"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api"; // Authenticated API client
import { Loader2, Building, Activity, DollarSign, Users, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentClinicsTable } from "@/components/dashboard/RecentClinics";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, clinicsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/tenants")
        ]);

        setStats(statsRes.data);
        const tenantsPayload = clinicsRes.data;
        const tenantList = Array.isArray(tenantsPayload) ? tenantsPayload : tenantsPayload.data || [];
        setClinics(tenantList);

        // Calculate total patients across all clinics
        const patientCount = tenantList.reduce((sum: number, c: any) => sum + (c._count?.patients || 0), 0);
        setTotalPatients(patientCount);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data", err);
        setError("Failed to load dashboard data. Ensure you are logged in as Super Admin.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/50">
        <Loader2 className="h-10 w-10 animate-spin text-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-md text-center">
          <AlertCircle className="h-10 w-10 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900">Access Error</h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Real-time metrics from across the Clinicia ecosystem.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatsCard
          title="Total Clinics"
          value={stats?.totalClinics || 0}
          icon={Building}
          color="blue"
        />
        <StatsCard
          title="Total Doctors"
          value={stats?.totalDoctors || 0}
          icon={Users}
          color="rose"
        />
        {/* <StatsCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={Activity}
          color="emerald"
          trend={{ value: 5, label: "new this week" }}
        /> */}
        <StatsCard
          title="Monthly Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="purple"
        />
      </motion.div>

      {/* Additional Metrics Row */}
      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* We can add more charts here later */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-slate-300 font-medium mb-1">System Health</h3>
            <div className="text-2xl font-bold flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              {stats?.systemHealth || "Operational"}
            </div>
            <div className="mt-6 flex gap-4 text-xs text-slate-400">
              <div>
                <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Latency</span>
                <span className="text-white font-mono">24ms</span>
              </div>
              <div>
                <span className="block text-slate-500 uppercase tracking-wider text-[10px]">Uptime</span>
                <span className="text-white font-mono">99.99%</span>
              </div>
            </div>
          </div>
          <Activity className="absolute right-[-20px] bottom-[-20px] h-32 w-32 text-white/5" />
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <Users className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-900">Total Patients Managed</h3>
          <p className="text-3xl font-bold text-slate-700 mt-2">{totalPatients.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Across all tenants</p>
        </div>
      </motion.div>

      {/* Recent Clinics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <RecentClinicsTable clinics={clinics.slice(0, 5)} />
      </motion.div>
    </div>
  );
}
