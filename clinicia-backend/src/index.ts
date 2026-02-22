import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { MongoClient } from "mongodb";
import rateLimit from "express-rate-limit";
import logger from "./lib/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
export const prisma = new PrismaClient();

// Allowed origins from env or defaults for development
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:3001", "http://localhost:8081"];

// Create HTTP server and attach Socket.io
const httpServer = createServer(app);
export const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

import authRoutes from "./routes/auth";
import patientRoutes from "./routes/patients";
import appointmentRoutes from "./routes/appointments";
import adminRoutes from "./routes/admin";
import doctorRoutes from "./routes/doctors";
import patientApiRoutes from "./routes/patient-api";
import { firebaseAdmin } from "./lib/firebase";

app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// HTTP request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info(
            { method: req.method, url: req.originalUrl, status: res.statusCode, duration },
            "HTTP request"
        );
    });
    next();
});

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window per IP
    message: { error: "Too many login attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per IP
    message: { error: "Too many requests, please slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/patients", apiLimiter, patientRoutes); // Admin managing patients
app.use("/api/patient", apiLimiter, patientApiRoutes); // Patient app API
app.use("/api/appointments", apiLimiter, appointmentRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/doctors", apiLimiter, doctorRoutes);

// Health Check
app.get("/", (req, res) => {
    res.json({ status: "ok", service: "clinicia-backend", uptime: process.uptime() });
});

// Detailed health check with DB connectivity
app.get("/health", async (req, res) => {
    try {
        await prisma.$runCommandRaw({ ping: 1 });
        res.json({ status: "healthy", db: "connected", uptime: process.uptime() });
    } catch {
        res.status(503).json({ status: "unhealthy", db: "disconnected" });
    }
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error("Authentication required"));
    }
    try {
        const decoded = await firebaseAdmin.auth().verifyIdToken(token);
        (socket as any).user = { uid: decoded.uid, email: decoded.email };
        next();
    } catch (err) {
        logger.warn({ err: (err as Error).message }, "Socket auth failed");
        next(new Error("Invalid or expired token"));
    }
});

// Socket.io connection handling
io.on("connection", (socket) => {
    const user = (socket as any).user;
    logger.info({ socketId: socket.id, uid: user?.uid }, "Client connected");
    
    // Join clinic-specific room — verify the user belongs to this clinic
    socket.on("join-clinic", async (clinicId: string) => {
        try {
            const dbUser = await prisma.user.findUnique({
                where: { firebaseUid: user.uid },
                select: { clinicId: true, role: true },
            });
            if (!dbUser) {
                socket.emit("error", { message: "User not found" });
                return;
            }
            if (dbUser.role !== 'SUPER_ADMIN' && dbUser.clinicId !== clinicId) {
                socket.emit("error", { message: "Forbidden: Not a member of this clinic" });
                return;
            }
            socket.join(`clinic-${clinicId}`);
            logger.info({ socketId: socket.id, clinicId }, "Socket joined clinic room");
        } catch (err) {
            logger.error({ err }, "Socket join-clinic error");
            socket.emit("error", { message: "Failed to join clinic room" });
        }
    });
    
    // Join admin room — requires SUPER_ADMIN role
    socket.on("join-admin", async () => {
        try {
            const dbUser = await prisma.user.findUnique({
                where: { firebaseUid: user.uid },
                select: { role: true },
            });
            if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
                socket.emit("error", { message: "Forbidden: Admin access required" });
                return;
            }
            socket.join("admin");
            logger.info({ socketId: socket.id }, "Socket joined admin room (SUPER_ADMIN verified)");
        } catch (err) {
            logger.error({ err }, "Socket join-admin error");
            socket.emit("error", { message: "Failed to join admin room" });
        }
    });
    
    socket.on("disconnect", () => {
        logger.info({ socketId: socket.id }, "Client disconnected");
    });
});

// MongoDB Change Streams for real-time updates
let changeStreamClient: MongoClient | null = null;

function watchCollection(db: any, collectionName: string, eventName: string, roomFn?: (doc: any) => string | null) {
    function startWatch() {
        const stream = db.collection(collectionName).watch([], { fullDocument: "updateLookup" });
        
        stream.on("change", (change: any) => {
            const doc = change.fullDocument;
            const clinicId = doc?.clinicId;
            
            // Emit to specific clinic room if applicable
            if (clinicId && roomFn) {
                io.to(`clinic-${clinicId}`).emit(eventName, {
                    type: change.operationType,
                    data: doc,
                });
            }
            // Always emit to admin room
            io.to("admin").emit(eventName, {
                type: change.operationType,
                data: doc,
            });
        });

        stream.on("error", (err: Error) => {
            logger.error({ collection: collectionName, err: err.message }, "Change stream error");
            // Reconnect after 5 seconds
            setTimeout(startWatch, 5000);
        });

        stream.on("close", () => {
            logger.warn({ collection: collectionName }, "Change stream closed, reconnecting...");
            setTimeout(startWatch, 5000);
        });

        logger.info({ collection: collectionName }, "Watching collection");
    }
    startWatch();
}

async function setupChangeStreams() {
    try {
        const mongoUrl = process.env.DATABASE_URL;
        if (!mongoUrl) {
            logger.warn("DATABASE_URL not set, skipping change streams");
            return;
        }
        
        // Extract MongoDB connection string (remove prisma-specific parts)
        const cleanUrl = mongoUrl.replace(/\?.*$/, "");
        const client = new MongoClient(cleanUrl);
        await client.connect();
        changeStreamClient = client;
        
        const dbName = cleanUrl.split("/").pop() || "clinicia";
        const db = client.db(dbName);
        
        logger.info("Setting up MongoDB Change Streams...");
        
        watchCollection(db, "Patient", "patient-updated", (doc) => doc?.clinicId);
        watchCollection(db, "Clinic", "tenant-updated");
        watchCollection(db, "Appointment", "appointment-updated", (doc) => doc?.clinicId);
        watchCollection(db, "User", "user-updated");
        
        logger.info("MongoDB Change Streams active for: Patient, Clinic, Appointment, User");
        
    } catch (error) {
        logger.error({ err: error }, "Failed to setup change streams. Real-time updates will not be available. Make sure MongoDB is a replica set.");
    }
}

// Graceful crash handlers
process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ err: reason }, 'Unhandled Promise Rejection');
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught Exception — shutting down');
    process.exit(1);
});

// Graceful shutdown
async function shutdown(signal: string) {
    logger.info({ signal }, 'Received shutdown signal, cleaning up...');
    try {
        if (changeStreamClient) {
            await changeStreamClient.close();
            logger.info('MongoDB change stream client closed');
        }
        await prisma.$disconnect();
        logger.info('Prisma disconnected');
        httpServer.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
        // Force exit after 10s if graceful shutdown hangs
        setTimeout(() => process.exit(1), 10_000);
    } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
    }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start Server
httpServer.listen(port, () => {
    logger.info({ port }, "Server running");
    logger.info("WebSocket server ready");
    
    // Setup change streams after server starts
    setupChangeStreams();
});
