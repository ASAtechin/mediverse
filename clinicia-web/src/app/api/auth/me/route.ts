import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

export async function GET() {
    try {
        // verifyAuth checks session cookie FIRST, then Authorization header as fallback
        const decodedToken = await verifyAuth();

        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
            select: { id: true, clinicId: true, role: true, email: true },
        });

        if (!user) {
            // 404 = authenticated but not registered (distinct from 401 = not authenticated)
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
        console.error('[/api/auth/me] Auth failed:', error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
