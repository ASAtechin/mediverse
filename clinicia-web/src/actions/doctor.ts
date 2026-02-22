"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-session";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type DoctorWithStats = {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    specialization: string | null;
    qualification: string | null;
    createdAt: Date;
    _count: {
        appointments: number;
    };
};

// ─── GET ALL DOCTORS ─────────────────────────────────────────────────────────

export async function getDoctors(clinicId?: string): Promise<DoctorWithStats[]> {
    const session = await requireAuth();

    const effectiveClinicId =
        session.role === "SUPER_ADMIN" ? clinicId : session.clinicId;

    const clinicFilter = effectiveClinicId ? { clinicId: effectiveClinicId } : {};

    return prisma.user.findMany({
        where: {
            role: "DOCTOR",
            ...clinicFilter,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            specialization: true,
            qualification: true,
            createdAt: true,
            _count: {
                select: { appointments: true },
            },
        },
        orderBy: { createdAt: "desc" },
    }) as any;
}

// ─── GET SINGLE DOCTOR ───────────────────────────────────────────────────────

export async function getDoctor(doctorId: string) {
    const session = await requireAuth();

    const doctor = await prisma.user.findUnique({
        where: { id: doctorId },
        include: {
            clinic: { select: { name: true } },
            _count: { select: { appointments: true } },
        },
    });

    if (!doctor) throw new Error("Doctor not found");

    // Verify clinic access
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== doctor.clinicId) {
        throw new Error("Forbidden: Access denied");
    }

    return doctor;
}

// ─── CREATE DOCTOR ───────────────────────────────────────────────────────────
// Creates a User record with role DOCTOR. Firebase account must already exist
// (created during sign-up) — here we link by email.

export async function createDoctor(formData: FormData, clinicId: string) {
    const session = await requireAuth();

    // Only ADMIN or SUPER_ADMIN can add doctors
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
        throw new Error("Forbidden: Only admins can add doctors");
    }

    if (session.role !== "SUPER_ADMIN" && session.clinicId !== clinicId) {
        throw new Error("Forbidden: Access denied to this clinic");
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const specialization = formData.get("specialization") as string;
    const qualification = formData.get("qualification") as string;

    // ── Validation ──
    if (!name || !email) {
        throw new Error("Name and email are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
    }

    // Validate phone if provided
    if (phone && !/^\+?[\d\s-]{7,15}$/.test(phone)) {
        throw new Error("Please enter a valid phone number");
    }

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("A user with this email already exists");
    }

    // Create a Firebase account for the doctor and link
    const { initAdmin } = await import("@/lib/firebase-admin");
    await initAdmin();
    const admin = await import("firebase-admin");

    let firebaseUser;
    try {
        // Check if Firebase user already exists
        firebaseUser = await admin.auth().getUserByEmail(email);
    } catch {
        // Create a new Firebase user with a temporary password
        firebaseUser = await admin.auth().createUser({
            email,
            displayName: name,
            password: `Temp${Date.now()}!`, // Temporary — doctor resets on first login
        });
    }

    await prisma.user.create({
        data: {
            name,
            email,
            phone: phone || null,
            role: "DOCTOR",
            specialization: specialization || null,
            qualification: qualification || null,
            firebaseUid: firebaseUser.uid,
            clinic: { connect: { id: clinicId } },
        },
    });

    revalidatePath("/doctors");
    revalidatePath("/appointments");
}

// ─── UPDATE DOCTOR ───────────────────────────────────────────────────────────

export async function updateDoctor(doctorId: string, formData: FormData) {
    const session = await requireAuth();

    if (!["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
        throw new Error("Forbidden: Only admins can update doctors");
    }

    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new Error("Doctor not found");

    if (session.role !== "SUPER_ADMIN" && session.clinicId !== doctor.clinicId) {
        throw new Error("Forbidden: Access denied");
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const specialization = formData.get("specialization") as string;
    const qualification = formData.get("qualification") as string;

    if (!name) throw new Error("Name is required");

    if (phone && !/^\+?[\d\s-]{7,15}$/.test(phone)) {
        throw new Error("Please enter a valid phone number");
    }

    await prisma.user.update({
        where: { id: doctorId },
        data: {
            name,
            phone: phone || null,
            specialization: specialization || null,
            qualification: qualification || null,
        },
    });

    revalidatePath("/doctors");
    revalidatePath("/appointments");
}

// ─── DELETE DOCTOR ───────────────────────────────────────────────────────────

export async function deleteDoctor(doctorId: string) {
    const session = await requireAuth();

    if (!["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
        throw new Error("Forbidden: Only admins can remove doctors");
    }

    const doctor = await prisma.user.findUnique({
        where: { id: doctorId },
        include: { _count: { select: { appointments: true } } },
    });

    if (!doctor) throw new Error("Doctor not found");

    if (session.role !== "SUPER_ADMIN" && session.clinicId !== doctor.clinicId) {
        throw new Error("Forbidden: Access denied");
    }

    // Safety: prevent deletion if doctor has upcoming appointments
    const futureAppointments = await prisma.appointment.count({
        where: {
            doctorId,
            date: { gte: new Date() },
            status: { not: "CANCELLED" },
        },
    });

    if (futureAppointments > 0) {
        throw new Error(
            `Cannot delete: This doctor has ${futureAppointments} upcoming appointment(s). Cancel or reassign them first.`
        );
    }

    // Delete the user record (keeps Firebase account for potential re-use)
    await prisma.user.delete({ where: { id: doctorId } });

    revalidatePath("/doctors");
    revalidatePath("/appointments");
}
