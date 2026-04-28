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
import { Check, CheckCheckIcon, CheckCircle, Heart, Share2, Star, StarIcon, XCircle } from "lucide-react";
import { discountPrice } from "@/lib/helper";
const ShopDetails = ({ product, session, reviews }) => {
  const { openPreviewModal } = usePreviewSlider();
  const [previewImg, setPreviewImg] = useState(0);
  const [type, setType] = useState("active");
  const [sim, setSim] = useState("dual");
  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState("tabOne");



  const types = [
    {
      id: "active",
      title: "Active",
    },

    {
      id: "inactive",
      title: "Inactive",
    },
  ];

  const sims = [
    {
      id: "dual",
      title: "Dual",
    },

    {
      id: "e-sim",
      title: "E Sim",
    },
  ];

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

  // pass the product here when you get the real data.
  const handlePreviewSlider = () => {
    openPreviewModal();
  };

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = reviews.length > 0 ? Math.round(totalRating / reviews.length) : 0;

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

  return (
    <>
      <Breadcrumb title={"Shop Details"} pages={["shop details"]} />


      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-lg shadow bg-[#f3f4f6] p-4 sm:p-7.5 relative flex items-center justify-center">
                <div>
                  {product.images?.[previewImg] && (
                    <Image
                      src={product.images?.[previewImg]}
                      alt="products-details"
                      width={400}
                      height={400}
                    />
                  )}
                </div>
              </div>

              {/* ?  &apos;border-blue &apos; :  &apos;border-transparent&apos; */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                {product.images?.map((item, key) => (
                  <button
                    onClick={() => setPreviewImg(key)}
                    key={key}
                    className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-[#f3f4f6] shadow ease-out duration-200 border-2 hover:border-blue ${key === previewImg
                      ? "border-blue"
                      : "border-transparent"
                      }`}
                  >
                    <Image
                      width={50}
                      height={50}
                      src={item}
                      alt="thumbnail"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* <!-- product content --> */}
            <div className="max-w-[539px] w-full">
              {/* Title and Badge */}
              <div className="mb-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="font-bold text-2xl sm:text-3xl xl:text-4xl text-dark leading-tight">
                    {product.title}
                  </h1>
                  {product.discountedPrice && (
                    <span className="flex-shrink-0 inline-flex items-center font-bold text-sm text-white bg-blue rounded-md py-1.5 px-3 shadow-sm">
                      {product.discountedPrice}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Rating and Stock Status */}
              <div className="flex flex-wrap items-center gap-5 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-4 ${star <= averageRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    ({reviews.length} customer reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {product.quantity > 0 ? (
                    <>
                      <CheckCircle className="size-5 text-green-600" />
                      <span className="text-green-600 font-semibold text-sm">In Stock</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-5 text-red-600" />
                      <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Price:
                  </span>
                  <span className="text-4xl font-bold text-dark">
                    Rs. {discountPrice({ price: product.price, discount: product.discountedPrice })}
                  </span>
                  {product.discountedPrice && (
                    <span className="text-xl text-gray-400 line-through font-medium">
                      Rs. {product.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-dark">Quantity:</label>
                  <div className="flex items-center rounded-lg border-2 border-gray-300 bg-white shadow-sm">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="flex items-center justify-center w-11 h-11 ease-out duration-200 hover:bg-gray-50 active:bg-gray-100"
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    >
                      <svg
                        className="fill-current text-gray-600"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" />
                      </svg>
                    </button>

                    <span className="flex items-center justify-center min-w-[60px] h-11 border-x-2 border-gray-300 font-semibold text-dark text-base">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex items-center justify-center w-11 h-11 ease-out duration-200 hover:bg-gray-50 active:bg-gray-100"
                    >
                      <svg
                        className="fill-current text-gray-600"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" />
                        <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  {/* Primary Button */}
                  <button
                    type="button"
                    className="w-full font-bold text-base text-white bg-blue py-4 px-8 rounded-lg shadow-lg ease-out duration-200 hover:bg-blue-dark hover:shadow-xl active:scale-[0.98] transition-all"
                  >
                    Purchase Now
                  </button>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center w-13 h-13 rounded-lg border-2 border-gray-300 bg-white ease-out duration-200 hover:border-red-400 hover:bg-red-50 active:scale-95 transition-all group"
                      aria-label="Add to wishlist"
                    >
                      <Heart className="size-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-center w-13 h-13 rounded-lg border-2 border-gray-300 bg-white ease-out duration-200 hover:border-green-400 hover:bg-green-50 active:scale-95 transition-all group"
                      aria-label="Share on WhatsApp"
                    >
                      <svg
                        fill="none"
                        className="fill-current text-gray-600 group-hover:text-green-600 transition-colors"
                        width="20px"
                        height="20px"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-center w-13 h-13 rounded-lg border-2 border-gray-300 bg-white ease-out duration-200 hover:border-blue-400 hover:bg-blue-50 active:scale-95 transition-all group"
                      aria-label="Share product"
                    >
                      <Share2 className="size-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">SKU:</span>
                    <span className="ml-2 text-dark font-semibold">N/A</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Category:</span>
                    <span className="ml-2 text-dark font-semibold">Electronics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* <!--== tab header start ==--> */}
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {tabs.map((item, key) => (
              <button
                key={key}
                onClick={() => setActiveTab(item.id)}
                className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${activeTab === item.id
                  ? "text-blue before:w-full"
                  : "text-dark before:w-0"
                  }`}
              >
                {item.title}
              </button>
            ))}
          </div>
          {/* <!--== tab header end ==--> */}

          {/* <!--== tab content start ==--> */}
          {/* <!-- tab content one start --> */}
          <div>
            <div
              className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${activeTab === "tabOne" ? "flex" : "hidden"
                }`}
            >
              <div className=" w-full">
                <h2 className="font-medium text-2xl text-dark mb-7">
                  Specifications:
                </h2>

                <div
                  className="prose prose-slate max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: product.additionalInfo || "" }}
                />

              </div>

            </div>
          </div>
          {/* <!-- tab content one end --> */}

          {/* <!-- tab content two start --> */}
          <div>
            <div
              className={`rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-10 ${activeTab === "tabTwo" ? "block" : "hidden"
                }`}
            >
              {/* <!-- info item --> */}
              <div className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5">
                <div className="max-w-[450px] min-w-[140px] w-full">
                  <p className="text-sm sm:text-base text-dark">Brand</p>
                </div>
                <div className="w-full">
                  <p className="text-sm sm:text-base text-dark">{product?.brand?.title}</p>
                </div>
              </div>

              {/* <!-- info item --> */}
              {
                /* Convert the object into an array of [key, value] pairs */
                Object.entries(product?.specifications).map(([label, value], key) => (
                  <div
                    key={key}
                    className="rounded-md even:bg-gray-100 flex py-4 px-4 sm:px-5 border-b border-gray-50 last:border-0"
                  >
                    {/* The Key (e.g., Generation) */}
                    <div className="max-w-[450px] min-w-[140px] w-full">
                      <p className="text-sm sm:text-base font-semibold text-gray-700">{label}</p>
                    </div>

                    {/* The Value (e.g., 13th Generation) */}
                    <div className="w-full">
                      <p className="text-sm sm:text-base text-gray-600">
                        {value}
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          {/* <!-- tab content two end --> */}

          {/* <!-- tab content three start --> */}
          <div>
            <div
              className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${activeTab === "tabThree" ? "flex" : "hidden"
                }`}
            >
              <div className="max-w-[570px] w-full">
                <h2 className="font-medium text-2xl text-dark mb-9">
                  {reviews.length} Review for this product
                </h2>

                <div className="flex flex-col gap-6">
                  {
                    reviews && reviews.length > 0 && reviews.map((review) => {
                      return (
                        <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <a href="#" className="flex items-center gap-4">
                              <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
                                <Image
                                  src="/images/users/user-01.jpg"
                                  alt="author"
                                  className="w-12.5 h-12.5 rounded-full overflow-hidden"
                                  width={50}
                                  height={50}
                                />
                              </div>

                              <div>
                                <h3 className="font-medium text-dark">
                                  {review.name}
                                </h3>
                                <p className="text-[14px]">
                                  {review.email}
                                </p>
                              </div>
                            </a>

                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((starIndex) => (
                                <Star1
                                  key={starIndex}
                                  isActive={starIndex <= review.rating}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-dark mt-6">
                            {review.comment}
                          </p>
                        </div>
                      )
                    })
                  }
                </div>
              </div>

              <div className="max-w-[550px] w-full">
                <SubmitReview productId={product.id} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <RecentlyViewdItems /> */}

      <Newsletter />
    </>
  );
};

export default ShopDetails;
