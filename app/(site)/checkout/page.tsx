"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useDispatch } from "react-redux";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { getCart } from "@/lib/action/cart.action";
import { getAddresses } from "@/lib/action/address.action";
import { placeOrder, validateCouponCode } from "@/lib/action/v2-order.action";
import { toast } from "react-hot-toast";
import type { AppDispatch } from "@/redux/store";

interface CartProduct {
  id: number;
  title: string;
  price: number;
  discountedPrice?: number | null;
  images: string[];
}

interface CartItem {
  id: string;
  productId: number;
  quantity: number;
  product: CartProduct;
}

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  country: string;
  streetAddress: string;
  apartment?: string | null;
  city: string;
  state?: string | null;
  phone: string;
  email: string;
  isDefault: boolean;
}

const SHIPPING_OPTIONS = [
  { value: "FREE", label: "Free Shipping", desc: "5-7 business days", price: 0 },
  { value: "FEDEX", label: "FedEx Express", desc: "2-3 business days", price: 10.99 },
  { value: "DHL", label: "DHL Priority", desc: "1-2 business days", price: 12.5 },
] as const;

const PAYMENT_OPTIONS = [
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", desc: "Pay when your package arrives", icon: "payments" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", desc: "Transfer via bank to our account", icon: "account_balance" },
] as const;

