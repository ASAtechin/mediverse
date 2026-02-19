"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
    Stethoscope, 
    HeartPulse, 
    Home, 
    ArrowLeft,
    Search,
    ShieldX
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating Medical Icons */}
                <motion.div
                    className="absolute top-20 left-10 text-blue-100"
                    animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 10, 0]
                    }}
                    transition={{ 
                        duration: 6, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                >
                    <Stethoscope className="h-24 w-24" />
                </motion.div>

                <motion.div
                    className="absolute bottom-32 right-20 text-cyan-100"
                    animate={{ 
                        y: [0, 20, 0],
                        rotate: [0, -10, 0]
                    }}
                    transition={{ 
                        duration: 5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 1
                    }}
                >
                    <HeartPulse className="h-32 w-32" />
                </motion.div>

                <motion.div
                    className="absolute top-1/3 right-10 text-blue-50"
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                >
                    <div className="h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 blur-2xl" />
                </motion.div>

                <motion.div
                    className="absolute bottom-20 left-1/4 text-cyan-50"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                        duration: 5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 2
                    }}
                >
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 blur-2xl" />
                </motion.div>

                {/* ECG Line Animation */}
                <svg 
                    className="absolute bottom-0 left-0 w-full h-32 text-blue-100/50"
                    viewBox="0 0 1200 100"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        d="M0,50 L100,50 L120,50 L140,20 L160,80 L180,50 L200,50 L300,50 L320,50 L340,10 L360,90 L380,50 L400,50 L500,50 L520,50 L540,30 L560,70 L580,50 L600,50 L700,50 L720,50 L740,15 L760,85 L780,50 L800,50 L900,50 L920,50 L940,25 L960,75 L980,50 L1000,50 L1100,50 L1120,50 L1140,20 L1160,80 L1180,50 L1200,50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </svg>
            </div>

            {/* Main Content */}
            <motion.div 
                className="relative z-10 text-center max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* 404 Icon */}
                <motion.div 
                    className="mb-8 inline-flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 200, 
                        damping: 15,
                        delay: 0.2
                    }}
                >
                    <div className="relative">
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center shadow-xl shadow-red-100/50">
                            <ShieldX className="h-16 w-16 text-red-400" />
                        </div>
                        <motion.div
                            className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            !
                        </motion.div>
                    </div>
                </motion.div>

                {/* Error Code */}
                <motion.h1 
                    className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    404
                </motion.h1>

                {/* Title */}
                <motion.h2 
                    className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Page Not Found
                </motion.h2>

                {/* Description */}
                <motion.p 
                    className="text-slate-500 text-lg mb-8 max-w-md mx-auto leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Oops! It seems like this page took an unscheduled break. 
                    Don&apos;t worry, our medical team is on it! 
                    Let&apos;s get you back on track.
                </motion.p>

                {/* Medical-themed divider */}
                <motion.div 
                    className="flex items-center justify-center gap-3 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-300" />
                    <HeartPulse className="h-5 w-5 text-red-400" />
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-300" />
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Link href="/dashboard">
                        <Button 
                            size="lg" 
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 gap-2 px-8"
                        >
                            <Home className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => window.history.back()}
                        className="gap-2 border-slate-300 hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                </motion.div>

                {/* Help Text */}
                <motion.div 
                    className="mt-12 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 inline-flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-slate-700">Looking for something?</p>
                        <p className="text-xs text-slate-500">Try checking the URL or navigate from the dashboard</p>
                    </div>
                </motion.div>

                {/* Footer Branding */}
                <motion.div 
                    className="mt-12 flex items-center justify-center gap-2 text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <div className="h-6 w-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        C+
                    </div>
                    <span className="text-sm font-medium">Clinicia</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
