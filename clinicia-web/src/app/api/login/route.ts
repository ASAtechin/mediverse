import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

export async function POST(request: Request) {
    try {
        // Verify Firebase token to ensure the request is authenticated
        const decodedToken = await verifyAuth();
        const email = decodedToken.email;

        if (!email) {
            return NextResponse.json(
                { error: 'Email not found in token' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                clinic: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return user data (authenticated via Firebase token)
        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clinicId: user.clinicId,
            clinic: user.clinic
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
