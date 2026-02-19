"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useTenantUpdates } from "@/lib/socket";
import { 
    Loader2, 
    Building, 
    Users, 
    Calendar, 
    Search, 
    Plus, 
    MoreHorizontal, 
    TrendingUp, 
    Filter,
    ArrowUpRight,
    Activity,
    Crown,
    Zap,
    CheckCircle2,
    Clock,
    AlertCircle,
    RefreshCw,
    Wifi,
    WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddTenantModal, TenantFormData } from "@/components/dashboard/AddTenantModal";
import { EditTenantModal } from "@/components/dashboard/EditTenantModal";

const statusConfig = {
    ACTIVE: {
        color: "emerald",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
        icon: CheckCircle2
    },
    TRIAL: {
        color: "amber",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
        icon: Clock
    },
    INACTIVE: {
        color: "slate",
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
        dot: "bg-slate-400",
        icon: AlertCircle
    },
    SUSPENDED: {
        color: "red",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-500",
        icon: AlertCircle
    }
};

const planConfig = {
    FREE: { icon: Zap, color: "text-slate-500", bg: "bg-slate-100" },
    PRO: { icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    ENTERPRISE: { icon: Crown, color: "text-purple-600", bg: "bg-purple-50" }
};

export default function TenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editTenant, setEditTenant] = useState<any>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [page, setPage] = useState(1);
    const [totalTenants, setTotalTenants] = useState(0);
    const pageSize = 20;

    const fetchTenants = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await api.get(`/admin/tenants?page=${page}&limit=${pageSize}`);
            const payload = res.data;
            // Backend returns { data, total, page, limit }
            setTenants(Array.isArray(payload) ? payload : payload.data || []);
            setTotalTenants(payload.total ?? (Array.isArray(payload) ? payload.length : 0));
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch tenants", error);
            setTenants([]);
        } finally {
            setLoading(false);
        }
    };

    // Real-time WebSocket updates - refreshes when MongoDB changes
    const { isConnected } = useTenantUpdates(() => {
        fetchTenants(false);
    });

    // Initial fetch
    useEffect(() => {
        fetchTenants(true);
    }, [page]);

    const handleAddTenant = async (formData: TenantFormData) => {
        const res = await api.post("/admin/tenants", formData);
        return res.data;
    };

    const handleEditTenant = async (id: string, data: any) => {
        await api.put(`/admin/tenants/${id}`, data);
        fetchTenants(false);
    };

    const handleDeleteTenant = async (id: string) => {
        await api.delete(`/admin/tenants/${id}`);
        fetchTenants(false);
    };

    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              tenant.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "ALL" || tenant.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.status === 'ACTIVE').length,
        trial: tenants.filter(t => t.status === 'TRIAL').length,
        enterprise: tenants.filter(t => t.plan === 'ENTERPRISE').length
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
                        <Building className="h-8 w-8 text-blue-500 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 justify-center text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Loading tenants...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-1">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tenant Management</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-slate-500">Manage and monitor all registered clinics on the platform</p>
                        <div className="flex items-center gap-1.5 text-xs">
                            {isConnected ? (
                                <>
                                    <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-emerald-600 font-medium">Live updates</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-slate-400">Connecting...</span>
                                </>
                            )}
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400">Updated {lastUpdated.toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchTenants(false)}
                        className="p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        title="Refresh now"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                    >
                        <Plus className="h-4 w-4" />
                        Add Tenant
                    </motion.button>
                </div>
            </motion.div>

            {/* Add Tenant Modal */}
            <AddTenantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchTenants();
                }}
                onSubmit={handleAddTenant}
            />

            {/* Edit Tenant Modal */}
            <EditTenantModal
                isOpen={!!editTenant}
                tenant={editTenant}
                onClose={() => setEditTenant(null)}
                onSave={handleEditTenant}
                onDelete={handleDeleteTenant}
            />

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-slate-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-3">{stats.total}</p>
                    <p className="text-sm text-slate-500">Registered Clinics</p>
                </div>

                <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-3">{stats.active}</p>
                    <p className="text-sm text-slate-500">Active Subscriptions</p>
                </div>

                <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Trial</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-3">{stats.trial}</p>
                    <p className="text-sm text-slate-500">On Free Trial</p>
                </div>

                <div className="bg-white rounded-xl border border-purple-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Crown className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Enterprise</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-3">{stats.enterprise}</p>
                    <p className="text-sm text-slate-500">Enterprise Clients</p>
                </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tenants by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {["ALL", "ACTIVE", "TRIAL", "INACTIVE"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                filterStatus === status
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Tenants Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinic</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence>
                                {filteredTenants.map((tenant, index) => {
                                    const status = statusConfig[tenant.status as keyof typeof statusConfig] || statusConfig.INACTIVE;
                                    const plan = planConfig[tenant.plan as keyof typeof planConfig] || planConfig.FREE;
                                    const PlanIcon = plan.icon;
                                    const StatusIcon = status.icon;

                                    return (
                                        <motion.tr
                                            key={tenant.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                                                        {tenant.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{tenant.name}</p>
                                                        <p className="text-sm text-slate-500">{tenant.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${plan.bg}`}>
                                                    <PlanIcon className={`h-4 w-4 ${plan.color}`} />
                                                    <span className={`text-sm font-semibold ${plan.color}`}>{tenant.plan}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bg} ${status.border} border`}>
                                                    <div className={`h-2 w-2 rounded-full ${status.dot} animate-pulse`} />
                                                    <span className={`text-sm font-medium ${status.text}`}>{tenant.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-slate-400" />
                                                    <span className="font-medium text-slate-700">{tenant._count?.patients || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                    <span className="font-medium text-slate-700">{tenant._count?.appointments || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500">
                                                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setEditTenant(tenant)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        Manage
                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredTenants.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <Building className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No tenants found</h3>
                            <p className="text-sm text-slate-500 text-center max-w-sm">
                                {searchQuery 
                                    ? `No clinics match your search for "${searchQuery}"`
                                    : "There are no clinics registered yet. Add your first tenant to get started."
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Table Footer */}
                {filteredTenants.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-700">{filteredTenants.length}</span> of{" "}
                            <span className="font-medium text-slate-700">{totalTenants}</span> tenants
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-slate-500">Page {page}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page * pageSize >= totalTenants}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
