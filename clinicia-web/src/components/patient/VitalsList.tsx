"use client";

import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity, Heart, Thermometer, Wind } from "lucide-react";

interface Vital {
    id: string;
    weight: number | null;
    height: number | null;
    bpSystolic: number | null;
    bpDiastolic: number | null;
    pulse: number | null;
    temperature: number | null;
    spo2: number | null;
    recordedAt: string | Date;
}

export function VitalsList({ vitals }: { vitals: Vital[] }) {
    if (!vitals || vitals.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No vitals recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {vitals.map((vital) => (
                <Card key={vital.id} className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div className="col-span-2 md:col-span-4 text-xs text-slate-400 font-medium">
                        {format(new Date(vital.recordedAt), 'PP p')}
                    </div>

                    {/* BP */}
                    <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 rounded-full text-red-500">
                            <Activity className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">BP</p>
                            <p className="font-bold text-slate-900">
                                {vital.bpSystolic && vital.bpDiastolic
                                    ? `${vital.bpSystolic}/${vital.bpDiastolic}`
                                    : '--'}
                                <span className="text-xs text-slate-400 font-normal ml-1">mmHg</span>
                            </p>
                        </div>
                    </div>

                    {/* Pulse */}
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-50 p-2 rounded-full text-rose-500">
                            <Heart className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Pulse</p>
                            <p className="font-bold text-slate-900">
                                {vital.pulse || '--'}
                                <span className="text-xs text-slate-400 font-normal ml-1">bpm</span>
                            </p>
                        </div>
                    </div>

                    {/* Temp */}
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-50 p-2 rounded-full text-orange-500">
                            <Thermometer className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Temp</p>
                            <p className="font-bold text-slate-900">
                                {vital.temperature || '--'}
                                <span className="text-xs text-slate-400 font-normal ml-1">°F</span>
                            </p>
                        </div>
                    </div>

                    {/* SpO2 */}
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full text-blue-500">
                            <Wind className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">SpO2</p>
                            <p className="font-bold text-slate-900">
                                {vital.spo2 || '--'}
                                <span className="text-xs text-slate-400 font-normal ml-1">%</span>
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
