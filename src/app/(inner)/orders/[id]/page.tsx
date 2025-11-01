"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import { RootState } from "@/store";
import { useGetOrderByIdQuery, useTrackDelhiveryQuery } from "@/store/ordersApi";
import HeaderThree from "@/components/header/HeaderThree";
import { useCart } from "@/components/header/CartContext";

// Decode JWT from localStorage to rehydrate auth on hard-refresh
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

function formatCurrency(amount?: number) {
  if (typeof amount !== "number") return "-";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹ ${amount.toFixed(2)}`;
  }
}

function StatusBadge({ value }: { value?: string }) {
  if (!value) return null;
  const color = {
    pending: "warning",
    confirmed: "info",
    processing: "info",
    shipped: "primary",
    delivered: "success",
    cancelled: "danger",
    returned: "secondary",
  } as Record<string, string>;
  const cls = color[value] || "secondary";
  return <span className={`badge bg-${cls} text-capitalize`}>{value}</span>;
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const id = params?.id;
  const { clearCart, isCartLoaded } = useCart();
  const [shouldTrack, setShouldTrack] = React.useState(false);

  // Ensure auth token exists in Redux on direct page load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const localToken = localStorage.getItem("authToken");
    if (!localToken) {
      router.push("/login");
      return;
    }
    if (!token) {
      const decoded = decodeToken(localToken);
      dispatch(
        setCredentials({ token: localToken, user: decoded || undefined })
      );
    }
  }, [token, dispatch, router]);

  const {
    data: order,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetOrderByIdQuery(id, {
    skip: !id || !token,
  });

  const {
    data: trackData,
    isLoading: trackLoading,
    error: trackError,
  } = useTrackDelhiveryQuery(
    { id: id || "" },
    {
      skip: !id || !token || !shouldTrack || !order?.trackingNumber,
    }
  );

  const isAuthError = useMemo(() => {
    // RTK Query error shape may vary; handle common cases
    const anyErr = error as any;
    const status = anyErr?.status || anyErr?.originalStatus;
    return status === 401;
  }, [error]);

  useEffect(() => {
    if (isAuthError) router.push("/login");
  }, [isAuthError, router]);

  // If token becomes available after hydration, refetch once
  useEffect(() => {
    if (id && token) {
      refetch();
    }
  }, [id, token, refetch]);

  // Clear cart when arriving from Cashfree with payment=success (run once per order id)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!id) return;
    if (!isCartLoaded) return;
    const payment = searchParams?.get("payment");
    if (payment === "success") {
      const key = `cartClearedForOrder:${id}`;
      try {
        if (!sessionStorage.getItem(key)) {
          clearCart();
          sessionStorage.setItem(key, "1");
          // notify any listeners to refresh cart UI
          window.dispatchEvent(new Event("refreshCart"));
        }
      } catch {
        // no-op
      }
    }
  }, [id, searchParams, clearCart, isCartLoaded]);

  // Clear cart if the fetched order is already paid (safety net)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!id) return;
    if (!isCartLoaded) return;
    const paid = (order as any)?.paymentStatus === "paid" || (order as any)?.paymentInfo?.status === "completed";
    if (paid) {
      const key = `cartClearedForOrder:${id}`;
      try {
        if (!sessionStorage.getItem(key)) {
          clearCart();
          sessionStorage.setItem(key, "1");
          window.dispatchEvent(new Event("refreshCart"));
        }
      } catch {
        // no-op
      }
    }
  }, [id, order, clearCart, isCartLoaded]);

  return (
    <div className="demo-one">
      <HeaderThree />

      <div className="rts-section-gap">
        <div className="container-2">
          <div className="row mb-3">
            <div className="col-12 d-flex align-items-center justify-content-between">
              <div>
                <h2 className="mb-1">Order Details</h2>
                <div className="text-muted small">
                  {order?.orderNumber ? (
                    <>
                      <span className="me-2">Order</span>
                      <strong>{order.orderNumber}</strong>
                    </>
                  ) : id ? (
                    <>
                      <span className="me-2">Order</span>
                      <strong>#{String(id).slice(-6)}</strong>
                    </>
                  ) : null}
                  {order?.createdAt && (
                    <span className="ms-3">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="rts-btn btn-primary radious-sm with-icon"
                  onClick={() => window.print()}
                >
                  <div className="btn-text">Print</div>
                  <div className="arrow-icon">
                    <i className="fa-regular fa-print" />
                  </div>
                </button>
                <Link
                  href="/account"
                  className="rts-btn btn-secondary radious-sm"
                >
                  Back to Account
                </Link>
              </div>
            </div>
          </div>

          {(isLoading || isFetching) && (
            <div className="row">
              <div className="col-12">
                <div className="alert alert-info">Loading order…</div>
              </div>
            </div>
          )}

          {error && !isAuthError && (
            <div className="row">
              <div className="col-12">
                <div className="alert alert-danger">
                  Failed to load order. Please try again.
                </div>
              </div>
            </div>
          )}

          {order && (
            <div className="row g-4">
              {/* Order summary */}
              <div className="col-lg-4">
                <div className="card p-4 h-100">
                  <h5 className="mb-3">Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Status</span>
                    <StatusBadge value={order.status} />
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Payment</span>
                    <span className="text-capitalize badge bg-light text-dark">
                      {order.paymentStatus || order.paymentInfo?.status || "-"}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-1">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(order.subtotal)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Shipping</span>
                    <strong>{formatCurrency(order.shippingCost)}</strong>
                  </div>
                  {/* <div className="d-flex justify-content-between mb-1">
                    <span>Tax</span>
                    <strong>{formatCurrency(order.tax)}</strong>
                  </div> */}
                  {order.discount ? (
                    <div className="d-flex justify-content-between mb-1">
                      <span>Discount</span>
                      <strong>-{formatCurrency(order.discount)}</strong>
                    </div>
                  ) : null}
                  <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                    <span>Total</span>
                    <strong className="fs-5">
                      {formatCurrency(order.totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="col-lg-8">
                <div className="card p-4 h-100">
                  <h5 className="mb-3">Items ({order.items?.length || 0})</h5>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((it: any, idx: number) => {
                          const thumb =
                            it?.thumbnail ||
                            it?.product?.thumbnail ||
                            "/assets/images/placeholder.png";
                          const name = it?.name || it?.product?.name || "-";
                          const price = it?.price ?? it?.product?.price;
                          const qty = it?.quantity ?? 1;
                          const sub =
                            it?.subtotal ??
                            (typeof price === "number"
                              ? price * qty
                              : undefined);
                          return (
                            <tr key={idx}>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  <img
                                    src={thumb}
                                    alt={name}
                                    style={{
                                      width: 56,
                                      height: 56,
                                      objectFit: "cover",
                                      borderRadius: 8,
                                    }}
                                  />
                                  <div>
                                    <div className="fw-semibold">{name}</div>
                                    {it?.selectedColor && (
                                      <div className="text-muted small">
                                        Color: {it.selectedColor}
                                      </div>
                                    )}
                                    {it?.selectedSize && (
                                      <div className="text-muted small">
                                        Size: {it.selectedSize}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>{formatCurrency(price)}</td>
                              <td>{qty}</td>
                              <td className="text-end">
                                {formatCurrency(sub)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="col-lg-6">
                <div className="card p-4 h-100">
                  <h5 className="mb-3">Shipping Address</h5>
                  <AddressBlock data={order.shippingAddress as any} />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card p-4 h-100">
                  <h5 className="mb-3">Billing Address</h5>
                  <AddressBlock data={order.billingAddress as any} />
                </div>
              </div>

              {/* Payment & Shipping */}
              <div className="col-lg-6">
                <div className="card p-4 h-100">
                  <h5 className="mb-3">Payment</h5>
                  <div className="mb-2">
                    Method: {order.paymentInfo?.method || "-"}
                  </div>
                  <div className="mb-2">
                    Status:{" "}
                    {order.paymentInfo?.status || order.paymentStatus || "-"}
                  </div>
                  {order.paymentInfo?.transactionId && (
                    <div className="mb-2">
                      Txn ID: {order.paymentInfo.transactionId}
                    </div>
                  )}
                  {order.paymentInfo?.paymentDate && (
                    <div className="mb-2">
                      Paid On:{" "}
                      {new Date(order.paymentInfo.paymentDate).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card p-4 h-100">
                  <h5 className="mb-3">Shipping</h5>
                  <div className="mb-2">
                    Method: {order.shippingMethod || "-"}
                  </div>
                  {order.trackingNumber && (
                    <>
                      <div className="mb-2">Tracking: {order.trackingNumber}</div>
                      <button
                        className="rts-btn btn-primary radious-sm with-icon mt-2"
                        onClick={() => setShouldTrack(true)}
                        disabled={trackLoading}
                      >
                        <div className="btn-text">
                          {trackLoading ? "Loading..." : "Track Shipment"}
                        </div>
                        <div className="arrow-icon">
                          <i className="fa-regular fa-location-dot" />
                        </div>
                      </button>
                    </>
                  )}
                  {order.estimatedDelivery && (
                    <div className="mb-2 mt-2">
                      ETA:{" "}
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Information */}
              {trackData && shouldTrack && (
                <div className="col-12">
                  <TrackingDisplay trackingData={trackData} />
                </div>
              )}

              {/* Status History */}
              <div className="col-12">
                <div className="card p-4">
                  <h5 className="mb-3">Status History</h5>
                  {(order as any)?.statusHistory?.length ? (
                    <ul className="list-unstyled m-0">
                      {(order as any).statusHistory.map((h: any, i: number) => (
                        <li
                          key={i}
                          className="d-flex align-items-start gap-3 mb-2"
                        >
                          <i className="fa-regular fa-circle-check text-success mt-1" />
                          <div>
                            <div className="fw-semibold text-capitalize">
                              {h.status}
                            </div>
                            <div className="text-muted small">
                              {new Date(h.timestamp).toLocaleString()}{" "}
                              {h.note ? `— ${h.note}` : ""}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted">No history available.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FooterOne />
    </div>
  );
}

function TrackingDisplay({ trackingData }: { trackingData: any }) {
  const shipment =
    trackingData?.ShipmentData?.[0]?.Shipment ||
    trackingData?.Shipment ||
    {};
  const status = shipment.Status || {};
  const scans = shipment.Scans || [];
  const consignee = shipment.Consignee || {};

  const getStatusColor = (statusCode: string) => {
    if (!statusCode) return "secondary";
    if (statusCode.includes("DLV") || statusCode.includes("OK"))
      return "success";
    if (statusCode.includes("RTO") || statusCode.includes("LOST"))
      return "danger";
    if (statusCode.includes("OFD") || statusCode.includes("UD"))
      return "primary";
    if (statusCode.includes("PP")) return "info";
    return "warning";
  };

  const statusColor = getStatusColor(status.StatusCode);

  return (
    <div className="card p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="mb-1">Shipment Tracking</h5>
          <div className="text-muted small">AWB: {shipment.AWB}</div>
        </div>
        <span className={`badge bg-${statusColor} text-uppercase px-3 py-2`}>
          {status.Status || "Unknown"}
        </span>
      </div>

      {/* Current Status */}
      <div className="mb-4 p-3 bg-light rounded">
        <div className="d-flex align-items-start gap-3">
          <div className="mt-1">
            <i
              className={`fa-solid fa-box text-${statusColor}`}
              style={{ fontSize: "24px" }}
            />
          </div>
          <div className="flex-grow-1">
            <div className="fw-semibold text-dark mb-1">{status.Status}</div>
            <div className="text-muted small mb-2">
              {status.Instructions || "No additional information"}
            </div>
            <div className="d-flex gap-3 flex-wrap small">
              <span>
                <i className="fa-regular fa-location-dot me-1" />
                {status.StatusLocation || "N/A"}
              </span>
              {status.StatusDateTime && (
                <span>
                  <i className="fa-regular fa-clock me-1" />
                  {new Date(status.StatusDateTime).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="small text-muted">Order Type</div>
          <div className="fw-medium">{shipment.OrderType || "N/A"}</div>
        </div>
        <div className="col-md-6">
          <div className="small text-muted">Reference Number</div>
          <div className="fw-medium">{shipment.ReferenceNo || "N/A"}</div>
        </div>
        <div className="col-md-6">
          <div className="small text-muted">Destination</div>
          <div className="fw-medium">{shipment.Destination || "N/A"}</div>
        </div>
        <div className="col-md-6">
          <div className="small text-muted">Quantity</div>
          <div className="fw-medium">{shipment.Quantity || "N/A"}</div>
        </div>
      </div>

      {/* Consignee Details */}
      {consignee.Name && (
        <div className="mb-4">
          <h6 className="text-muted mb-2">Delivery Address</h6>
          <div className="p-2 bg-light rounded small">
            <div className="fw-medium">{consignee.Name}</div>
            <div>
              {consignee.City}, {consignee.State} - {consignee.PinCode}
            </div>
            <div>{consignee.Country}</div>
          </div>
        </div>
      )}

      {/* Tracking Timeline */}
      {scans.length > 0 && (
        <div>
          <h6 className="text-muted mb-3">Shipment Journey</h6>
          <div className="position-relative" style={{ paddingLeft: "2rem" }}>
            {/* Timeline line */}
            <div
              className="position-absolute"
              style={{
                left: "11px",
                top: "8px",
                bottom: "8px",
                width: "2px",
                background: "#dee2e6",
              }}
            />

            {scans.map((scan: any, idx: number) => {
              const detail = scan.ScanDetail || {};
              const scanColor = getStatusColor(detail.StatusCode);
              return (
                <div key={idx} className="position-relative mb-3 pb-3">
                  {/* Timeline dot */}
                  <div
                    className="position-absolute bg-white"
                    style={{ left: "-1.55rem", top: "0" }}
                  >
                    <div
                      className={`rounded-circle bg-${scanColor} d-flex align-items-center justify-content-center`}
                      style={{ width: "22px", height: "22px" }}
                    >
                      <i
                        className="fa-solid fa-check text-white"
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                  </div>

                  <div className="ps-2">
                    <div className="fw-medium text-dark">{detail.Scan}</div>
                    <div className="text-muted small">{detail.Instructions}</div>
                    <div className="mt-1 small">
                      <span className="text-muted">
                        <i className="fa-regular fa-location-dot me-1" />
                        {detail.ScannedLocation}
                      </span>
                      <span className="text-muted ms-3">
                        <i className="fa-regular fa-clock me-1" />
                        {new Date(detail.ScanDateTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AddressBlock({ data }: { data?: any }) {
  if (!data) return <div className="text-muted">No address provided.</div>;
  return (
    <address className="mb-0">
      <div className="fw-semibold">{data.fullName}</div>
      {data.phone && <div>Phone: {data.phone}</div>}
      {data.email && <div>Email: {data.email}</div>}
      <div>
        {data.addressLine1}
        {data.addressLine2 ? `, ${data.addressLine2}` : ""}
      </div>
      <div>
        {data.city}
        {data.state ? `, ${data.state}` : ""}
        {data.postalCode ? `, ${data.postalCode}` : ""}
      </div>
      {data.country && <div>{data.country}</div>}
    </address>
  );
}
