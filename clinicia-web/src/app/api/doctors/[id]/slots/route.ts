import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';
import { startOfDay, endOfDay, addMinutes, format, parse, isSameDay } from 'date-fns';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const doctorId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    if (!dateParam) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    try {
        const queryDate = new Date(dateParam);
        const dayStart = startOfDay(queryDate);
        const dayEnd = endOfDay(queryDate);

        // 1. Fetch existing appointments for this doctor on this day
        const existingAppointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                date: {
                    gte: dayStart,
                    lte: dayEnd
                },
                status: { not: 'CANCELLED' }
            }
        });

        // 2. Generate all possible slots (9 AM to 5 PM, 30 min intervals)
        const slots = [];
        let currentSlot = new Date(queryDate);
        currentSlot.setHours(9, 0, 0, 0); // Start at 9:00 AM

        const endTime = new Date(queryDate);
        endTime.setHours(17, 0, 0, 0); // End at 5:00 PM

        while (currentSlot < endTime) {
            // Check if this slot is booked
            const isBooked = existingAppointments.some(appt => {
                const apptDate = new Date(appt.date);
                return apptDate.getTime() === currentSlot.getTime();
            });

            if (!isBooked) {
                slots.push(format(currentSlot, 'HH:mm'));
            }

            currentSlot = addMinutes(currentSlot, 30);
        }

        return NextResponse.json(slots);

    } catch (error) {
        console.error('Slot fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch slots' },
            { status: 500 }
        );
    }
}
