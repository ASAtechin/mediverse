'use server';

import { prisma } from "@/lib/db";

export async function createPrismaUser(userData: {
    firebaseUid: string;
    email: string;
    name: string;
    role?: string;
}) {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            // Auto-link: Update the existing user's firebaseUid to match the new auth provider
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { firebaseUid: userData.firebaseUid }
            });
            return { success: true, message: "User account linked successfully." };
        }

        const clinic = await prisma.clinic.create({
            data: {
                name: `${userData.name}'s Clinic`,
                ownerId: userData.firebaseUid,
                address: "Default Address",
                phone: "000-000-0000",
                email: userData.email
            }
        });

        // Create the User linked to that Clinic
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                name: userData.name,
                firebaseUid: userData.firebaseUid,
                role: userData.role || 'DOCTOR',
                clinicId: clinic.id
            }
        });

        return { success: true, userId: user.id };

    } catch (error: any) {
        console.error("[AUTH] Error creating user:", error?.message);
        return { success: false, error: error.message };
    }
}
