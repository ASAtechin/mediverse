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

    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const dob = formData.get("dob") as string;
    const gender = formData.get("gender") as string;
    const address = (formData.get("address") as string)?.trim();
    const password = formData.get("password") as string;

    // ── Validation ──
    if (!firstName || !lastName || !phone || !dob || !gender || !clinicId) {
        throw new Error("Missing required fields: First Name, Last Name, Phone, Date of Birth, and Gender are mandatory");
    }

    if (firstName.length < 2) throw new Error("First name must be at least 2 characters");
    if (lastName.length < 2) throw new Error("Last name must be at least 2 characters");

    // Phone validation
    if (!/^\+?[\d\s-]{7,15}$/.test(phone)) {
        throw new Error("Please enter a valid phone number (7-15 digits)");
    }

    // Email validation (optional field)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Please enter a valid email address");
    }

    // Date of birth validation
    const dobDate = new Date(dob);
    const today = new Date();
    if (isNaN(dobDate.getTime())) throw new Error("Invalid date of birth");
    if (dobDate > today) throw new Error("Date of birth cannot be in the future");
    
    const age = today.getFullYear() - dobDate.getFullYear();
    if (age > 150) throw new Error("Please enter a valid date of birth");

    // Gender validation
    if (!["Male", "Female", "Other"].includes(gender)) {
        throw new Error("Invalid gender selection");
    }

    // Check duplicate phone
    const existingPhone = await prisma.patient.findUnique({ where: { phone } });
    if (existingPhone) {
        throw new Error("A patient with this phone number already exists");
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
            dateOfBirth: dobDate,
            gender,
            address: address || null,
            clinic: {
                connect: { id: clinicId }
            }
        },
    });

    revalidatePath("/patients");
}
