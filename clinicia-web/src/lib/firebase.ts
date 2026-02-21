import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug logging for Railway
if (typeof window !== 'undefined') {
    console.log('Firebase Config Debug:', {
        apiKeyExists: !!firebaseConfig.apiKey,
        apiKeyLength: firebaseConfig.apiKey?.length,
        apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 10),
        projectId: firebaseConfig.projectId,
        allKeys: Object.keys(firebaseConfig).filter(k => firebaseConfig[k as keyof typeof firebaseConfig])
    });
}

// Safe initialization: during build-time static generation, the env vars
// may not be available. We only initialize Firebase when the API key exists.
let app: FirebaseApp | undefined;
let auth: Auth;
let storage: FirebaseStorage;

if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    storage = getStorage(app);
} else {
    // Build-time: create stubs so imports don't crash during static generation.
    // These will never be used at runtime — real Firebase kicks in when env vars load.
    app = undefined as any;
    auth = undefined as any;
    storage = undefined as any;
}

export { auth, app, storage };
