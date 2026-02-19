import { Router, Response } from 'express';
import { prisma } from '../index';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import { createPatientSchema, validateBody } from '../lib/validation';
import logger from '../lib/logger';

const router = Router();

// GET /api/patients - List patients for the current user's clinic
router.get('/', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // We need to fetch the clinicId for this user first
        // Optimization: In a real app, attach clinicId to the token claims or cache it
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

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where: { clinicId: user.clinicId },
                orderBy: { createdAt: "desc" },
                include: { appointments: true },
                skip,
                take: limit,
            }),
            prisma.patient.count({ where: { clinicId: user.clinicId } }),
        ]);

        res.json({ data: patients, total, page, limit });

    } catch (error) {
        logger.error({ err: error }, "Error fetching patients");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/patients - Create a new patient
router.post('/', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;

        if (!uid) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Fetch Clinic ID
        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
            select: { clinicId: true }
        });

        if (!user || !user.clinicId) {
            res.status(403).json({ error: "User or Clinic not found" });
            return;
        }

        // Validate request body
        const validation = validateBody(createPatientSchema, req.body);
        if (!validation.success) {
            res.status(400).json({ error: "Validation failed", details: validation.errors });
            return;
        }
        const { firstName, lastName, phone, email, dob, gender, address } = validation.data;

        const newPatient = await prisma.patient.create({
            data: {
                firstName,
                lastName,
                phone,
                email: email || null,
                dateOfBirth: new Date(dob),
                gender,
                address: address || null,
                clinic: {
                    connect: { id: user.clinicId }
                }
            }
        });

        res.status(201).json(newPatient);

    } catch (error) {
        logger.error({ err: error }, "Error creating patient");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
