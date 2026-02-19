
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const email = "superadmin@clinicia.com";
    const uid = "VVLMW67ed5WbfWDxlf3mKdlD0163"; // UID from previous curl command

    console.log(`Syncing user ${email} with UID ${uid}...`);

    // Ensure the HQ clinic exists
    const hq = await prisma.clinic.upsert({
        where: { id: "669b7b7b7b7b7b7b7b7b7b7a" },
        update: {
            ownerId: uid
        },
        create: {
            id: "669b7b7b7b7b7b7b7b7b7b7a",
            name: "Clinicia HQ",
            status: "ACTIVE",
            plan: "ENTERPRISE",
            ownerId: uid,
            email: "hq@clinicia.com",
            address: "Global HQ",
            phone: "+1000000000"
        }
    });

    // Upsert the User
    const user = await prisma.user.upsert({
        where: { email: email },
        update: {
            firebaseUid: uid,
            role: "SUPER_ADMIN",
            clinicId: hq.id
        },
        create: {
            email: email,
            name: "Super Admin",
            role: "SUPER_ADMIN",
            firebaseUid: uid,
            clinicId: hq.id
        }
    });

    console.log("✅ User synced successfully!");
    console.log("UserID:", user.id);
    console.log("FirebaseUID:", user.firebaseUid);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
