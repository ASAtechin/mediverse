"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth-session";

// Fetches patients for a specific clinic.
export async function getPatients(clinicId: string) {
    const session = await requireAuth();

    // SUPER_ADMIN can access any clinic, others must match
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== clinicId) {
        throw new Error("Forbidden: Access denied to this clinic");
    }

    if (!clinicId) return [];

    return prisma.patient.findMany({
        where: { clinicId },
        orderBy: { createdAt: "desc" },
        include: { appointments: true },
    });
}

export async function createPatient(formData: FormData, clinicId: string) {
    const session = await requireAuth();

    // Verify clinic access
    if (session.role !== "SUPER_ADMIN" && session.clinicId !== clinicId) {
        throw new Error("Forbidden: Access denied to this clinic");
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const dob = formData.get("dob") as string;
    const gender = formData.get("gender") as string;
    const address = formData.get("address") as string;
    const password = formData.get("password") as string;

    if (!firstName || !lastName || !phone || !dob || !gender || !clinicId) {
        throw new Error("Missing required fields");
    }

    // Hash password before storing
    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;

    await prisma.patient.create({
        data: {
            firstName,
            lastName,
            email: email || null,
            phone,
            password: hashedPassword,
            dateOfBirth: new Date(dob),
            gender,
            address: address || null,
            clinic: {
                connect: { id: clinicId }
            }
        },
    });

    revalidatePath("/patients");
}
