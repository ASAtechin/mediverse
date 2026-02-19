import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../lib/firebase';
import logger from '../lib/logger';

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
}

export const verifyAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    } catch (error) {
        logger.warn({ err: error }, "Token verification failed");
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
};
