import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

export async function POST(request: Request) {
    try {
        const decodedToken = await verifyAuth(); // Protect Route
        const body = await request.json();
        const { doctorId, patientId, date, type, clinicId: clientClinicId } = body;

        // Basic validation
        if (!doctorId || !patientId || !date) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Derive clinicId from authenticated user instead of trusting client
        let clinicId = clientClinicId;
        if (decodedToken.email) {
            const currentUser = await prisma.user.findUnique({
                where: { email: decodedToken.email },
                select: { clinicId: true }
            });
            if (currentUser?.clinicId) {
                clinicId = currentUser.clinicId;
            }
        }

        if (!clinicId) {
            return NextResponse.json(
                { error: 'Could not determine clinic' },
                { status: 400 }
            );
        }

        const appointmentDate = new Date(date);

        // Check for conflicts
        const existing = await prisma.appointment.findFirst({
            where: {
                doctorId,
                date: appointmentDate,
                status: { not: 'CANCELLED' }
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Doctor is already booked at this time' },
                { status: 409 }
            );
        }

        // Calculate Token Number
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        const appointmentCount = await prisma.appointment.count({
            where: {
                clinicId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        const tokenNumber = appointmentCount + 1;

        const appointment = await prisma.appointment.create({
            data: {
                doctorId,
                patientId,
                clinicId,
                date: appointmentDate,
                type: type || 'CONSULTATION',
                status: 'SCHEDULED',
                tokenNumber
            },
            include: { patient: true }
        });

        // Send Notification (async, best-effort — don't block response)
        import('@/lib/notifications').then(({ sendAppointmentConfirmation }) => {
            sendAppointmentConfirmation(
                appointment.patient.firstName,
                appointment.patient.phone,
                appointment.date,
                appointment.tokenNumber || 0
            ).catch(() => { /* notification failed — non-critical */ });
        }).catch(() => { /* dynamic import failed — notifications module missing */ });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        console.error("[API] Booking error:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: 'Failed to create appointment' },
            { status: 500 }
        );
    }
}
