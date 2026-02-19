"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Building,
    Mail,
    Phone,
    MapPin,
    Loader2,
    Zap,
    TrendingUp,
    Crown,
    Save,
    Trash2,
    AlertTriangle
} from "lucide-react";

interface EditTenantModalProps {
    isOpen: boolean;
    tenant: any;
    onClose: () => void;
    onSave: (id: string, data: Partial<TenantEditData>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export interface TenantEditData {
    name: string;
    email: string;
    phone: string;
    address: string;
    plan: string;
    status: string;
}

const plans = [
    { value: "FREE", label: "Free", icon: Zap, color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" },
    { value: "PRO", label: "Pro", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { value: "ENTERPRISE", label: "Enterprise", icon: Crown, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
];

const statuses = [
    { value: "ACTIVE", label: "Active", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    { value: "TRIAL", label: "Trial", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    { value: "SUSPENDED", label: "Suspended", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
    { value: "INACTIVE", label: "Inactive", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
];

export function EditTenantModal({ isOpen, tenant, onClose, onSave, onDelete }: EditTenantModalProps) {
    const [formData, setFormData] = useState<TenantEditData>({
        name: "",
        email: "",
        phone: "",
        address: "",
        plan: "FREE",
        status: "ACTIVE",
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name || "",
                email: tenant.email || "",
                phone: tenant.phone || "",
                address: tenant.address || "",
                plan: tenant.plan || "FREE",
                status: tenant.status || "ACTIVE",
            });
            setShowDeleteConfirm(false);
            setError("");
        }
    }, [tenant]);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError("Clinic name is required");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await onSave(tenant.id, formData);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.error || err.message || "Failed to update tenant");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError("");
        try {
            await onDelete(tenant.id);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.error || err.message || "Failed to delete tenant");
        } finally {
            setDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Building className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Edit Tenant</h2>
                                <p className="text-sm text-slate-500">Modify clinic details</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Clinic Name</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Phone & Address */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Plan */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
                            <div className="grid grid-cols-3 gap-2">
                                {plans.map((plan) => {
                                    const Icon = plan.icon;
                                    const selected = formData.plan === plan.value;
                                    return (
                                        <button
                                            key={plan.value}
                                            type="button"
                                            onClick={() => setFormData(f => ({ ...f, plan: plan.value }))}
                                            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                                                selected
                                                    ? `${plan.bg} ${plan.border} ${plan.color} ring-2 ring-offset-1 ring-blue-500/30`
                                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {plan.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                {statuses.map((s) => {
                                    const selected = formData.status === s.value;
                                    return (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => setFormData(f => ({ ...f, status: s.value }))}
                                            className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${
                                                selected
                                                    ? `${s.bg} ${s.border} ${s.color} ring-2 ring-offset-1 ring-blue-500/30`
                                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-200 flex items-center justify-between">
                        {!showDeleteConfirm ? (
                            <>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full">
                                <div className="flex items-center gap-2 text-red-700 mb-3">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        Are you sure? This will delete the clinic and all associated data permanently.
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Confirm Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
