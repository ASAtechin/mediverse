import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const clinicId = "669b7b7b7b7b7b7b7b7b7b7b"; // The hardcoded dev ID
    const patientId = "669b7b7b7b7b7b7b7b7b7b7c"; // The hardcoded patient ID used in mobile app fallback
    const doctorId1 = "669b7b7b7b7b7b7b7b7b7b7d";
    const doctorId2 = "669b7b7b7b7b7b7b7b7b7b7e";

    console.log("🌱 Starting Seeding...");

    // 1. Upsert Clinic
    const clinic = await prisma.clinic.upsert({
        where: { id: clinicId },
        update: {},
        create: {
            id: clinicId,
            name: "Clinicia Demo Clinic",
            address: "123 Health St, Medical City",
            phone: "+91 98765 43210",
            ownerId: "dev_user",
            email: "demo@clinicia.com"
        }
    });
    console.log("✅ Clinic Ready:", clinic.name);

    // 2. Upsert Doctors
    await prisma.user.upsert({
        where: { id: doctorId1 },
        update: {},
        create: {
            id: doctorId1,
            name: "Dr. Stephen Strange",
            email: "strange@clinicia.com",
            role: "DOCTOR",
            firebaseUid: "doctor_strange_uid",
            clinicId: clinicId
        }
    });

    await prisma.user.upsert({
        where: { id: doctorId2 },
        update: {},
        create: {
            id: doctorId2,
            name: "Dr. Gregory House",
            email: "house@clinicia.com",
            role: "DOCTOR",
            firebaseUid: "doctor_house_uid",
            clinicId: clinicId
        }
    });
    console.log("✅ Doctors Ready");

    // 3. Upsert Patient (The one mobile app uses as fallback/test)
    const patient = await prisma.patient.upsert({
        where: { id: patientId },
        update: {},
        create: {
            id: patientId,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            dateOfBirth: new Date("1990-01-01"),
            gender: "Male",
            clinicId: clinicId,
            address: "456 User Lane"
        }
    });
    console.log("✅ Test Patient Ready:", patient.firstName);

    // 4. Create Future Appointment (Dashboard Scenario)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    // Check if appointment exists to avoid duplicates
    const existingFutureAppt = await prisma.appointment.findFirst({
        where: {
            patientId: patientId,
            date: tomorrow
        }
    });

    if (!existingFutureAppt) {
        await prisma.appointment.create({
            data: {
                date: tomorrow,
                status: "SCHEDULED",
                type: "CONSULTATION",
                notes: "Regular checkup",
                clinicId: clinicId,
                patientId: patientId,
                doctorId: doctorId1
            }
        });
        console.log("✅ Future Appointment Created");
    }

    // 5. Create Past Appointment + Visit + Prescription (Records Scenario)
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    lastMonth.setHours(14, 30, 0, 0);

    let pastAppt = await prisma.appointment.findFirst({
        where: {
            patientId: patientId,
            date: lastMonth
        }
    });

    if (!pastAppt) {
        pastAppt = await prisma.appointment.create({
            data: {
                date: lastMonth,
                status: "COMPLETED",
                type: "FOLLOW_UP",
                notes: "Fever and cold",
                clinicId: clinicId,
                patientId: patientId,
                doctorId: doctorId2
            }
        });
        console.log("✅ Past Appointment Created");
    }

    // Create Visit Record for Past Appointment
    const existingVisit = await prisma.visit.findFirst({
        where: { appointmentId: pastAppt.id }
    });

    if (!existingVisit) {
        await prisma.visit.create({
            data: {
                appointmentId: pastAppt.id,
                patientId: patientId,
                diagnosis: "Viral Fever",
                symptoms: "High temperature, cough",
                prescriptions: {
                    create: {
                        medications: JSON.stringify([
                            { name: "Paracetamol", dosage: "500mg", frequency: "Twice a day", duration: "5 days" },
                            { name: "Vitamin C", dosage: "1000mg", frequency: "Once a day", duration: "10 days" }
                        ])
                    }
                }
            }
        });
        console.log("✅ Medical Record (Visit & Prescription) Created");
    }

    console.log("🚀 Seeding Complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
