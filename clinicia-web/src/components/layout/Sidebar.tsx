"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Settings,
    Pill,
    CreditCard,
    Menu,
    ChevronLeft,
    LogOut,
    DollarSign,
    Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Doctors", href: "/doctors", icon: Stethoscope },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Clinical Records", href: "/emr", icon: FileText },
    { name: "Prescriptions", href: "/prescriptions", icon: Pill },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
    { name: "Settings", href: "/settings", icon: Settings },
];



export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <motion.div
            initial={{ width: 256 }}
            animate={{ width: collapsed ? 80 : 256 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
                "hidden md:flex flex-col h-screen bg-white border-r shadow-xl z-20 relative"
            )}
        >
            <div className="flex items-center justify-between p-4 h-20 border-b border-slate-100">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                C+
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                Clinicia
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-transform",
                        collapsed && "mx-auto rotate-180"
                    )}
                >
                    {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 space-y-1 overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block outline-none"
                        >
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                            )}>
                                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-medium whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                                {isActive && !collapsed && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/40"
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-medium shadow-md">
                        {user?.displayName?.[0] || user?.email?.[0] || "U"}
                    </div>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm overflow-hidden"
                        >
                            <p className="font-semibold text-slate-800 truncate max-w-[150px]">{user?.displayName || "User"}</p>
                            <div className="flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                <p className="text-xs text-slate-500 uppercase">{user?.role || "GUEST"}</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center gap-3 px-2 py-2 w-full rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors",
                        collapsed ? "justify-center" : ""
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span className="text-sm font-medium">Log Out</span>}
                </button>
            </div>
        </motion.div>
    );
}
