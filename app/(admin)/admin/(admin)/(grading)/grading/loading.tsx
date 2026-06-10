"use client";
import { Package } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
            <div className="relative flex items-center justify-center">
                {/* Outer Spinning Ring */}
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>

                {/* Inner Icon (Matches your Sidebar Logo) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-6 h-6 text-emerald-600 animate-pulse" />
                </div>
            </div>

            {/* Loading Text */}
            <div className="flex flex-col items-center gap-1">
                <h3 className="text-lg font-semibold text-slate-800 animate-pulse">
                    Preparing Content
                </h3>
                <p className="text-sm text-slate-500">
                    Please wait a moment...
                </p>
            </div>
        </div>
    );
}