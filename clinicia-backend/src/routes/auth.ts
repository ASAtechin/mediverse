import { Router, Response } from 'express';
import { prisma } from '../index';
import { verifyAuth, AuthRequest } from '../middleware/auth';
import logger from '../lib/logger';

const router = Router();

// Get Current User Profile
router.get('/me', verifyAuth, async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user?.uid;
        if (!uid) {
            res.status(401).json({ error: "No user ID found" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
            include: { clinic: true }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    } catch (error) {
        logger.error({ err: error }, "Error fetching user profile");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
