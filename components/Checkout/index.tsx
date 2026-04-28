"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { toast } from "react-hot-toast"; // or your preferred toast library
import { applyCoupon, processCheckout } from "@/lib/action/checkout.action";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Login from "@/components/Checkout/Login";
import Billing from "@/components/Checkout/Billing";
import Shipping from "@/components/Checkout/Shipping";
import Coupon from "@/components/Checkout/Coupon";
import PaymentMethod from "@/components/Checkout/PaymentMethod";
import { discountPrice } from "@/lib/helper";
import { useDispatch } from "react-redux";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { getProductById, getUserAddress } from "@/lib/action/home.action";


const Checkout = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirect = searchParams.get("direct") === "true";
  const productId = searchParams.get("pid");
  const quantity = parseInt(searchParams.get("qty") || "1");
  const [displayItems, setDisplayItems] = useState([]);
  const info = useAppSelector((state) => state.userReducer);
  const [loading, setLoading] = useState(false);
  const carts = useAppSelector(state => state.cartReducer.items);
  const reduxCartItems = useAppSelector(state => state.cartReducer.items);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // Form states
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("FREE");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [notes, setNotes] = useState("");

  const dispatch = useDispatch();

  // Billing address state
  const [billingAddress, setBillingAddress] = useState({
    firstName: "",
    lastName: "",
    company: "",
    country: "Australia",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    phone: "",
    email: "",
  });


  //   useEffect(() => {
  //   const fee = calculateShippingFee(shippingMethod);
  //   setShippingFee(fee);

  //   const newSubtotal = displayItems.reduce(
  //     (sum, item) => sum + (discountPrice({ price: item.price, discount: item.discountedPrice }) * item.quantity),
  //     0
  //   );

  //   setSubtotal(newSubtotal);
  //   // Total = Items + Shipping - Discount
  //   setTotal(newSubtotal + fee - discount);
  // }, [displayItems, discount, shippingMethod]);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    company: "",
    country: "Australia",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    phone: "",
    email: "",
  });



  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const { address } = await getUserAddress();

        console.log("Fetched Address:", address);

        // 2. Update state only if address exists
        if (address) {
          setBillingAddress({
            lastName: address.lastName || "",
            firstName: address.firstName || "",
            company: address.company || "",
            country: address.country || "",
            streetAddress: address.streetAddress || "",
            apartment: address.apartment || "",
            city: address.city || "",
            state: address.state || "",
            phone: address.phone || "",
            email: address.email || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch address:", error);
      }
    };

    // 3. Call it immediately
    fetchAddress();
  }, []); // Empty dependency array means this runs once on mount

  // Calculate totals
  // useEffect(() => {
  //   const newSubtotal = carts.reduce(
  //     (sum, item) => sum + (discountPrice({ price: item.price, discount: item.discountedPrice }) * item.quantity),
  //     0
  //   );
  //   setSubtotal(newSubtotal);


  //   // 3. Calculate Final Total: (Items + Shipping) - Coupon Discount
  //   const newTotal = newSubtotal - discount;

  //   setTotal(newTotal);
  // }, [carts, discount]);

  useEffect(() => {
    const newSubtotal = displayItems.reduce(
      (sum, item) => sum + (discountPrice({ price: item.price, discount: item.discountedPrice }) * item.quantity),
      0
    );
    setSubtotal(newSubtotal);
    setTotal(newSubtotal - discount);
  }, [displayItems, discount]);

  const calculateShippingFee = (method) => {
    switch (method) {
      case "FREE":
        return 0;
      case "FEDEX":
        return 10.99;
      case "DHL":
        return 12.5;
      default:
        return 0;
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const result = await applyCoupon(couponCode, subtotal);
    if (result.valid) {
      setDiscount(result.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! You saved $${result.discount.toFixed(2)}`);
    } else {
      toast.error(result.message);
    }
  };

  const validateForm = () => {
    // Validate billing address
    const requiredFields = [
      "firstName",
      "lastName",
      "country",
      "streetAddress",
      "city",
      "phone",
      "email",
    ];

    for (const field of requiredFields) {
      if (!billingAddress[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }

    // Validate shipping address if different
    if (shipToDifferentAddress) {
      for (const field of requiredFields) {
        if (!shippingAddress[field]) {
          toast.error(
            `Please fill in shipping ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
          );
          return false;
        }
      }
    }

    // Validate cart
    if (displayItems.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!info.isAuthenticated) {
      toast.error("Please login to continue");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const checkoutData = {
        userId: info?.info?.id,
        billingAddress,
        shippingAddress: shipToDifferentAddress ? shippingAddress : undefined,
        shipToDifferentAddress,
        cartItems: displayItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        shippingMethod,
        couponCode: couponApplied ? couponCode : undefined,
        notes: notes || undefined,
      };

      const result = await processCheckout(checkoutData);
      if (result.success) {
        // const payfast = result.data;
        // console.log(payfast)
        // document.open();
        // document.write(payfast.redirectHTML);
        // document.close();
        // const form = document.createElement("form");
        // form.method = "POST";
        // form.action = payfast.payment_url;

        // Object.entries(payfast).forEach(([key, value]) => {
        //   if (key !== "payment_url") {
        //     const input = document.createElement("input");
        //     input.type = "hidden";
        //     input.name = key;
        //     input.value = String(value);
        //     form.appendChild(input);
        //   }
        // });

        // document.body.appendChild(form);
        // form.submit();
        toast.success("Order placed successfully!");
        dispatch(
          removeAllItemsFromCart()
        )
        router.push(`/order-confirmation/${result.orderNumber}`);
      } else {
        toast.error(result.error || "Failed to process checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initItems = async () => {
      if (isDirect && productId) {
        // Fetch the single product if it's a direct purchase
        const { product } = await getProductById(Number(productId));
        if (product) {
          setDisplayItems([{ ...product, quantity }]);
        }
      } else {
        setDisplayItems(reduxCartItems);
      }
    };
    initItems();
  }, [isDirect, productId, quantity, reduxCartItems]);

  // if (!info.isAuthenticated) {
  //   return (
  //     <>
  //       <Breadcrumb title={"Checkout"} pages={["checkout"]} />
  //       <section className="overflow-hidden py-20 bg-gray-2">
  //         <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
  //           <Login />
  //         </div>
  //       </section>
  //     </>
  //   );
  // }

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* Checkout left */}
              <div className="lg:max-w-[670px] w-full">
                <Billing
                  billingAddress={billingAddress}
                  setBillingAddress={setBillingAddress}
                />
                <Shipping
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  shipToDifferentAddress={shipToDifferentAddress}
                  setShipToDifferentAddress={setShipToDifferentAddress}
                />
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>
              </div>

              {/* Checkout right */}
              <div className="max-w-[455px] w-full">
                {/* Order list box */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* Title */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">Subtotal</h4>
                      </div>
                    </div>

                    {/* Cart items */}
                    {displayItems && displayItems.map((item) => (
                      <div
                        key={item?.id}
                        className="flex items-center justify-between py-5 border-b border-gray-3"
                      >
                        <div>
                          <p className="text-dark">
                            {item.title} × {item.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-dark text-right">
                            Rs. {(discountPrice({
                              price: item.price,
                              discount: item.discountedPrice
                            }) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Shipping Fee */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Shipping Fee</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">
                          Rs. {shippingFee.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Discount</p>
                        </div>
                        <div>
                          <p className="text-green-600 text-right">
                            -Rs. {discount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          Rs. {total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon box */}
                <Coupon
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  handleApplyCoupon={handleApplyCoupon}
                  couponApplied={couponApplied}
                />

                {/* Shipping box */}
                {/* <ShippingMethod
                  shippingMethod={shippingMethod}
                  setShippingMethod={setShippingMethod}
                /> */}

                {/* Payment box */}
                <PaymentMethod
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                />

                {/* Checkout button */}
                <button
                  type="submit"
                  disabled={loading || displayItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Process to Checkout"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;