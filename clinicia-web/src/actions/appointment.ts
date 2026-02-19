"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-session";

export async function createAppointment(formData: FormData) {
    const session = await requireAuth();

    const patientId = formData.get("patientId") as string;
    const doctorId = formData.get("doctorId") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const type = formData.get("type") as string;
    const notes = formData.get("notes") as string;

    if (!patientId || !doctorId || !date || !time) {
        throw new Error("Missing required fields");
    }

    // Combine date and time
    const appointmentDateTime = new Date(`${date}T${time}:00`);

    // Derive clinicId from the doctor's profile
    const doctor = await prisma.user.findUnique({
        where: { id: doctorId },
        select: { clinicId: true }
    });

    if (!doctor) {
        throw new Error("Doctor not found.");
    }

    // Verify the authenticated user belongs to this clinic
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== doctor.clinicId) {
        throw new Error("Forbidden: Access denied to this clinic");
    }

    // Check for double booking
    const existing = await prisma.appointment.findFirst({
        where: {
            doctorId,
            date: appointmentDateTime,
            status: { not: "CANCELLED" }
        }
    });

    if (existing) {
        throw new Error("Doctor is already booked at this time.");
    }

    await prisma.appointment.create({
        data: {
            patientId,
            doctorId,
            date: appointmentDateTime,
            type: type || "CONSULTATION",
            notes: notes || null,
            status: "SCHEDULED",
            clinicId: doctor.clinicId
        },
    });

    revalidatePath("/appointments");
    revalidatePath("/");
}
