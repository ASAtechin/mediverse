
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

// GET /api/patient/[id]/vitals
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { uid } = decodedToken;
        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { id } = params;

        const vitals = await prisma.vital.findMany({
            where: {
                patientId: id,
                clinicId: user.clinicId,
            },
            orderBy: {
                recordedAt: 'desc',
            },
            include: {
                visit: {
                    select: {
                        visitDate: true
                    }
                }
            }
        });

        return NextResponse.json(vitals);
    } catch (error) {
        console.error("Error fetching vitals:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/patient/[id]/vitals
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { uid } = decodedToken;
        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { id } = params;
        const json = await request.json();

        // Validate body
        const {
            weight,
            height,
            bpSystolic,
            bpDiastolic,
            pulse,
            temperature,
            spo2,
            note,
            visitId
        } = json;

        const vital = await prisma.vital.create({
            data: {
                patientId: id,
                clinicId: user.clinicId,
                weight: weight ? parseFloat(weight) : null,
                height: height ? parseFloat(height) : null,
                bpSystolic: bpSystolic ? parseInt(bpSystolic) : null,
                bpDiastolic: bpDiastolic ? parseInt(bpDiastolic) : null,
                pulse: pulse ? parseInt(pulse) : null,
                temperature: temperature ? parseFloat(temperature) : null,
                spo2: spo2 ? parseInt(spo2) : null,
                note,
                visitId: visitId || null,
            },
        });

        return NextResponse.json(vital);
    } catch (error) {
        console.error("Error creating vital:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
