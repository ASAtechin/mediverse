import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import logger from './logger';

dotenv.config();

if (!admin.apps.length) {
    try {
        // Option 1: Use service account JSON from environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id,
            });
            logger.info("Firebase Admin initialized with service account from ENV");
        }
        // Option 2: Use service account JSON file
        else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
            logger.info("Firebase Admin initialized with GOOGLE_APPLICATION_CREDENTIALS");
        }
        // Option 3: Look for service-account.json in the project root
        else {
            const serviceAccountPath = path.join(__dirname, '../../service-account.json');
            if (fs.existsSync(serviceAccountPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: serviceAccount.project_id,
                });
                logger.info("Firebase Admin initialized with service-account.json file");
            } else {
                // Option 4: Initialize without credentials (limited functionality - token verification only)
                logger.warn("No Firebase service account found. Admin operations will fail.");
                logger.warn("To fix: Download service account key from Firebase Console and save as 'service-account.json' in clinicia-backend/");
                admin.initializeApp({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'clinicia-demo'
                });
                logger.info("Firebase Admin initialized in limited mode (no admin operations)");
            }
        }
    } catch (error) {
        logger.error({ err: error }, "Firebase Admin Init Error");
        // Fallback initialization
        try {
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'clinicia-demo'
            });
        } catch (e) {
            logger.fatal({ err: e }, "Firebase Fatal Init Error");
        }
    }
}

export const firebaseAdmin = admin;
