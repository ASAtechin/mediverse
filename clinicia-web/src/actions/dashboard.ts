'use server';

import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { requireAuth } from "@/lib/auth-session";

export async function getDashboardStats(clinicId?: string) {
    try {
        const session = await requireAuth();

        // SUPER_ADMIN can query any clinic; others are scoped to their own
        const effectiveClinicId = session.role === "SUPER_ADMIN"
            ? clinicId
            : session.clinicId;

        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);
        const startOfCurrentMonth = startOfMonth(today);
        const endOfCurrentMonth = endOfMonth(today);

        // Build clinic filter - scope data to the user's clinic
        const clinicFilter = effectiveClinicId ? { clinicId: effectiveClinicId } : {};

        // 1. Total Patients
        const totalPatients = await prisma.patient.count({ where: clinicFilter });

        // 2. Appointments Today
        const appointmentsToday = await prisma.appointment.count({
            where: {
                ...clinicFilter,
                date: {
                    gte: startOfToday,
                    lte: endOfToday
                },
                status: { not: 'CANCELLED' }
            }
        });

        // 3. Revenue (MTD) - Sum of PAID invoices this month
        const revenueResult = await prisma.invoice.aggregate({
            _sum: {
                totalAmount: true
            },
            where: {
                ...clinicFilter,
                status: 'PAID',
                createdAt: {
                    gte: startOfCurrentMonth,
                    lte: endOfCurrentMonth
                }
            }
        });
        const revenue = revenueResult._sum.totalAmount || 0;

        // 4. Active Treatments - visits created this month
        const activeTreatments = await prisma.visit.count({
            where: {
                ...(effectiveClinicId ? { clinicId: effectiveClinicId } : {}),
                createdAt: {
                    gte: startOfCurrentMonth
                }
            }
        });

        return {
            success: true,
            data: {
                totalPatients,
                appointmentsToday,
                revenue,
                activeTreatments
            }
        };

    } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch weekly patient flow data for the chart.
 */
export async function getWeeklyChartData(clinicId?: string) {
    try {
        const session = await requireAuth();
        const effectiveClinicId = session.role === "SUPER_ADMIN" ? clinicId : session.clinicId;
        const clinicFilter = effectiveClinicId ? { clinicId: effectiveClinicId } : {};

        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ...
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const chartData = [];

        for (let i = 0; i < 7; i++) {
            const dayStart = new Date(startOfWeek);
            dayStart.setDate(startOfWeek.getDate() + i);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const patients = await prisma.appointment.count({
                where: {
                    ...clinicFilter,
                    date: { gte: dayStart, lte: dayEnd },
                    status: { not: 'CANCELLED' },
                },
            });

            chartData.push({ name: dayNames[i], patients });
        }

        return { success: true, data: chartData };
    } catch (error: any) {
        return { success: false, data: [] };
    }
}

/**
 * Fetch upcoming appointments for the schedule widget.
 */
export async function getUpcomingSchedule(clinicId?: string) {
    try {
        const session = await requireAuth();
        const effectiveClinicId = session.role === "SUPER_ADMIN" ? clinicId : session.clinicId;
        const clinicFilter = effectiveClinicId ? { clinicId: effectiveClinicId } : {};

        const appointments = await prisma.appointment.findMany({
            where: {
                ...clinicFilter,
                date: { gte: new Date() },
                status: { not: 'CANCELLED' },
            },
            include: {
                patient: { select: { firstName: true, lastName: true } },
            },
            orderBy: { date: 'asc' },
            take: 5,
        });

        return {
            success: true,
            data: appointments.map((a) => ({
                id: a.id,
                time: a.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                patientName: `${a.patient.firstName} ${a.patient.lastName}`,
                type: a.type,
            })),
        };
    } catch (error: any) {
        return { success: false, data: [] };
    }
}
