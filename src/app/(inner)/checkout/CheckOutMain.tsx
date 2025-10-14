"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/components/header/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateOrderMutation } from "@/store/ordersApi";
import { useInitiateCashfreePaymentMutation } from "@/store/paymentApi";
import { useApplyMutation } from "@/store/couponApi";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Badge,
  Alert,
} from "react-bootstrap";

import Script from "next/script";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials, setUser } from "@/store/authSlice";
import {
  useGetMyAddressesQuery,
  useCreateAddressMutation,
  type IAddress,
} from "@/store/addressApi";

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
  const [initiateCashfreePayment] = useInitiateCashfreePaymentMutation();
  const [applyCouponMut] = useApplyMutation();

  const isAuthenticated = useSelector((state: any) => !!state?.auth?.token);
  const user = useSelector((state: any) => state?.auth?.user);

  const [coupon, setCoupon] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Saved addresses for the logged-in user
  const {
    data: addresses = [],
    isLoading: addressesLoading,
    refetch: refetchAddresses,
  } = useGetMyAddressesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [createAddress, { isLoading: isCreatingAddress }] =
    useCreateAddressMutation();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<IAddress>>({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    addressType: "home",
    isDefault: false,
  });

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

  // Map a saved address to the billing form (keep at top-level for reuse)
  const applyAddressToBilling = (addr: IAddress) => {
    const [firstName, ...rest] = (addr.fullName || "").trim().split(" ");
    setBillingInfo((prev: any) => ({
      ...prev,
      email: addr.email || prev.email,
      firstName: firstName || prev.firstName,
      lastName: rest.join(" ") || prev.lastName,
      company: addr.addressLine2 || "",
      country: addr.country || "India",
      street: addr.addressLine1 || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.postalCode || "",
      phone: addr.phone || prev.phone,
    }));
  };

  // Preselect default address (or first) once after data loads; do not override user's choice
  // Important: keep this before any early returns to preserve Hooks order
  useEffect(() => {
    if (selectedAddressId) return; // user already selected or preselected
    if (!addressesLoading && addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def?._id) {
        setSelectedAddressId(def._id);
        applyAddressToBilling(def as IAddress);
        setShowAddressForm(false);
      }
    }
  }, [addressesLoading, addresses, selectedAddressId]);

  // When user clicks a different saved address, sync it to billing form
  useEffect(() => {
    if (!selectedAddressId) return;
    const picked = (addresses || []).find((a) => a._id === selectedAddressId);
    if (picked) applyAddressToBilling(picked as IAddress);
  }, [selectedAddressId, addresses]);

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

  const handleCouponApply = async () => {
    try {
      const itemsPayload = safeCartItems
        .map((item: any) => ({
          productId: String(
            item.productId ||
              item?.raw?._id ||
              (isValidObjectId(item.id) ? item.id : "")
          ),
          quantity: Math.max(1, Number(item.quantity) || 1),
        }))
        .filter((x: any) => isValidObjectId(x.productId));

      if (!coupon || !itemsPayload.length) {
        setDiscount(0);
        setCouponMessage("Invalid coupon or empty cart");
        return;
      }

      const resp = await applyCouponMut({
        code: coupon,
        items: itemsPayload,
      }).unwrap();
      const discAmount = Number(resp?.discountAmount || 0);
      if (discAmount > 0 && subtotal > 0) {
        // store as fraction for local UI; backend will re-validate on order
        const frac = Math.min(1, discAmount / subtotal);
        setDiscount(frac);
        setCouponMessage(`Coupon applied (₹ ${discAmount.toFixed(2)})`);
      } else {
        setDiscount(0);
        setCouponMessage("Coupon not applicable");
      }
    } catch (e: any) {
      setDiscount(0);
      setCouponMessage(e?.data?.message || "Failed to apply coupon");
    }
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const subtotal = safeCartItems.reduce((sum: number, item: any) => {
    const price =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return sum + (isNaN(price) ? 0 : price * (item.quantity || 1));
  }, 0);
  const discountAmount = subtotal * discount;
  // Match backend: standard shipping = 50, tax = 5% of subtotal
  const taxAmount = subtotal * 0.05;
  const shippingCost = DEFAULT_SHIPPING_COST; // always standard in payload
  const total = subtotal - discountAmount + shippingCost + taxAmount;

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

  // Simple Mongo ObjectId validator (client-side)
  const isValidObjectId = (v: any): boolean => {
    if (!v) return false;
    const s = String(v);
    return /^[0-9a-fA-F]{24}$/.test(s);
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = (await createAddress(
        addressForm as IAddress
      ).unwrap()) as IAddress;
      toast.success("Address added");
      await refetchAddresses();
      setSelectedAddressId(created._id || null);
      applyAddressToBilling(created);
      setShowAddressForm(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    // Clear any existing toasts for a cleaner UX
    try {
      toast.dismiss();
    } catch {
      /* noop */
    }

    if (!isAuthenticated) {
      toast.error("⚠️ Please login to place an order", {
        position: "top-right",
        autoClose: 4000,
      });
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    if (!validateForm()) {
      toast.error("❌ Please fill all required fields correctly", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (safeCartItems.length === 0) {
      toast.error("❌ Your cart is empty", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    try {
      // Build request items with strict productId validation and fallback
      const itemsForRequest = safeCartItems.map((item: any) => {
        const candidate =
          item.productId ||
          item?.raw?._id ||
          (isValidObjectId(item.id) ? String(item.id) : undefined);
        return {
          productId: candidate,
          quantity: item.quantity || 1,
          price:
            typeof item.price === "string"
              ? parseFloat(item.price)
              : item.price,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        };
      });

      const invalidItems = itemsForRequest.filter(
        (it: any) => !isValidObjectId(it.productId)
      );
      if (invalidItems.length > 0) {
        toast.error(
          "❌ Some items in your cart are not available to purchase. Please remove them and try again.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        return;
      }

      const orderData = {
        items: itemsForRequest,
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
        paymentMethod:
          selectedPaymentMethod === "cod" ? "cash_on_delivery" : "card",
        shippingMethod: "standard", // Required field
        notes: billingInfo.orderNotes || undefined,
        couponCode: discount > 0 ? coupon : undefined,
      };

      console.log("Sending order data:", JSON.stringify(orderData, null, 2));

      const response = await createOrder(orderData).unwrap();
      console.log("Order response:", response);

      if (response) {
        try {
          toast.dismiss();
        } catch {
          /* noop */
        }
        // Get order ID for redirect and display
        const orderId =
          response._id || response.orderNumber || (response as any).id;

        if (selectedPaymentMethod === "cod") {
          // Clear cart first
          if (typeof clearCart === "function") clearCart();

          // Show success toast with order ID and redirect
          toast.success(
            `🎉 Order placed successfully! ${
              orderId ? `Order ID: ${orderId}` : ""
            }`,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );

          if (orderId) {
            setTimeout(() => router.push(`/orders/${orderId}`), 1500);
          } else {
            setTimeout(() => router.push("/account?tab=orders"), 1500);
          }
        } else if (selectedPaymentMethod === "cashfree") {
          if (!orderId) {
            throw new Error("Failed to resolve order ID for Cashfree payment");
          }

          // Initiate Cashfree payment to get paymentSessionId
          const pay = await initiateCashfreePayment({ orderId }).unwrap();
          const paymentSessionId = (pay as any)?.paymentSessionId;
          if (!paymentSessionId) {
            throw new Error("Failed to get Cashfree payment session");
          }

          // Ensure SDK is available and open checkout
          const mode =
            process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
              ? "production"
              : "sandbox";
          const cf = (window as any).Cashfree
            ? (window as any).Cashfree({ mode })
            : null;
          if (!cf) {
            throw new Error("Cashfree SDK not loaded");
          }
          await cf.checkout({ paymentSessionId, redirectTarget: "_self" });
          // Redirect occurs; on return, backend redirects to /orders/:id with status
        }
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
      let shouldRedirectToLogin = false;

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
        errorMessage = "⚠️ Session expired. Please login to place an order.";
        shouldRedirectToLogin = true;
      } else if (error?.status === 400 || error?.response?.status === 400) {
        errorMessage =
          "❌ " +
          (error?.data?.message ||
            error?.response?.data?.message ||
            "Invalid order data. Please check your information.");
      } else if (error?.status === 404 || error?.response?.status === 404) {
        errorMessage = "❌ Product not found. Please refresh your cart.";
      } else if (error?.status === 500 || error?.response?.status === 500) {
        errorMessage = "⚠️ Server error. Please try again later.";
      } else if (error?.status === 409 || error?.response?.status === 409) {
        errorMessage =
          "❌ " +
          (error?.data?.message ||
            "Order conflict. Some items may be out of stock.");
      } else {
        errorMessage = "❌ " + errorMessage;
      }

      // Normalize common backend validation messages to be more user-friendly
      if (/Invalid product ID/i.test(errorMessage)) {
        errorMessage =
          "❌ Some items in your cart are invalid. Please remove them and try again.";
      }
      if (/Product not found/i.test(errorMessage)) {
        errorMessage =
          "❌ One or more products are no longer available. Please refresh your cart.";
      }

      // Show error toast with configuration
      try {
        toast.dismiss();
      } catch {
        /* noop */
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect to login if authentication failed
      if (shouldRedirectToLogin) {
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
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
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h3 className="mb-4 fw-semibold text-dark">Billing Details</h3>

                {/* Saved Addresses Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-semibold">Saved Addresses</h5>
                    {addresses && addresses.length > 0 && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowAddressForm((s) => !s)}
                      >
                        {showAddressForm ? "Close" : "Add New Address"}
                      </Button>
                    )}
                  </div>

                  {/* Address Loading Skeleton */}
                  {addressesLoading ? (
                    <div className="text-center my-3">
                      <Spinner animation="border" variant="secondary" />
                    </div>
                  ) : addresses && addresses.length > 0 ? (
                    <div className="list-group mb-3">
                      {addresses.map((a) => (
                        <label
                          key={a._id}
                          className="list-group-item d-flex align-items-start gap-2"
                          style={{ cursor: "pointer" }}
                        >
                          <Form.Check
                            type="radio"
                            name="selectedAddress"
                            value={a._id}
                            checked={selectedAddressId === a._id}
                            onChange={(e) =>
                              setSelectedAddressId(
                                e.currentTarget.value || null
                              )
                            }
                            className="mt-1"
                          />
                          <div>
                            <div className="fw-semibold">
                              {a.fullName}{" "}
                              {a.isDefault && (
                                <Badge bg="primary" className="ms-2">
                                  Default
                                </Badge>
                              )}
                              <Badge bg="secondary" className="ms-2">
                                {a.addressType}
                              </Badge>
                            </div>
                            <div className="text-muted small">
                              {a.addressLine1}
                              {a.addressLine2
                                ? `, ${a.addressLine2}`
                                : ""}, {a.city}, {a.state} {a.postalCode},{" "}
                              {a.country}
                            </div>
                            <div className="text-muted small">
                              Phone: {a.phone}{" "}
                              {a.email ? <span>· {a.email}</span> : ""}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="info" style={{ fontSize: "12px" }}>
                      You don't have any saved addresses. Please add one below.
                    </Alert>
                  )}

                  {/* Add / Edit Address Form */}
                  {(showAddressForm ||
                    (addresses && addresses.length === 0)) && (
                    <Form
                      onSubmit={handleSaveNewAddress}
                      className="border rounded p-3 uniform-inputs bg-light"
                    >
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Label>Full Name *</Form.Label>
                          <Form.Control
                            value={addressForm.fullName || ""}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                fullName: e.target.value,
                              })
                            }
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Label>Phone *</Form.Label>
                          <Form.Control
                            value={addressForm.phone || ""}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                phone: e.target.value,
                              })
                            }
                            required
                          />
                        </Col>

                        <Col md={6} className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={addressForm.email || ""}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Label>Address Type</Form.Label>
                          <Form.Select
                            value={addressForm.addressType || "home"}
                            style={{ fontSize: "12px" }}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                addressType: e.target.value as IAddress["addressType"],
                              })
                            }
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </Form.Select>
                        </Col>

                        <Col xs={12} className="mb-3">
                          <Form.Label>Address Line 1 *</Form.Label>
                          <Form.Control
                            value={addressForm.addressLine1 || ""}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                addressLine1: e.target.value,
                              })
                            }
                            required
                          />
                        </Col>
                        <Col xs={12} className="mb-3">
                          <Form.Label>Address Line 2</Form.Label>
                          <Form.Control
                            value={addressForm.addressLine2 || ""}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                addressLine2: e.target.value,
                              })
                            }
                          />
                        </Col>

                        <Col md={4} className="mb-3">
                          <Form.Label>City *</Form.Label>
                          <Form.Control
                            value={addressForm.city || ""}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                city: e.target.value,
                              })
                            }
                            required
                          />
                        </Col>
                        <Col md={4} className="mb-3">
                          <Form.Label>State *</Form.Label>
                          <Form.Control
                            value={addressForm.state || ""}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                state: e.target.value,
                              })
                            }
                            required
                          />
                        </Col>
                        <Col md={4} className="mb-3">
                          <Form.Label>Postal Code *</Form.Label>
                          <Form.Control
                            value={addressForm.postalCode || ""}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                postalCode: e.target.value,
                              })
                            }
                            required
                          />
                        </Col>

                        <Col md={6} className="mb-3">
                          <Form.Label>Country *</Form.Label>
                          <Form.Control
                            value={addressForm.country || "India"}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                country: e.target.value,
                              })
                            }
                            required
                          />
                        </Col>
                        <Col md={6} className="d-flex align-items-center mt-3">
                          <Form.Check
                            type="checkbox"
                            id="addrIsDefault"
                            label="Set as default address"
                            checked={addressForm.isDefault || false}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                isDefault: e.target.checked,
                              })
                            }
                          />
                        </Col>
                      </Row>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isCreatingAddress}
                        className="mt-3 rts-btn btn-primary"
                      >
                        {isCreatingAddress ? "Saving..." : "Save Address"}
                      </Button>
                    </Form>
                  )}
                </div>

                {/* Billing Info Form */}
                {/* <Form className="uniform-inputs">
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        id="email"
                        value={billingInfo.email}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.email}
                      </Form.Control.Feedback>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label>Phone *</Form.Label>
                      <Form.Control
                        id="phone"
                        value={billingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        isInvalid={!!validationErrors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.phone}
                      </Form.Control.Feedback>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        id="firstName"
                        value={billingInfo.firstName}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.firstName}
                      </Form.Control.Feedback>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control
                        id="lastName"
                        value={billingInfo.lastName}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.lastName}
                      </Form.Control.Feedback>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label>Company Name (Optional)</Form.Label>
                      <Form.Control
                        id="company"
                        value={billingInfo.company}
                        onChange={handleInputChange}
                      />
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label>Country / Region *</Form.Label>
                      <Form.Select
                        id="country"
                        value={billingInfo.country}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                      </Form.Select>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Label>Street Address *</Form.Label>
                      <Form.Control
                        id="street"
                        value={billingInfo.street}
                        onChange={handleInputChange}
                        placeholder="House number and street name"
                        isInvalid={!!validationErrors.street}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.street}
                      </Form.Control.Feedback>
                    </Col>

                    <Col md={4} className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        id="city"
                        value={billingInfo.city}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.city}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.city}
                      </Form.Control.Feedback>
                    </Col>

                    <Col md={4} className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        id="state"
                        value={billingInfo.state}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.state}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.state}
                      </Form.Control.Feedback>
                    </Col>

                    <Col md={4} className="mb-3">
                      <Form.Label>Zip Code *</Form.Label>
                      <Form.Control
                        id="zip"
                        value={billingInfo.zip}
                        onChange={handleInputChange}
                        isInvalid={!!validationErrors.zip}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.zip}
                      </Form.Control.Feedback>
                    </Col>

                    <Col xs={12} className="mb-3">
                      <Form.Label>Order Notes (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        id="orderNotes"
                        rows={3}
                        value={billingInfo.orderNotes}
                        onChange={handleInputChange}
                        placeholder="Notes about your order, e.g. delivery instructions"
                      />
                    </Col>
                  </Row>
                </Form> */}
              </Card.Body>
            </Card>
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
                    <span>Discount</span>
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
                  <span>Tax (5%)</span>
                </div>
                <span className="price">₹ {taxAmount.toFixed(2)}</span>
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
                      id="cashfree"
                      name="payment"
                      onChange={() => setSelectedPaymentMethod("cashfree")}
                      checked={selectedPaymentMethod === "cashfree"}
                    />
                    <label htmlFor="cashfree" style={{ opacity: 0.9 }}>
                      Pay with Cashfree
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
      {/* Cashfree SDK */}
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
      />
    </div>
  );
};

export default CheckOutMain;
