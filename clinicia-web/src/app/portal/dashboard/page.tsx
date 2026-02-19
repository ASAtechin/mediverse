
import { Card } from "@/components/ui/card";
import { Calendar, Activity, Pill } from "lucide-react";

export default function PortalDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                <p className="text-slate-500">Here's your health overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Next Appointment</p>
                            <h3 className="text-lg font-bold text-slate-900">Oct 24, 10:00 AM</h3>
                            <p className="text-xs text-slate-400">Dr. Sarah Johnson</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-green-500 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-50 p-3 rounded-full text-green-600">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Latest Vitals</p>
                            <h3 className="text-lg font-bold text-slate-900">120/80 mmHg</h3>
                            <p className="text-xs text-slate-400">Recorded 2 days ago</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-purple-500 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-50 p-3 rounded-full text-purple-600">
                            <Pill className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Medications</p>
                            <h3 className="text-lg font-bold text-slate-900">2 Active</h3>
                            <p className="text-xs text-slate-400">Next refill in 5 days</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Recent Documents</h3>
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded border border-dashed">
                        No new documents.
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Messages</h3>
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded border border-dashed">
                        No new messages.
                    </div>
                </Card>
            </div>
        </div>
    );
}
