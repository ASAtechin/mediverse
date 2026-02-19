import { prisma } from "@/lib/db";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EMRListPage({
    searchParams,
}: {
    searchParams: Promise<{ clinicId?: string }>;
}) {
    const params = await searchParams;
    const clinicId = params.clinicId;

    // Build clinic-scoped filter
    const clinicFilter = clinicId ? { clinicId } : {};

    const visits = await prisma.visit.findMany({
        where: clinicFilter,
        orderBy: { createdAt: "desc" },
        include: {
            patient: true,
            appointment: {
                include: {
                    doctor: { select: { name: true } }
                }
            }
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Clinical Records
                </h1>
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm max-w-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search records..."
                    className="flex-1 outline-none text-sm"
                />
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Diagnosis</th>
                            <th className="px-6 py-4">Doctor</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {visits.map((visit) => (
                            <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-600">
                                    {visit.appointment?.date ? visit.appointment.date.toLocaleDateString() : visit.createdAt.toLocaleDateString()}
                                    <div className="text-xs text-slate-400">{visit.appointment?.date ? visit.appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {visit.patient.firstName} {visit.patient.lastName}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {visit.diagnosis || "-"}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {visit.appointment?.doctor?.name || 'Unknown Doctor'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/emr/${visit.appointmentId}`}>
                                        <Button variant="outline" size="sm">
                                            View
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {visits.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500">
                                    No clinical records found. Complete appointments to generate records.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
