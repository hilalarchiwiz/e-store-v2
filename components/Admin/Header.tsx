'use client'

import { useAppSelector } from "@/redux/store"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { AlertTriangle, LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { logoutUser } from "@/redux/features/user-slice"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"

export default function Header() {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const user = useAppSelector((state) => state.userReducer.info)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter();
    const dispatch = useDispatch();
    const handleLogout = async () => {
        setIsLoggingOut(true); // Open the modal

        try {
            const { error } = await signOut();

            if (error) {
                toast.error(error.message || 'Error logging out');
                setIsLoggingOut(false); // Close modal only if there is an error
            } else {
                dispatch(logoutUser());
                router.push("/signin");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
            setIsLoggingOut(false);
        }
    };

    const [isLoggingOut, setIsLoggingOut] = useState(false);


    // Dummy Image logic
    const profilePic = user?.image || "https://ui-avatars.com/api/?name=" + (user?.name || "User")

    return (
        <header className="sticky top-0 z-40 border-b bg-white">
            <div className="px-4 py-3 flex items-center justify-between">
                <div>
                    <p className="text-xl font-bold text-black">Dashboard</p>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/" target="_blank" className="text-gray-600 hover:text-black flex items-center gap-2 text-sm transition">
                        🏠 Visit Website
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded-full transition"
                        >
                            <span className="text-black font-medium hidden md:block">{user?.name}</span>
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                                <Image
                                    src={profilePic}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </button>

                        {isOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl z-20 py-2">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-xs text-gray-500">Signed in as</p>
                                        <p className="text-sm font-semibold truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        href="/admin/update-profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        👤 Edit Profile
                                    </Link>
                                    <Link
                                        href="/admin/update-profile/change-password"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        🔑 Change Password
                                    </Link>
                                    <Link
                                        href="/admin/logs"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        🔑 Activity Logs
                                    </Link>
                                    <hr className="my-1" />
                                    {/* <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        Logout
                                    </button> */}
                                    <button
                                        onClick={() => setIsLogoutModalOpen(true)}
                                        className="group w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-black hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                                    >
                                        <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                                        <span>Logout</span>
                                    </button>
                                </div>

                                {isLogoutModalOpen && (
                                    <div className="fixed inset-0  flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
                                        {/* Backdrop */}
                                        <div
                                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                                            onClick={() => setIsLogoutModalOpen(false)}
                                        />

                                        {/* Modal Content */}
                                        <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden border border-slate-200 dark:border-slate-800">
                                            {/* Decorative Top Bar */}
                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />

                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                                    Confirm Logout
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 mb-8">
                                                    Are you sure you want to log out? You will need to sign in again to access the dashboard.
                                                </p>

                                                <div className="flex flex-col w-full gap-3">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 transition-all active:scale-95"
                                                    >
                                                        {isLoggingOut ? 'logout....' : 'Logout me'}
                                                    </button>
                                                    <button
                                                        onClick={() => setIsLogoutModalOpen(false)}
                                                        className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold transition-all"
                                                    >
                                                        Stay Logged In
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>


        </header>
    )
}