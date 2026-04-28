'use client'
import { signIn, signOut } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod"; // 1. Import Zod

// 2. Define the Validation Schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Pages() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // State for field-specific validation errors
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // 3. Validate with Zod
        const validation = loginSchema.safeParse({ email, password });

        if (!validation.success) {
            // Map Zod errors to our state
            const errors = validation.error.flatten().fieldErrors;
            setFieldErrors({
                email: errors.email?.[0],
                password: errors.password?.[0],
            });
            return;
        }

        setLoading(true); // Start loading

        try {
            const res = await signIn.email({
                email,
                password,
                callbackURL: "/admin" // Better Auth can handle the redirect path
            });

            if (res.error) {
                setError(res.error.message || "Something went wrong.");
                setLoading(false);
            } else {
                if (res.data?.user?.role === "admin") {
                    router.push("/admin");
                } else {
                    setError("Access denied. Admin only.");
                    await signOut();
                    setLoading(false);
                }
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setLoading(false);
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
                <div className="max-w-md w-full">
                    <Image
                        src="/images/logo/logo.png"
                        alt="logo"
                        width={200}
                        height={200}
                        className="mb-12 mx-auto block"
                    />

                    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <h1 className="text-slate-900 text-center text-3xl font-semibold">Sign in</h1>

                        {/* Global Error Alert */}
                        {error && (
                            <div className="mt-6 p-3 rounded bg-red-50 border border-red-200 text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="text-slate-900 text-sm font-medium mb-2 block">Email Address</label>
                                <div className="relative">
                                    <input
                                        name="email"
                                        type="email"
                                        className={`w-full text-slate-900 text-sm border ${fieldErrors.email ? 'border-red-500' : 'border-slate-300'} px-4 py-3 rounded-md outline-blue-600`}
                                        placeholder="name@company.com"
                                    />
                                </div>
                                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="text-slate-900 text-sm font-medium mb-2 block">Password</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type="password"
                                        className={`w-full text-slate-900 text-sm border ${fieldErrors.password ? 'border-red-500' : 'border-slate-300'} px-4 py-3 rounded-md outline-blue-600`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 border-slate-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-900">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <button type="button" className="text-blue-600 hover:underline font-semibold">Forgot password?</button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 text-sm font-medium rounded-md text-white transition-all
                                    ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
                                        Processing...
                                    </span>
                                ) : "Sign in"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}