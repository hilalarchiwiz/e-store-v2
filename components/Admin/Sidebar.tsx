'use client'
import { signOut } from '@/lib/auth-client';
import { logoutUser } from '@/redux/features/user-slice';
import {
    Home,
    Layers,
    Bookmark,
    ShoppingBag,
    Image as ImageIcon,
    Monitor,
    FileEdit,
    Ticket,
    Truck,
    MessageSquare,
    Files,
    Info,
    Mail,
    Contact,
    Package,
    ChevronLeft,
    Settings,
    LogOut,
    AlertTriangle,
    Menu,
    User,
    Logs
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/admin', permission: 'yes' },
    {
        icon: Home,
        label: 'Role',
        href: '/admin/role',
        permission: 'role_view'
    },
    {
        icon: User,
        label: 'User',
        href: '/admin/users',
        permission: 'user_view'
    },
    { icon: Layers, label: 'Categories', href: '/admin/category', permission: 'category_view' },
    { icon: Layers, label: 'Sub-Categories', href: '/admin/subcategory', permission: 'category_view' },
    { icon: Bookmark, label: 'Brands', href: '/admin/brand', permission: 'brand_view' },      // Bookmark for brand identity
    { icon: ShoppingBag, label: 'Products', href: '/admin/products', permission: 'product_view' }, // ShoppingBag is better for retail
    { icon: ImageIcon, label: 'Sliders', href: '/admin/slider', permission: 'slider_view' },   // ImageIcon for visual slides
    { icon: Monitor, label: 'Banner', href: '/admin/banner', permission: 'banner_view' },      // Monitor for display banners
    { icon: FileEdit, label: 'Blog', href: '/admin/blog', permission: 'blog_view' },         // FileEdit for writing articles
    { icon: Ticket, label: 'Coupons', href: '/admin/coupon', permission: 'coupon_view' },
    { icon: Truck, label: 'Orders', href: '/admin/orders', permission: 'order_view' },
    { icon: MessageSquare, label: 'FAQs', href: '/admin/faq', permission: 'faq_view' },      // MessageSquare for Q&A
    { icon: Files, label: 'Pages', href: '/admin/page', permission: 'page_view' },            // Files for multiple static pages
    { icon: Info, label: 'About Page', href: '/admin/about/about-banner', permission: 'about_view' }, // Info for "About Us"
    { icon: Mail, label: 'Subscribe', href: '/admin/subscribe', permission: 'subscriber_view' },
    { icon: Contact, label: 'Contact', href: '/admin/contact', permission: 'contact_view' },
];

export default function Sidebar({ permissions }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const visibleMenuItems = menuItems.filter(item => {
        if (item.permission === 'yes') return true;
        return Array.isArray(permissions) && permissions.includes(item.permission);
    });
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

    const isSettingActive = pathname === '/admin'
        ? pathname === '/admin'
        : pathname === '/admin/setting' || pathname.startsWith(`/admin/setting/`) ? 'bg-gradient-to-r bg-emerald-500 text-white' : 'text-white hover:bg-slate-800/50 hover:text-white';
    const isLogsActive = pathname === '/admin'
        ? pathname === '/admin'
        : pathname === '/admin/logs/' || pathname.startsWith(`/admin/logs/`) ? 'bg-gradient-to-r bg-emerald-500 text-white' : 'text-white hover:bg-slate-800/50 hover:text-white';
    return (
        <>
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav className={`
                fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 
                transition-all duration-300 ease-in-out shadow-2xl
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                w-72
            `}>
                {/* Header with gradient accent */}
                <div className="relative pt-8 pb-6 px-6 border-b border-slate-700/50 bg-gradient-to-r from-emerald-600/10 to-teal-600/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">QAAM</h1>
                                <p className="text-xs text-slate-400">Online store</p>
                            </div>
                        </div>

                        {/* Close button for mobile */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar h-[calc(100vh-220px)] no-scrollbar">
                    <div className="mb-3 px-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</p>
                    </div>
                    <ul className="space-y-1">
                        {visibleMenuItems.map((item, index) => {
                            // 1. Calculate a boolean: Is this specific item active?
                            const isActive = item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);

                            return (
                                <li key={index}>
                                    <Link
                                        href={item.href}
                                        className={`
                        group w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium
                        transition-all duration-200 ease-in-out relative overflow-hidden
                        ${isActive
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                                                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}
                    `}
                                    >
                                        <item.icon className={`
                        w-5 h-5 mr-3 relative z-10 transition-transform duration-200
                        ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                    `} />
                                        <span className="relative z-10">{item.label}</span>

                                        {isActive && (
                                            <span className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Bottom section with settings and Logout Trigger */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-2.75 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
                    <Link href={'/admin/setting/general'} className={`group w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-2 ${isSettingActive}`}>
                        <Settings className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Settings</span>
                    </Link>
                    {/* <Link href={'/admin/logs'} className={`group w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-2 ${isLogsActive}`}>
                        <Logs className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Activity Logs</span>
                    </Link> */}

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="group w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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

            {/* Mobile Menu Button - Enhanced */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-6 left-4 z-50 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
                <Menu className="w-6 h-6 text-white" />
            </button>
        </>
    );
}