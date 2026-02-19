"use server";

import { cookies } from "next/headers";
import * as admin from "firebase-admin";
import { initAdmin } from "./firebase-admin";
import { prisma } from "./db";

export interface AuthSession {
    uid: string;
    email: string;
    clinicId: string;
    userId: string;
    role: string;
}

/**
 * Verifies the Firebase session token from the cookie and resolves the user's
 * clinicId from the database. This is the single source of truth for auth
 * in all server actions.
 *
 * @throws Error if the user is not authenticated or not found in DB
 */
export async function requireAuth(): Promise<AuthSession> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("__session")?.value;

    if (!sessionToken) {
        throw new Error("Unauthorized: No session");
    }

    await initAdmin();

    let decoded: admin.auth.DecodedIdToken;
    try {
        decoded = await admin.auth().verifyIdToken(sessionToken);
    } catch {
        throw new Error("Unauthorized: Invalid or expired token");
    }

    // Resolve the user from DB to get clinicId and role — single DB round-trip
    const user = await prisma.user.findUnique({
        where: { firebaseUid: decoded.uid },
        select: { id: true, clinicId: true, role: true, email: true },
    });

    if (!user) {
        throw new Error("Unauthorized: User not found in database");
    }

    return {
        uid: decoded.uid,
        email: decoded.email || user.email,
        clinicId: user.clinicId,
        userId: user.id,
        role: user.role,
    };
}

/**
 * Verifies auth and asserts that the resolved clinicId matches the requested one.
 * Use this when the client sends a clinicId and you need to verify ownership.
 */
export async function requireAuthForClinic(requestedClinicId: string): Promise<AuthSession> {
    const session = await requireAuth();

    // SUPER_ADMIN can access any clinic
    if (session.role === "SUPER_ADMIN") {
        return session;
    }

    if (session.clinicId !== requestedClinicId) {
        throw new Error("Forbidden: You do not have access to this clinic");
    }

    return session;
}
