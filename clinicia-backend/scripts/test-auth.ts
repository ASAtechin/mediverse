import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
const serviceAccount = require('../service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const prisma = new PrismaClient();

async function main() {
  // List Firebase users
  const listResult = await admin.auth().listUsers(10);
  console.log('=== FIREBASE USERS ===');
  listResult.users.forEach((u) => console.log(u.uid, u.email, u.displayName));

  // Find the superadmin
  const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (superAdmin) {
    console.log('\n=== SUPERADMIN DB USER ===');
    console.log('ID:', superAdmin.id, 'Email:', superAdmin.email, 'FirebaseUID:', superAdmin.firebaseUid);
    
    try {
      const fbUser = await admin.auth().getUser(superAdmin.firebaseUid);
      console.log('Firebase user found:', fbUser.uid, fbUser.email);
      
      // Create a custom token
      const customToken = await admin.auth().createCustomToken(superAdmin.firebaseUid);
      console.log('SUPERADMIN_CUSTOM_TOKEN:', customToken);
    } catch (e: any) {
      console.log('SuperAdmin not in Firebase:', e.message);
    }
  }

  // Find the doctor Aditya (most likely test doctor)
  const doctor = await prisma.user.findFirst({ 
    where: { email: 'doctor_test_7344@clinicia.com' },
    include: { clinic: true }
  });
  if (doctor) {
    console.log('\n=== DOCTOR DB USER ===');
    console.log('ID:', doctor.id, 'Email:', doctor.email, 'FirebaseUID:', doctor.firebaseUid);
    console.log('Clinic:', doctor.clinic.name, 'ClinicID:', doctor.clinicId);
    
    try {
      const fbUser = await admin.auth().getUser(doctor.firebaseUid);
      console.log('Firebase user found:', fbUser.uid, fbUser.email);
      
      const customToken = await admin.auth().createCustomToken(doctor.firebaseUid);
      console.log('DOCTOR_CUSTOM_TOKEN:', customToken);
    } catch (e: any) {
      console.log('Doctor not in Firebase:', e.message);
    }
  }

  // Find any ADMIN user (clinic admin)
  const clinicAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    include: { clinic: true }
  });
  if (clinicAdmin) {
    console.log('\n=== CLINIC ADMIN DB USER ===');
    console.log('ID:', clinicAdmin.id, 'Email:', clinicAdmin.email, 'FirebaseUID:', clinicAdmin.firebaseUid);
    console.log('Clinic:', clinicAdmin.clinic.name);
    
    try {
      const fbUser = await admin.auth().getUser(clinicAdmin.firebaseUid);
      console.log('Firebase user found:', fbUser.uid, fbUser.email);
      
      const customToken = await admin.auth().createCustomToken(clinicAdmin.firebaseUid);
      console.log('ADMIN_CUSTOM_TOKEN:', customToken);
    } catch (e: any) {
      console.log('Admin not in Firebase:', e.message);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
