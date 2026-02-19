"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-slate-50">
                <AdminSidebar />
                <main className="flex-1 p-8 overflow-y-auto h-screen">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
