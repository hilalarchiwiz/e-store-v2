"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useAppSelector } from "@/redux/store";
import { getOrders } from "@/lib/action/v2-order.action";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  PROCESSING: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  CONFIRMED: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
  SHIPPED: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  DELIVERED: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  CANCELLED: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  RETURNED: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const wishlistCount = useAppSelector((state) => state.wishlistReducer.ids.length);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then((res) => {
      if (res.success) setOrders(res.orders);
      setLoading(false);
    });
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const pending = orders.filter((o) =>
    ["PENDING", "PROCESSING", "CONFIRMED"].includes(o.status)
  ).length;
  const recentOrders = orders.slice(0, 3);

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: "shopping_bag", color: "bg-blue-500" },
    { label: "Delivered", value: delivered, icon: "check_circle", color: "bg-green-500" },
    { label: "Pending", value: pending, icon: "pending", color: "bg-amber-500" },
    { label: "Wishlist", value: wishlistCount, icon: "favorite", color: "bg-red-500" },
  ];

  if (loading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-300">
        <div className="space-y-2">
          <div className="h-9 bg-gray-200 dark:bg-white/10 rounded-xl w-56 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-xl w-80 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1a251d] p-6 rounded-3xl border border-primary/5 shadow-xl animate-pulse">
              <div className="size-12 bg-gray-200 dark:bg-white/10 rounded-2xl mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-200 dark:bg-white/10 rounded w-12" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex gap-6">
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24 animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-20 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16 animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-black text-[#121714] dark:text-white mb-2">
          Hello, {firstName}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back to your eco-dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#1a251d] p-6 rounded-3xl border border-primary/5 shadow-xl group hover:border-primary/20 transition-all"
          >
            <div className={`size-12 ${stat.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black text-[#121714] dark:text-white">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#121714] dark:text-white">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
          >
            View All
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">receipt_long</span>
            </div>
            <p className="font-bold text-[#121714] dark:text-white mb-1">No orders yet</p>
            <p className="text-sm text-gray-500 mb-6">Start shopping to see your orders here.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary text-white font-black px-6 py-3 rounded-2xl hover:bg-primary/90 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f1f4f2] dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <th className="px-8 py-4">Order ID</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm font-bold">
                {recentOrders.map((order) => {
                  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  });
                  return (
                    <tr key={order.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6 text-[#121714] dark:text-white font-black">
                        <Link
                          href={`/dashboard/orders/${order.orderNumber}`}
                          className="hover:text-primary transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-8 py-6 text-gray-500 font-medium">{date}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-primary font-black">
                        Rs.{Number(order.total).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Manage Addresses", icon: "location_on", href: "/v2/dashboard/addresses", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Account Settings", icon: "person", href: "/v2/dashboard/profile", color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
          { label: "Security", icon: "security", href: "/v2/dashboard/security", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white dark:bg-[#1a251d] p-5 rounded-2xl border border-primary/5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all flex items-center gap-4 group"
          >
            <div className={`size-11 rounded-xl flex items-center justify-center ${item.color} shrink-0`}>
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </div>
            <span className="font-black text-sm text-[#121714] dark:text-white group-hover:text-primary transition-colors">
              {item.label}
            </span>
            <span className="material-symbols-outlined text-gray-300 ml-auto group-hover:text-primary transition-colors text-base">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
