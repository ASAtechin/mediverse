import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-session';

export async function GET() {
    try {
        const session = await requireAuth();

        // Return user data from the session (already includes DB lookup)
        return NextResponse.json({
            id: session.userId,
            firebaseUid: session.uid,
            email: session.email,
            role: session.role,
            clinicId: session.clinicId
        });
    } catch (error) {
        console.error('[/api/auth/me] Auth failed:', error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
