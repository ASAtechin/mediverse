import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { VisitForm } from "@/components/emr/VisitForm";

export default async function ConsultationPage({ params }: { params: { id: string } }) {
    const appointment = await prisma.appointment.findUnique({
        where: { id: params.id },
        include: { patient: true, visit: { include: { prescriptions: true, invoices: true } } },
    });

    if (!appointment) {
        return notFound();
    }

    const visit = appointment.visit;
    const prescription = visit?.prescriptions[0];
    const initialMeds = prescription ? JSON.parse(prescription.medications) : [];

    return (
        <VisitForm
            appointment={appointment}
            visit={visit}
            initialMeds={initialMeds}
        />
    );
}
