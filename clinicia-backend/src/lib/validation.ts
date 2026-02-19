import { z } from "zod";

// ── Patient ──────────────────────────────────────────────
export const createPatientSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    phone: z.string().min(5, "Phone is required").max(20),
    email: z.string().email("Invalid email").optional().nullable(),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Gender must be MALE, FEMALE, or OTHER" }),
    address: z.string().max(500).optional().nullable(),
});

// ── Appointment ──────────────────────────────────────────
export const createAppointmentSchema = z.object({
    patientId: z.string().min(1, "Patient ID is required"),
    doctorId: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    type: z.string().default("CONSULTATION"),
    notes: z.string().max(1000).optional().nullable(),
});

// ── Patient API (Mobile) ─────────────────────────────────
export const bookAppointmentSchema = z.object({
    doctorId: z.string().min(1, "Doctor ID is required"),
    patientId: z.string().min(1, "Patient ID is required"),
    clinicId: z.string().min(1, "Clinic ID is required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    type: z.string().default("CONSULTATION"),
});

// ── Doctor Registration ──────────────────────────────────
export const registerDoctorSchema = z.object({
    name: z.string().min(1, "Name is required").max(200),
    email: z.string().email("Invalid email"),
    phone: z.string().min(5).max(20).optional(),
    specialization: z.string().max(200).optional(),
});

// ── ObjectId validation ──────────────────────────────────
export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID format");

/**
 * Validates request body against a Zod schema.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(body);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`),
    };
}
