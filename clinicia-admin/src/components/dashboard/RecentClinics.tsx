"use client";

import { motion } from "framer-motion";
import { Building2, Calendar, Mail } from "lucide-react";
import Link from "next/link";

interface Clinic {
    id: string;
    name: string;
    email: string; // Contact email
    status: string; // ACTIVE, INACTIVE
    plan: string; // BASIC, ENTERPRISE
    createdAt: string;
}

export function RecentClinicsTable({ clinics }: { clinics: Clinic[] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Recent Registrations</h2>
                    <p className="text-sm text-slate-500">New clinics joining the platform</p>
                </div>
                <Link href="/tenants" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                            <th className="px-6 py-4 font-medium">Clinic Name</th>
                            <th className="px-6 py-4 font-medium">Contact</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Plan</th>
                            <th className="px-6 py-4 font-medium">Joined</th>
                            <th className="px-6 py-4 font-medium"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clinics.map((clinic, i) => (
                            <motion.tr
                                key={clinic.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group hover:bg-slate-50/50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-slate-900">{clinic.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Mail className="h-3.5 w-3.5" />
                                        {clinic.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clinic.status === 'ACTIVE'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-800'
                                        }`}>
                                        {clinic.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-600 font-medium">{clinic.plan}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(clinic.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                </td>
                            </motion.tr>
                        ))}
                        {clinics.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
