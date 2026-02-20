import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Security Check: Verify User is Super Admin
        const decodedToken = await verifyAuth();

        // Additional Check: Ensure the user from token actually has SUPER_ADMIN role in DB
        // (Optional but recommended for critical admin routes)
        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid }
        });

        if (!user || user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const [
            clinicsCount,
            activeSubsCount,
            totalPatients,
            revenueResult
        ] = await Promise.all([
            prisma.clinic.count(),
            prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            prisma.patient.count(),
            // Simple revenue aggregation from PAID invoices
            // Note: In a real SaaS, revenue comes from Stripe Subscriptions, not Clinic Invoices.
            // But for now, let's just count invoices or mock MRR based on Plan types.
            prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                where: { status: 'PAID' }
            })
        ]);

        return NextResponse.json({
            clinics: clinicsCount,
            active_subscriptions: activeSubsCount,
            patients: totalPatients,
            revenue: revenueResult._sum.totalAmount || 0
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
