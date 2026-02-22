import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';
import { prisma } from '@/lib/db';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const ANALYSIS_SYSTEM_PROMPT = `You are an expert medical AI assistant. Given a patient's visit history with diagnoses, symptoms, vitals, and prescriptions, provide:
1. A concise health summary
2. Key health trends (improving/stable/concerning)
3. Notable patterns or recurring issues
4. Recommendations for follow-up

Respond ONLY in this JSON format:
{
  "summary": "<2-3 sentence health overview>",
  "trends": [
    { "label": "<trend name>", "status": "improving|stable|concerning", "detail": "<brief explanation>" }
  ],
  "patterns": ["<pattern 1>", "<pattern 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "riskLevel": "low|moderate|high"
}
Do NOT include markdown code blocks. Return valid JSON only.`;

export async function POST(req: Request) {
    try {
        // Auth check
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("__session")?.value;
        if (!sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await initAdmin();
        try {
            await admin.auth().verifyIdToken(sessionToken);
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { patientId } = await req.json();

        if (!patientId) {
            return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
        }

        // Fetch patient data
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: { firstName: true, lastName: true, dateOfBirth: true, gender: true },
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        // Fetch visit history
        const visits = await prisma.visit.findMany({
            where: { patientId },
            include: {
                vitals: true,
                prescriptions: true,
                appointment: {
                    include: { doctor: { select: { name: true } } }
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10, // Last 10 visits
        });

        if (visits.length === 0) {
            return NextResponse.json({
                summary: "No visit history available for analysis.",
                trends: [],
                patterns: [],
                recommendations: ["Schedule an initial health check-up."],
                riskLevel: "low",
                _noData: true,
            });
        }

        if (!OPENAI_API_KEY) {
            return NextResponse.json({
                summary: `Patient ${patient.firstName} has ${visits.length} recorded visit(s). AI analysis requires OpenAI API key configuration.`,
                trends: [{ label: "Visits", status: "stable", detail: `${visits.length} visits on record` }],
                patterns: ["AI analysis not available — OPENAI_API_KEY not set"],
                recommendations: ["Configure OPENAI_API_KEY for detailed AI insights"],
                riskLevel: "low",
                _mock: true,
            });
        }

        // Build context for AI
        const age = Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const visitSummaries = visits.map(v => {
            const vitals = v.vitals[0];
            const meds = v.prescriptions.map(p => {
                try { return JSON.parse(p.medications); } catch { return []; }
            }).flat();

            return {
                date: v.createdAt.toISOString().split('T')[0],
                doctor: v.appointment?.doctor?.name || 'Unknown',
                diagnosis: v.diagnosis || 'N/A',
                symptoms: v.symptoms || 'N/A',
                notes: v.notes || '',
                vitals: vitals ? {
                    bp: vitals.bpSystolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : null,
                    pulse: vitals.pulse,
                    temp: vitals.temperature,
                    weight: vitals.weight,
                    spo2: vitals.spo2,
                } : null,
                medications: meds.map((m: any) => `${m.medicine || m.name} ${m.dosage}`),
            };
        });

        const patientContext = `Patient: ${patient.firstName} ${patient.lastName}, Age: ${age}, Gender: ${patient.gender}\n\nVisit History:\n${JSON.stringify(visitSummaries, null, 2)}`;

        // Call GPT
        const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0.3,
                messages: [
                    { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
                    { role: 'user', content: patientContext },
                ],
            }),
        });

        if (!gptRes.ok) {
            const errText = await gptRes.text();
            console.error("[AI ANALYSIS] GPT failed:", errText);
            return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 });
        }

        const gptData = await gptRes.json();
        const rawContent = gptData.choices?.[0]?.message?.content || '{}';

        let parsed;
        try {
            parsed = JSON.parse(rawContent);
        } catch {
            parsed = {
                summary: "Unable to generate analysis. Please try again.",
                trends: [],
                patterns: [],
                recommendations: [],
                riskLevel: "low",
            };
        }

        return NextResponse.json(parsed);

    } catch (error) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}
