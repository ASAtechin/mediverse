"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Pill,
    CreditCard,
    Settings,
    DollarSign
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Clinical Records", href: "/emr", icon: FileText },
    { name: "Prescriptions", href: "/prescriptions", icon: Pill },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                <div className="flex flex-col h-full bg-white">
                    <div className="flex items-center gap-2 p-6 border-b border-slate-100">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            C+
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                            Clinicia
                        </span>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block outline-none"
                                    onClick={() => setOpen(false)}
                                >
                                    <div className={cn(
                                        "flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                                    )}>
                                        <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400")} />
                                        <span className="font-medium whitespace-nowrap">
                                            {item.name}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-medium shadow-md">
                                {user?.displayName?.[0] || user?.email?.[0] || "U"}
                            </div>
                            <div className="text-sm overflow-hidden">
                                <p className="font-semibold text-slate-800 truncate max-w-[150px]">{user?.displayName || "User"}</p>
                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                    <p className="text-xs text-slate-500 uppercase">{user?.role || "GUEST"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
