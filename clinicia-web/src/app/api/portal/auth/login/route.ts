
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import { authRateLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        // Rate limit by IP
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() || "unknown";
        const { limited, remaining } = authRateLimiter.check(ip);

        if (limited) {
            return NextResponse.json(
                { error: "Too many login attempts. Please try again later." },
                { status: 429, headers: { "Retry-After": "900", "X-RateLimit-Remaining": "0" } }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { phone, password } = body;

        if (!phone || !password) {
            return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });
        }

        // 1. Find Patient
        const patient = await prisma.patient.findUnique({
            where: { phone }
        });

        if (!patient || !patient.password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 2. Verify Password using bcrypt
        const isValidPassword = await bcrypt.compare(password, patient.password);
        if (!isValidPassword) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Mint Custom Token
        await initAdmin();
        const customToken = await admin.auth().createCustomToken(patient.id, {
            role: 'patient',
            clinicId: patient.clinicId
        });

        return NextResponse.json({ token: customToken });

    } catch (error: any) {
        console.error("Patient Login Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
