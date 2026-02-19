"use client";

import { useState } from "react";
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
    CheckCircle2,
    User,
    Key,
    Copy,
    Check,
    AlertTriangle
} from "lucide-react";

interface AddTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (tenant: any) => void;
    onSubmit: (data: TenantFormData) => Promise<any>;
}

export interface TenantFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    plan: string;
    status: string;
    adminName: string;
}

interface CreatedTenantInfo {
    clinicName: string;
    adminEmail: string;
    temporaryPassword: string;
}

const plans = [
    { value: "FREE", label: "Free", icon: Zap, color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" },
    { value: "PRO", label: "Pro", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { value: "ENTERPRISE", label: "Enterprise", icon: Crown, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
];

const statuses = [
    { value: "TRIAL", label: "Trial", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { value: "ACTIVE", label: "Active", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { value: "INACTIVE", label: "Inactive", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
];

export function AddTenantModal({ isOpen, onClose, onSuccess, onSubmit }: AddTenantModalProps) {
    const [formData, setFormData] = useState<TenantFormData>({
        name: "",
        email: "",
        phone: "",
        address: "",
        plan: "FREE",
        status: "TRIAL",
        adminName: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdTenant, setCreatedTenant] = useState<CreatedTenantInfo | null>(null);
    const [copiedPassword, setCopiedPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError("Clinic name is required");
            return;
        }

        if (!formData.email.trim()) {
            setError("Admin email is required for login access");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await onSubmit(formData);
            
            // Show success screen with credentials
            setCreatedTenant({
                clinicName: formData.name,
                adminEmail: formData.email,
                temporaryPassword: result.temporaryPassword || "Check email for password reset"
            });
            
            // Don't call onSuccess here - call it when modal is closed
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || "Failed to create tenant");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = async () => {
        if (createdTenant?.temporaryPassword) {
            await navigator.clipboard.writeText(createdTenant.temporaryPassword);
            setCopiedPassword(true);
            setTimeout(() => setCopiedPassword(false), 2000);
        }
    };

    const handleClose = () => {
        // If we just created a tenant, trigger the refresh
        const wasCreated = createdTenant !== null;
        
        // Reset form when closing
        setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            plan: "FREE",
            status: "TRIAL",
            adminName: "",
        });
        setCreatedTenant(null);
        setError("");
        setCopiedPassword(false);
        onClose();
        
        // Call onSuccess after closing to refresh the list
        if (wasCreated) {
            onSuccess(null);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Success Screen */}
                        {createdTenant ? (
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-100 rounded-full mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Tenant Created Successfully!</h2>
                                    <p className="text-sm text-slate-500 mt-1">Share the login credentials with the clinic admin</p>
                                </div>

                                <div className="space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Clinic Name</label>
                                        <p className="text-sm font-semibold text-slate-900 mt-1">{createdTenant.clinicName}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Admin Email</label>
                                        <p className="text-sm font-semibold text-slate-900 mt-1">{createdTenant.adminEmail}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Temporary Password</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900">
                                                {createdTenant.temporaryPassword}
                                            </code>
                                            <button
                                                onClick={handleCopyPassword}
                                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                                                title="Copy password"
                                            >
                                                {copiedPassword ? (
                                                    <Check className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-700">
                                        Please save these credentials securely. The password is only shown once. 
                                        The tenant should change their password after first login.
                                    </p>
                                </div>

                                <button
                                    onClick={handleClose}
                                    className="w-full mt-6 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Building className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Add New Tenant</h2>
                                            <p className="text-sm text-slate-500">Register a new clinic on the platform</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    {/* Clinic Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Clinic Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter clinic name"
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Admin Section Header */}
                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Key className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm font-semibold text-slate-700">Admin Account</span>
                                            <span className="text-xs text-slate-500">(for clinic login)</span>
                                        </div>
                                    </div>

                                    {/* Admin Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Admin Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="adminName"
                                                value={formData.adminName}
                                                onChange={handleChange}
                                                placeholder="Clinic administrator name"
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Admin Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="admin@clinic.com"
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">This email will be used to log in to the clinic portal</p>
                                    </div>

                                    {/* Phone & Address Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Phone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+1 234 567 890"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="City, State"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Subscription Plan</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {plans.map((plan) => {
                                                const Icon = plan.icon;
                                                const isSelected = formData.plan === plan.value;
                                                return (
                                                    <button
                                                        key={plan.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, plan: plan.value }))}
                                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                                                            isSelected 
                                                                ? `${plan.bg} ${plan.border} ${plan.color}` 
                                                                : "border-slate-200 text-slate-400 hover:border-slate-300"
                                                        }`}
                                                    >
                                                        <Icon className={`h-5 w-5 ${isSelected ? plan.color : ""}`} />
                                                        <span className={`text-xs font-semibold ${isSelected ? plan.color : "text-slate-600"}`}>
                                                            {plan.label}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckCircle2 className={`h-3.5 w-3.5 ${plan.color}`} />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Status Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Initial Status</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {statuses.map((status) => {
                                                const isSelected = formData.status === status.value;
                                                return (
                                                    <button
                                                        key={status.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                                                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${
                                                            isSelected 
                                                                ? `${status.bg} ${status.border} ${status.color}` 
                                                                : "border-slate-200 text-slate-400 hover:border-slate-300"
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className={`h-2 w-2 rounded-full ${
                                                                status.value === 'ACTIVE' ? 'bg-emerald-500' :
                                                                status.value === 'TRIAL' ? 'bg-amber-500' : 'bg-slate-400'
                                                            }`} />
                                                        )}
                                                        <span className={`text-sm font-medium ${isSelected ? status.color : "text-slate-600"}`}>
                                                            {status.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-3 bg-red-50 border border-red-200 rounded-xl"
                                            >
                                                <p className="text-sm text-red-600 font-medium">{error}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Create Tenant
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
