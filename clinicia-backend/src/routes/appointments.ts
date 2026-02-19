import { Router, Response } from 'express';
import { prisma } from '../index';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import { createAppointmentSchema, validateBody } from '../lib/validation';
import logger from '../lib/logger';

const router = Router();

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

export default router;
