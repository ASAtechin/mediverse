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
        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientId
            },
            include: {
                doctor: {
                    select: {
                        name: true
                    }
                },
                clinic: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json(appointments);
    } catch (error: any) {
        console.error('Patient appointments error:', error?.message || error);
        return NextResponse.json(
            { error: 'Failed to fetch appointments', details: error?.message },
            { status: 500 }
        );
    }
}
