import { headers, cookies } from "next/headers";
import * as admin from "firebase-admin";
import { initAdmin } from "./firebase-admin";

export async function verifyAuth() {
    // 1. Prefer Authorization header — the client sends a FRESH token explicitly.
    //    This avoids the bug where the __session cookie still holds a stale/expired
    //    token while the client already refreshed it via getIdToken(true).
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // 2. Fallback: session cookie (used by server components that can't send headers)
    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get("__session")?.value ?? null;
    }

    if (!token) {
        throw new Error("Unauthorized: No token provided");
    }

    // Ensure Admin is initialized
    await initAdmin();

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Token verification failed:", error);
        throw new Error("Unauthorized: Invalid token");
    }
}
