import { prisma } from "@/lib/db";
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markInvoicePaid } from "@/actions/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ clinicId?: string }>;
}) {
    const params = await searchParams;
    const clinicId = params.clinicId;

    // Build clinic-scoped filter
    const clinicFilter = clinicId ? { clinicId } : {};

    const invoices = await prisma.invoice.findMany({
        where: clinicFilter,
        orderBy: { createdAt: "desc" },
        include: {
            visit: {
                include: {
                    patient: true
                }
            }
        }
    });

    const totalCollected = invoices
        .filter(i => i.status === 'PAID')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const pendingAmount = invoices
        .filter(i => i.status === 'PENDING')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Billing & Invoices
                </h1>
                <Button disabled>
                    <DollarSign className="mr-2 h-4 w-4" /> Create Manual Invoice
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-500 font-medium">Pending Payments</p>
                        <h3 className="text-2xl font-bold text-orange-600 mt-2">₹{pendingAmount.toFixed(2)}</h3>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-500 font-medium">Collected Total</p>
                        <h3 className="text-2xl font-bold text-green-600 mt-2">₹{totalCollected.toFixed(2)}</h3>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <FileText className="h-12 w-12 mb-4 text-slate-300" />
                        <p>No invoices generated yet.</p>
                        <p className="text-sm">Go to Clinical Records to generate an invoice for a visit.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Invoice ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-500">#{inv.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4">{inv.createdAt.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {inv.visit.patient.firstName} {inv.visit.patient.lastName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {inv.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                                        ₹{inv.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {inv.status === 'PENDING' && (
                                            <form action={markInvoicePaid.bind(null, inv.id)}>
                                                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                                    Mark Paid
                                                </Button>
                                            </form>
                                        )}
                                        {inv.status === 'PAID' && (
                                            <Button size="sm" variant="ghost" disabled>Paid</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
