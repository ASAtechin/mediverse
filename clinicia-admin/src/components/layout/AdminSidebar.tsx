"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    LogOut,
    Shield,
    Menu,
    ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Tenants", href: "/tenants", icon: Users },
    { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Use replace to prevent back navigation to authenticated pages
            router.replace('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <motion.div
            initial={{ width: 256 }}
            animate={{ width: collapsed ? 80 : 256 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
                "flex flex-col h-screen bg-slate-900 border-r border-slate-800 shadow-xl z-20 relative text-slate-100"
            )}
        >
            <div className="flex items-center justify-between p-4 h-20 border-b border-slate-800">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                Admin
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-transform",
                        collapsed && "mx-auto rotate-180"
                    )}
                >
                    {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 space-y-1 overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block outline-none"
                        >
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}>
                                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-medium whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-2">
                <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium border border-slate-700">
                        A
                    </div>
                    {!collapsed && (
                        <div className="text-sm overflow-hidden">
                            <p className="font-semibold text-slate-200 truncate max-w-[150px]">Super Admin</p>
                            <div className="flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                <p className="text-xs text-slate-400 uppercase">GOD MODE</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center gap-3 px-2 py-2 w-full rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors",
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
