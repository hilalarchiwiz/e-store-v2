import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Props = {
    title: string;
    breadcrumbs?: { label: string; href?: string }[];
}

const Title = ({ title, breadcrumbs }: Props) => {
    return (
        <div className="px-4">
            <div className="flex items-center justify-between">
                {/* Left Side - Title */}
                <h1 className="text-2xl font-medium text-gray-700">{title}</h1>

                {/* Right Side - Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="hover:text-purple-600 transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-800 font-medium">{crumb.label}</span>
                                )}
                                {index < breadcrumbs.length - 1 && (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Title;