import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
            {/* Main Card */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
                <div className="p-12 md:p-20 text-center">

                    {/* Heading */}
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4">
                        401 - Unauthorized
                    </h1>

                    {/* Subtext */}
                    <p className="text-[#64748B] text-lg md:text-xl mb-10 font-medium">
                        Please sign in to continue
                    </p>

                    {/* Action Button */}
                    <Link
                        href="/login"
                        className="inline-block bg-[#334155] hover:bg-[#1E293B] text-white font-semibold py-4 px-10 rounded-xl transition-colors duration-200 shadow-md active:scale-95"
                    >
                        Sign In
                    </Link>

                </div>
            </div>
        </div>
    );
}