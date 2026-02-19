import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/session — Set session cookie with Firebase ID token
export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 400 });
        }

        const cookieStore = await cookies();
        cookieStore.set("__session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60, // 1 hour — Firebase tokens expire in 1 hour
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SESSION] Error setting session:", error);
        return NextResponse.json({ error: "Failed to set session" }, { status: 500 });
    }
}

// DELETE /api/auth/session — Clear session cookie on logout
export async function DELETE() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("__session");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SESSION] Error clearing session:", error);
        return NextResponse.json({ error: "Failed to clear session" }, { status: 500 });
    }
}
