"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Sparkles, Wand2 } from "lucide-react";
import { PrescriptionManager } from "@/components/emr/PrescriptionManager";
import { AudioRecorder } from "@/components/emr/AudioRecorder";
import { CreateInvoiceDialog } from "@/components/billing/CreateInvoiceDialog";
import Link from "next/link";
import { saveConsultation } from "@/actions/emr";
import { toast } from "sonner";

interface VisitFormProps {
    appointment: any;
    visit: any;
    initialMeds: any[];
    initialVitals?: any;
}

export function VisitForm({ appointment, visit, initialMeds, initialVitals }: VisitFormProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiData, setAiData] = useState<any>(null); // To store AI suggestions
    const [showReview, setShowReview] = useState(false);

    // Form State (to allow Auto-fill)
    const [symptoms, setSymptoms] = useState(visit?.symptoms || "");
    const [diagnosis, setDiagnosis] = useState(visit?.diagnosis || "");
    const [notes, setNotes] = useState(visit?.notes || "");
    const [keyForRx, setKeyForRx] = useState(0); // To force re-render Rx Manager
    const [meds, setMeds] = useState(initialMeds);

    // Vitals State
    const [bp, setBp] = useState(initialVitals ? `${initialVitals.bpSystolic || ""}/${initialVitals.bpDiastolic || ""}` : "");
    const [pulse, setPulse] = useState(initialVitals?.pulse?.toString() || "");
    const [temperature, setTemperature] = useState(initialVitals?.temperature?.toString() || "");
    const [weight, setWeight] = useState(initialVitals?.weight?.toString() || "");
    const [height, setHeight] = useState(initialVitals?.height?.toString() || "");
    const [spo2, setSpo2] = useState(initialVitals?.spo2?.toString() || "");

    // AI Analysis State
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [analyzingPatient, setAnalyzingPatient] = useState(false);

    const analyzePatientHistory = async () => {
        setAnalyzingPatient(true);
        try {
            const res = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId: appointment.patientId }),
            });
            if (res.ok) {
                const data = await res.json();
                setAiAnalysis(data);
                toast.success("Patient analysis complete!");
            } else {
                toast.error("Failed to analyze patient history.");
            }
        } catch {
            toast.error("Error connecting to AI.");
        } finally {
            setAnalyzingPatient(false);
        }
    };

    const handleAudioStop = async (audioBlob: Blob) => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
            const res = await fetch("/api/ai/scribe", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setAiData(data); // Store for review
                setShowReview(true); // Show the "Magic" card
                toast.success("AI Analysis Complete! Review suggestions.");
            } else {
                toast.error("Failed to process audio.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error connecting to AI Scribe.");
        } finally {
            setIsProcessing(false);
        }
    };

    const applyAiSuggestions = () => {
        if (!aiData) return;

        setSymptoms(aiData.symptoms);
        setDiagnosis(aiData.diagnosis);
        setNotes(aiData.plan); // Mapping 'Plan' to 'Detailed Notes'

        // Transform AI prescriptions to match our format
        // Simple mapping assuming AI returns object with name/dosage/freq
        const newMeds = aiData.prescriptions?.map((p: any, idx: number) => ({
            id: Date.now() + idx,
            medicine: p.name,
            dosage: p.dosage,
            frequency: p.frequency,
            duration: "5 Days" // Default or extract if available
        })) || [];

        setMeds(newMeds);
        setKeyForRx(prev => prev + 1); // Force Rx Manager to reload with new meds

        setShowReview(false);
        toast.success("AI Suggestions Applied!");
    };

    return (
        <form action={saveConsultation} className="space-y-6 max-w-5xl mx-auto pb-20">
            <input type="hidden" name="appointmentId" value={appointment.id} />
            <input type="hidden" name="patientId" value={appointment.patientId} />

            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-slate-50 py-4 z-10 border-b mb-6 transition-all">
                <div className="flex items-center gap-4">
                    <Link href="/appointments">
                        <Button variant="ghost" size="icon" type="button">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            Consultation: {appointment.patient.firstName}
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-normal">AI Enabled</span>
                        </h1>
                        <p className="text-sm text-slate-500">
                            {new Date(appointment.date).toDateString()} • {appointment.type}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {visit && <CreateInvoiceDialog visitId={visit.id} patientName={`${appointment.patient.firstName}`} />}
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 shadow-sm">
                        <Save className="h-4 w-4 mr-2" /> Complete Visit
                    </Button>
                </div>
            </div>

            {/* AI Review Card (The "Creative" Modification) */}
            {showReview && aiData && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-purple-900">Dr. Scribe Suggestions</h3>
                                <p className="text-sm text-purple-700">Based on your conversation</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowReview(false)} className="text-slate-500">Dismiss</Button>
                            <Button type="button" onClick={applyAiSuggestions} className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Wand2 className="h-4 w-4 mr-2" /> Apply All
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/60 p-3 rounded border border-purple-100">
                            <span className="block text-xs font-semibold text-purple-500 uppercase">Diagnosis</span>
                            <span className="font-medium text-slate-800">{aiData.diagnosis}</span>
                        </div>
                        <div className="bg-white/60 p-3 rounded border border-purple-100">
                            <span className="block text-xs font-semibold text-purple-500 uppercase">Symptoms</span>
                            <span className="text-slate-700 truncate">{aiData.symptoms}</span>
                        </div>
                        <div className="col-span-2 bg-white/60 p-3 rounded border border-purple-100">
                            <span className="block text-xs font-semibold text-purple-500 uppercase">Suggested Plan</span>
                            <p className="text-slate-700 mt-1">{aiData.plan}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col */}
                <div className="space-y-6">
                    {/* Audio Recorder Widget */}
                    <AudioRecorder onStop={handleAudioStop} isProcessing={isProcessing} />

                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Vitals</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <Label className="text-xs text-slate-500">BP (mmHg)</Label>
                                <Input name="bp" placeholder="120/80" value={bp} onChange={(e) => setBp(e.target.value)} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs text-slate-500">Pulse (bpm)</Label>
                                <Input name="pulse" placeholder="72" value={pulse} onChange={(e) => setPulse(e.target.value)} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs text-slate-500">Temp (°F)</Label>
                                <Input name="temperature" placeholder="98.6" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs text-slate-500">Weight (kg)</Label>
                                <Input name="weight" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs text-slate-500">Height (cm)</Label>
                                <Input name="height" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs text-slate-500">SpO2 (%)</Label>
                                <Input name="spo2" placeholder="98" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Transcript Accordion (Creative Mod: Show what was heard) */}
                    {aiData?.transcript && (
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <h3 className="text-sm font-semibold mb-2">Transcript</h3>
                            <p className="text-xs text-slate-500 italic leading-relaxed">
                                "{aiData.transcript}"
                            </p>
                        </div>
                    )}

                    {/* AI Patient Analysis */}
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">AI Patient Analysis</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={analyzePatientHistory}
                                disabled={analyzingPatient}
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                                {analyzingPatient ? (
                                    <><Sparkles className="h-3 w-3 mr-1 animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Sparkles className="h-3 w-3 mr-1" /> Analyze History</>
                                )}
                            </Button>
                        </div>
                        {aiAnalysis && (
                            <div className="space-y-3 text-sm">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-slate-700">{aiAnalysis.summary}</p>
                                </div>
                                {aiAnalysis.trends?.length > 0 && (
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500 uppercase">Trends</span>
                                        <div className="mt-1 space-y-1">
                                            {aiAnalysis.trends.map((t: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${t.status === 'improving' ? 'bg-green-500' : t.status === 'concerning' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                    <span className="text-slate-700">{t.label}: {t.detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {aiAnalysis.recommendations?.length > 0 && (
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500 uppercase">Recommendations</span>
                                        <ul className="mt-1 list-disc list-inside text-slate-600">
                                            {aiAnalysis.recommendations.map((r: string, i: number) => (
                                                <li key={i}>{r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {aiAnalysis.riskLevel && (
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        aiAnalysis.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                                        aiAnalysis.riskLevel === 'moderate' ? 'bg-amber-100 text-amber-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        Risk Level: {aiAnalysis.riskLevel}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Center/Right Col */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg">Clinical Notes</h3>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Symptoms / Chief Complaints</Label>
                                <textarea
                                    name="symptoms"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus:border-blue-400"
                                    placeholder="e.g. Fever, Headache since 2 days"
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Diagnosis</Label>
                                <Input
                                    name="diagnosis"
                                    placeholder="e.g. Viral Fever"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    className={diagnosis ? "bg-green-50 border-green-200" : ""}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Detailed Notes & Plan</Label>
                                <textarea
                                    name="notes"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Examination findings..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <PrescriptionManager key={keyForRx} initialData={meds} />
                    </div>
                </div>
            </div>
        </form>
    );
}
