import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const CLINICAL_SYSTEM_PROMPT = `You are an expert clinical AI scribe. Given a doctor-patient consultation transcript, extract structured clinical information. Respond ONLY in this JSON format:
{
  "transcript": "<cleaned up transcript>",
  "diagnosis": "<primary diagnosis>",
  "symptoms": "<comma-separated list of symptoms>",
  "plan": "<treatment plan>",
  "prescriptions": [
    { "name": "<medication>", "dosage": "<dosage>", "frequency": "<frequency>" }
  ]
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

        const formData = await req.formData();
        const audioFile = formData.get('audio') as Blob;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
        }

        if (!OPENAI_API_KEY) {
            console.warn("[AI SCRIBE] OPENAI_API_KEY not configured — returning mock data");
            // Graceful fallback to mock when key isn't set
            return NextResponse.json({
                transcript: "AI Scribe is not configured. Set OPENAI_API_KEY to enable real transcription.",
                diagnosis: "N/A",
                symptoms: "N/A",
                plan: "Please configure the OpenAI API key to use AI Scribe.",
                prescriptions: [],
                _mock: true,
            });
        }

        // Step 1: Transcribe audio with Whisper API
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile, 'consultation.webm');
        audioFormData.append('model', 'whisper-1');
        audioFormData.append('language', 'en');
        audioFormData.append('response_format', 'text');

        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: audioFormData,
        });

        if (!whisperRes.ok) {
            const errText = await whisperRes.text();
            console.error("[AI SCRIBE] Whisper failed:", errText);
            return NextResponse.json({ error: 'Transcription failed' }, { status: 502 });
        }

        const transcript = await whisperRes.text();

        // Step 2: Extract clinical insights with GPT-4o-mini
        const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0.2,
                messages: [
                    { role: 'system', content: CLINICAL_SYSTEM_PROMPT },
                    { role: 'user', content: `Transcript:\n${transcript}` },
                ],
            }),
        });

        if (!gptRes.ok) {
            const errText = await gptRes.text();
            console.error("[AI SCRIBE] GPT failed:", errText);
            return NextResponse.json({ error: 'Clinical analysis failed' }, { status: 502 });
        }

        const gptData = await gptRes.json();
        const rawContent = gptData.choices?.[0]?.message?.content || '{}';

        let parsed;
        try {
            parsed = JSON.parse(rawContent);
        } catch {
            console.error("[AI SCRIBE] Failed to parse GPT response:", rawContent);
            // Return the raw transcript with a parsing error
            parsed = {
                transcript,
                diagnosis: "Unable to parse — please review transcript",
                symptoms: "",
                plan: "",
                prescriptions: [],
            };
        }

        // Ensure transcript is always the actual Whisper output
        parsed.transcript = transcript;

        return NextResponse.json(parsed);

    } catch (error) {
        console.error("AI Scribe Error:", error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}