function getItemPrice(product: CartProduct) {
  if (product.discountedPrice && product.discountedPrice > 0) {
    return product.price - (product.price * product.discountedPrice) / 100;
  }
  return product.price;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, isPending: sessionLoading } = useSession();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  // Form state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    firstName: "", lastName: "", company: "", country: "United States",
    streetAddress: "", apartment: "", city: "", state: "", phone: "", email: "",
  });

  const [shippingMethod, setShippingMethod] = useState<"FREE" | "FEDEX" | "DHL">("FREE");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "BANK_TRANSFER">("CASH_ON_DELIVERY");
  const [notes, setNotes] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Derived values
  const subtotal = cartItems.reduce((sum, item) => sum + getItemPrice(item.product) * item.quantity, 0);
  const shippingFee = SHIPPING_OPTIONS.find((o) => o.value === shippingMethod)?.price ?? 0;
  const discount = couponApplied?.discount ?? 0;
  const total = subtotal + shippingFee - discount;

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    const items = await getCart();
    setCartItems(items as CartItem[]);
    setCartLoading(false);
  }, []);

  const fetchAddresses = useCallback(async () => {
    if (!session?.user) return;
    const result = await getAddresses();
    if (result.success && result.addresses.length > 0) {
      setAddresses(result.addresses as Address[]);
      const def = result.addresses.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else setSelectedAddressId(result.addresses[0].id);
    } else {
      setShowNewForm(true);
    }
  }, [session?.user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);
  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  // Redirect non-logged users to login
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?redirect=/checkout");
    }
  }, [session, sessionLoading, router]);

  // Redirect if cart is empty after loading
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      router.push("/v2/shop");
    }
  }, [cartLoading, cartItems.length, router]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    const result = await validateCouponCode(couponInput.trim(), subtotal);
    if (result.valid) {
      setCouponApplied({ code: couponInput.trim().toUpperCase(), discount: result.discount });
      toast.success(result.message);
    } else {
      setCouponApplied(null);
      toast.error(result.message);
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponInput("");
  };

  const handlePlaceOrder = async () => {
    if (!session?.user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    // Validate address
    if (!showNewForm && !selectedAddressId && addresses.length > 0) {
      toast.error("Please select a delivery address");
      return;
    }

    if (showNewForm || addresses.length === 0) {
      if (!newAddress.firstName || !newAddress.lastName || !newAddress.streetAddress ||
        !newAddress.city || !newAddress.country || !newAddress.phone || !newAddress.email) {
        toast.error("Please fill in all required address fields");
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await placeOrder({
        addressId: (!showNewForm && selectedAddressId) ? selectedAddressId : undefined,
        addressData: (showNewForm || addresses.length === 0) ? {
          firstName: newAddress.firstName,
          lastName: newAddress.lastName,
          company: newAddress.company || undefined,
          country: newAddress.country,
          streetAddress: newAddress.streetAddress,
          apartment: newAddress.apartment || undefined,
          city: newAddress.city,
          state: newAddress.state || undefined,
          phone: newAddress.phone,
          email: newAddress.email,
        } : undefined,
        shippingMethod,
        paymentMethod,
        couponCode: couponApplied?.code,
        notes: notes || undefined,
      });

      if (result.success) {
        dispatch(removeAllItemsFromCart());
        toast.success("Order placed successfully!");
        router.push(`/v2/order-confirmation/${result.orderNumber}`);
      } else {
        toast.error(result.error ?? "Failed to place order");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading || cartLoading) {
    return (
      <main className="flex-1 max-w-300 mx-auto w-full px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-2xl w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-80 bg-gray-200 dark:bg-white/10 rounded-3xl" />
              <div className="h-48 bg-gray-200 dark:bg-white/10 rounded-3xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-96 bg-gray-200 dark:bg-white/10 rounded-3xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-300 mx-auto w-full px-6 py-10 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm font-bold text-[#648770] hover:text-primary transition-colors mb-4 w-fit">
          <Link href="/cart" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Cart
          </Link>
        </div>
        <h1 className="text-4xl font-black text-[#121714] dark:text-white mb-2">Checkout</h1>
        <p className="text-gray-500 dark:text-gray-400">Review your order and complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ── Left: Checkout Form ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Delivery Address */}
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-6 mb-8">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <h2 className="text-2xl font-black text-[#121714] dark:text-white">Delivery Address</h2>
            </div>

            {/* Saved addresses */}
            {addresses.length > 0 && (
              <div className="space-y-3 mb-6">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => { setSelectedAddressId(addr.id); setShowNewForm(false); }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedAddressId === addr.id && !showNewForm
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 dark:border-white/10 hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#121714] dark:text-white text-sm">
                          {addr.firstName} {addr.lastName}
                          {addr.isDefault && (
                            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black uppercase tracking-wide">Default</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{addr.streetAddress}{addr.apartment ? `, ${addr.apartment}` : ""}</p>
                        <p className="text-xs text-gray-500">{addr.city}{addr.state ? `, ${addr.state}` : ""}, {addr.country}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                      </div>
                      <div className={`size-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${selectedAddressId === addr.id && !showNewForm ? "border-primary" : "border-gray-300"
                        }`}>
                        {selectedAddressId === addr.id && !showNewForm && (
                          <div className="size-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => { setShowNewForm(true); setSelectedAddressId(null); }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${showNewForm
                    ? "border-primary bg-primary/5"
                    : "border-dashed border-gray-300 dark:border-white/20 hover:border-primary/50"
                    }`}
                >
                  <span className="material-symbols-outlined text-primary">add_circle</span>
                  <span className="font-bold text-sm text-[#121714] dark:text-white">Use a different address</span>
                </button>
              </div>
            )}

            {/* New address form */}
            {(showNewForm || addresses.length === 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { field: "firstName", label: "First Name *", placeholder: "Jane", col: 1 },
                  { field: "lastName", label: "Last Name *", placeholder: "Doe", col: 1 },
                  { field: "email", label: "Email *", placeholder: "jane@example.com", col: 2 },
                  { field: "phone", label: "Phone *", placeholder: "+1 (555) 000-0000", col: 2 },
                  { field: "streetAddress", label: "Street Address *", placeholder: "123 Main St", col: 2 },
                  { field: "apartment", label: "Apartment / Suite", placeholder: "Apt 4B (optional)", col: 2 },
                  { field: "city", label: "City *", placeholder: "New York", col: 1 },
                  { field: "state", label: "State / Province", placeholder: "NY (optional)", col: 1 },
                  { field: "country", label: "Country *", placeholder: "United States", col: 2 },
                  { field: "company", label: "Company", placeholder: "Company (optional)", col: 2 },
                ].map(({ field, label, placeholder, col }) => (
                  <div key={field} className={col === 2 ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={(newAddress as any)[field]}
                      onChange={(e) => setNewAddress((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full bg-[#f7f8f9] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-[#121714] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping Method */}
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-6 mb-8">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <h2 className="text-2xl font-black text-[#121714] dark:text-white">Shipping Method</h2>
            </div>

            <div className="space-y-3">
              {SHIPPING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setShippingMethod(option.value)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${shippingMethod === option.value
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 dark:border-white/10 hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${shippingMethod === option.value ? "border-primary" : "border-gray-300"
                      }`}>
                      {shippingMethod === option.value && <div className="size-2.5 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="font-black text-sm text-[#121714] dark:text-white">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                  </div>
                  <span className={`font-black text-sm ${option.price === 0 ? "text-green-500" : "text-[#121714] dark:text-white"}`}>
                    {option.price === 0 ? "FREE" : `Rs.${option.price.toFixed(2)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-6 mb-8">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">credit_card</span>
              </div>
              <h2 className="text-2xl font-black text-[#121714] dark:text-white">Payment Method</h2>
            </div>

            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentMethod(option.value)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${paymentMethod === option.value
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 dark:border-white/10 hover:border-primary/50"
                    }`}
                >
                  <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === option.value ? "border-primary" : "border-gray-300"
                    }`}>
                    {paymentMethod === option.value && <div className="size-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">{option.icon}</span>
                  </div>
                  <div>
                    <p className="font-black text-sm text-[#121714] dark:text-white">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {paymentMethod === "BANK_TRANSFER" && (
              <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/30">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  After placing your order, you will receive bank transfer details via email. Your order will be confirmed once payment is verified.
                </p>
              </div>
            )}
          </div>

          {/* Order Notes */}
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-8 md:p-10">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-6 mb-8">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">note</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-[#121714] dark:text-white">Order Notes</h2>
                <p className="text-xs text-gray-400 font-medium">Optional</p>
              </div>
            </div>
            <textarea
              placeholder="Add any special instructions or notes about your order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#f7f8f9] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-[#121714] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon */}
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-6">
            <h3 className="font-black text-[#121714] dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">local_offer</span>
              Promo Code
            </h3>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wide">{couponApplied.code}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">-Rs.{couponApplied.discount.toFixed(2)} discount</p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  className="flex-1 bg-[#f7f8f9] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-[#121714] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="bg-primary text-white text-sm font-black px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {couponLoading ? (
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  ) : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl p-6 sticky top-32">
            <h2 className="text-xl font-black text-[#121714] dark:text-white mb-6">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const finalPrice = getItemPrice(item.product);
                const hasDiscount = item.product.discountedPrice && item.product.discountedPrice > 0;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="size-16 rounded-xl overflow-hidden bg-[#f1f4f2] dark:bg-[#2a3a2f] shrink-0">
                      <img
                        src={item.product.images[0] || "/placeholder.jpg"}
                        alt={item.product.title}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-[#121714] dark:text-white line-clamp-2 leading-tight">{item.product.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-primary">Rs.{(finalPrice * item.quantity).toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through">Rs.{(item.product.price * item.quantity).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5 text-sm font-bold">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Subtotal ({cartItems.reduce((n, i) => n + i.quantity, 0)} items)</span>
                <span className="text-[#121714] dark:text-white">Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Shipping</span>
                <span className={shippingFee === 0 ? "text-green-500" : "text-[#121714] dark:text-white"}>
                  {shippingFee === 0 ? "FREE" : `Rs.${shippingFee.toFixed(2)}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount ({couponApplied?.code})</span>
                  <span>-Rs.{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5">
                <span className="text-lg font-black text-[#121714] dark:text-white">Total</span>
                <span className="text-2xl font-black text-primary">Rs.{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="mt-6 w-full bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                  Placing Order...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  Place Order — Rs.{total.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-4 font-medium">
              By placing your order you agree to our{" "}
              <Link href="/shop" className="text-primary hover:underline">Terms of Service</Link>
            </p>

            {/* Eco Banner */}
            <div className="mt-5 p-4 bg-green-50 dark:bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-lg">forest</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Planet Impact</span>
              </div>
              <p className="text-[10px] text-green-700 dark:text-green-500 leading-relaxed font-bold">
                2 TREES WILL BE PLANTED WITH THIS ORDER.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
