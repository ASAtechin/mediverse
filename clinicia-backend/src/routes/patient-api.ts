import { Router, Response } from 'express';
import { prisma } from '../index';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import { bookAppointmentSchema, validateBody } from '../lib/validation';
import logger from '../lib/logger';

const router = Router();

/**
 * Resolves the Patient record that belongs to the authenticated Firebase user.
 * Returns null if no patient is linked to this user.
 */
async function resolvePatient(req: AuthRequest): Promise<{ id: string; clinicId: string } | null> {
    const email = req.user?.email;
    if (!email) return null;

    return prisma.patient.findFirst({
        where: { email },
        select: { id: true, clinicId: true },
    });
}

// GET /api/patient/appointments - Fetch future appointments for a patient
router.get('/appointments', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const patientId = req.query.patientId as string;

        if (!patientId) {
            res.status(400).json({ error: "Patient ID is required" });
            return;
        }

        // Verify that the authenticated user owns this patient record
        const ownedPatient = await resolvePatient(req);
        if (!ownedPatient || ownedPatient.id !== patientId) {
            // Also allow doctor/admin access — check if user is staff for the patient's clinic
            const user = await prisma.user.findUnique({
                where: { firebaseUid: req.user!.uid },
                select: { clinicId: true, role: true },
            });
            const patient = await prisma.patient.findUnique({
                where: { id: patientId },
                select: { clinicId: true },
            });
            if (!user || !patient || (user.role !== 'SUPER_ADMIN' && user.clinicId !== patient.clinicId)) {
                res.status(403).json({ error: "Forbidden: Access denied to this patient" });
                return;
            }
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientId,
                date: {
                    gte: new Date() // Future appointments
                },
                status: { not: 'CANCELLED' }
            },
            include: {
                doctor: { select: { name: true } },
                clinic: { select: { name: true } }
            },
            orderBy: { date: 'asc' }
        });

        res.json(appointments);

    } catch (error) {
        logger.error({ err: error }, "Error fetching patient appointments");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/patient/records - Fetch past visits for a patient
router.get('/records', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const patientId = req.query.patientId as string;

        if (!patientId) {
            res.status(400).json({ error: "Patient ID is required" });
            return;
        }

        // Verify ownership: patient owns their own data, or clinic staff can access
        const ownedPatient = await resolvePatient(req);
        if (!ownedPatient || ownedPatient.id !== patientId) {
            const user = await prisma.user.findUnique({
                where: { firebaseUid: req.user!.uid },
                select: { clinicId: true, role: true },
            });
            const patient = await prisma.patient.findUnique({
                where: { id: patientId },
                select: { clinicId: true },
            });
            if (!user || !patient || (user.role !== 'SUPER_ADMIN' && user.clinicId !== patient.clinicId)) {
                res.status(403).json({ error: "Forbidden: Access denied to this patient" });
                return;
            }
        }

        // Fetch visits
        const visits = await prisma.visit.findMany({
            where: {
                patientId: patientId
            },
            include: {
                prescriptions: true,
                appointment: {
                    include: {
                        doctor: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(visits);

    } catch (error) {
        logger.error({ err: error }, "Error fetching patient records");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/patient/profile - Resolve Patient ID from Firebase Auth
router.get('/profile', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;
        const email = req.user?.email;

        if (!uid || !email) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Resolve patient by email (matches Firebase auth email)
        // This is secure because the email comes from the verified Firebase token, not the client
        const patient = await prisma.patient.findFirst({
            where: { email: email }
        });

        if (!patient) {
            res.status(404).json({ error: "Patient profile not found for this user." });
            return;
        }

        res.json(patient);

    } catch (error) {
        logger.error({ err: error }, "Error fetching patient profile");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/patient/appointments - Book an appointment (patient-facing)
router.post('/appointments', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        // Validate request body
        const validation = validateBody(bookAppointmentSchema, req.body);
        if (!validation.success) {
            res.status(400).json({ error: "Validation failed", details: validation.errors });
            return;
        }
        const { doctorId, patientId, clinicId, date, type } = validation.data;

        // Verify ownership: patient books for themselves, or clinic staff books for their patients
        const ownedPatient = await resolvePatient(req);
        if (!ownedPatient || ownedPatient.id !== patientId) {
            const user = await prisma.user.findUnique({
                where: { firebaseUid: req.user!.uid },
                select: { clinicId: true, role: true },
            });
            if (!user || (user.role !== 'SUPER_ADMIN' && user.clinicId !== clinicId)) {
                res.status(403).json({ error: "Forbidden: Access denied" });
                return;
            }
        }

        // Verify the patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            res.status(404).json({ error: "Patient not found" });
            return;
        }

        const appointmentDate = new Date(date);

        // Check for double booking
        const existing = await prisma.appointment.findFirst({
            where: {
                doctorId,
                date: appointmentDate,
                status: { not: 'CANCELLED' }
            }
        });

        if (existing) {
            res.status(409).json({ error: "Doctor is already booked at this time" });
            return;
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                date: appointmentDate,
                type: type || "CONSULTATION",
                status: "SCHEDULED",
                clinic: { connect: { id: clinicId } },
                patient: { connect: { id: patientId } },
                doctor: { connect: { id: doctorId } }
            },
            include: {
                doctor: { select: { name: true } },
                clinic: { select: { name: true } }
            }
        });

        res.status(201).json(newAppointment);

    } catch (error) {
        logger.error({ err: error }, "Error booking patient appointment");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
