import * as admin from 'firebase-admin';
const serviceAccount = require('../service-account.json');
const https = require('https');
const http = require('http');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const FIREBASE_API_KEY = 'AIzaSyAS8jNhh0t3BN-K3aZkGDCo2pPq7h6RDoo';

async function exchangeCustomTokenForIdToken(customToken: string): Promise<string> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;
  const body = JSON.stringify({
    token: customToken,
    returnSecureToken: true
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.idToken) {
          resolve(parsed.idToken);
        } else {
          reject(new Error('Failed to get ID token: ' + data));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function testEndpoint(name: string, url: string, token: string, method = 'GET', body?: any) {
  return new Promise<void>((resolve) => {
    const parsedUrl = new URL(url);
    const options: any = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        let parsed: any;
        try { parsed = JSON.parse(data); } catch { parsed = data.substring(0, 200); }
        const summary = typeof parsed === 'object' ? JSON.stringify(parsed).substring(0, 300) : parsed;
        console.log(`\n[${status === 200 || status === 201 ? '✅' : '❌'}] ${name} (${method} ${parsedUrl.pathname}) → ${status}`);
        console.log(`    ${summary}`);
        resolve();
      });
    });
    req.on('error', (e: any) => {
      console.log(`\n[❌] ${name} → ERROR: ${e.message}`);
      resolve();
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('=== Generating ID Tokens ===\n');

  // Super Admin
  const saCustomToken = await admin.auth().createCustomToken('VVLMW67ed5WbfWDxlf3mKdlD0163');
  const saToken = await exchangeCustomTokenForIdToken(saCustomToken);
  console.log('✅ SUPERADMIN ID Token obtained (length:', saToken.length, ')');

  // Doctor (Aditya - doctor_test_7344@clinicia.com)
  const docCustomToken = await admin.auth().createCustomToken('ipHVf3JctcSjaTQloaSOUT95H953');
  const docToken = await exchangeCustomTokenForIdToken(docCustomToken);
  console.log('✅ DOCTOR ID Token obtained (length:', docToken.length, ')');

  // Clinic Admin (clinic_2@gmail.com)
  const adminCustomToken = await admin.auth().createCustomToken('WPILkkLCzYPJ9AFGaRci4Xacs6j1');
  const adminToken = await exchangeCustomTokenForIdToken(adminCustomToken);
  console.log('✅ CLINIC ADMIN ID Token obtained (length:', adminToken.length, ')');

  // ============================
  // TEST 1: Auth endpoint
  // ============================
  console.log('\n\n========== TEST 1: AUTH ENDPOINTS ==========');
  
  await testEndpoint('Auth /me (SuperAdmin)', 'http://localhost:4000/api/auth/me', saToken);
  await testEndpoint('Auth /me (Doctor)', 'http://localhost:4000/api/auth/me', docToken);
  await testEndpoint('Auth /me (ClinicAdmin)', 'http://localhost:4000/api/auth/me', adminToken);
  await testEndpoint('Auth /me (No token)', 'http://localhost:4000/api/auth/me', 'invalid-token');

  // ============================
  // TEST 2: Doctor endpoints
  // ============================
  console.log('\n\n========== TEST 2: DOCTOR ENDPOINTS ==========');
  
  await testEndpoint('List Doctors (as Doctor)', 'http://localhost:4000/api/doctors', docToken);
  await testEndpoint('List Doctors (as ClinicAdmin)', 'http://localhost:4000/api/doctors', adminToken);
  // Doctor slots - use a doctor ID
  await testEndpoint('Doctor Slots', 'http://localhost:4000/api/doctors/6972788a92b0ad862a46bbba/slots?date=2025-07-20', docToken);

  // ============================
  // TEST 3: Patient endpoints (backend)
  // ============================
  console.log('\n\n========== TEST 3: PATIENT ENDPOINTS ==========');
  
  await testEndpoint('List Patients (as Doctor)', 'http://localhost:4000/api/patients', docToken);
  await testEndpoint('Create Patient (as Doctor)', 'http://localhost:4000/api/patients', docToken, 'POST', {
    firstName: 'E2E',
    lastName: 'TestPatient',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    phone: '9876543210'
  });

  // ============================
  // TEST 4: Appointment endpoints (backend)
  // ============================
  console.log('\n\n========== TEST 4: APPOINTMENT ENDPOINTS ==========');
  
  await testEndpoint('List Appointments (as Doctor)', 'http://localhost:4000/api/appointments', docToken);

  // ============================
  // TEST 5: Admin endpoints
  // ============================
  console.log('\n\n========== TEST 5: ADMIN ENDPOINTS ==========');
  
  await testEndpoint('Admin Stats (as SuperAdmin)', 'http://localhost:4000/api/admin/stats', saToken);
  await testEndpoint('Admin Tenants (as SuperAdmin)', 'http://localhost:4000/api/admin/tenants', saToken);
  await testEndpoint('Admin Subscriptions (as SuperAdmin)', 'http://localhost:4000/api/admin/subscriptions', saToken);
  // Should fail: doctor trying admin endpoint
  await testEndpoint('Admin Stats (as Doctor - should fail)', 'http://localhost:4000/api/admin/stats', docToken);

  // ============================
  // TEST 6: Patient API (mobile endpoints)
  // ============================
  console.log('\n\n========== TEST 6: PATIENT API (MOBILE) ==========');
  
  await testEndpoint('Patient Profile (as Doctor - email match)', 'http://localhost:4000/api/patient/profile', docToken);
  // Use a patient ID from DB
  await testEndpoint('Patient Appointments', 'http://localhost:4000/api/patient/appointments?patientId=6971bc2ebbc4c4dbdc22d7d4', docToken);
  await testEndpoint('Patient Records', 'http://localhost:4000/api/patient/records?patientId=6971bc2ebbc4c4dbdc22d7d4', docToken);

  // ============================
  // TEST 7: Web API endpoints
  // ============================
  console.log('\n\n========== TEST 7: WEB API ENDPOINTS ==========');
  
  await testEndpoint('Web Login API', 'http://localhost:3000/api/login', docToken, 'POST');
  await testEndpoint('Web Auth Me', 'http://localhost:3000/api/auth/me', docToken);
  await testEndpoint('Web Doctors', 'http://localhost:3000/api/doctors', docToken);
  await testEndpoint('Web Expenses', 'http://localhost:3000/api/expenses', docToken);
  
  // Test doctor slots (web)
  await testEndpoint('Web Doctor Slots', 'http://localhost:3000/api/doctors/6972788a92b0ad862a46bbba/slots?date=2025-07-20', docToken);
  
  // Portal login (no auth needed)
  await testEndpoint('Portal Login (empty)', 'http://localhost:3000/api/portal/auth/login', '', 'POST', {});
  await testEndpoint('Portal Login (wrong creds)', 'http://localhost:3000/api/portal/auth/login', '', 'POST', { phone: '9999999999', password: 'wrong' });

  // ============================
  // TEST 8: Web Admin API
  // ============================
  console.log('\n\n========== TEST 8: WEB ADMIN API ==========');
  
  await testEndpoint('Web Admin Stats (SuperAdmin)', 'http://localhost:3000/api/admin/stats', saToken);
  await testEndpoint('Web Admin Tenants (SuperAdmin)', 'http://localhost:3000/api/admin/tenants', saToken);
  await testEndpoint('Web Admin Stats (Doctor - should fail)', 'http://localhost:3000/api/admin/stats', docToken);

  console.log('\n\n========== ALL TESTS COMPLETE ==========');
}

main().catch(console.error);
