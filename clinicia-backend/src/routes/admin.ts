import { Router, Response, NextFunction } from 'express';
import { prisma, io } from '../index';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import { firebaseAdmin } from '../lib/firebase';
import logger from '../lib/logger';
import { randomBytes } from 'crypto';

const router = Router();

// Middleware to ensure Super Admin
const verifySuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const uid = req.user?.uid;
        if (!uid) return res.status(401).json({ error: "Unauthorized" });

        const user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
        if (user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: "Forbidden: Super Admin Only" });
        }
        next();
    } catch (error) {
        logger.error({ err: error }, "Error verifying super admin");
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET /api/admin/stats
router.get('/stats', verifyAuth, verifySuperAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const totalClinics = await prisma.clinic.count();
        const totalDoctors = await prisma.user.count({
            where: { role: 'DOCTOR' }
        });
        const activeSubscriptions = await prisma.subscription.count({
            where: { status: 'ACTIVE' }
        });
        // Calculate real revenue from paid invoices
        const revenueResult = await prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { status: 'PAID' }
        });
        const totalRevenue = revenueResult._sum.totalAmount || 0;

        res.json({
            totalClinics,
            totalDoctors,
            activeSubscriptions,
            totalRevenue,
            systemHealth: "Healthy"
        });
    } catch (error) {
        logger.error({ err: error }, "Error fetching admin stats");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/admin/tenants
router.get('/tenants', verifyAuth, verifySuperAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const skip = (page - 1) * limit;

        const [clinics, total] = await Promise.all([
            prisma.clinic.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { patients: true, appointments: true }
                    }
                },
                skip,
                take: limit,
            }),
            prisma.clinic.count(),
        ]);

        res.json({ data: clinics, total, page, limit });
    } catch (error) {
        logger.error({ err: error }, "Error fetching tenants");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/admin/tenants - Create a new tenant (clinic) with admin user
router.post('/tenants', verifyAuth, verifySuperAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, phone, address, plan, status, adminName, adminPassword } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: "Clinic name is required" });
        }

        if (!email || email.trim().length === 0) {
            return res.status(400).json({ error: "Admin email is required for login access" });
        }

        // Generate a default password if not provided
        const password = adminPassword || generateTemporaryPassword();

        let firebaseUser;
        try {
            // Check if user already exists in Firebase
            try {
                firebaseUser = await firebaseAdmin.auth().getUserByEmail(email.trim());
            } catch (err: any) {
                if (err.code === 'auth/user-not-found') {
                    // Create Firebase Auth user for the tenant admin
                    firebaseUser = await firebaseAdmin.auth().createUser({
                        email: email.trim(),
                        password: password,
                        displayName: adminName || name,
                        emailVerified: false,
                    });
                } else {
                    throw err;
                }
            }
        } catch (error: any) {
            logger.error({ err: error }, "Firebase Auth Error");
            return res.status(400).json({ error: `Failed to create auth account: ${error.message}` });
        }

        // Create the clinic
        const clinic = await prisma.clinic.create({
            data: {
                name: name.trim(),
                email: email?.trim() || null,
                phone: phone?.trim() || null,
                address: address?.trim() || null,
                plan: plan || 'FREE',
                status: status || 'TRIAL',
                ownerId: firebaseUser.uid,
            },
        });

        // Create the admin user for this clinic
        const adminUser = await prisma.user.create({
            data: {
                email: email.trim(),
                name: adminName || name,
                firebaseUid: firebaseUser.uid,
                role: 'ADMIN',
                clinicId: clinic.id,
            },
        });

        // Return clinic with admin info (but not password in response for security)
        const clinicWithCounts = await prisma.clinic.findUnique({
            where: { id: clinic.id },
            include: {
                _count: {
                    select: { patients: true, appointments: true }
                },
                users: {
                    where: { role: 'ADMIN' },
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(201).json({
            ...clinicWithCounts,
            message: "Tenant created successfully. A temporary password has been generated — share it securely with the clinic admin."
        });

        // Log the temporary password server-side only (for admin to retrieve securely)
        logger.info({ clinicId: clinic.id, adminEmail: email.trim() }, "New tenant created. Temporary password generated (check secure admin channel).");

        // Emit socket event for real-time updates
        io.to("admin").emit("tenant-updated", {
            type: "insert",
            data: clinicWithCounts
        });
        logger.info("Emitted tenant-updated event to admin room");
    } catch (error: any) {
        logger.error({ err: error }, "Error creating tenant");
        res.status(500).json({ error: error.message || "Failed to create tenant" });
    }
});

// Helper function to generate a cryptographically secure temporary password
function generateTemporaryPassword(): string {
    return randomBytes(12).toString('base64url').slice(0, 12);
}

// PUT /api/admin/tenants/:id - Update a tenant
router.put('/tenants/:id', verifyAuth, verifySuperAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, email, phone, address, plan, status } = req.body;

        const clinic = await prisma.clinic.update({
            where: { id },
            data: {
                ...(name && { name: name.trim() }),
                ...(email !== undefined && { email: email?.trim() || null }),
                ...(phone !== undefined && { phone: phone?.trim() || null }),
                ...(address !== undefined && { address: address?.trim() || null }),
                ...(plan && { plan }),
                ...(status && { status }),
            },
            include: {
                _count: {
                    select: { patients: true, appointments: true }
                }
            }
        });

        res.json(clinic);

        // Emit socket event for real-time updates
        io.to("admin").emit("tenant-updated", {
            type: "update",
            data: clinic
        });
        logger.info("Emitted tenant-updated (update) event to admin room");
    } catch (error) {
        logger.error({ err: error }, "Error updating tenant");
        res.status(500).json({ error: "Failed to update tenant" });
    }
});

