import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Page title skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-9 w-48 bg-slate-200 rounded-lg" />
                <div className="h-10 w-36 bg-slate-200 rounded-lg" />
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                            <div className="h-10 w-10 bg-slate-100 rounded-lg" />
                        </div>
                        <div className="h-8 w-16 bg-slate-200 rounded" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                        <div className="h-16 w-16 bg-slate-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-40 bg-slate-200 rounded" />
                            <div className="h-3 w-28 bg-slate-100 rounded" />
                        </div>
                        <div className="h-4 w-16 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
