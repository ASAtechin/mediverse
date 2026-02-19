import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { type NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        await verifyAuth(); // Protect Route
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
        return NextResponse.json(
            { error: 'Patient ID is required' },
            { status: 400 }
        );
    }

    try {
        const visits = await prisma.visit.findMany({
            where: {
                patientId: patientId
            },
            include: {
                prescriptions: true,
                appointment: {
                    include: {
                        doctor: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(visits);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch medical records' },
            { status: 500 }
        );
    }
}
