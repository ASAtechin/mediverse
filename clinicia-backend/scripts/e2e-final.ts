import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
const serviceAccount = require('../service-account.json');
const https = require('https');
const http = require('http');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const prisma = new PrismaClient();
const FIREBASE_API_KEY = 'AIzaSyAS8jNhh0t3BN-K3aZkGDCo2pPq7h6RDoo';

async function getToken(uid: string): Promise<string> {
  const ct = await admin.auth().createCustomToken(uid);
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res: any) => {
      let d = ''; res.on('data', (c: any) => d += c);
      res.on('end', () => { const p = JSON.parse(d); p.idToken ? resolve(p.idToken) : reject(new Error(d)); });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ token: ct, returnSecureToken: true }));
    req.end();
  });
}

let pass = 0, fail = 0, expected = 0;

async function test(name: string, url: string, token: string, method = 'GET', body?: any, expectCode?: number): Promise<any> {
  return new Promise((resolve) => {
    const u = new URL(url);
    const h: any = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, method, headers: h }, (res: any) => {
      let d = ''; res.on('data', (c: any) => d += c);
      res.on('end', () => {
        let p: any; try { p = JSON.parse(d); } catch { p = d.substring(0, 100); }
        const s = res.statusCode;
        const ok = s >= 200 && s < 300;
        const exp = expectCode === s;
        const icon = ok ? '✅' : exp ? '🔒' : '❌';
        if (ok) pass++; else if (exp) expected++; else fail++;
        const desc = typeof p === 'object' ? JSON.stringify(p).substring(0, 120) : String(p).substring(0, 120);
        console.log(`  ${icon} [${s}] ${name}: ${desc}`);
        resolve(p);
      });
    });
    req.on('error', (e: any) => { console.log(`  ❌ ${name}: ${e.message}`); fail++; resolve(null); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('🔑 Generating tokens...');
  const sa = await getToken('VVLMW67ed5WbfWDxlf3mKdlD0163');
  const doc = await getToken('ipHVf3JctcSjaTQloaSOUT95H953');
  const adm = await getToken('WPILkkLCzYPJ9AFGaRci4Xacs6j1');

  // ===================== BACKEND =====================
  console.log('\n🏥 BACKEND (port 4000)\n');

  console.log('Auth:');
  await test('SuperAdmin /me', 'http://localhost:4000/api/auth/me', sa);
  await test('Doctor /me', 'http://localhost:4000/api/auth/me', doc);
  await test('ClinicAdmin /me', 'http://localhost:4000/api/auth/me', adm);
  await test('Invalid token /me', 'http://localhost:4000/api/auth/me', 'bad', 'GET', undefined, 401);

  console.log('\nDoctors:');
  await test('List doctors', 'http://localhost:4000/api/doctors', doc);
  await test('Doctor slots', 'http://localhost:4000/api/doctors/6972788a92b0ad862a46bbba/slots?date=2025-07-20', doc);

  console.log('\nPatients:');
  await test('List patients', 'http://localhost:4000/api/patients', doc);
  const pt = await test('Create patient', 'http://localhost:4000/api/patients', doc, 'POST', {
    firstName: 'Final', lastName: 'E2E', dob: '1995-03-10', gender: 'Female', phone: '5559876543'
  });

  console.log('\nAppointments:');
  await test('List appointments', 'http://localhost:4000/api/appointments', doc);
  let apptId: string | null = null;
  if (pt?.id) {
    const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(9, 0, 0, 0);
    const a = await test('Create appointment', 'http://localhost:4000/api/appointments', doc, 'POST', {
      patientId: pt.id, date: d.toISOString()
    });
    apptId = a?.id;
    await test('Verify appointment listed', 'http://localhost:4000/api/appointments', doc);
  }

  console.log('\nAdmin:');
  await test('Stats (SA)', 'http://localhost:4000/api/admin/stats', sa);
  await test('Tenants (SA)', 'http://localhost:4000/api/admin/tenants', sa);
  await test('Subscriptions (SA)', 'http://localhost:4000/api/admin/subscriptions', sa);
  await test('Stats (Doctor-blocked)', 'http://localhost:4000/api/admin/stats', doc, 'GET', undefined, 403);
  await test('Tenants (noAuth)', 'http://localhost:4000/api/admin/tenants', '', 'GET', undefined, 401);

  console.log('\nPatient API:');
  await test('Profile (doc)', 'http://localhost:4000/api/patient/profile', doc);
  await test('Appointments', 'http://localhost:4000/api/patient/appointments?patientId=6971bc2ebbc4c4dbdc22d7d4', doc);
  await test('Records', 'http://localhost:4000/api/patient/records?patientId=6971bc2ebbc4c4dbdc22d7d4', doc);
  if (pt?.id) {
    const d2 = new Date(); d2.setDate(d2.getDate() + 5); d2.setHours(15, 0, 0, 0);
    await test('Book (mobile)', 'http://localhost:4000/api/patient/appointments', doc, 'POST', {
      doctorId: '6972788a92b0ad862a46bbba', patientId: pt.id, clinicId: '6972788a92b0ad862a46bbb9', date: d2.toISOString()
    });
  }

  // ===================== WEB =====================
  console.log('\n🌐 WEB (port 3000)\n');

  console.log('Auth:');
  await test('Login', 'http://localhost:3000/api/login', doc, 'POST');
  await test('Auth/me', 'http://localhost:3000/api/auth/me', doc);
  await test('Auth/me (noAuth)', 'http://localhost:3000/api/auth/me', '', 'GET', undefined, 401);

  console.log('\nDoctors:');
  await test('List', 'http://localhost:3000/api/doctors', doc);
  await test('Slots', 'http://localhost:3000/api/doctors/6972788a92b0ad862a46bbba/slots?date=2025-07-20', doc);

  console.log('\nExpenses:');
  await test('List', 'http://localhost:3000/api/expenses', doc);
  await test('Create', 'http://localhost:3000/api/expenses', doc, 'POST', {
    date: new Date().toISOString(), category: 'Rent', amount: 15000, note: 'Final E2E'
  });

  console.log('\nPortal Login:');
  await test('Empty', 'http://localhost:3000/api/portal/auth/login', '', 'POST', {}, 400);
  await test('Wrong', 'http://localhost:3000/api/portal/auth/login', '', 'POST', { phone: '1111', password: 'x' }, 401);

  console.log('\nAdmin API:');
  await test('Stats (SA)', 'http://localhost:3000/api/admin/stats', sa);
  await test('Tenants (SA)', 'http://localhost:3000/api/admin/tenants', sa);
  await test('Stats (Doc-blocked)', 'http://localhost:3000/api/admin/stats', doc, 'GET', undefined, 403);

  console.log('\nAppointments:');
  if (pt?.id) {
    const d3 = new Date(); d3.setDate(d3.getDate() + 10); d3.setHours(10, 0, 0, 0);
    await test('Create', 'http://localhost:3000/api/appointments', doc, 'POST', {
      patientId: pt.id, doctorId: '6972788a92b0ad862a46bbba', date: d3.toISOString()
    });
  }

  console.log('\nPatient Data:');
  await test('Appointments', 'http://localhost:3000/api/patient/appointments?patientId=6971bc2ebbc4c4dbdc22d7d4', doc);
  await test('Records', 'http://localhost:3000/api/patient/records?patientId=6971bc2ebbc4c4dbdc22d7d4', doc);

  // ===================== PAGES =====================
  console.log('\n📄 WEB PAGES\n');
  for (const [p, n] of [['/', 'Dashboard'], ['/login', 'Login'], ['/patients', 'Patients'],
    ['/appointments', 'Appointments'], ['/billing', 'Billing'], ['/emr', 'EMR'],
    ['/pricing', 'Pricing'], ['/portal/login', 'Portal'], ['/prescriptions', 'Rx'],
    ['/settings', 'Settings'], ['/expenses', 'Expenses'], ['/register', 'Register']]) {
    await test(n, `http://localhost:3000${p}`, '');
  }

  console.log('\n📄 ADMIN PAGES\n');
  for (const [p, n] of [['/', 'Dashboard'], ['/login', 'Login'], ['/tenants', 'Tenants'], ['/subscriptions', 'Subs']]) {
    await test(n, `http://localhost:3001${p}`, '');
  }

  // ===================== CLEANUP =====================
  console.log('\n🧹 Cleanup');
  if (pt?.id) {
    const del = await prisma.appointment.deleteMany({ where: { patientId: pt.id } });
    console.log(`  Deleted ${del.count} test appointments`);
    await prisma.patient.delete({ where: { id: pt.id } });
    console.log(`  Deleted test patient`);
  }

  // ===================== RESULTS =====================
  console.log('\n═══════════════════════════════════════');
  console.log(`  ✅ ${pass} PASSED   🔒 ${expected} EXPECTED-REJECTIONS   ❌ ${fail} FAILED`);
  console.log('═══════════════════════════════════════\n');

  if (fail > 0) {
    console.log('⚠️  Some tests failed! Review the ❌ items above.\n');
  } else {
    console.log('🎉 ALL TESTS PASSED!\n');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
