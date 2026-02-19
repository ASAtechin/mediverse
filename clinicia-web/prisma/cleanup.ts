
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Starting System Cleanup...");

    // 1. Delete deeply nested / dependent dependencies first
    // Note: Deleting InvoiceItems (which are embedded in Invoice usually, but let's check schema. InvoiceItems is a TYPE, not a model)
    console.log("...Deleting Prescriptions");
    await prisma.prescription.deleteMany();

    console.log("...Deleting UsageRecords");
    await prisma.usageRecord.deleteMany();

    console.log("...Deleting InventoryItems");
    await prisma.inventoryItem.deleteMany();

    // Invoices are linked to Visits or Clinics
    console.log("...Deleting Invoices");
    await prisma.invoice.deleteMany();

    // Medications are strings in prescription, so no delete needed.

    // 2. Visits depend on Appointments
    console.log("...Deleting Visits");
    await prisma.visit.deleteMany(); // Cascades prescriptions usually but we deleted manually to be safe

    // 3. Appointments depend on Patients, Doctors, Clinics
    console.log("...Deleting Appointments");
    await prisma.appointment.deleteMany();

    // 3b. Delete Vitals and Attachments (depend on Patient)
    console.log("...Deleting Vitals");
    await prisma.vital.deleteMany();
    
    console.log("...Deleting Attachments");
    await prisma.attachment.deleteMany();

    // 3c. Delete Expenses
    console.log("...Deleting Expenses");
    await prisma.expense.deleteMany();

    // 4. Patients depend on Clinic
    console.log("...Deleting Patients");
    await prisma.patient.deleteMany();

    // 5. Delete Users (Doctors/Staff) EXCEPT Super Admin
    // We want to keep 'superadmin@clinicia.com' (UID: VVLMW67ed5WbfWDxlf3mKdlD0163)
    console.log("...Deleting Users (except Super Admin)");
    await prisma.user.deleteMany({
        where: {
            NOT: {
                OR: [
                    { email: "superadmin@clinicia.com" },
                    { firebaseUid: "VVLMW67ed5WbfWDxlf3mKdlD0163" }
                ]
            }
        }
    });

    // 6. Delete Clinics EXCEPT HQ
    // We must identify HQ. It's the one owned by Super Admin.
    console.log("...Deleting Clinics (except HQ)");

    // Find HQ Clinic IDs manually to be sure
    const superAdmins = await prisma.user.findMany({
        where: {
            OR: [
                { email: "superadmin@clinicia.com" },
                { firebaseUid: "VVLMW67ed5WbfWDxlf3mKdlD0163" }
            ]
        },
        select: { clinicId: true }
    });

    const hqIds = superAdmins.map((u: any) => u.clinicId).filter((id: any) => id !== null);

    await prisma.clinic.deleteMany({
        where: {
            id: { notIn: hqIds }
        }
    });

    // 7. Subscriptions
    console.log("...Deleting Subscriptions");
    // Only delete subscriptions if they don't belong to HQ (though HQ is Enterprise usually)
    await prisma.subscription.deleteMany({
        where: {
            clinicId: { notIn: hqIds }
        }
    });

    console.log("✅ System Cleanup Complete. All mock data removed.");
    console.log("Retained HQ Clinic IDs:", hqIds);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
