import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Starting database seeding...")

    // Clear existing data (optional, but good for idempotent runs if relations allow)
    // await prisma.invoice.deleteMany()
    // await prisma.prescription.deleteMany()
    // await prisma.visit.deleteMany()
    // await prisma.appointment.deleteMany()
    // await prisma.patient.deleteMany()
    // await prisma.user.deleteMany()
    // await prisma.clinic.deleteMany()

    // 1. Create Main Clinic
    const clinic = await prisma.clinic.create({
        data: {
            name: "Clinicia Health Center",
            address: "123 Wellness Blvd, Tech City",
            phone: "+1-555-0123",
            email: "contact@clinicia.health",
            ownerId: "firebase-owner-uid-123",
        }
    });

    console.log("Created Clinic");

    // 2. Create Doctors
    const doctor = await prisma.user.upsert({
        where: { email: 'doctor@clinicia.com' },
        update: { clinicId: clinic.id },
        create: {
            email: 'doctor@clinicia.com',
            name: 'Dr. Sarah Patel',
            role: 'DOCTOR',
            firebaseUid: "firebase-doctor-uid-123",
            clinicId: clinic.id
        },
    });

    // Additional Doctor
    const doctor2 = await prisma.user.upsert({
        where: { email: 'dr.james@clinicia.com' },
        update: { clinicId: clinic.id },
        create: {
            email: 'dr.james@clinicia.com',
            name: 'Dr. James Wilson',
            role: 'DOCTOR',
            firebaseUid: "firebase-doctor-uid-456",
            clinicId: clinic.id
        }
    });

    console.log("Created Doctors");

    // 3. Create Patients
    const patientsData = [
        {
            firstName: 'John', lastName: 'Doe', dob: '1985-04-23', gender: 'Male',
            phone: '555-0101', email: 'john.doe@example.com', address: '123 Main St'
        },
        {
            firstName: 'Jane', lastName: 'Smith', dob: '1992-11-15', gender: 'Female',
            phone: '555-0102', email: 'jane.smith@example.com', address: '456 Oak Ave'
        },
        {
            firstName: 'Robert', lastName: 'Brown', dob: '1978-06-10', gender: 'Male',
            phone: '555-0103', email: 'bob.brown@example.com', address: '789 Pine Rd'
        },
        {
            firstName: 'Emily', lastName: 'Davis', dob: '2001-09-30', gender: 'Female',
            phone: '555-0104', email: 'emily.d@example.com', address: '321 Elm St'
        },
        {
            firstName: 'Michael', lastName: 'Chen', dob: '1990-02-14', gender: 'Male',
            phone: '555-0105', email: 'mike.chen@example.com', address: '654 Maple Dr'
        }
    ];

    const patients = [];
    for (const p of patientsData) {
        const patient = await prisma.patient.create({
            data: {
                firstName: p.firstName,
                lastName: p.lastName,
                dateOfBirth: new Date(p.dob),
                gender: p.gender,
                phone: p.phone,
                email: p.email,
                address: p.address,
                clinicId: clinic.id
            }
        });
        patients.push(patient);
    }
    console.log(`Created ${patients.length} Patients`);

    // 4. Create Appointments & Visits (History)
    // Recent past appointment (Completed with Visit)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2); // 2 days ago

    const appt1 = await prisma.appointment.create({
        data: {
            clinicId: clinic.id,
            patientId: patients[0].id,
            doctorId: doctor.id,
            date: pastDate,
            status: 'COMPLETED',
            type: 'CONSULTATION',
            notes: 'Regular checkup'
        }
    });

    const visit1 = await prisma.visit.create({
        data: {
            appointmentId: appt1.id,
            patientId: patients[0].id,
            diagnosis: 'Seasonal Allergies',
            symptoms: 'Sneezing, runny nose, itchy eyes',
            notes: 'Patient advised to avoid known allergens.',
            createdAt: pastDate, // Backdate creation
        }
    });

    // Prescription for Visit 1
    await prisma.prescription.create({
        data: {
            visitId: visit1.id,
            medications: JSON.stringify([
                { name: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "7 days" },
                { name: "Fluticasone", dosage: "1 spray", frequency: "Twice daily", duration: "14 days" }
            ]),
            createdAt: pastDate
        }
    });

    // Invoice for Visit 1
    await prisma.invoice.create({
        data: {
            clinicId: clinic.id,
            visitId: visit1.id,
            totalAmount: 50.00,
            status: 'PAID',
            items: [
                { id: "1", description: "Consultation Fee", quantity: 1, unitPrice: 50.00, total: 50.00 }
            ],
            createdAt: pastDate
        }
    });

    // Today's Appointments
    const today = new Date();
    today.setHours(9, 0, 0, 0); // 9 AM

    await prisma.appointment.create({
        data: {
            clinicId: clinic.id,
            patientId: patients[1].id,
            doctorId: doctor.id,
            date: today,
            status: 'SCHEDULED',
            type: 'CONSULTATION',
            notes: 'Follow-up on bloodwork'
        }
    });

    const todayNoon = new Date(today);
    todayNoon.setHours(12, 30, 0, 0);

    await prisma.appointment.create({
        data: {
            clinicId: clinic.id,
            patientId: patients[2].id,
            doctorId: doctor.id,
            date: todayNoon,
            status: 'SCHEDULED',
            type: 'ROUTINE_CHECKUP',
        }
    });

    // Future Appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    await prisma.appointment.create({
        data: {
            clinicId: clinic.id,
            patientId: patients[3].id,
            doctorId: doctor2.id,
            date: tomorrow,
            status: 'SCHEDULED',
            type: 'CONSULTATION',
            notes: 'First time visit'
        }
    });

    console.log("Created Appointments, Visits, Prescriptions, and Invoices");

    // --- SAAS SEEDING ---

    // 5. Create a Super Admin Clinic (The Platform Owner's HQ)
    // Note: ownerId is optional now, but good to have.
    const hq = await prisma.clinic.create({
        data: {
            name: "Clinicia HQ",
            status: "ACTIVE",
            plan: "ENTERPRISE",
            ownerId: "super_admin_uid_123"
        }
    });

    // 6. Create the Super Admin User
    await prisma.user.create({
        data: {
            name: "Super Admin",
            email: "admin@clinicia.com",
            role: "SUPER_ADMIN",
            firebaseUid: "super_admin_uid_123",
            clinicId: hq.id
        }
    });

    console.log("Seed data created successfully");
    console.log("Super Admin: admin@clinicia.com");
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
