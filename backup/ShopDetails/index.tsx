"use client";
import { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";
import { v4 as uuidv4 } from "uuid"
import SubmitReview from "./SubmitReview";
import ImageMagnifier from "./ImageMagnifier";
import { ShoppingCart, Check, CheckCheckIcon, CheckCircle, Heart, Share2, Star, StarIcon, XCircle } from "lucide-react";
import { discountPrice } from "@/lib/helper";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { addOrUpdateCartItem, addProductToWishlist } from "@/lib/action/home.action";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
const ShopDetails = ({ product, products, session, reviews }) => {

  const dispatch = useDispatch();
  const router = useRouter();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const userInfo = useAppSelector((state) => state.userReducer)
  const user = userInfo?.info;
  const [activeTab, setActiveTab] = useState("tabOne");
  const tabs = [
    {
      id: "tabOne",
      title: "Description",
    },
    {
      id: "tabTwo",
      title: "Additional Information",
    },
    {
      id: "tabThree",
      title: "Reviews",
    },
  ];
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = reviews.length > 0 ? Math.round(totalRating / reviews.length) : 0;

  const handleAddToCart = async () => {
    if (quantity < product.quantity) {
      const result = await addOrUpdateCartItem(product.id, 1, user?.id);
      if (result.success) {
        dispatch(
          addItemToCart({
            title: product.title,
            discountedPrice: product.discountedPrice,
            price: product.price,
            images: product.images,
            id: product.id,
            quantity: 1,
          })
        );
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      toast.error(`Only ${product.quantity} items in stock`);
    }

  };

  const handleItemToWishList = async () => {
    const result = await addProductToWishlist(product.id, user?.id);

    if (result.success) {
      dispatch(
        addItemToWishlist({
          title: product.title,
          discountedPrice: product.discountedPrice,
          price: product.price,
          images: product.images,
          quantity: product.quantity,
          id: product.id
        })
      );
      toast.success(result.message);
    }
    else {
      toast.error(result.message);
    }
  };

  const handleIncrement = () => {
    if (quantity < product.quantity) {
      setQuantity(prev => prev + 1);
    } else {
      toast.error(`Only ${product.quantity} items in stock`);
    }
  };
  const handleDirectPurchase = () => {
    const url = `/checkout?direct=true&pid=${product.id}&qty=${quantity}`;
    router.push(url);
  };
  const Star1 = ({ isActive }: { isActive: boolean }) => (
    <span className={isActive ? "text-[#FBB040]" : "text-gray-300"}>
      <svg
        className="fill-current"
        width="15"
        height="16"
        viewBox="0 0 15 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z" />
      </svg>
    </span>
  );
  const fontUrl = `https://fonts.googleapis.com/css2?family=${product.titleFont?.replace(/\s+/g, "+")}&display=swap`;
  return (
    <>
      <Breadcrumb
        title={''}
        pages={[
          { label: "Shop", href: "/shop" },
          ...(product?.category
            ? [{ label: product.category.title, href: `/shop?category=${product.category.id}` }]
            : []),
          ...(product?.subCategory
            ? [{ label: product.subCategory.title, href: `/shop?category=${product.categoryId}&subcategory=${product.subCategoryId}` }]
            : []),
          { label: product?.title || "Product" },
        ]}
      />

      <link rel="stylesheet" href={fontUrl} />
      {/* Product Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div>
              <ImageMagnifier src={product.images?.[previewImg]} alt="product" />

              <div className="grid grid-cols-4 gap-3">
                {product.images?.map((item, key) => (
                  <button
                    onClick={() => setPreviewImg(key)}
                    key={key}
                    className={`bg-slate-50 rounded-xl p-3 border-2 transition-all duration-200 hover:border-dark ${key === previewImg ? "border-blue-dark bg-blue-50" : "border-slate-200"
                      }`}
                  >
                    <img src={item} alt="thumbnail" className="w-full h-auto object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Category / SubCategory tags */}
              {(product?.category || product?.subCategory) && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {product?.category && (
                    <a
                      href={`/shop?category=${product.category.id}`}
                      className="text-xs font-medium text-blue bg-blue/10 hover:bg-blue/20 px-3 py-1 rounded-full transition-colors"
                    >
                      {product.category.title}
                    </a>
                  )}
                  {product?.subCategory && (
                    <>
                      <span className="text-slate-300 text-xs">/</span>
                      <a
                        href={`/shop?category=${product.categoryId}&subcategory=${product.subCategoryId}`}
                        className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors"
                      >
                        {product.subCategory.title}
                      </a>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight" style={{ fontFamily: product.titleFont }}>
                  {product.title}
                </h1>
                {product.discountedPrice ? (
                  <span className="flex-shrink-0 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-sm px-4 py-2 rounded-full">
                    {product.discountedPrice}% OFF
                  </span>
                ) : null}
              </div>

              {/* Rating & Stock */}
              <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= averageRating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 font-medium">
                    ({reviews.length} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {product.quantity > 0 ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold text-sm">In Stock</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  Price
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-dark bg-clip-text ">
                    Rs. {discountPrice({ price: product.price, discount: product.discountedPrice }).toLocaleString()}
                  </span>
                  {product.discountedPrice ? (
                    <span className="text-2xl text-slate-400 line-through">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-900 mb-3 block">Quantity</label>
                <div className="inline-flex items-center bg-slate-100 rounded-xl border-2 border-slate-200">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-12 h-12 flex items-center justify-center text-slate-700 hover:bg-slate-200 rounded-l-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" />
                    </svg>
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center font-bold text-slate-900 border-x-2 border-slate-200">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="w-12 h-12 flex items-center justify-center text-slate-700 hover:bg-slate-200 rounded-r-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" />
                      <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleDirectPurchase}
                  disabled={product.quantity <= 0}
                  className={`w-full bg-blue-dark text-white font-bold text-lg py-4 px-8 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${product.quantity <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-dark"
                    }`}
                >
                  {product.quantity > 0 ? "Purchase Now" : "Out of Stock"}
                </button>

                <div className="flex gap-3">
                  <button onClick={handleItemToWishList} className="flex-1 flex cursor-pointer items-center justify-center gap-2 bg-slate-100 border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all group">
                    <Heart className="w-5 h-5 group-hover:fill-current" />
                    <span>Wishlist</span>
                  </button>
                  <a
                    href={`https://wa.me/923379727476?text=${encodeURIComponent(`Hi, I'm interested in this product:\n*${product.title}*\nPrice: Rs. ${discountPrice({ price: product.price, discount: product.discountedPrice }).toLocaleString()}\nLink: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-14 h-14 bg-slate-100 border-2 border-slate-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all group"
                    aria-label="Chat on WhatsApp"
                  >
                    <svg className="w-6 h-6 fill-slate-700 group-hover:fill-green-600" viewBox="0 0 32 32">
                      <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z" />
                    </svg>
                  </a>
                  <button onClick={handleAddToCart} className="flex cursor-pointer items-center justify-center w-14 h-14 bg-slate-100 border-2 border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group">
                    <ShoppingCart className="w-5 h-5 cursor-pointer text-slate-700 group-hover:text-blue-600" />
                  </button>
                </div>
              </div>

              {/* Meta Info */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Warranty:</span>
                    <span className="ml-2 text-slate-900 font-semibold">{product.warranty} Days</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Category:</span>
                    <span className="ml-2 text-slate-900 font-semibold">{product?.category?.title}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Header */}
          <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === item.id
                  ? "bg-blue-dark text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Description Tab */}
          {activeTab === "tabOne" && (
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Specifications</h2>
              <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.additionalInfo }} />
            </div>
          )}

          {/* Additional Info Tab */}
          {activeTab === "tabTwo" && (
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
              <div className="divide-y divide-slate-100">
                {/* <div className="flex py-4 px-6 bg-slate-50">
                  <div className="w-1/3 font-semibold text-slate-700">Brand</div>
                  <div className="w-2/3 text-slate-900">{product?.brand?.title}</div>
                </div> */}
                {Object.entries(product?.specifications).map(([label, value], key) => (
                  <div key={key} className="flex py-4 px-6 hover:bg-slate-50 transition-colors">
                    <div className="w-1/3 font-semibold text-slate-700">{label}</div>
                    <div className="w-2/3 text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "tabThree" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {reviews.length} Reviews
                </h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{review.name}</h3>
                            <p className="text-sm text-slate-500">{review.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((starIndex) => (
                            <Star1 key={starIndex} isActive={starIndex <= review.rating} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 h-fit">
                <SubmitReview productId={product.id} />
              </div>
            </div>
          )}
        </div>
      </section>

      <RecentlyViewdItems products={products} />

      <div className="mt-10">
        <Newsletter />
      </div>
    </>
  );
};

export default ShopDetails;
