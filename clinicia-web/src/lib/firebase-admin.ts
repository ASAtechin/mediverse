import "server-only";
import * as admin from "firebase-admin";

interface FirebaseAdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, "\n");
}

export function createFirebaseAdminApp(params: FirebaseAdminConfig) {
    const privateKey = formatPrivateKey(params.privateKey);

    if (admin.apps.length > 0) {
        return admin.app();
    }

    const cert = admin.credential.cert({
        projectId: params.projectId,
        clientEmail: params.clientEmail,
        privateKey,
    });

    return admin.initializeApp({
        credential: cert,
        projectId: params.projectId,
    });
}

export async function initAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // If full service-account credentials are available, use them for secure token verification
    if (projectId && clientEmail && privateKey) {
        return createFirebaseAdminApp({ projectId, clientEmail, privateKey });
    }

    // Fallback: project-ID-only init — verifyIdToken will NOT validate signatures
    // This is acceptable ONLY in development. In production, always set FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            'Firebase Admin: FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set in production'
        );
    }

    console.warn('[FIREBASE-ADMIN] Running without service-account credentials — token verification is insecure. Set FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY for production.');

    try {
        return admin.initializeApp({ projectId: projectId || 'clinicia-demo' });
    } catch (e) {
        console.error("Firebase Admin Init Error", e);
        throw e;
    }
}
