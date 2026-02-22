"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateDoctor, type DoctorWithStats } from "@/actions/doctor";

const SPECIALIZATIONS = [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Obstetrics & Gynecology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Pulmonology",
    "Radiology",
    "Surgery",
    "Urology",
    "ENT (Otolaryngology)",
    "Dentistry",
    "Physiotherapy",
    "Ayurveda",
    "Homeopathy",
    "Other",
];

interface EditDoctorDialogProps {
    doctor: DoctorWithStats;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditDoctorDialog({ doctor, open, onOpenChange, onSuccess }: EditDoctorDialogProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        setSubmitting(true);
        setError(null);

        try {
            await updateDoctor(doctor.id, formData);
            onOpenChange(false);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || "Failed to update doctor");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <form ref={formRef} action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Doctor</DialogTitle>
                        <DialogDescription>
                            Update Dr. {doctor.name}&apos;s information.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-200 mt-2">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Full Name *</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                defaultValue={doctor.name || ""}
                                required
                                minLength={2}
                                maxLength={100}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                value={doctor.email}
                                disabled
                                className="bg-slate-50 text-slate-500"
                            />
                            <p className="text-xs text-slate-400">Email cannot be changed</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                                id="edit-phone"
                                name="phone"
                                type="tel"
                                defaultValue={doctor.phone || ""}
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-specialization">Specialization</Label>
                            <select
                                id="edit-specialization"
                                name="specialization"
                                defaultValue={doctor.specialization || ""}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select Specialization</option>
                                {SPECIALIZATIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-qualification">Qualification</Label>
                            <Input
                                id="edit-qualification"
                                name="qualification"
                                defaultValue={doctor.qualification || ""}
                                placeholder="MBBS, MD, MS, etc."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
