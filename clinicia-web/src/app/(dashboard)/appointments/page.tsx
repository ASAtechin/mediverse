import { prisma } from "@/lib/db";
import { BookAppointmentDialog } from "@/components/appointments/BookAppointmentDialog";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-session";

export default async function AppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ clinicId?: string }>;
}) {
    // Verify authentication and get the real clinicId from session
    const session = await requireAuth();
    const clinicId = session.role === "SUPER_ADMIN"
        ? (await searchParams).clinicId || undefined
        : session.clinicId;

    // Build clinic-scoped filter
    const clinicFilter = clinicId ? { clinicId } : {};

    const appointments = await prisma.appointment.findMany({
        orderBy: { date: "asc" },
        include: { patient: true, doctor: true },
        where: {
            ...clinicFilter,
            date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)) // Upcoming from today
            }
        }
    });

    const patients = await prisma.patient.findMany({
        where: clinicFilter,
        select: { id: true, firstName: true, lastName: true }
    });
    const doctors = await prisma.user.findMany({
        where: { role: 'DOCTOR', ...clinicFilter },
        select: { id: true, name: true }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Appointments
                </h1>
                <BookAppointmentDialog patients={patients} doctors={doctors} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="space-y-4">
                    {appointments.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No upcoming appointments scheduled.
                        </div>
                    )}
                    {appointments.map((appt) => (
                        <div
                            key={appt.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg border text-sm">
                                    <span className="font-bold text-slate-900">{appt.date.getDate()}</span>
                                    <span className="text-xs text-slate-500 uppercase">{appt.date.toLocaleString('default', { month: 'short' })}</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900">
                                        <a href={`/emr/${appt.id}`} className="hover:underline hover:text-primary">
                                            {appt.patient.firstName} {appt.patient.lastName}
                                        </a>
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        with {appt.doctor.name} • {appt.type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="font-medium text-slate-900">{appt.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className={cn("text-xs font-medium uppercase", appt.status === 'SCHEDULED' ? "text-blue-600" : "text-green-600")}>
                                        {appt.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
