import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VitalsList } from "@/components/patient/VitalsList";
import { AddVitalDialog } from "@/components/patient/AddVitalDialog";
import { AttachmentsList } from "@/components/patient/AttachmentsList";
import { AddAttachmentDialog } from "@/components/patient/AddAttachmentDialog";

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
    const patient = await prisma.patient.findUnique({
        where: { id: params.id },
        include: {
            appointments: true,
            visits: true,
            vitals: { orderBy: { recordedAt: 'desc' } },
            attachments: { orderBy: { createdAt: 'desc' } }
        },
    });

    if (!patient) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/patients">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {patient.firstName} {patient.lastName}
                    </h1>
                </div>
                <AddVitalDialog patientId={patient.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Demographics</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-semibold">Phone</label>
                                <p>{patient.phone}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-semibold">Email</label>
                                <p>{patient.email || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-semibold">Address</label>
                                <p>{patient.address || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-semibold">DOB</label>
                                <p>{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vitals Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Vitals History</h3>
                        </div>
                        <VitalsList vitals={patient.vitals} />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm min-h-[200px]">
                        <h3 className="font-semibold text-lg mb-4">Medical History</h3>
                        <p className="text-slate-500 italic">No records found.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm min-h-[200px]">
                        <h3 className="font-semibold text-lg mb-4">Recent Visits</h3>
                        <p className="text-slate-500 italic">No visits recorded.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
