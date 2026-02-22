"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface VisitRow {
    id: string;
    appointmentId: string | null;
    diagnosis: string | null;
    symptoms: string | null;
    createdAt: string;
    appointmentDate: string | null;
    appointmentTime: string | null;
    patientName: string;
    doctorName: string;
}

export default function EMRListClient({ visits }: { visits: VisitRow[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredVisits = visits.filter((v) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            v.patientName.toLowerCase().includes(q) ||
            v.doctorName.toLowerCase().includes(q) ||
            (v.diagnosis?.toLowerCase().includes(q) ?? false) ||
            (v.symptoms?.toLowerCase().includes(q) ?? false)
        );
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
                    placeholder="Search by patient, doctor, diagnosis..."
                    className="flex-1 outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                        {filteredVisits.map((visit) => (
                            <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-600">
                                    {visit.appointmentDate
                                        ? new Date(visit.appointmentDate).toLocaleDateString()
                                        : new Date(visit.createdAt).toLocaleDateString()}
                                    {visit.appointmentTime && (
                                        <div className="text-xs text-slate-400">{visit.appointmentTime}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {visit.patientName}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {visit.diagnosis || "-"}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {visit.doctorName}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {visit.appointmentId ? (
                                        <Link href={`/emr/${visit.appointmentId}`}>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button variant="outline" size="sm" disabled>
                                            No Appointment
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredVisits.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500">
                                    {searchQuery
                                        ? "No records match your search."
                                        : "No clinical records found. Complete appointments to generate records."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
