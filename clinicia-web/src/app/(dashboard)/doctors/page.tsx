"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Search,
    Loader2,
    Stethoscope,
    Mail,
    Phone,
    Calendar,
    MoreHorizontal,
    Trash2,
    Pencil,
    Award,
    Users as UsersIcon,
} from "lucide-react";
import { getDoctors, deleteDoctor, type DoctorWithStats } from "@/actions/doctor";
import { useAuth } from "@/context/AuthContext";
import { AddDoctorDialog } from "@/components/doctors/AddDoctorDialog";
import { EditDoctorDialog } from "@/components/doctors/EditDoctorDialog";

export default function DoctorsPage() {
    const { user, loading: authLoading } = useAuth();
    const [doctors, setDoctors] = useState<DoctorWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [editingDoctor, setEditingDoctor] = useState<DoctorWithStats | null>(null);

    const fetchDoctors = useCallback(async () => {
        if (!user?.clinicId) return;
        setLoading(true);
        try {
            const data = await getDoctors(user.clinicId);
            setDoctors(data);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        } finally {
            setLoading(false);
        }
    }, [user?.clinicId]);

    useEffect(() => {
        if (!authLoading) {
            if (user?.clinicId) {
                fetchDoctors();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading, fetchDoctors]);

    const handleDelete = async (doctorId: string, doctorName: string | null) => {
        if (!confirm(`Are you sure you want to remove Dr. ${doctorName || "this doctor"}? This action cannot be undone.`)) {
            return;
        }
        setDeletingId(doctorId);
        setDeleteError(null);
        try {
            await deleteDoctor(doctorId);
            fetchDoctors();
        } catch (err: any) {
            setDeleteError(err.message || "Failed to delete doctor");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredDoctors = doctors.filter((d) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            d.name?.toLowerCase().includes(q) ||
            d.email?.toLowerCase().includes(q) ||
            d.specialization?.toLowerCase().includes(q) ||
            d.phone?.includes(q)
        );
    });

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    if (authLoading || (loading && user)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Doctors
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your clinic&apos;s medical team
                    </p>
                </div>
                {isAdmin && (
                    <AddDoctorDialog clinicId={user?.clinicId} onSuccess={fetchDoctors} />
                )}
            </div>

            {/* Error Banner */}
            {deleteError && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-200">
                    {deleteError}
                    <button
                        onClick={() => setDeleteError(null)}
                        className="ml-2 text-red-500 hover:text-red-700 font-medium"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm max-w-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search doctors by name, specialty..."
                    className="flex-1 outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{doctors.length}</p>
                        <p className="text-xs text-slate-500">Total Doctors</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">
                            {new Set(doctors.map((d) => d.specialization).filter(Boolean)).size}
                        </p>
                        <p className="text-xs text-slate-500">Specializations</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">
                            {doctors.reduce((sum, d) => sum + (d._count?.appointments || 0), 0)}
                        </p>
                        <p className="text-xs text-slate-500">Total Appointments</p>
                    </div>
                </div>
            </div>

            {/* Doctor Cards Grid */}
            {filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
                    <Stethoscope className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">
                        {searchQuery ? "No matching doctors" : "No doctors yet"}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {searchQuery
                            ? "Try a different search term."
                            : "Add your first doctor to start managing appointments."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDoctors.map((doctor) => (
                        <div
                            key={doctor.id}
                            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                                            {doctor.name?.[0]?.toUpperCase() || "D"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-base">
                                                Dr. {doctor.name || "Unnamed"}
                                            </h3>
                                            {doctor.specialization && (
                                                <p className="text-white/80 text-xs">
                                                    {doctor.specialization}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingDoctor(doctor)}
                                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                                                title="Edit Doctor"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doctor.id, doctor.name)}
                                                disabled={deletingId === doctor.id}
                                                className="p-1.5 rounded-full bg-white/20 hover:bg-red-500/80 text-white transition-colors disabled:opacity-50"
                                                title="Remove Doctor"
                                            >
                                                {deletingId === doctor.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                                {doctor.qualification && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Award className="h-4 w-4 text-slate-400" />
                                        <span>{doctor.qualification}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="truncate">{doctor.email}</span>
                                </div>
                                {doctor.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{doctor.phone}</span>
                                    </div>
                                )}

                                {/* Stats Row */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {doctor._count?.appointments || 0} appointment{doctor._count?.appointments !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        Joined {new Date(doctor.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Doctor Dialog */}
            {editingDoctor && (
                <EditDoctorDialog
                    doctor={editingDoctor}
                    open={!!editingDoctor}
                    onOpenChange={(open) => !open && setEditingDoctor(null)}
                    onSuccess={fetchDoctors}
                />
            )}
        </div>
    );
}
