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

    // Vitals Data
    const bp = formData.get("bp") as string;
    const pulse = formData.get("pulse") as string;
    const temperature = formData.get("temperature") as string;
    const weight = formData.get("weight") as string;
    const height = formData.get("height") as string;
    const spo2 = formData.get("spo2") as string;

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

    // Update or Create Visit — now includes clinicId
    const visit = await prisma.visit.upsert({
        where: { appointmentId },
        update: {
            symptoms,
            diagnosis,
            notes,
            clinicId: appointment.clinicId,
        },
        create: {
            appointmentId,
            patientId,
            symptoms,
            diagnosis,
            notes,
            clinicId: appointment.clinicId,
        },
    });

    // Save Vitals — upsert: if vitals exist for this visit, update; otherwise create
    const hasVitals = bp || pulse || temperature || weight || height || spo2;
    if (hasVitals) {
        // Parse BP "120/80" → systolic/diastolic
        let bpSystolic: number | null = null;
        let bpDiastolic: number | null = null;
        if (bp && bp.includes("/")) {
            const [sys, dia] = bp.split("/");
            bpSystolic = parseInt(sys) || null;
            bpDiastolic = parseInt(dia) || null;
        }

        const vitalsData = {
            bpSystolic,
            bpDiastolic,
            pulse: pulse ? parseInt(pulse) : null,
            temperature: temperature ? parseFloat(temperature) : null,
            weight: weight ? parseFloat(weight) : null,
            height: height ? parseFloat(height) : null,
            spo2: spo2 ? parseInt(spo2) : null,
            patientId,
            clinicId: appointment.clinicId,
            visitId: visit.id,
        };

        const existingVital = await prisma.vital.findFirst({
            where: { visitId: visit.id },
        });

        if (existingVital) {
            await prisma.vital.update({
                where: { id: existingVital.id },
                data: vitalsData,
            });
        } else {
            await prisma.vital.create({ data: vitalsData });
        }
    }

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
