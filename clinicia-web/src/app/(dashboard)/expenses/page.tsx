"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, DollarSign, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    async function fetchExpenses() {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) return;

            const res = await fetch("/api/expenses", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setExpenses(data);
            } else {
                setExpenses([]);
                console.error("Fetch expenses returned non-array:", data);
            }
        } catch (error) {
            console.error("Failed to fetch expenses", error);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) return;

            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: formData.get("category"),
                    amount: formData.get("amount"),
                    date: formData.get("date"),
                    note: formData.get("note"),
                }),
            });

            if (res.ok) {
                setOpen(false);
                fetchExpenses();
            }
        } catch (error) {
            console.error("Failed to create expense", error);
        }
    }

    const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum, e) => sum + e.amount, 0) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
                    <p className="text-slate-500">Track clinic operational costs.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Expense</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input name="category" placeholder="Rent, Utilities, etc." required />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input name="amount" type="number" step="0.01" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <Label>Note</Label>
                                <Input name="note" />
                            </div>
                            <Button type="submit" className="w-full">Save Expense</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-red-50 border-red-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-600 uppercase">Total Expenses</p>
                            <h2 className="text-3xl font-bold text-slate-900">${totalExpenses.toLocaleString()}</h2>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Expense History</h3>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : expenses.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No expenses recorded.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Note</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {expenses.map((e) => (
                                        <tr key={e.id}>
                                            <td className="px-4 py-3">{format(new Date(e.date), 'PP')}</td>
                                            <td className="px-4 py-3 font-medium">{e.category}</td>
                                            <td className="px-4 py-3 text-slate-500">{e.note || '-'}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900">${e.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
