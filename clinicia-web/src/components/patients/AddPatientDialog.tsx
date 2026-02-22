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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { createPatient } from "@/actions/patient";

interface AddPatientDialogProps {
    clinicId?: string;
    onSuccess?: () => void;
}

export function AddPatientDialog({ clinicId, onSuccess }: AddPatientDialogProps) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        if (!clinicId) return;
        setSubmitting(true);
        setError(null);
        try {
            await createPatient(formData, clinicId);
            formRef.current?.reset();
            setOpen(false);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || "Failed to create patient");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button disabled={!clinicId}>
                    <Plus className="mr-2 h-4 w-4" /> Add Patient
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form ref={formRef} action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Patient</DialogTitle>
                        <DialogDescription>
                            Enter the patient's basic details here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-200 mt-2">
                            {error}
                        </div>
                    )}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input id="firstName" name="firstName" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input id="lastName" name="lastName" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dob">Date of Birth *</Label>
                                <Input id="dob" name="dob" type="date" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender *</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input id="phone" name="phone" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Info Portal Password</Label>
                            <Input id="password" name="password" type="password" placeholder="Optional" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submitting ? "Saving..." : "Save Patient"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
