import { prisma } from "@/lib/db";
import { Search, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadRxButton } from "@/components/prescription/DownloadRxButton";

// Prevent static generation — this page needs runtime DB access
export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
    const prescriptions = await prisma.prescription.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            visit: {
                include: {
                    patient: true,
                    clinic: true
                }
            }
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Prescriptions
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {prescriptions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No prescriptions issued yet.
                    </div>
                ) : (
                    <div className="grid gap-4 p-6">
                        {prescriptions.map((rx) => {
                            const meds = JSON.parse(rx.medications);
                            return (
                                <div key={rx.id} className="border rounded-lg p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900">
                                                {rx.visit.patient.firstName} {rx.visit.patient.lastName}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Date: {rx.createdAt.toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                            <Pill className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {meds.map((m: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm border-b border-slate-200 last:border-0 pb-1 last:pb-0">
                                                <span className="font-medium text-slate-700">{m.medicine}</span>
                                                <span className="text-slate-500">{m.dosage} • {m.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t flex justify-end">
                                        <DownloadRxButton data={{
                                            id: rx.id,
                                            patientName: `${rx.visit.patient.firstName} ${rx.visit.patient.lastName}`,
                                            doctorName: "Doctor",
                                            date: rx.createdAt.toLocaleDateString(),
                                            medications: meds,
                                            clinicName: rx.visit.clinic?.name || "Clinic"
                                        }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
