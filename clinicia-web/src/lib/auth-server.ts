import { headers, cookies } from "next/headers";
import * as admin from "firebase-admin";
import { initAdmin } from "./firebase-admin";

export async function verifyAuth() {
    // First, try to get token from session cookie (preferred method)
    const cookieStore = await cookies();
    let token = cookieStore.get("__session")?.value;

    // Fallback: check Authorization header (for backward compatibility)
    if (!token) {
        const headersList = await headers();
        const authHeader = headersList.get("authorization");
        if (authHeader) {
            token = authHeader.split("Bearer ")[1];
        }
    }

    if (!token) {
        throw new Error("Unauthorized: No token provided");
    }

    // Ensure Admin is initialized
    await initAdmin();

    try {
        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Token verification failed:", error);
        throw new Error("Unauthorized: Invalid token");
    }
}
