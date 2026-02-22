import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-session";
import EMRListClient from "@/components/emr/EMRListClient";

export default async function EMRListPage() {
    const session = await requireAuth();

    // Clinic-scoped filter: SUPER_ADMIN sees all, others see only their clinic
    const clinicFilter = session.role === "SUPER_ADMIN" ? {} : { clinicId: session.clinicId };

    const visits = await prisma.visit.findMany({
        where: clinicFilter,
        orderBy: { createdAt: "desc" },
        include: {
            patient: true,
            appointment: {
                include: {
                    doctor: { select: { name: true } }
                }
            }
        },
    });

    // Serialize dates for client component
    const serializedVisits = visits.map(v => ({
        id: v.id,
        appointmentId: v.appointmentId,
        diagnosis: v.diagnosis,
        symptoms: v.symptoms,
        createdAt: v.createdAt.toISOString(),
        appointmentDate: v.appointment?.date?.toISOString() || null,
        appointmentTime: v.appointment?.date
            ? v.appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : null,
        patientName: `${v.patient.firstName} ${v.patient.lastName}`,
        doctorName: v.appointment?.doctor?.name || 'Unknown Doctor',
    }));

    return <EMRListClient visits={serializedVisits} />;
}
