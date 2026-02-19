import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckCircle2, Pill, Stethoscope, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PatientVisitSummary({ params }: { params: { id: string } }) {
    // ID here is the APPOINTMENT ID (easier to link) or VISIT ID. Let's use Appointment ID for consistency.
    const appointment = await prisma.appointment.findUnique({
        where: { id: params.id },
        include: {
            clinic: true,
            doctor: true,
            patient: true,
            visit: { include: { prescriptions: true } }
        },
    });

    if (!appointment || !appointment.visit) {
        return notFound();
    }

    const { visit, doctor, clinic, patient } = appointment;
    const aiData = visit.aiSummary as any; // Typed as Json in Prisma

    // Mock "Patient Friendly" Translation if AI data exists
    const patientSummary = aiData
        ? `Dr. ${doctor.name?.split(' ')[0] || 'Smith'} noted that you have ${aiData.diagnosis.toLowerCase()}. ${aiData.plan}`
        : visit.notes || "No specific notes recorded.";

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white text-center relative">
                    <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                        <Stethoscope className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Visit Summary</h1>
                    <p className="text-blue-100 text-sm">{appointment.date.toDateString()}</p>
                    <div className="mt-4 inline-block bg-blue-700/50 px-3 py-1 rounded-full text-xs font-medium">
                        {clinic.name}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Diagnosis Card */}
                    <div className="text-center">
                        <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Diagnosis</p>
                        <h2 className="text-2xl font-bold text-slate-900">{visit.diagnosis || aiData?.diagnosis || "Consultation"}</h2>
                    </div>

                    <hr className="border-slate-100" />

                    {/* AI Insights / Doctor's Note */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-purple-600">
                            <SparklesIcon />
                            <h3 className="font-semibold text-sm">Doctor's Note (Simplified)</h3>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-purple-100">
                            {patientSummary}
                        </div>
                    </div>

                    {/* Medications */}
                    {visit.prescriptions.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-blue-600">
                                <Pill className="h-4 w-4" />
                                <h3 className="font-semibold text-sm">Medications</h3>
                            </div>
                            <div className="space-y-2">
                                {(() => {
                                    try {
                                        const meds = JSON.parse(visit.prescriptions[0].medications);
                                        return meds.map((med: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                                <div>
                                                    <p className="font-medium text-slate-900">{med.medicine || med.name}</p>
                                                    <p className="text-xs text-slate-500">{med.duration}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-xs font-bold bg-white border px-2 py-1 rounded text-slate-600">
                                                        {med.frequency}
                                                    </span>
                                                </div>
                                            </div>
                                        ));
                                    } catch (e) { return <p className="text-sm text-gray-500">Error loading prescriptions.</p> }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-green-50 p-4 rounded-xl flex gap-3 items-start border border-green-100">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-green-900 text-sm">Follow Up</h4>
                            <p className="text-green-800 text-xs mt-1">
                                Please schedule a follow-up visit if symptoms persist after 5 days.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 text-center border-t">
                    <p className="text-xs text-slate-400">Powered by Clinicia AI</p>
                </div>
            </div>
        </div>
    );
}

function SparklesIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    )
}
