import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
const serviceAccount = require('../service-account.json');
const https = require('https');
const http = require('http');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const prisma = new PrismaClient();
const FIREBASE_API_KEY = 'AIzaSyAS8jNhh0t3BN-K3aZkGDCo2pPq7h6RDoo';

async function exchangeCustomTokenForIdToken(customToken: string): Promise<string> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;
  const body = JSON.stringify({ token: customToken, returnSecureToken: true });
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.idToken) resolve(parsed.idToken);
        else reject(new Error('Failed: ' + data));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

let passed = 0;
let failed = 0;
let expectedFails = 0;

async function testEndpoint(name: string, url: string, token: string, method = 'GET', body?: any, expectStatus?: number): Promise<any> {
  return new Promise<any>((resolve) => {
    const parsedUrl = new URL(url);
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options: any = {
      hostname: parsedUrl.hostname, port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search, method, headers
    };
    const req = http.request(options, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        let parsed: any;
        try { parsed = JSON.parse(data); } catch { parsed = data.substring(0, 200); }
        const isExpectedFail = expectStatus && expectStatus === status;
        const isPass = status >= 200 && status < 300;
        const icon = isPass ? '✅' : isExpectedFail ? '🔒' : '❌';
        if (isPass) passed++;
        else if (isExpectedFail) expectedFails++;
        else failed++;
        const summary = typeof parsed === 'object' ? JSON.stringify(parsed).substring(0, 250) : parsed;
        console.log(`  ${icon} ${name} → ${status} ${summary.substring(0, 150)}`);
        resolve(parsed);
      });
    });
    req.on('error', (e: any) => { console.log(`  ❌ ${name} → ERROR: ${e.message}`); failed++; resolve(null); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('Generating ID Tokens...\n');
  const saToken = await exchangeCustomTokenForIdToken(await admin.auth().createCustomToken('VVLMW67ed5WbfWDxlf3mKdlD0163'));
  const docToken = await exchangeCustomTokenForIdToken(await admin.auth().createCustomToken('ipHVf3JctcSjaTQloaSOUT95H953'));
  const adminToken = await exchangeCustomTokenForIdToken(await admin.auth().createCustomToken('WPILkkLCzYPJ9AFGaRci4Xacs6j1'));
  console.log('✅ All tokens obtained\n');

  // =============================
  console.log('═══════════════════════════════════════');
  console.log('  BACKEND API (port 4000) TESTS');
  console.log('═══════════════════════════════════════\n');

  console.log('── Auth ──');
  await testEndpoint('GET /auth/me (SuperAdmin)', 'http://localhost:4000/api/auth/me', saToken);
  await testEndpoint('GET /auth/me (Doctor)', 'http://localhost:4000/api/auth/me', docToken);
  await testEndpoint('GET /auth/me (ClinicAdmin)', 'http://localhost:4000/api/auth/me', adminToken);
  await testEndpoint('GET /auth/me (invalid token)', 'http://localhost:4000/api/auth/me', 'bad', 'GET', undefined, 401);

  console.log('\n── Doctors ──');
  await testEndpoint('GET /doctors (Doctor)', 'http://localhost:4000/api/doctors', docToken);
  await testEndpoint('GET /doctors (ClinicAdmin)', 'http://localhost:4000/api/doctors', adminToken);
  await testEndpoint('GET /doctors/:id/slots', 'http://localhost:4000/api/doctors/6972788a92b0ad862a46bbba/slots?date=2025-07-20', docToken);

  console.log('\n── Patients ──');
  await testEndpoint('GET /patients (Doctor)', 'http://localhost:4000/api/patients', docToken);
  const newPatient = await testEndpoint('POST /patients (create)', 'http://localhost:4000/api/patients', docToken, 'POST', {
    firstName: 'E2E', lastName: 'TestPatient', dob: '1990-05-15', gender: 'Male', phone: '5551234567', email: 'e2e@test.com'
  });
  if (newPatient && newPatient.id) {
    console.log(`    → Created patient ID: ${newPatient.id}`);
  }

  console.log('\n── Appointments ──');
  await testEndpoint('GET /appointments (Doctor)', 'http://localhost:4000/api/appointments', docToken);
  
  // Create an appointment using the created patient
  if (newPatient && newPatient.id) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const newAppt = await testEndpoint('POST /appointments (create)', 'http://localhost:4000/api/appointments', docToken, 'POST', {
      patientId: newPatient.id,
      date: tomorrow.toISOString(),
      type: 'CONSULTATION',
      notes: 'E2E test appointment'
    });
    if (newAppt && newAppt.id) {
      console.log(`    → Created appointment ID: ${newAppt.id}`);
    }
    
    // Verify it shows up
    await testEndpoint('GET /appointments (after create)', 'http://localhost:4000/api/appointments', docToken);
  }

  console.log('\n── Admin ──');
  await testEndpoint('GET /admin/stats (SuperAdmin)', 'http://localhost:4000/api/admin/stats', saToken);
  await testEndpoint('GET /admin/tenants (SuperAdmin)', 'http://localhost:4000/api/admin/tenants', saToken);
  await testEndpoint('GET /admin/subscriptions (SuperAdmin)', 'http://localhost:4000/api/admin/subscriptions', saToken);
  await testEndpoint('GET /admin/stats (Doctor - forbidden)', 'http://localhost:4000/api/admin/stats', docToken, 'GET', undefined, 403);
  await testEndpoint('GET /admin/tenants (no auth)', 'http://localhost:4000/api/admin/tenants', '', 'GET', undefined, 401);

  console.log('\n── Patient API (Mobile) ──');
  await testEndpoint('GET /patient/profile', 'http://localhost:4000/api/patient/profile', docToken);
  await testEndpoint('GET /patient/appointments (John Doe)', 'http://localhost:4000/api/patient/appointments?patientId=6971bc2ebbc4c4dbdc22d7d4', docToken);
  await testEndpoint('GET /patient/records (John Doe)', 'http://localhost:4000/api/patient/records?patientId=6971bc2ebbc4c4dbdc22d7d4', docToken);
  
  // Book appointment via patient API
  if (newPatient && newPatient.id) {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);
    await testEndpoint('POST /patient/appointments (book)', 'http://localhost:4000/api/patient/appointments', docToken, 'POST', {
      doctorId: '6972788a92b0ad862a46bbba',
      patientId: newPatient.id,
      clinicId: '6972788a92b0ad862a46bbb9',
      date: dayAfter.toISOString(),
      type: 'FOLLOW_UP'
    });
  }

  // =============================
  console.log('\n═══════════════════════════════════════');
  console.log('  WEB API (port 3000) TESTS');
  console.log('═══════════════════════════════════════\n');

  console.log('── Auth ──');
  await testEndpoint('POST /api/login (Doctor)', 'http://localhost:3000/api/login', docToken, 'POST');
  await testEndpoint('GET /api/auth/me (Doctor)', 'http://localhost:3000/api/auth/me', docToken);
  await testEndpoint('GET /api/auth/me (no auth)', 'http://localhost:3000/api/auth/me', '', 'GET', undefined, 401);

  console.log('\n── Doctors ──');
  await testEndpoint('GET /api/doctors (Doctor)', 'http://localhost:3000/api/doctors', docToken);
  await testEndpoint('GET /api/doctors/:id/slots', 'http://localhost:3000/api/doctors/6972788a92b0ad862a46bbba/slots?date=2025-07-20', docToken);

  console.log('\n── Expenses ──');
  await testEndpoint('GET /api/expenses (Doctor)', 'http://localhost:3000/api/expenses', docToken);
  await testEndpoint('POST /api/expenses (create)', 'http://localhost:3000/api/expenses', docToken, 'POST', {
    date: new Date().toISOString(), category: 'Equipment', amount: 5000, note: 'E2E test expense'
  });
  await testEndpoint('GET /api/expenses (after create)', 'http://localhost:3000/api/expenses', docToken);

  console.log('\n── Portal Login ──');
  await testEndpoint('Portal Login (empty body)', 'http://localhost:3000/api/portal/auth/login', '', 'POST', {}, 400);
  await testEndpoint('Portal Login (missing password)', 'http://localhost:3000/api/portal/auth/login', '', 'POST', { phone: '9999999999' }, 400);
  await testEndpoint('Portal Login (wrong creds)', 'http://localhost:3000/api/portal/auth/login', '', 'POST', { phone: '9999999999', password: 'wrong' }, 401);

  console.log('\n── Admin API ──');
  await testEndpoint('GET /api/admin/stats (SA)', 'http://localhost:3000/api/admin/stats', saToken);
  await testEndpoint('GET /api/admin/tenants (SA)', 'http://localhost:3000/api/admin/tenants', saToken);
  await testEndpoint('GET /api/admin/stats (Doctor - forbidden)', 'http://localhost:3000/api/admin/stats', docToken, 'GET', undefined, 403);

  console.log('\n── Appointments API ──');
  if (newPatient && newPatient.id) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(11, 0, 0, 0);
    await testEndpoint('POST /api/appointments (create)', 'http://localhost:3000/api/appointments', docToken, 'POST', {
      patientId: newPatient.id,
      doctorId: '6972788a92b0ad862a46bbba',
      date: nextWeek.toISOString(),
      type: 'CONSULTATION'
    });
  }

  console.log('\n── Patient Data APIs ──');
  await testEndpoint('GET /api/patient/appointments', 'http://localhost:3000/api/patient/appointments?patientId=6971bc2ebbc4c4dbdc22d7d4', docToken);
  await testEndpoint('GET /api/patient/records', 'http://localhost:3000/api/patient/records?patientId=6971bc2ebbc4c4dbdc22d7d4', docToken);

  // =============================
  console.log('\n═══════════════════════════════════════');
  console.log('  WEB PAGES (port 3000) TESTS');
  console.log('═══════════════════════════════════════\n');
  
  const pages = [
    ['/', 'Dashboard'], ['/login', 'Login'], ['/patients', 'Patients'],
    ['/appointments', 'Appointments'], ['/billing', 'Billing'], ['/emr', 'EMR'],
    ['/pricing', 'Pricing'], ['/portal/login', 'Patient Portal Login'],
    ['/prescriptions', 'Prescriptions'], ['/settings', 'Settings'],
    ['/expenses', 'Expenses'], ['/register', 'Register']
  ];
  for (const [path, name] of pages) {
    await testEndpoint(`Page: ${name}`, `http://localhost:3000${path}`, '', 'GET');
  }

  // =============================
  console.log('\n═══════════════════════════════════════');
  console.log('  ADMIN PANEL (port 3001) TESTS');
  console.log('═══════════════════════════════════════\n');
  
  const adminPages = [
    ['/', 'Admin Dashboard'], ['/login', 'Admin Login'],
    ['/tenants', 'Tenants'], ['/subscriptions', 'Subscriptions']
  ];
  for (const [path, name] of adminPages) {
    await testEndpoint(`Page: ${name}`, `http://localhost:3001${path}`, '', 'GET');
  }

  // =============================
  // CLEANUP
  // =============================
  console.log('\n── Cleanup ──');
  if (newPatient && newPatient.id) {
    // Delete test appointments
    const deleted = await prisma.appointment.deleteMany({
      where: { patientId: newPatient.id }
    });
    console.log(`  🧹 Deleted ${deleted.count} test appointments`);
    
    // Delete test patient
    await prisma.patient.delete({ where: { id: newPatient.id } });
    console.log(`  🧹 Deleted test patient ${newPatient.id}`);
  }
  
  // Skip expense cleanup — model handled by web app's Prisma schema
  console.log(`  🧹 Expense cleanup skipped (web-only model)`);

  // =============================
  // SUMMARY
  // =============================
  console.log('\n═══════════════════════════════════════');
  console.log(`  RESULTS: ✅ ${passed} passed  🔒 ${expectedFails} expected-rejections  ❌ ${failed} failed`);
  console.log('═══════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(console.error);
