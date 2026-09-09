"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then((res) => {
      if (res.success) setOrders(res.orders);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div>
          <div className="h-8 bg-surface dark:bg-white/10 rounded-xl w-40 mb-3 animate-pulse" />
          <div className="h-4 bg-surface dark:bg-white/10 rounded-xl w-72 animate-pulse" />
        </div>
        <div className="bg-surface dark:bg-surface rounded-3xl border border-primary/5 shadow-xl overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-8 py-6 border-b border-outline dark:border-white/5 flex items-center gap-6">
              <div className="h-4 bg-surface dark:bg-white/10 rounded-lg w-28 animate-pulse" />
              <div className="h-4 bg-surface dark:bg-white/10 rounded-lg w-24 animate-pulse" />
              <div className="h-4 bg-surface dark:bg-white/10 rounded-lg w-16 animate-pulse" />
              <div className="h-6 bg-surface dark:bg-white/10 rounded-full w-20 animate-pulse" />
              <div className="h-4 bg-surface dark:bg-white/10 rounded-lg w-16 animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
          <h1 className="text-3xl font-black text-foreground dark:text-foreground mb-2">My Orders</h1>
          <p className="text-muted dark:text-muted">Manage your past and current orders effortlessly.</p>
        </div>
        <div className="bg-surface dark:bg-surface rounded-3xl border border-primary/5 shadow-xl p-16 text-center">
          <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">receipt_long</span>
          </div>
          <h3 className="text-xl font-black text-foreground dark:text-foreground mb-2">No orders yet</h3>
          <p className="text-muted text-sm mb-8">Start shopping to see your orders here.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-primary text-white font-black px-8 py-3 rounded-2xl hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-xl">storefront</span>
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-foreground dark:text-foreground mb-2">My Orders</h1>
        <p className="text-muted dark:text-muted">
          {orders.length} order{orders.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="bg-surface dark:bg-surface rounded-3xl border border-primary/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[650px] sm:min-w-0">
            <thead>
              <tr className="bg-surface dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                <th className="px-4 sm:px-8 py-3.5 sm:py-4 whitespace-nowrap">Order ID</th>
                <th className="px-4 sm:px-8 py-3.5 sm:py-4 whitespace-nowrap">Date</th>
                <th className="px-4 sm:px-8 py-3.5 sm:py-4 whitespace-nowrap">Items</th>
                <th className="px-4 sm:px-8 py-3.5 sm:py-4 whitespace-nowrap">Status</th>
                <th className="px-4 sm:px-8 py-3.5 sm:py-4 whitespace-nowrap">Total</th>
                <th className="px-4 sm:px-8 py-3.5 sm:py-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm font-bold">
              {orders.map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                });
                const totalItems = order.orderItems.reduce((n: number, i: any) => n + i.quantity, 0);
                return (
                  <tr key={order.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-foreground dark:text-foreground font-black whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-muted font-medium whitespace-nowrap">{date}</td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-muted font-medium whitespace-nowrap">
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black whitespace-nowrap ${STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-primary font-black whitespace-nowrap">Rs. {Number(order.total).toLocaleString()}</td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/orders/${order.orderNumber}`}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-muted hover:text-primary transition-colors bg-surface dark:bg-white/5 hover:bg-primary/10 px-3 py-2 rounded-xl"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
