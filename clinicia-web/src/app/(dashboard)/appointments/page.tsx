"use client";

import { useEffect, useState, useCallback } from "react";
import { BookAppointmentDialog } from "@/components/appointments/BookAppointmentDialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getAppointments, getAppointmentFormData, updateAppointmentStatus, rescheduleAppointment, cancelAppointment } from "@/actions/appointment";
import { Loader2, Calendar, Search, Check, X, Clock, UserCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AppointmentItem = {
    id: string;
    date: string;
    status: string;
    type: string;
    notes: string | null;
    tokenNumber: number | null;
    patient: { id: string; firstName: string; lastName: string };
    doctor: { id: string; name: string | null } | null;
};

type FormDataType = {
    patients: { id: string; firstName: string; lastName: string }[];
    doctors: { id: string; name: string | null }[];
    currentUserId: string;
    currentUserRole: string;
};

export default function AppointmentsPage() {
    const { user, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
    const [formData, setFormData] = useState<FormDataType | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAll = useCallback(async () => {
        if (!user?.clinicId) return;
        setLoading(true);
        try {
            const [appts, fd] = await Promise.all([
                getAppointments(user.clinicId),
                getAppointmentFormData(user.clinicId),
            ]);
            setAppointments(appts);
            setFormData(fd);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    }, [user?.clinicId]);

    useEffect(() => {
        if (!authLoading) {
            if (user?.clinicId) {
                fetchAll();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading, fetchAll]);

    const filteredAppointments = appointments.filter((a) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const patientName = `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase();
        const doctorName = a.doctor?.name?.toLowerCase() || "";
        return (
            patientName.includes(q) ||
            doctorName.includes(q) ||
            a.type.toLowerCase().includes(q) ||
            a.status.toLowerCase().includes(q)
        );
    });

    const handleStatusChange = async (appointmentId: string, newStatus: string) => {
        try {
            await updateAppointmentStatus(appointmentId, newStatus);
            toast.success(`Appointment ${newStatus.toLowerCase()}`);
            fetchAll();
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleCancel = async (appointmentId: string) => {
        try {
            await cancelAppointment(appointmentId);
            toast.success("Appointment cancelled");
            fetchAll();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel");
        }
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Appointments
                </h1>
                {formData && (
                    <BookAppointmentDialog
                        patients={formData.patients}
                        doctors={formData.doctors}
                        currentUserId={formData.currentUserId}
                        currentUserRole={formData.currentUserRole}
                        onSuccess={fetchAll}
                    />
                )}
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm max-w-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by patient, doctor, type..."
                    className="flex-1 outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="space-y-4">
                    {filteredAppointments.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                            {searchQuery
                                ? "No appointments match your search."
                                : "No upcoming appointments scheduled."}
                        </div>
                    )}
                    {filteredAppointments.map((appt) => {
                        const d = new Date(appt.date);
                        return (
                            <div
                                key={appt.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg border text-sm">
                                        <span className="font-bold text-slate-900">
                                            {d.getDate()}
                                        </span>
                                        <span className="text-xs text-slate-500 uppercase">
                                            {d.toLocaleString("default", { month: "short" })}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900">
                                            <Link
                                                href={`/emr/${appt.id}`}
                                                className="hover:underline hover:text-primary"
                                            >
                                                {appt.patient.firstName} {appt.patient.lastName}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {appt.doctor?.name
                                                ? `with ${appt.doctor.name}`
                                                : "No doctor assigned"}{" "}
                                            • {appt.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-medium text-slate-900">
                                            {d.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        <p
                                            className={cn(
                                                "text-xs font-medium uppercase",
                                                appt.status === "SCHEDULED"
                                                    ? "text-blue-600"
                                                    : appt.status === "CONFIRMED"
                                                    ? "text-indigo-600"
                                                    : appt.status === "CHECKED_IN"
                                                    ? "text-amber-600"
                                                    : appt.status === "CANCELLED"
                                                    ? "text-red-600"
                                                    : appt.status === "COMPLETED"
                                                    ? "text-green-600"
                                                    : appt.status === "NO_SHOW"
                                                    ? "text-slate-400"
                                                    : "text-amber-600"
                                            )}
                                        >
                                            {appt.status}
                                        </p>
                                    </div>

                                    {/* Status Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        {appt.status === "SCHEDULED" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:bg-green-50 h-8 px-2"
                                                    title="Confirm"
                                                    onClick={() => handleStatusChange(appt.id, "CONFIRMED")}
                                                >
                                                    <Check className="h-3.5 w-3.5 mr-1" /> Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50 h-8 px-2"
                                                    title="Cancel"
                                                    onClick={() => handleCancel(appt.id)}
                                                >
                                                    <X className="h-3.5 w-3.5 mr-1" /> Decline
                                                </Button>
                                            </>
                                        )}
                                        {appt.status === "CONFIRMED" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-amber-600 hover:bg-amber-50 h-8 px-2"
                                                    title="Check In"
                                                    onClick={() => handleStatusChange(appt.id, "CHECKED_IN")}
                                                >
                                                    <UserCheck className="h-3.5 w-3.5 mr-1" /> Check In
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50 h-8 px-2"
                                                    title="Cancel"
                                                    onClick={() => handleCancel(appt.id)}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </>
                                        )}
                                        {appt.status === "CHECKED_IN" && (
                                            <Link href={`/emr/${appt.id}`}>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 h-8 px-3"
                                                >
                                                    Start Consultation
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
