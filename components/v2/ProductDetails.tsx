"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/v2/Button";
import ProductCard from "@/components/v2/ProductCard";
import ReviewForm from "@/components/v2/ReviewForm";
import { addToCart } from "@/lib/action/cart.action";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "react-hot-toast";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number | null;
  warranty?: string | null;
  images: string[];
  specifications: any;
  rating: number;
  reviews: number;
  reviewsList?: any[];
  category?: { id?: number | null; title: string } | null;
}

interface ProductDetailsProps {
  product: Product;
  relatedProducts: any[];
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, relatedProducts }) => {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(product.images[0] || "/images/placeholder-product.jpg");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewsList, setReviewsList] = useState<any[]>(product.reviewsList || []);
  const [cartLoading, setCartLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const inWishlist = isInWishlist(product.id);
  // discountedPrice in DB is a percentage (e.g. 20 = 20% off)
  const discountPercent = product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : null;
  const displayPrice = discountPercent ? product.price - (product.price * discountPercent) / 100 : product.price;
  const hasDiscount = !!discountPercent;

  const handleAddToCart = async () => {
    setCartLoading(true);
    const result = await addToCart(product.id, quantity);
    setCartLoading(false);
    if (result.success) {
      toast.success("Added to cart!");
    } else {
      toast.error(result.error ?? "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    setBuyLoading(true);
    const result = await addToCart(product.id, quantity);
    setBuyLoading(false);
    if (result.success) {
      router.push("/v2/checkout");
    } else if (result.error?.toLowerCase().includes("maximum")) {
      // Item is already in cart at max stock — navigate to checkout anyway
      router.push("/v2/checkout");
    } else {
      toast.error(result.error ?? "Failed to add to cart");
    }
  };

  const handleWhatsApp = () => {
    if (!WHATSAPP_NUMBER) {
      toast.error("WhatsApp not configured");
      return;
    }
    const msg = encodeURIComponent(
      `Hi! I'm interested in: *${product.title}*\nPrice: PKR ${Number(displayPrice).toLocaleString()}\n\nPlease provide more details.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div
            className="relative aspect-square bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-4xl overflow-hidden border border-gray-100 dark:border-white/5 select-none"
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onMouseMove={handleMouseMove}
            style={{ cursor: zoomed ? "zoom-in" : "default" }}
          >
            <img
              src={selectedImage}
              alt={product.title}
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain p-8 transition-transform duration-150 ease-out"
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: zoomed ? "scale(2.4)" : "scale(1)",
              }}
            />
            {!zoomed && (
              <div className="absolute bottom-4 right-4 bg-black/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                Hover to zoom
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`size-24 rounded-xl border-2 shrink-0 overflow-hidden p-2 transition-all ${selectedImage === img ? "border-primary bg-primary/5" : "border-transparent bg-[#f1f4f2] dark:bg-[#2a3a2f]"}`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-5">
          {/* Category badge */}
          {product.category && (
            <Link
              href={`/v2/shop?category=${product.category.id ?? ""}`}
              className="inline-flex w-fit items-center gap-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">category</span>
              {product.category.title}
            </Link>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`material-symbols-outlined text-xl ${i < Math.floor(product.rating || 0) ? "fill-1" : ""}`}>
                {i < Math.floor(product.rating || 0) ? "star" : "star_border"}
              </span>
            ))}
            <span className="text-sm text-gray-500 font-medium ml-2">({product.reviews || 0} reviews)</span>
          </div>

          <h1 className="text-4xl font-black text-[#121714] dark:text-white leading-tight">{product.title}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold text-primary">
              PKR {Number(displayPrice).toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-400 line-through font-medium">
                  PKR {Number(product.price).toLocaleString()}
                </span>
                <span className="text-xs font-black bg-red-100 text-red-500 px-2 py-1 rounded-full">
                  {Math.round(discountPercent ?? 0)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            {product.description.substring(0, 200)}...
          </p>

          {/* Warranty */}
          {product.warranty && (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-amber-500">verified</span>
              <div>
                <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-0.5">Warranty</p>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{product.warranty}</p>
              </div>
            </div>
          )}

          <div className="h-px bg-gray-100 dark:bg-white/10 w-full"></div>

          {/* Qty + Add to Cart + Wishlist */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 bg-white dark:bg-black/20 shrink-0">
              <button onClick={() => setQuantity((p) => Math.max(1, p - 1))} className="size-9 flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="w-10 text-center font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity((p) => p + 1)} className="size-9 flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <Button fullWidth icon="shopping_cart" className="flex-1 rounded-xl" onClick={handleAddToCart} isLoading={cartLoading}>
              Add to Cart
            </Button>
            <button
              onClick={() => toggleWishlist(product.id)}
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className={`size-12 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all ${inWishlist ? "border-red-400 bg-red-50 dark:bg-red-500/10 text-red-500" : "border-gray-200 dark:border-white/10 text-gray-400 hover:border-red-300 hover:text-red-500"}`}
            >
              <span className={`material-symbols-outlined ${inWishlist ? "fill-1" : ""}`}>favorite</span>
            </button>
          </div>

          {/* Buy Now */}
          <Button fullWidth icon="bolt" variant="secondary" className="rounded-xl" onClick={handleBuyNow} isLoading={buyLoading}>
            Buy Now
          </Button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all"
          >
            <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Order on WhatsApp
          </button>

          {/* Trust badges */}
          <div className="flex flex-col gap-2 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              </div>
              <span>Free Shipping on orders over PKR 5,000</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
              </div>
              <span>Secure Payment &amp; 30 Days Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-col gap-8">
        <div className="flex border-b border-gray-100 dark:border-white/10 overflow-x-auto no-scrollbar">
          {["description", "specifications", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 font-bold text-sm uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-[#121714] dark:hover:text-white"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="py-6 animate-in fade-in duration-500">
          {activeTab === "description" && (
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
              {product.description}
            </div>
          )}
          {activeTab === "specifications" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between p-4 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-xl">
                  <span className="font-bold text-[#121714] dark:text-white capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>
                </div>
              ))}
              {!product.specifications && <p>No specifications available.</p>}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="flex flex-col gap-8">
              {!showReviewForm ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{reviewsList.length} Reviews</h3>
                    <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
                  </div>
                  {reviewsList.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {reviewsList.map((review: any) => (
                        <div key={review.id} className="bg-[#f1f4f2] dark:bg-[#2a3a2f] p-6 rounded-2xl flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-[#121714] dark:text-white">{review.name || "Anonymous"}</span>
                              <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? "fill-1" : ""}`}>
                                  {i < review.rating ? "star" : "star_border"}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                      <div className="size-20 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl">rate_review</span>
                      </div>
                      <h3 className="text-xl font-bold">No Reviews Yet</h3>
                      <p className="text-gray-500">Be the first to review this product!</p>
                      <Button variant="outline" onClick={() => setShowReviewForm(true)}>Write a Review</Button>
                    </div>
                  )}
                </>
              ) : (
                <ReviewForm
                  productId={product.id}
                  onSuccess={(newReview) => {
                    setReviewsList((prev) => [newReview, ...prev]);
                    setShowReviewForm(false);
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="flex flex-col gap-8 border-t border-gray-100 dark:border-white/10 pt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-[#121714] dark:text-white">Related Products</h2>
            <Link href="/shop" className="text-primary font-bold text-sm hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, idx) => (
              <ProductCard
                key={idx}
                id={p.id}
                name={p.title}
                price={p.price}
                image={p.images[0] || "/images/placeholder-product.jpg"}
                images={p.images.length > 0 ? p.images : ["/images/placeholder-product.jpg"]}
                description={p.description}
                category={p.category?.title || "Uncategorized"}
                rating={5}
                reviews={12}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
