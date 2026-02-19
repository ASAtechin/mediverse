import { headers } from "next/headers";
import * as admin from "firebase-admin";
import { initAdmin } from "./firebase-admin";

export async function verifyAuth() {
    const headersList = await headers();
    const token = headersList.get("authorization")?.split("Bearer ")[1];

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
