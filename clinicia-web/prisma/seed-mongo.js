const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const clinicId = "669b7b7b7b7b7b7b7b7b7b7b"; // The hardcoded dev ID

    try {
        // Check if exists
        const exists = await prisma.clinic.findUnique({
            where: { id: clinicId }
        });

        if (!exists) {
            console.log("Creating Default Clinic...");
            await prisma.clinic.create({
                data: {
                    id: clinicId,
                    name: "Clinicia Demo Clinic",
                    address: "123 Health St, Medical City",
                    phone: "+91 98765 43210",
                    ownerId: "dev_user", // Placeholder
                    email: "demo@clinicia.com"
                }
            });
            console.log("Clinic created!");
        } else {
            console.log("Clinic already exists.");
        }
    } catch (error) {
        console.error("Error seeding clinic:", error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
