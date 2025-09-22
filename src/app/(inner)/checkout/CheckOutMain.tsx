"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/components/header/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateOrderMutation } from "@/store/ordersApi";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials, setUser } from "@/store/authSlice";

const DEFAULT_SHIPPING_COST = 50;

// helper: decode JWT
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

const CheckOutMain: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cartItems, isCartLoaded, clearCart } = useCart();
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();

  const isAuthenticated = useSelector((state: any) => !!state?.auth?.token);
  const user = useSelector((state: any) => state?.auth?.user);

  const [coupon, setCoupon] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [billingInfo, setBillingInfo] = useState<any>({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    company: "",
    country: "India",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: user?.phone || "",
    orderNotes: "",
  });

  const [couponMessage, setCouponMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Check and sync auth token from localStorage
  useEffect(() => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("authToken");

    if (token && !isAuthenticated) {
      const decoded = decodeToken(token);
      if (decoded) {
        dispatch(setCredentials({ token, user: decoded }));
      }
    } else if (!token && isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (user) {
      setBillingInfo((prev: any) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || user.name?.split(" ")[0] || prev.firstName,
        lastName:
          user.lastName ||
          (user.name
            ? user.name.split(" ").slice(1).join(" ")
            : prev.lastName) ||
          prev.lastName,
        phone: user.phone || prev.phone,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCouponApply = () => {
    if (coupon === "12345") {
      setDiscount(0.25);
      setCouponMessage("Coupon applied -25% Discount");
    } else {
      setDiscount(0);
      setCouponMessage("Coupon code is incorrect");
    }
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const subtotal = safeCartItems.reduce((sum: number, item: any) => {
    const price =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return sum + (isNaN(price) ? 0 : price * (item.quantity || 1));
  }, 0);
  const discountAmount = subtotal * discount;
  const shippingCost = discount > 0 ? 0 : DEFAULT_SHIPPING_COST;
  const total = subtotal - discountAmount + shippingCost;

  if (!isCartLoaded) {
    return <div>Loading checkout...</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setBillingInfo({ ...billingInfo, [id]: value });
    if (validationErrors[id]) {
      setValidationErrors({ ...validationErrors, [id]: "" });
    }
  };

  const toggleCouponInput = () => setShowCoupon((p) => !p);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!billingInfo.email) errors.email = "Email is required";
    if (!billingInfo.firstName) errors.firstName = "First name is required";
    if (!billingInfo.lastName) errors.lastName = "Last name is required";
    if (!billingInfo.street) errors.street = "Street address is required";
    if (!billingInfo.city) errors.city = "City is required";
    if (!billingInfo.state) errors.state = "State is required";
    if (!billingInfo.zip) errors.zip = "Zip code is required";
    if (!billingInfo.phone) errors.phone = "Phone number is required";
    if (!selectedPaymentMethod)
      errors.payment = "Please select a payment method";
    if (!agreedToTerms) errors.terms = "Please agree to terms and conditions";

    if (billingInfo.email && !/\S+@\S+\.\S+/.test(billingInfo.email)) {
      errors.email = "Invalid email address";
    }

    if (
      billingInfo.phone &&
      !/^[6-9]\d{9}$/.test(String(billingInfo.phone).replace(/\D/g, ""))
    ) {
      errors.phone = "Invalid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      router.push("/login");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    if (safeCartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (selectedPaymentMethod !== "cod") {
      toast.error("Currently only Cash on Delivery is available");
      return;
    }

    try {
      const orderData = {
        items: safeCartItems.map((item: any) => ({
          productId: item.productId || item.id,
          quantity: item.quantity || 1,
          price:
            typeof item.price === "string"
              ? parseFloat(item.price)
              : item.price,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
        shippingAddress: {
          fullName: `${billingInfo.firstName} ${billingInfo.lastName}`.trim(),
          phone: billingInfo.phone,
          email: billingInfo.email,
          addressLine1: billingInfo.street,
          addressLine2: billingInfo.company || undefined,
          city: billingInfo.city,
          state: billingInfo.state,
          postalCode: billingInfo.zip,
          country: billingInfo.country,
          isDefault: true,
        },
        billingAddress: {
          fullName: `${billingInfo.firstName} ${billingInfo.lastName}`.trim(),
          phone: billingInfo.phone,
          email: billingInfo.email,
          addressLine1: billingInfo.street,
          addressLine2: billingInfo.company || undefined,
          city: billingInfo.city,
          state: billingInfo.state,
          postalCode: billingInfo.zip,
          country: billingInfo.country,
          isDefault: true,
        },
        paymentMethod: "cash_on_delivery", // backend expects this value
        shippingMethod: "standard", // Required field
        notes: billingInfo.orderNotes || undefined,
        couponCode: discount > 0 ? coupon : undefined,
      };

      console.log("Sending order data:", JSON.stringify(orderData, null, 2));

      const response = await createOrder(orderData).unwrap();
      console.log("Order response:", response);

      if (response) {
        toast.success("Order placed successfully!");
        if (typeof clearCart === "function") clearCart();

        const orderId =
          response._id || response.orderNumber || (response as any).id;
        if (orderId) toast.info(`Your Order ID: ${orderId}`);
        else router.push("/my-orders");
      }
    } catch (error: any) {
      console.error("Order creation failed - Full error:", error);
      console.error("Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
        response: error?.response,
      });

      let errorMessage = "Failed to place order. Please try again.";

      // Handle different error formats
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (Array.isArray(error?.data?.errors)) {
        errorMessage = error.data.errors.join(", ");
      }

      // Handle specific status codes
      if (error?.status === 401 || error?.response?.status === 401) {
        errorMessage = "Please login to place an order";
        router.push("/login");
      } else if (error?.status === 400 || error?.response?.status === 400) {
        errorMessage =
          error?.data?.message ||
          error?.response?.data?.message ||
          "Invalid order data. Please check your information.";
      } else if (error?.status === 404 || error?.response?.status === 404) {
        errorMessage = "Product not found. Please refresh your cart.";
      } else if (error?.status === 500 || error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      toast.error(errorMessage);
    }
  };

  return (
    <div className="checkout-area rts-section-gap">
      <div className="container">
        <div className="row">
          {/* Left: Billing Details */}
          <div className="col-lg-8 pr--40 order-2 order-xl-1">
            <div className="coupon-input-area-1">
              <div className="coupon-area">
                <div
                  className="coupon-ask cupon-wrapper-1"
                  onClick={toggleCouponInput}
                >
                  <button className="coupon-click">
                    Have a coupon? Click here to enter your code
                  </button>
                </div>

                <div
                  className={`coupon-input-area cupon1 ${
                    showCoupon ? "show" : ""
                  }`}
                >
                  <div className="inner">
                    <p>If you have a coupon code, please apply it below.</p>
                    <div className="form-area">
                      <input
                        type="text"
                        placeholder="Enter Coupon Code..."
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value);
                          setCouponMessage("");
                        }}
                      />
                      <button
                        type="button"
                        className="btn-primary rts-btn"
                        onClick={handleCouponApply}
                      >
                        Apply Coupon
                      </button>
                    </div>
                    {couponMessage && (
                      <p
                        style={{
                          color: discount > 0 ? "green" : "red",
                          marginTop: 8,
                        }}
                      >
                        {couponMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Form */}
            <div className="rts-billing-details-area">
              <h3 className="title">Billing Details</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="single-input">
                  <label htmlFor="email">Email Address*</label>
                  <input
                    id="email"
                    type="email"
                    value={billingInfo.email}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.email ? "error" : ""}
                  />
                  {validationErrors.email && (
                    <span className="error-message">
                      {validationErrors.email}
                    </span>
                  )}
                </div>

                <div className="single-input">
                  <label htmlFor="firstName">First Name*</label>
                  <input
                    id="firstName"
                    value={billingInfo.firstName}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.firstName ? "error" : ""}
                  />
                  {validationErrors.firstName && (
                    <span className="error-message">
                      {validationErrors.firstName}
                    </span>
                  )}
                </div>

                <div className="single-input">
                  <label htmlFor="lastName">Last Name*</label>
                  <input
                    id="lastName"
                    value={billingInfo.lastName}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.lastName ? "error" : ""}
                  />
                  {validationErrors.lastName && (
                    <span className="error-message">
                      {validationErrors.lastName}
                    </span>
                  )}
                </div>

                <div className="single-input">
                  <label htmlFor="company">Company Name (Optional)</label>
                  <input
                    id="company"
                    value={billingInfo.company}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="single-input">
                  <label htmlFor="country">Country / Region*</label>
                  <select
                    id="country"
                    value={billingInfo.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div className="single-input">
                  <label htmlFor="street">Street Address*</label>
                  <input
                    id="street"
                    value={billingInfo.street}
                    onChange={handleInputChange}
                    placeholder="House number and street name"
                    required
                    className={validationErrors.street ? "error" : ""}
                  />
                  {validationErrors.street && (
                    <span className="error-message">
                      {validationErrors.street}
                    </span>
                  )}
                </div>

                <div className="single-input">
                  <label htmlFor="city">Town / City*</label>
                  <input
                    id="city"
                    value={billingInfo.city}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.city ? "error" : ""}
                  />
                  {validationErrors.city && (
                    <span className="error-message">
                      {validationErrors.city}
                    </span>
                  )}
                </div>

                <div className="single-input">
                  <label htmlFor="state">State*</label>
                  <input
                    id="state"
                    value={billingInfo.state}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.state ? "error" : ""}
                  />
                  {validationErrors.state && (
                    <span className="error-message">
                      {validationErrors.state}
                    </span>
                  )}
                </div>

                <div className="single-input">
                  <label htmlFor="zip">Zip Code*</label>
                  <input
                    id="zip"
                    value={billingInfo.zip}
                    onChange={handleInputChange}
                    required
                    className={validationErrors.zip ? "error" : ""}
                  />
                  {validationErrors.zip && (
                    <span className="error-message">
                      {validationErrors.zip}
                    </span>
                  )}
                </div>

                <div className="single-input">
                  <label htmlFor="phone">Phone*</label>
                  <input
                    id="phone"
                    value={billingInfo.phone}
                    onChange={handleInputChange}
                    placeholder="10 digit mobile number"
                    required
                    className={validationErrors.phone ? "error" : ""}
                  />
                  {validationErrors.phone && (
                    <span className="error-message">
                      {validationErrors.phone}
                    </span>
                  )}
                </div>

                <div className="single-input">
                  <label htmlFor="orderNotes">Order Notes (Optional)</label>
                  <textarea
                    id="orderNotes"
                    value={billingInfo.orderNotes}
                    onChange={handleInputChange}
                    placeholder="Notes about your order, e.g. special notes for delivery"
                  ></textarea>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="col-lg-4 order-1 order-xl-2">
            <h3 className="title-checkout">Your Order</h3>
            <div className="right-card-sidebar-checkout">
              <div className="top-wrapper">
                <div className="product">Products</div>
                <div className="price">Price</div>
              </div>

              {safeCartItems.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                safeCartItems.map((item: any) => (
                  <div
                    className="single-shop-list"
                    key={item.id || item.productId}
                  >
                    <div className="left-area">
                      <img src={item.image} alt={item.title} />
                      <span className="title">
                        {item.title} × {item.quantity}
                      </span>
                    </div>
                    <span className="price">
                      ₹{" "}
                      {(
                        (typeof item.price === "string"
                          ? parseFloat(item.price)
                          : item.price) * (item.quantity || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))
              )}

              <div className="single-shop-list">
                <div className="left-area">
                  <span>Subtotal</span>
                </div>
                <span className="price">₹ {subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="single-shop-list">
                  <div className="left-area">
                    <span>Discount (25%)</span>
                  </div>
                  <span className="price">-₹ {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="single-shop-list">
                <div className="left-area">
                  <span>Shipping</span>
                </div>
                <span className="price">₹ {shippingCost.toFixed(2)}</span>
              </div>

              <div className="single-shop-list">
                <div className="left-area">
                  <span style={{ fontWeight: 600, color: "#2C3C28" }}>
                    Total Price:
                  </span>
                </div>
                <span className="price" style={{ color: "#629D23" }}>
                  ₹ {total.toFixed(2)}
                </span>
              </div>

              {/* Payment methods */}
              <div className="cottom-cart-right-area">
                <ul>
                  <li>
                    <input
                      type="radio"
                      id="bank"
                      name="payment"
                      disabled
                      onChange={() => setSelectedPaymentMethod("bank")}
                    />
                    <label htmlFor="bank" style={{ opacity: 0.5 }}>
                      Direct Bank Transfer (Coming Soon)
                    </label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id="check"
                      name="payment"
                      disabled
                      onChange={() => setSelectedPaymentMethod("check")}
                    />
                    <label htmlFor="check" style={{ opacity: 0.5 }}>
                      Check Payments (Coming Soon)
                    </label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      onChange={() => setSelectedPaymentMethod("cod")}
                      checked={selectedPaymentMethod === "cod"}
                    />
                    <label htmlFor="cod">Cash On Delivery</label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id="paypal"
                      name="payment"
                      disabled
                      onChange={() => setSelectedPaymentMethod("paypal")}
                    />
                    <label htmlFor="paypal" style={{ opacity: 0.5 }}>
                      Paypal (Coming Soon)
                    </label>
                  </li>
                </ul>
                {validationErrors.payment && (
                  <span
                    className="error-message"
                    style={{ color: "red", fontSize: 12 }}
                  >
                    {validationErrors.payment}
                  </span>
                )}

                <div className="single-category mb--30">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    {" "}
                    I have read and agree to terms and conditions *
                  </label>
                </div>
                {validationErrors.terms && (
                  <span
                    className="error-message"
                    style={{
                      color: "red",
                      fontSize: 12,
                      display: "block",
                      marginBottom: 10,
                    }}
                  >
                    {validationErrors.terms}
                  </span>
                )}

                <button
                  className="rts-btn btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={isCreatingOrder || safeCartItems.length === 0}
                  style={{
                    width: "100%",
                    cursor: isCreatingOrder ? "not-allowed" : "pointer",
                  }}
                >
                  {isCreatingOrder ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutMain;