// DELETE /api/admin/tenants/:id - Delete a tenant
router.delete('/tenants/:id', verifyAuth, verifySuperAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        // Check if clinic exists
        const clinic = await prisma.clinic.findUnique({ where: { id } });
        if (!clinic) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        // Delete related records in a transaction (atomic operation)
        await prisma.$transaction(async (tx) => {
            // 1. Delete prescriptions (depend on visits)
            const visits = await tx.visit.findMany({ where: { patientId: { in: (await tx.patient.findMany({ where: { clinicId: id }, select: { id: true } })).map(p => p.id) } }, select: { id: true } });
            if (visits.length > 0) {
                await tx.prescription.deleteMany({ where: { visitId: { in: visits.map(v => v.id) } } });
            }
            // 2. Delete invoices (depend on visits/clinic)
            await tx.invoice.deleteMany({ where: { clinicId: id } });
            // 3. Delete visits (depend on patients/appointments)
            if (visits.length > 0) {
                await tx.visit.deleteMany({ where: { id: { in: visits.map(v => v.id) } } });
            }
            // 4. Delete appointments (depend on patients/users)
            await tx.appointment.deleteMany({ where: { clinicId: id } });
            // 5. Delete patients and users
            await tx.patient.deleteMany({ where: { clinicId: id } });
            await tx.user.deleteMany({ where: { clinicId: id } });
            // 6. Delete remaining
            await tx.inventoryItem.deleteMany({ where: { clinicId: id } });
            await tx.usageRecord.deleteMany({ where: { clinicId: id } });
            await tx.subscription.deleteMany({ where: { clinicId: id } });
            // 7. Delete the clinic itself
            await tx.clinic.delete({ where: { id } });
        });

        res.json({ success: true, message: "Tenant deleted successfully" });

        // Emit socket event for real-time updates
        io.to("admin").emit("tenant-updated", {
            type: "delete",
            data: { id }
        });
        logger.info("Emitted tenant-updated (delete) event to admin room");
    } catch (error) {
        logger.error({ err: error }, "Error deleting tenant");
        res.status(500).json({ error: "Failed to delete tenant" });
    }
});

// GET /api/admin/subscriptions — List all subscriptions with clinic info
router.get('/subscriptions', verifyAuth, verifySuperAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                clinic: {
                    select: { id: true, name: true, plan: true, status: true }
                }
            }
        });
        res.json(subscriptions);
    } catch (error) {
        logger.error({ err: error }, "Error fetching subscriptions");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
