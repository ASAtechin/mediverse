'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-session";

export async function getSettingsData(firebaseUid: string) {
    try {
        const session = await requireAuth();

        // Only allow users to access their own settings
        if (session.uid !== firebaseUid && session.role !== "SUPER_ADMIN") {
            return { success: false, error: "Forbidden" };
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: session.uid },
            include: { clinic: true }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateProfile(formData: FormData) {
    try {
        const session = await requireAuth();

        const name = formData.get("name") as string;

        // Always update the authenticated user's own profile
        await prisma.user.update({
            where: { firebaseUid: session.uid },
            data: { name }
        });

        revalidatePath("/settings");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateClinic(formData: FormData) {
    try {
        const session = await requireAuth();

        const clinicId = formData.get("clinicId") as string;
        const name = formData.get("name") as string;
        const address = formData.get("address") as string;
        const phone = formData.get("phone") as string;

        // Verify clinic ownership
        if (session.role !== "SUPER_ADMIN" && session.clinicId !== clinicId) {
            return { success: false, error: "Forbidden: Access denied" };
        }

        await prisma.clinic.update({
            where: { id: clinicId },
            data: { name, address, phone }
        });

        revalidatePath("/settings");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
