import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/action/v2-order.action";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  CONFIRMED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
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

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const { success, order } = await getOrderByNumber(orderNumber);

  if (!success || !order) notFound();

  const addr = order.billingAddress;
  const createdAt = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main className="flex-1 max-w-400 mx-auto w-full px-6 md:px-10 py-10 md:py-16">
      {/* Success Banner */}
      <div className="bg-gradient-to-br from-primary/10 to-green-500/10 border border-primary/20 rounded-3xl p-8 md:p-12 mb-10 text-center">
        <div className="size-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined text-white text-4xl">check_circle</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground dark:text-foreground mb-3">
          Order Confirmed!
        </h1>
        <p className="text-muted dark:text-muted mb-4 font-medium">
          Thank you for your purchase. Your order has been received.
        </p>
        <div className="inline-flex items-center gap-2 bg-surface dark:bg-surface border border-primary/20 px-6 py-3 rounded-2xl">
          <span className="text-xs font-black uppercase tracking-widest text-muted">Order Number</span>
          <span className="text-primary font-black text-lg">{order.orderNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Items */}
        <div className="lg:col-span-8 space-y-8">
          {/* Order Items */}
          <div className="bg-surface dark:bg-surface rounded-3xl border border-primary/5 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-outline dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground dark:text-foreground">
                Order Items ({order.orderItems.length})
              </h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING}`}>
                {order.status}
              </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {order.orderItems.map((item: any) => (
                <div key={item.id} className="p-6 flex items-center gap-5">
                  <div className="size-20 rounded-2xl overflow-hidden bg-icon-surface dark:bg-icon-surface shrink-0">
                    <img
                      src={item.product.images?.[0] ?? "/placeholder.jpg"}
                      alt={item.product.title}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="font-black text-sm text-foreground dark:text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-muted mt-1">Qty: {item.quantity}</p>
                    <p className="text-xs text-muted">Unit price: Rs.{Number(item.price).toLocaleString()}</p>
                  </div>
                  <p className="font-black text-foreground dark:text-foreground">
                    Rs.{Number(item.subtotal).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-surface dark:bg-surface rounded-3xl border border-primary/5 shadow-xl p-8">
            <h2 className="text-xl font-black text-foreground dark:text-foreground mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Delivery Address
            </h2>
            <div className="text-sm font-medium text-muted dark:text-muted space-y-1">
              <p className="font-black text-foreground dark:text-foreground">{addr.firstName} {addr.lastName}</p>
              {addr.company && <p>{addr.company}</p>}
              <p>{addr.streetAddress}{addr.apartment ? `, ${addr.apartment}` : ""}</p>
              <p>{addr.city}{addr.state ? `, ${addr.state}` : ""}</p>
              <p>{addr.country}</p>
              <p className="mt-2 text-muted">{addr.phone}</p>
              <p className="text-muted">{addr.email}</p>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Info */}
          <div className="bg-surface dark:bg-surface rounded-3xl border border-primary/5 shadow-xl p-6 space-y-5">
            <h2 className="text-xl font-black text-foreground dark:text-foreground">Order Details</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted font-medium">Order Date</span>
                <span className="font-black text-foreground dark:text-foreground">{createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-medium">Payment</span>
                <span className="font-black text-foreground dark:text-foreground">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-medium">Shipping</span>
                <span className="font-black text-foreground dark:text-foreground">{SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod}</span>
              </div>
              {order.notes && (
                <div>
                  <span className="text-muted font-medium block mb-1">Notes</span>
                  <p className="text-xs text-muted dark:text-muted bg-surface dark:bg-white/5 rounded-xl p-3">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-surface dark:bg-surface rounded-3xl border border-primary/5 shadow-xl p-6">
            <h2 className="text-xl font-black text-foreground dark:text-foreground mb-5">Cost Summary</h2>
            <div className="space-y-3 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-foreground dark:text-foreground">Rs.{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className={order.shippingFee === 0 ? "text-green-500" : "text-foreground dark:text-foreground"}>
                  {order.shippingFee === 0 ? "FREE" : `Rs.${Number(order.shippingFee).toLocaleString()}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-Rs.{Number(order.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-4 border-t border-outline dark:border-white/5 flex justify-between items-center">
                <span className="text-lg font-black text-foreground dark:text-foreground">Total</span>
                <span className="text-2xl font-black text-primary">Rs.{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/dashboard/orders"
              className="w-full bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">receipt_long</span>
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="w-full bg-surface dark:bg-surface text-foreground dark:text-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface dark:hover:bg-white/5 transition-all border border-outline dark:border-white/10"
            >
              <span className="material-symbols-outlined text-xl">storefront</span>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
