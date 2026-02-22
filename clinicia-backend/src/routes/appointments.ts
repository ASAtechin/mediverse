import { Router, Response } from 'express';
import { prisma } from '../index';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import { createAppointmentSchema, validateBody } from '../lib/validation';
import logger from '../lib/logger';

const router = Router();

const VALID_TRANSITIONS: Record<string, string[]> = {
    SCHEDULED: ["CONFIRMED", "CANCELLED", "CHECKED_IN", "NO_SHOW"],
    CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
    CHECKED_IN: ["COMPLETED", "NO_SHOW"],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
};

// GET /api/appointments - List appointments for the current user's clinic
router.get('/', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
            select: { clinicId: true }
        });

        if (!user || !user.clinicId) {
            res.status(403).json({ error: "User or Clinic not found" });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const skip = (page - 1) * limit;

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where: { clinicId: user.clinicId },
                include: {
                    patient: true,
                    doctor: true
                },
                orderBy: { date: 'asc' },
                skip,
                take: limit,
            }),
            prisma.appointment.count({ where: { clinicId: user.clinicId } }),
        ]);

        res.json({ data: appointments, total, page, limit });

    } catch (error) {
        logger.error({ err: error }, "Error fetching appointments");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/appointments - Create Appointment
router.post('/', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;

        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
            select: { clinicId: true }
        });

        if (!user || !user.clinicId) {
            res.status(403).json({ error: "User or Clinic not found" });
            return;
        }

        // Validate request body
        const validation = validateBody(createAppointmentSchema, req.body);
        if (!validation.success) {
            res.status(400).json({ error: "Validation failed", details: validation.errors });
            return;
        }
        const { patientId, date, type, notes } = validation.data;
        let targetDoctorId = validation.data.doctorId;

        if (!patientId || !date) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        // Use provided doctorId or default to current user (if doctor)
        if (!targetDoctorId) {
            const fullUser = await prisma.user.findUnique({ where: { firebaseUid: uid } });
            targetDoctorId = fullUser?.id;
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                date: new Date(date),
                type: type || "CONSULTATION",
                notes: notes,
                status: "SCHEDULED",
                clinic: { connect: { id: user.clinicId } },
                patient: { connect: { id: patientId } },
                doctor: { connect: { id: targetDoctorId } }
            }
        });

        res.status(201).json(newAppointment);

    } catch (error) {
        logger.error({ err: error }, "Error creating appointment");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PATCH /api/appointments/:id/status - Update appointment status
router.patch('/:id/status', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
            select: { clinicId: true, role: true }
        });

        if (!user || !user.clinicId) {
            res.status(403).json({ error: "User or Clinic not found" });
            return;
        }

        const id = req.params.id as string;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ error: "Status is required" });
            return;
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            select: { status: true, clinicId: true }
        });

        if (!appointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }

        // Verify clinic access
        if (user.role !== 'SUPER_ADMIN' && user.clinicId !== appointment.clinicId) {
            res.status(403).json({ error: "Forbidden: Access denied" });
            return;
        }

        // Validate state transition
        const allowed = VALID_TRANSITIONS[appointment.status] || [];
        if (!allowed.includes(status)) {
            res.status(400).json({ error: `Cannot change status from ${appointment.status} to ${status}` });
            return;
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                patient: true,
                doctor: true
            }
        });

        res.json(updated);

    } catch (error) {
        logger.error({ err: error }, "Error updating appointment status");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PATCH /api/appointments/:id/reschedule - Reschedule appointment
router.patch('/:id/reschedule', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
            select: { clinicId: true, role: true }
        });

        if (!user || !user.clinicId) {
            res.status(403).json({ error: "User or Clinic not found" });
            return;
        }

        const id = req.params.id as string;
        const { date } = req.body;

        if (!date) {
            res.status(400).json({ error: "New date is required" });
            return;
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            select: { status: true, clinicId: true, doctorId: true }
        });

        if (!appointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }

        if (user.role !== 'SUPER_ADMIN' && user.clinicId !== appointment.clinicId) {
            res.status(403).json({ error: "Forbidden: Access denied" });
            return;
        }

        if (!["SCHEDULED", "CONFIRMED"].includes(appointment.status)) {
            res.status(400).json({ error: `Cannot reschedule a ${appointment.status} appointment` });
            return;
        }

        const newDate = new Date(date);

        // Check double booking (30 min window)
        const thirtyMinBefore = new Date(newDate.getTime() - 30 * 60000);
        const thirtyMinAfter = new Date(newDate.getTime() + 30 * 60000);

        const existing = await prisma.appointment.findFirst({
            where: {
                doctorId: appointment.doctorId,
                id: { not: id },
                date: { gte: thirtyMinBefore, lte: thirtyMinAfter },
                status: { not: "CANCELLED" }
            }
        });

        if (existing) {
            res.status(409).json({ error: "Doctor already has an appointment within 30 minutes of this time" });
            return;
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: { date: newDate, status: "SCHEDULED" },
            include: { patient: true, doctor: true }
        });

        res.json(updated);

    } catch (error) {
        logger.error({ err: error }, "Error rescheduling appointment");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
