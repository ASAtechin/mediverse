"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvoice } from "@/actions/billing";
import { useState } from "react";
import { DollarSign } from "lucide-react";

export function CreateInvoiceDialog({ visitId, patientName }: { visitId: string, patientName: string }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    <DollarSign className="mr-2 h-4 w-4" /> Generate Invoice
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Invoice</DialogTitle>
                    <DialogDescription>
                        Generate a bill for {patientName}'s visit.
                    </DialogDescription>
                </DialogHeader>
                <form action={async (formData) => {
                    await createInvoice(formData);
                    setOpen(false);
                }} className="space-y-4">
                    <input type="hidden" name="visitId" value={visitId} />
                    <div className="grid gap-2">
                        <Label>Consultation Fee (₹)</Label>
                        <Input name="consultationFee" type="number" defaultValue="500" step="1" required />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Create Invoice</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
