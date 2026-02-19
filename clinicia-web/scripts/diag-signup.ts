

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Starting diagnostic signup...");
    const firebaseUid = "test-uid-" + Date.now();
    const email = "diag" + Date.now() + "@example.com";
    const name = "Diagnostic Doctor";

    try {
        console.log("Creating Clinic...");
        const clinic = await prisma.clinic.create({
            data: {
                name: `${name}'s Clinic`,
                ownerId: firebaseUid,
                address: "Default Address",
                phone: "000-000-0000",
                email: email
            }
        });
        console.log("Clinic created:", clinic.id);

        console.log("Creating User...");
        const user = await prisma.user.create({
            data: {
                email: email,
                name: name,
                firebaseUid: firebaseUid,
                role: 'DOCTOR',
                clinicId: clinic.id
            }
        });
        console.log("User created:", user.id);
        console.log("SUCCESS");

    } catch (e) {
        console.error("FAILURE:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

