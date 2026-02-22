"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, AlertTriangle, Info } from "lucide-react";
import { createAppointment } from "@/actions/appointment";

type Patient = {
    id: string;
    firstName: string;
    lastName: string;
};

type Doctor = {
    id: string;
    name: string | null;
}

interface BookAppointmentDialogProps {
    patients: Patient[];
    doctors: Doctor[];
    currentUserId?: string;
    currentUserRole?: string;
    onSuccess?: () => void;
}

export function BookAppointmentDialog({ patients, doctors, currentUserId, currentUserRole, onSuccess }: BookAppointmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasDoctors = doctors.length > 0;
    const hasPatients = patients.length > 0;
    // If the user is a doctor and they're the only one, auto-assign
    const isSoloPractitioner = currentUserRole === "DOCTOR" && doctors.length <= 1;

    async function handleSubmit(formData: FormData) {
        setSubmitting(true);
        setError(null);
        try {
            // If no doctor selected but user is a doctor, auto-assign
            if (!formData.get("doctorId") && currentUserId && currentUserRole === "DOCTOR") {
                formData.set("doctorId", currentUserId);
            }
            await createAppointment(formData);
            setOpen(false);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || "Failed to book appointment");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button disabled={!hasPatients}>
                    <Plus className="mr-2 h-4 w-4" /> New Appointment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Book Appointment</DialogTitle>
                        <DialogDescription>
                            Schedule a visit for a patient.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-200 mt-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {!hasPatients && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm p-3 rounded-md border border-amber-200 mt-2">
                            <Info className="h-4 w-4 flex-shrink-0" />
                            No patients registered yet. Add a patient first.
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="patientId">Patient *</Label>
                            <select
                                id="patientId"
                                name="patientId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Select Patient</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                                ))}
                            </select>
                        </div>

                        {/* Show doctor field only if there are multiple doctors */}
                        {hasDoctors && !isSoloPractitioner ? (
                            <div className="grid gap-2">
                                <Label htmlFor="doctorId">Doctor *</Label>
                                <select
                                    id="doctorId"
                                    name="doctorId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : hasDoctors && isSoloPractitioner ? (
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm p-3 rounded-md border border-blue-200">
                                <Info className="h-4 w-4 flex-shrink-0" />
                                Appointment will be assigned to you.
                                <input type="hidden" name="doctorId" value={currentUserId} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm p-3 rounded-md border border-amber-200">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">No doctors found</p>
                                    <p className="text-xs mt-0.5">
                                        {currentUserRole === "DOCTOR"
                                            ? "You'll be assigned as the doctor for this appointment."
                                            : "Please add a doctor from the Doctors page before booking."}
                                    </p>
                                </div>
                                {currentUserRole === "DOCTOR" && currentUserId && (
                                    <input type="hidden" name="doctorId" value={currentUserId} />
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time">Time *</Label>
                                <Input id="time" name="time" type="time" required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                name="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="CONSULTATION">Consultation</option>
                                <option value="FOLLOW_UP">Follow-up</option>
                                <option value="PROCEDURE">Procedure</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input id="notes" name="notes" placeholder="Reason for visit" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={submitting || (!hasDoctors && currentUserRole !== "DOCTOR")}
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submitting ? "Booking..." : "Book Slot"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
