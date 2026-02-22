"use client";

import {
  Users,
  CalendarCheck,
  DollarSign,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from "framer-motion";
import useSWR from "swr";
import { getDashboardStats, getWeeklyChartData, getUpcomingSchedule } from "@/actions/dashboard";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

import { useRouter } from "next/navigation"; // Added

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // ── ALL hooks MUST be called before any conditional return ──
  const { data: dashboardData } = useSWR(
    user?.clinicId ? ['dashboard-stats', user.clinicId] : null,
    async () => {
      const result = await getDashboardStats(user?.clinicId || undefined);
      if (result.success && result.data) return result.data;
      return null;
    },
    { refreshInterval: 5000, revalidateOnFocus: true }
  );

  const { data: chartResult } = useSWR(
    user?.clinicId ? ['weekly-chart', user.clinicId] : null,
    async () => getWeeklyChartData(user?.clinicId || undefined),
    { refreshInterval: 30000, revalidateOnFocus: true }
  );
  const chartData = chartResult?.data || [];

  const { data: scheduleResult } = useSWR(
    user?.clinicId ? ['upcoming-schedule', user.clinicId] : null,
    async () => getUpcomingSchedule(user?.clinicId || undefined),
    { refreshInterval: 10000, revalidateOnFocus: true }
  );
  const upcomingAppointments = scheduleResult?.data || [];

  // ── Conditional redirects AFTER hooks ──
  if (user?.role === 'SUPER_ADMIN') {
    if (typeof window !== 'undefined') {
      window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || '/admin';
    }
    return null;
  }

  const stats = [
    {
      name: "Total Patients",
      value: dashboardData?.totalPatients.toString() || "-",
      icon: Users,
      change: "—",
      color: "bg-blue-500",
      lightColor: "bg-blue-50 text-blue-600",
      href: "/patients"
    },
    {
      name: "Appointments Today",
      value: dashboardData?.appointmentsToday.toString() || "-",
      icon: CalendarCheck,
      change: "—",
      color: "bg-teal-500",
      lightColor: "bg-teal-50 text-teal-600",
      href: "/appointments"
    },
    {
      name: "Revenue (Mtd)",
      value: dashboardData ? `₹${dashboardData.revenue.toLocaleString()}` : "-",
      icon: DollarSign,
      change: "—",
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50 text-indigo-600",
      href: "/billing"
    },
    {
      name: "Active Treatments",
      value: dashboardData?.activeTreatments.toString() || "-",
      icon: Activity,
      change: "—",
      color: "bg-rose-500",
      lightColor: "bg-rose-50 text-rose-600",
      href: "/emr"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {user?.displayName || user?.email?.split('@')[0] || 'Doctor'}
          </h1>
          <p className="text-slate-500 mt-1">Here is what is happening with your clinic today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/billing">
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-sm font-medium transition-colors shadow-lg shadow-slate-900/20">
              View Analytics
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link href={stat.href} key={stat.name} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all cursor-pointer h-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.lightColor}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </span>
                <span className="ml-2 text-slate-400">vs last month</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Patient Flow</h3>
              <p className="text-sm text-slate-500">Weekly appointment statistics</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPatients)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Upcoming Schedule</h3>
          <div className="space-y-4">
            {upcomingAppointments.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No upcoming appointments</p>
            )}
            {upcomingAppointments.map((appt: any) => (
              <Link key={appt.id} href="/appointments" className="block">
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 font-bold text-xs">
                    <span>{appt.time}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">{appt.patientName}</h4>
                    <p className="text-xs text-slate-500">{appt.type}</p>
                  </div>
                  <span className="text-slate-400 hover:text-primary">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link href="/appointments" className="block w-full">
                <button className="w-full py-2 text-sm text-center text-primary font-medium hover:bg-blue-50 rounded-lg transition-colors">
                  View All Appointments
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
