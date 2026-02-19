import { Router, Response } from 'express';
import { prisma } from '../index';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import { startOfDay, endOfDay, addMinutes, format } from 'date-fns';
import logger from '../lib/logger';

const router = Router();

// GET /api/doctors - Fetch all doctors
// Can be public or protected. Mobile app sends auth token, so let's protect it or verifyAuth but allow pass if public?
// The mobile app uses `api.get('/doctors')`.
// In `AuthContext` of mobile, it sets headers.
// Let's use `verifyAuth` to be safe.
router.get('/', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        // Scope doctors by the requesting user's clinic when possible
        let clinicFilter = {};
        if (req.user?.uid) {
            const currentUser = await prisma.user.findUnique({
                where: { firebaseUid: req.user.uid },
                select: { clinicId: true, role: true }
            });
            // Non-admin users should only see doctors from their own clinic
            if (currentUser?.clinicId && currentUser.role !== 'SUPER_ADMIN') {
                clinicFilter = { clinicId: currentUser.clinicId };
            }
        }

        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                ...clinicFilter
            },
            select: {
                id: true,
                name: true,
                email: true,
                clinicId: true,
                clinic: {
                    select: {
                        name: true,
                        address: true
                    }
                }
            }
        });
        res.json(doctors);
    } catch (error) {
        logger.error({ err: error }, "Error fetching doctors");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/doctors/:id/slots - Fetch available slots
router.get('/:id/slots', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const doctorId = req.params.id as string;
        const dateParam = req.query.date as string;

        if (!dateParam) {
            res.status(400).json({ error: 'Date is required' });
            return;
        }

        const queryDate = new Date(dateParam);
        const dayStart = startOfDay(queryDate);
        const dayEnd = endOfDay(queryDate);

        // 1. Fetch existing appointments for this doctor on this day
        const existingAppointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                date: {
                    gte: dayStart,
                    lte: dayEnd
                },
                status: { not: 'CANCELLED' }
            }
        });

        // 2. Generate all possible slots (9 AM to 5 PM, 30 min intervals)
        const slots: string[] = [];
        let currentSlot = new Date(queryDate);
        currentSlot.setHours(9, 0, 0, 0); // Start at 9:00 AM

        const endTime = new Date(queryDate);
        endTime.setHours(17, 0, 0, 0); // End at 5:00 PM

        while (currentSlot < endTime) {
            // Check if this slot is booked
            const isBooked = existingAppointments.some(appt => {
                const apptDate = new Date(appt.date);
                // Simple equality check for 30 min slots. 
                // For more robust, we should check ranges. But this matches `web` logic.
                return apptDate.getTime() === currentSlot.getTime();
            });

            if (!isBooked) {
                slots.push(format(currentSlot, 'HH:mm'));
            }

            currentSlot = addMinutes(currentSlot, 30);
        }

        res.json(slots);

    } catch (error) {
        logger.error({ err: error }, "Error fetching slots");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
