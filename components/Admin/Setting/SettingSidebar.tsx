'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const SettingSidebar = () => {
    const pathname = usePathname();
    const menuItems = [
        { id: 'general', label: 'General Setting', active: true, href: '/admin/setting/general' },
        { id: 'logo', label: 'Logo and Favicon', active: false, href: '/admin/setting/logo' },
        { id: 'contact-info', label: 'Contact Information', active: false, href: '/admin/setting/contact-info' },
        { id: 'social-info', label: 'Social Information', active: false, href: '/admin/setting/social-info' },
    ];
    return (
        <div className="md:w-96 w-full md:px-0 px-3 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                        <div key={item.id} className={`w-full px-6 py-4 text-left font-medium transition-colors ${isActive
                            ? 'bg-gradient-to-r bg-emerald-600 to-emerald-600 text-white'
                            : 'text-emerald-600 hover:bg-gray-50'
                            } ${index !== 0 ? 'border-t border-gray-200' : ''}`}>
                            <Link href={item.href}>
                                {item.label}
                            </Link>
                        </div>
                    );
                })
                }
            </div>
        </div>
    )
}

export default SettingSidebar