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

async function getIdToken(uid: string): Promise<string> {
  const customToken = await admin.auth().createCustomToken(uid);
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;
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
    req.write(JSON.stringify({ token: customToken, returnSecureToken: true }));
    req.end();
  });
}

async function main() {
  const token = await getIdToken('ipHVf3JctcSjaTQloaSOUT95H953');
  console.log('Got token, testing patient appointments...');
  
  return new Promise<void>((resolve) => {
    const url = 'http://localhost:3000/api/patient/appointments?patientId=6971bc2ebbc4c4dbdc22d7d4';
    const req = http.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve();
      });
    });
    req.on('error', (e: any) => { console.log('Error:', e.message); resolve(); });
  });
}

main().catch(console.error);
