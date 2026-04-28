import { getDashboardStats } from "@/app/(admin)/admin/actions/dashboard";
import { Eye, Heart, Package, ShoppingCart, TrendingUp, ArrowUpRight } from "lucide-react";

export default async function DashboardStats() {
    const result = await getDashboardStats();

    if (!result.success || !result.stats) {
        return <div>Error loading stats</div>;
    }

    const { stats } = result;

    const cards = [
        {
            title: 'Total Products',
            value: stats.totalProducts,
            description: `Across ${stats.totalCategories} categories`,
            icon: Package,
            gradient: 'from-blue-500 via-blue-600 to-indigo-600',
            bgColor: 'bg-blue-500/10',
            lightBg: 'bg-blue-50',
            shadowColor: 'shadow-blue-500/20'
        },
        {
            title: 'Cart Items',
            value: stats.cartItems,
            description: `Active shopping carts`,
            icon: ShoppingCart,
            gradient: 'from-emerald-500 via-green-600 to-teal-600',
            bgColor: 'bg-emerald-500/10',
            lightBg: 'bg-emerald-50',
            shadowColor: 'shadow-emerald-500/20'
        },
        {
            title: 'Wishlist Items',
            value: stats.wishlistItems,
            description: `Products in wishlists`,
            icon: Heart,
            gradient: 'from-rose-500 via-pink-600 to-red-600',
            bgColor: 'bg-rose-500/10',
            lightBg: 'bg-rose-50',
            shadowColor: 'shadow-rose-500/20'
        },
        {
            title: 'Recent Views',
            value: stats.recentViews,
            description: `Product page visits`,
            icon: Eye,
            gradient: 'from-purple-500 via-violet-600 to-indigo-600',
            bgColor: 'bg-purple-500/10',
            lightBg: 'bg-purple-50',
            shadowColor: 'shadow-purple-500/20'
        }
    ];

    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className={`group relative bg-white rounded-2xl hover:shadow-xl ${card.shadowColor} transition-all duration-300 p-6 border border-gray-100 hover:border-transparent overflow-hidden hover:-translate-y-1`}
                    >
                        {/* Animated background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                        {/* Top section with icon */}
                        <div className="relative flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.lightBg} group-hover:scale-110 transition-transform duration-300`}>
                                <div className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center shadow-lg ${card.shadowColor}`}>
                                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Trending indicator */}
                            <div className={`px-2.5 py-1 rounded-full ${card.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-semibold text-green-600">+12%</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats section */}
                        <div className="relative">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                {card.title}
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-gray-900 tracking-tight">
                                    {card.value.toLocaleString()}
                                </p>
                                <ArrowUpRight className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <p className="mt-3 text-sm text-gray-600 font-medium">
                                {card.description}
                            </p>
                        </div>

                        {/* Decorative corner accent */}
                        <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
                    </div>
                );
            })}
        </div>
    );
}