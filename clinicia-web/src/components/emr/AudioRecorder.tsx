"use client";

import { useState, useRef } from "react";
import { toast } from "sonner"; // Using the newly added library!

interface AudioRecorderProps {
    onStop: (audioBlob: Blob) => void;
    isProcessing?: boolean;
}

export function AudioRecorder({ onStop, isProcessing }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onStop(blob);
                stopStream(stream);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const stopStream = (stream: MediaStream) => {
        stream.getTracks().forEach((track) => track.stop());
    };

    return (
        <div className="flex items-center gap-4 p-4 border rounded-xl bg-slate-50">
            <div className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isRecording ? 'bg-red-100' : 'bg-blue-100'}`}>
                {isRecording && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                )}
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`z-10 rounded-full p-2 transition-transform active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isRecording ? (
                        <div className="h-4 w-4 rounded-sm bg-red-600" />
                    ) : (
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </button>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900">
                        {isRecording ? "Listening..." : isProcessing ? "Dr. Scribe is thinking..." : "AI Scribe"}
                    </h4>
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider">PRO</span>
                </div>
                <p className="text-xs text-gray-500">
                    {isRecording ? "Recording consultation..." : isProcessing ? "Transcribing and extracting notes..." : "Record patient visit to auto-generate notes."}
                </p>
            </div>

            {isProcessing && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            )}
        </div>
    );
}
