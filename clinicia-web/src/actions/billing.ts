"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-session";

export async function createInvoice(formData: FormData) {
    const session = await requireAuth();
    const visitId = formData.get("visitId") as string;
    const consultationFee = parseFloat(formData.get("consultationFee") as string) || 0;

    // We'll calculate the total based on fee + any meds (placeholder logic)
    const items = [];
    let totalAmount = 0;

    // Add Consultation Fee
    if (consultationFee > 0) {
        items.push({
            description: "Consultation Fee",
            quantity: 1,
            unitPrice: consultationFee,
            total: consultationFee
        });
        totalAmount += consultationFee;
    }

    // Check for medicines from the visit to auto-add? 
    // For now, let's just stick to a basic fee + manual items if we had a complex form.
    // Simplifying for the 'Replica' speed:

    // Derive clinicId from the visit's patient
    const visit = await prisma.visit.findUnique({
        where: { id: visitId },
        select: { patientId: true, patient: { select: { clinicId: true } } }
    });

    if (!visit) {
        throw new Error("Visit not found.");
    }

    // Verify clinic access
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== visit.patient.clinicId) {
        throw new Error("Forbidden: Access denied");
    }

    const invoice = await prisma.invoice.create({
        data: {
            visitId,
            totalAmount,
            status: "PENDING",
            clinicId: visit.patient.clinicId,
            items: items
        }
    });

    revalidatePath("/billing");
    revalidatePath(`/emr/${visitId}`); // Assuming we link back
}

export async function markInvoicePaid(invoiceId: string) {
    const session = await requireAuth();

    // Verify the invoice belongs to the user's clinic
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { clinicId: true },
    });
    if (!invoice) throw new Error("Invoice not found");
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== invoice.clinicId) {
        throw new Error("Forbidden: Access denied");
    }

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" }
    });
    revalidatePath("/billing");
}
