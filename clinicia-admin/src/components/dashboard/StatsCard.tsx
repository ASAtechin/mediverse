import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
    };
    className?: string;
    color?: "blue" | "green" | "emerald" | "purple" | "rose" | "orange";
}

export function StatsCard({ title, value, icon: Icon, trend, className, color = "blue" }: StatsCardProps) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
    };

    return (
        <div className={cn("bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all", className)}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-lg", colorStyles[color])}>
                    <Icon className="h-6 w-6" />
                </div>
                {trend && (
                    <div className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                        trend.value >= 0 ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                    )}>
                        {trend.value >= 0 ? "+" : ""}{trend.value}%
                    </div>
                )}
            </div>

            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>

            {/* Decorative background visual */}
            <Icon className="absolute -bottom-4 -right-4 h-24 w-24 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
}
