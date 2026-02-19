"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, LogOut, LayoutDashboard, Calendar, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace("/portal/login");
            } else {
                // Ideally check custom claim 'role' === 'patient'
                // But simplified for now.
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/session', { method: 'DELETE' });
        } catch {}
        await auth.signOut();
        router.replace("/portal/login");
    };

    if (loading) {
        return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile/Desktop Sidebar simplified */}
            <aside className="bg-white w-full md:w-64 border-r hidden md:flex flex-col h-screen fixed left-0 top-0 z-10">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600">Clinicia Portal</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" /> Appointments
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600">
                        <FileText className="h-4 w-4" /> Records
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600">
                        <User className="h-4 w-4" /> Profile
                    </Button>
                </nav>
                <div className="p-4 border-t">
                    <Button variant="outline" className="w-full gap-2 text-red-600 border-red-100 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20">
                <h1 className="font-bold text-blue-600">Clinicia Portal</h1>
                <Button size="icon" variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                </Button>
            </header>

            <main className="flex-1 md:ml-64 p-6">
                {children}
            </main>
        </div>
    );
}
