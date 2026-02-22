import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

export async function GET() {
    // Step 1: Authenticate (Authorization header preferred, cookie fallback)
    let decodedToken;
    try {
        decodedToken = await verifyAuth();
    } catch (error) {
        console.error('[/api/auth/me] Auth failed:', error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Fetch user from database (errors here are 500, not 401)
    try {
        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
            select: { id: true, clinicId: true, role: true, email: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }

        return NextResponse.json({
            id: user.id,
            firebaseUid: decodedToken.uid,
            email: decodedToken.email || user.email,
            role: user.role,
            clinicId: user.clinicId,
        });
    } catch (error) {
        console.error('[/api/auth/me] Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
