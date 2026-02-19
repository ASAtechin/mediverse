import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

export async function GET() {
    try {
        const decodedToken = await verifyAuth(); // Protect Route

        // Scope doctors to the user's clinic if possible
        let clinicFilter = {};
        if (decodedToken.email) {
            const currentUser = await prisma.user.findUnique({
                where: { email: decodedToken.email },
                select: { clinicId: true }
            });
            if (currentUser?.clinicId) {
                clinicFilter = { clinicId: currentUser.clinicId };
            }
        }

        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                ...clinicFilter
            },
            select: {
                id: true,
                name: true,
                email: true,
                clinicId: true,
                clinic: {
                    select: {
                        name: true,
                        address: true
                    }
                }
            }
        });

        return NextResponse.json(doctors);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch doctors' },
            { status: 500 }
        );
    }
}
