import axios from 'axios';
import { Platform } from 'react-native';
import { getAuth } from 'firebase/auth';

// Use env var in production; default to emulator-appropriate URL in dev
const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    // Android Emulator uses 10.0.2.2, iOS Simulator uses localhost
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:4000/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to attach Firebase auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Failed to get auth token for request:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired — try refreshing
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (user) {
                    await user.getIdToken(true); // Force refresh
                    // Retry the original request with the new token
                    const token = await user.getIdToken();
                    error.config.headers.Authorization = `Bearer ${token}`;
                    return axios(error.config);
                }
            } catch (refreshError) {
                console.warn('Token refresh failed:', refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
