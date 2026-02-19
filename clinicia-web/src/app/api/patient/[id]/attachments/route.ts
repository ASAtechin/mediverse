
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

// GET /api/patient/[id]/attachments
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const decodedToken = await verifyAuth();
        if (!decodedToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Explicitly fetch user again to ensure clinic access logic is correct.
        // Ideally verifyAuth should return the user too, but sticking to the pattern used before.
        const { uid } = decodedToken;
        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { id } = params;

        const attachments = await prisma.attachment.findMany({
            where: {
                patientId: id,
                clinicId: user.clinicId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(attachments);
    } catch (error) {
        console.error("Error fetching attachments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/patient/[id]/attachments
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
        const { name, url, type, size } = json;

        const attachment = await prisma.attachment.create({
            data: {
                patientId: id,
                clinicId: user.clinicId,
                name,
                url,
                type: type || 'DOCUMENT',
                size: size ? parseInt(size) : null,
                uploadedBy: user.id
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.error("Error creating attachment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
