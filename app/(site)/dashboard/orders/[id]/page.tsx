"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrderByNumber } from "@/lib/action/v2-order.action";

const STATUS_STEPS: Record<string, number> = {
  PENDING: 1,
  PROCESSING: 2,
  CONFIRMED: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 0,
  RETURNED: 0,
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  PROCESSING: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  CONFIRMED: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
  SHIPPED: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  DELIVERED: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  CANCELLED: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  RETURNED: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Cash on Delivery",
  BANK_TRANSFER: "Bank Transfer",
  PAYPAL: "PayPal",
  CREDIT_CARD: "Credit Card",
};

const SHIPPING_LABELS: Record<string, string> = {
  FREE: "Free Shipping",
  FEDEX: "FedEx Express",
  DHL: "DHL Priority",
};

const TRACK_STEPS = [
  { label: "Order Placed", icon: "description" },
  { label: "Processing", icon: "settings" },
  { label: "Shipped", icon: "local_shipping" },
  { label: "Delivered", icon: "check_circle" },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getOrderByNumber(orderId).then((res) => {
      if (res.success && res.order) setOrder(res.order);
      else setNotFound(true);
      setLoading(false);
    });
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-48 animate-pulse" />
        <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-3xl animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-48 bg-gray-200 dark:bg-white/10 rounded-3xl animate-pulse" />
            <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 text-center py-20">
        <div className="size-20 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
        </div>
        <h2 className="text-2xl font-black text-[#121714] dark:text-white">Order not found</h2>
        <p className="text-gray-500">This order doesn't exist or you don't have permission to view it.</p>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 bg-primary text-white font-black px-6 py-3 rounded-2xl hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusStep = STATUS_STEPS[order.status] ?? 1;
  const isCancelled = order.status === "CANCELLED" || order.status === "RETURNED";
  const createdAt = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const addr = order.billingAddress;
  const totalItems = order.orderItems.reduce((n: number, i: any) => n + i.quantity, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-2 text-sm font-bold text-[#648770] hover:text-primary transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Orders
          </Link>
          <h1 className="text-3xl font-black text-[#121714] dark:text-white mb-2 underline decoration-primary/30 decoration-4">
            {order.orderNumber}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Placed on {createdAt} · {totalItems} item{totalItems !== 1 ? "s" : ""}</p>
        </div>
        <span className={`self-start md:self-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING}`}>
          {order.status}
        </span>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10">
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
            <div className="absolute top-[25%] left-0 w-full h-1 bg-gray-100 dark:bg-white/5 -translate-y-1/2 hidden md:block" />
            {TRACK_STEPS.map((step, index) => {
              const isCompleted = index + 1 <= statusStep;
              const isCurrent = index + 1 === statusStep;
              return (
                <div key={step.label} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-4 flex-1">
                  <div className={`size-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isCompleted ? "bg-primary text-white scale-110" : "bg-[#f1f4f2] dark:bg-white/5 text-gray-400"
                    }`}>
                    <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                  </div>
                  <div className="text-left md:text-center">
                    <p className={`text-xs font-black uppercase tracking-widest ${isCompleted ? "text-primary" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-[10px] text-gray-500 font-bold mt-1">In progress</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Order Items */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-xl font-black text-[#121714] dark:text-white">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {order.orderItems.map((item: any) => (
                <div key={item.id} className="p-8 flex items-center gap-6 group">
                  <div className="size-24 rounded-2xl overflow-hidden bg-[#f1f4f2] dark:bg-[#2a3a2f] shrink-0 border border-gray-100 dark:border-white/5">
                    <img
                      src={item.product.images?.[0] ?? "/placeholder.jpg"}
                      alt={item.product.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/v2/product/${item.product.id}`}
                      className="text-base font-black text-[#121714] dark:text-white group-hover:text-primary transition-colors"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-sm font-bold text-gray-400 mt-1">Qty: {item.quantity}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-black text-primary">Rs.{Number(item.price).toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">per unit</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-[#121714] dark:text-white">
                      Rs.{Number(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Address & Payment */}
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 space-y-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                Delivery Address
              </h3>
              <div className="space-y-1 text-sm font-bold text-[#121714] dark:text-white">
                <p>{addr.firstName} {addr.lastName}</p>
                {addr.company && <p className="text-gray-500 font-medium">{addr.company}</p>}
                <p className="text-gray-500 font-medium">{addr.streetAddress}{addr.apartment ? `, ${addr.apartment}` : ""}</p>
                <p className="text-gray-500 font-medium">{addr.city}{addr.state ? `, ${addr.state}` : ""}</p>
                <p className="text-gray-500 font-medium">{addr.country}</p>
                <p className="text-gray-500 font-medium mt-2">{addr.phone}</p>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-100 dark:border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Payment & Shipping</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-[#121714] dark:text-white">
                  <span className="material-symbols-outlined text-primary text-lg">payments</span>
                  <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-[#121714] dark:text-white">
                  <span className="material-symbols-outlined text-primary text-lg">local_shipping</span>
                  <span>{SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Total Summary</h3>
            <div className="space-y-4 font-bold text-sm mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-[#121714] dark:text-white">Rs.{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Shipping</span>
                <span className={order.shippingFee === 0 ? "text-green-500" : "text-[#121714] dark:text-white"}>
                  {order.shippingFee === 0 ? "FREE" : `Rs.${Number(order.shippingFee).toFixed(2)}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-Rs.{Number(order.discount).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
              <span className="text-lg font-black text-[#121714] dark:text-white">Total Amount</span>
              <span className="text-2xl font-black text-primary">Rs.{Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Order Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
