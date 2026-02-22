import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { VisitForm } from "@/components/emr/VisitForm";
import { requireAuth } from "@/lib/auth-session";

export default async function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await requireAuth();
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
            patient: true,
            visit: {
                include: {
                    prescriptions: true,
                    invoices: true,
                    vitals: true,
                }
            },
        },
    });

    if (!appointment) {
        return notFound();
    }

    // Verify clinic access
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== appointment.clinicId) {
        return notFound();
    }

    const visit = appointment.visit;
    const prescription = visit?.prescriptions[0];
    const initialMeds = prescription ? JSON.parse(prescription.medications) : [];
    const vitals = visit?.vitals?.[0] || null;

    return (
        <VisitForm
            appointment={appointment}
            visit={visit}
            initialMeds={initialMeds}
            initialVitals={vitals}
        />
    );
}
