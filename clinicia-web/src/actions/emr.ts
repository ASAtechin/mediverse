"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-session";

export async function saveConsultation(formData: FormData) {
    const session = await requireAuth();

    const appointmentId = formData.get("appointmentId") as string;
    const patientId = formData.get("patientId") as string;
    const symptoms = formData.get("symptoms") as string;
    const diagnosis = formData.get("diagnosis") as string;
    const notes = formData.get("notes") as string;

    // Handle Prescription Data
    const medicines = formData.getAll("medicine[]");
    const dosages = formData.getAll("dosage[]");
    const frequencies = formData.getAll("frequency[]");
    const durations = formData.getAll("duration[]");

    const prescriptionItems = medicines.map((med, index) => ({
        medicine: med,
        dosage: dosages[index],
        frequency: frequencies[index],
        duration: durations[index],
    })).filter(item => item.medicine !== "");

    // Verify the appointment belongs to the user's clinic
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { clinicId: true },
    });
    if (!appointment) throw new Error("Appointment not found");
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== appointment.clinicId) {
        throw new Error("Forbidden: Access denied to this appointment");
    }

    // Update or Create Visit
    const visit = await prisma.visit.upsert({
        where: { appointmentId },
        update: {
            symptoms,
            diagnosis,
            notes,
        },
        create: {
            appointmentId,
            patientId,
            symptoms,
            diagnosis,
            notes,
        },
    });

    // Handle Prescription
    if (prescriptionItems.length > 0) {
        // For simplicity, we delete old prescription for this visit and create new
        // In a real app, we might update individual items or have a more complex structure
        // Since our schema has Prescription linked to Visit, let's see.
        // Schema: Prescription has 'medications' String (JSON). 

        // Check if prescription exists
        const existingPrescription = await prisma.prescription.findFirst({
            where: { visitId: visit.id }
        });

        const medicationsJson = JSON.stringify(prescriptionItems);

        if (existingPrescription) {
            await prisma.prescription.update({
                where: { id: existingPrescription.id },
                data: { medications: medicationsJson }
            });
        } else {
            await prisma.prescription.create({
                data: {
                    visitId: visit.id,
                    medications: medicationsJson
                }
            });
        }
    }

    // Update Appointment Status
    await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "COMPLETED" },
    });

    revalidatePath(`/emr/${appointmentId}`);
    revalidatePath("/appointments");
}
