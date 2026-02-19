import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

export async function GET() {
    try {
        const decodedToken = await verifyAuth();

        // Ensure Admin
        const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } });
        if (!user || user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch Clinics with Owner info and Subscription
        const clinics = await prisma.clinic.findMany({
            include: {
                subscription: true,
                _count: {
                    select: { users: true, patients: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format data for table
        const formatted = clinics.map(c => ({
            id: c.id,
            name: c.name,
            plan: c.plan,
            status: c.status,
            users_count: c._count.users,
            patients_count: c._count.patients,
            createdAt: c.createdAt,
            subscription_status: c.subscription?.status || 'N/A'
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Admin Tenants Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
