"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { getPatients } from "@/actions/patient";
import { useAuth } from "@/context/AuthContext";

export default function PatientsPage() {
    const { user, loading: authLoading } = useAuth();
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            if (user?.clinicId) {
                try {
                    const data = await getPatients(user.clinicId);
                    setPatients(data);
                } catch (error) {
                    console.error("Failed to fetch patients", error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                // If auth loaded but no clinicId (e.g. Super Admin or error), stop loading
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchPatients();
        }
    }, [user, authLoading]);

    if (authLoading || (loading && user)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Patients
                </h1>
                <AddPatientDialog clinicId={user?.clinicId} />
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm max-w-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search patients..."
                    className="flex-1 outline-none text-sm"
                />
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Age/Gender</th>
                            <th className="px-6 py-4">Last Visit</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <Link href={`/patients/${patient.id}`} className="font-medium text-slate-900 hover:text-primary">
                                        {patient.firstName} {patient.lastName}
                                    </Link>
                                    <div className="text-xs text-slate-400">{patient.id.slice(0, 8)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-900">{patient.phone}</div>
                                    <div className="text-xs text-slate-500">{patient.email}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} Y / {patient.gender}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {patient.appointments?.[0]?.date ? new Date(patient.appointments[0].date).toLocaleDateString() : "Never"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {patients.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500">
                                    No patients found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
