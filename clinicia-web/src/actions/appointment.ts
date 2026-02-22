"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-session";

// ─── GET APPOINTMENTS ────────────────────────────────────────────────────────

export async function getAppointments(clinicId?: string) {
    const session = await requireAuth();

    const effectiveClinicId =
        session.role === "SUPER_ADMIN" ? clinicId : session.clinicId;

    const clinicFilter = effectiveClinicId ? { clinicId: effectiveClinicId } : {};

    const appointments = await prisma.appointment.findMany({
        orderBy: { date: "asc" },
        include: { patient: true, doctor: true },
        where: {
            ...clinicFilter,
            date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
        },
    });

    // Serialize dates for client components
    return appointments.map((a) => ({
        id: a.id,
        date: a.date.toISOString(),
        status: a.status,
        type: a.type,
        notes: a.notes,
        tokenNumber: a.tokenNumber,
        patient: {
            id: a.patient.id,
            firstName: a.patient.firstName,
            lastName: a.patient.lastName,
        },
        doctor: a.doctor
            ? { id: a.doctor.id, name: a.doctor.name }
            : null,
    }));
}

// ─── GET FORM DATA (patients + doctors for dropdowns) ────────────────────────

export async function getAppointmentFormData(clinicId?: string) {
    const session = await requireAuth();

    const effectiveClinicId =
        session.role === "SUPER_ADMIN" ? clinicId : session.clinicId;

    const clinicFilter = effectiveClinicId ? { clinicId: effectiveClinicId } : {};

    const [patients, doctors] = await Promise.all([
        prisma.patient.findMany({
            where: clinicFilter,
            select: { id: true, firstName: true, lastName: true },
        }),
        prisma.user.findMany({
            where: { role: "DOCTOR", ...clinicFilter },
            select: { id: true, name: true },
        }),
    ]);

    return {
        patients,
        doctors,
        currentUserId: session.userId,
        currentUserRole: session.role,
    };
}

// ─── CREATE APPOINTMENT ──────────────────────────────────────────────────────

export async function createAppointment(formData: FormData) {
    const session = await requireAuth();

    const patientId = formData.get("patientId") as string;
    let doctorId = formData.get("doctorId") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const type = formData.get("type") as string;
    const notes = (formData.get("notes") as string)?.trim();

    // ── Validation ──
    if (!patientId) throw new Error("Please select a patient");
    if (!date) throw new Error("Please select a date");
    if (!time) throw new Error("Please select a time");

    // If no doctorId provided and the user is a doctor, self-assign
    if (!doctorId && session.role === "DOCTOR") {
        doctorId = session.userId;
    }

    if (!doctorId) {
        throw new Error("No doctor assigned. Please add a doctor first or select one.");
    }

    // Validate date is not in the past
    const appointmentDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(appointmentDateTime.getTime())) {
        throw new Error("Invalid date or time format");
    }

    const now = new Date();
    // Allow same-day appointments but not past dates
    const appointmentDate = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (appointmentDate < today) {
        throw new Error("Cannot book appointments in the past");
    }

    // Validate appointment type
    const validTypes = ["CONSULTATION", "FOLLOW_UP", "PROCEDURE", "EMERGENCY"];
    if (type && !validTypes.includes(type)) {
        throw new Error("Invalid appointment type");
    }

    // Derive clinicId from the doctor's profile
    const doctor = await prisma.user.findUnique({
        where: { id: doctorId },
        select: { clinicId: true, role: true }
    });

    if (!doctor) throw new Error("Doctor not found.");
    if (doctor.role !== "DOCTOR") throw new Error("Selected user is not a doctor.");

    // Verify the authenticated user belongs to this clinic
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== doctor.clinicId) {
        throw new Error("Forbidden: Access denied to this clinic");
    }

    // Verify patient exists and belongs to the same clinic
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { clinicId: true }
    });

    if (!patient) throw new Error("Patient not found.");
    if (patient.clinicId !== doctor.clinicId) {
        throw new Error("Patient and doctor belong to different clinics");
    }

    // Check for double booking (within 30 min window)
    const thirtyMinBefore = new Date(appointmentDateTime.getTime() - 30 * 60000);
    const thirtyMinAfter = new Date(appointmentDateTime.getTime() + 30 * 60000);

    const existing = await prisma.appointment.findFirst({
        where: {
            doctorId,
            date: {
                gte: thirtyMinBefore,
                lte: thirtyMinAfter,
            },
            status: { not: "CANCELLED" }
        }
    });

    if (existing) {
        throw new Error("Doctor already has an appointment within 30 minutes of this time slot.");
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
