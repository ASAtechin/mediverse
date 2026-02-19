"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddVitalDialog({ patientId }: { patientId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const data = {
                bpSystolic: formData.get("bpSystolic"),
                bpDiastolic: formData.get("bpDiastolic"),
                pulse: formData.get("pulse"),
                temperature: formData.get("temperature"),
                spo2: formData.get("spo2"),
                weight: formData.get("weight"),
                height: formData.get("height"),
            };

            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error("No auth token found");
                setLoading(false);
                return;
            }

            const res = await fetch(`/api/patient/${patientId}/vitals`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to save");

            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Vitals
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Vitals</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>BP (Systolic)</Label>
                            <Input name="bpSystolic" type="number" placeholder="120" />
                        </div>
                        <div className="space-y-2">
                            <Label>BP (Diastolic)</Label>
                            <Input name="bpDiastolic" type="number" placeholder="80" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Pulse (bpm)</Label>
                            <Input name="pulse" type="number" placeholder="72" />
                        </div>
                        <div className="space-y-2">
                            <Label>Temp (°F)</Label>
                            <Input name="temperature" type="number" step="0.1" placeholder="98.6" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>SpO2 (%)</Label>
                            <Input name="spo2" type="number" placeholder="98" />
                        </div>
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            <Input name="weight" type="number" step="0.1" placeholder="70" />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Vitals
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
