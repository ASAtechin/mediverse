"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type PrescriptionItem = {
    id: number;
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
};

export function PrescriptionManager({ initialData = [] }: { initialData?: any[] }) {
    const [items, setItems] = useState<PrescriptionItem[]>(
        initialData.length > 0 ? initialData.map((item, idx) => ({ ...item, id: idx }))
            : [{ id: 0, medicine: "", dosage: "", frequency: "", duration: "" }]
    );

    const addItem = () => {
        setItems([...items, { id: Date.now(), medicine: "", dosage: "", frequency: "", duration: "" }]);
    };

    const removeItem = (id: number) => {
        if (items.length === 1) return; // Keep at least one
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Rx / Medications</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" /> Add Drug
                </Button>
            </div>

            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-start">
                        <div className="flex-1">
                            {index === 0 && <label className="text-xs text-slate-500 mb-1 block">Medicine Name</label>}
                            <Input name="medicine[]" placeholder="e.g. Paracetamol 500mg" defaultValue={item.medicine} />
                        </div>
                        <div className="w-24">
                            {index === 0 && <label className="text-xs text-slate-500 mb-1 block">Dosage</label>}
                            <Input name="dosage[]" placeholder="1-0-1" defaultValue={item.dosage} />
                        </div>
                        <div className="w-32">
                            {index === 0 && <label className="text-xs text-slate-500 mb-1 block">Frequency</label>}
                            <Input name="frequency[]" placeholder="After food" defaultValue={item.frequency} />
                        </div>
                        <div className="w-24">
                            {index === 0 && <label className="text-xs text-slate-500 mb-1 block">Duration</label>}
                            <Input name="duration[]" placeholder="5 Days" defaultValue={item.duration} />
                        </div>
                        <div className={index === 0 ? "pt-5" : ""}>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
