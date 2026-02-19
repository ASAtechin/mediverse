import axios from "axios";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

// Helper to wait for auth to be ready
const waitForAuth = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            resolve(user);
            unsubscribe();
        });
    });
};

api.interceptors.request.use(async (config) => {
    // If currentUser is already available, use it (fast path)
    let user = auth.currentUser;

    // If not, wait for the initial handshake (slow path)
    if (!user) {
        user = await waitForAuth() as any;
    }

    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
