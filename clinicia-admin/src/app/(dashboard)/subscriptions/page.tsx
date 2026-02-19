"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Plus, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Subscription {
    id: string;
    clinicId: string;
    provider: string;
    providerSubId: string;
    status: string;
    planId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    clinic: {
        id: string;
        name: string;
        plan: string;
        status: string;
    };
}

const plans = [
    {
        name: "Starter",
        price: "₹2,499",
        period: "/month",
        features: ["Up to 2 Doctors", "500 Patients", "Basic Support"]
    },
    {
        name: "Pro",
        price: "₹7,999",
        period: "/month",
        features: ["Up to 10 Doctors", "Unlimited Patients", "Priority Support", "Analytics"]
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        features: ["Unlimited Doctors", "Dedicated Account Manager", "Custom Integrations", "SLA"]
    }
];

const statusBadge = (status: string) => {
    switch (status.toUpperCase()) {
        case "ACTIVE":
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
        case "PAST_DUE":
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Past Due</Badge>;
        case "CANCELED":
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Canceled</Badge>;
        default:
            return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">{status}</Badge>;
    }
};

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchSubscriptions() {
            try {
                const res = await api.get("/admin/subscriptions");
                setSubscriptions(res.data);
            } catch (err: any) {
                console.error("Failed to fetch subscriptions:", err);
                setError("Failed to load subscriptions.");
            } finally {
                setLoading(false);
            }
        }
        fetchSubscriptions();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-slate-800" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-md text-center">
                    <AlertCircle className="h-10 w-10 text-red-600 mx-auto mb-3" />
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    const activeCount = subscriptions.filter(s => s.status === "ACTIVE").length;
    const pastDueCount = subscriptions.filter(s => s.status === "PAST_DUE").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
                    <p className="text-slate-500">Manage clinic subscription plans and billing.</p>
                </div>
                <Button disabled className="opacity-50 cursor-not-allowed" title="Plans are configured in the backend">
                    <Plus className="mr-2 h-4 w-4" /> Create New Plan
                </Button>
            </div>

            {/* Plan cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {plans.map((plan, idx) => (
                    <Card key={plan.name} className="p-6 flex flex-col relative overflow-hidden">
                        {idx === 1 && (
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                POPULAR
                            </div>
                        )}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                            <div className="mt-2 flex items-baseline">
                                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                                <span className="text-slate-500 ml-1">{plan.period}</span>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-6 flex-1">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button variant={idx === 1 ? "default" : "outline"} className="w-full opacity-50 cursor-not-allowed" disabled title="Plans are configured in the backend">
                            Edit Plan
                        </Button>
                    </Card>
                ))}
            </motion.div>

            {/* Active subscriptions table - REAL DATA */}
            <Card className="p-6 mt-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Active Subscriptions</h3>
                        <p className="text-slate-500 text-sm">
                            {activeCount} active · {pastDueCount} past due · {subscriptions.length} total
                        </p>
                    </div>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No subscriptions yet. Clinics will appear here after subscribing.</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3">Clinic Name</th>
                                    <th className="px-4 py-3">Plan</th>
                                    <th className="px-4 py-3">Provider</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Next Billing</th>
                                    <th className="px-4 py-3 text-right">Period End</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium">{sub.clinic?.name || "Unknown"}</td>
                                        <td className="px-4 py-3">{sub.planId}</td>
                                        <td className="px-4 py-3 text-slate-500">{sub.provider}</td>
                                        <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                                        <td className="px-4 py-3">
                                            {sub.cancelAtPeriodEnd
                                                ? <span className="text-red-500 text-xs">Cancels at period end</span>
                                                : new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-500">
                                            {new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
