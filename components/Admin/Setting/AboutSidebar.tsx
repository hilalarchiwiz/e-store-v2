'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const AboutSidebar = () => {
    const pathname = usePathname();
    const menuItems = [
        { id: 'About Banner', label: 'About Banner', active: true, href: '/admin/about/about-banner' },
        { id: 'logo', label: 'Who we are', active: false, href: '/admin/about/who-we-are' },
        { id: 'contact-info', label: 'What we do', active: false, href: '/admin/about/what-we-do' },
        { id: 'social-info', label: 'Mission Vision', active: false, href: '/admin/about/mission-vision' },
        { id: 'why-choose', label: 'Why Choose', active: false, href: '/admin/about/why-choose' },
        { id: 'team', label: 'Team', active: false, href: '/admin/about/team' },
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

export default AboutSidebar