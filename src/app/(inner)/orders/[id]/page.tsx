"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import { RootState } from "@/store";
import { useGetOrderByIdQuery } from "@/store/ordersApi";

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
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const id = params?.id;

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
      dispatch(setCredentials({ token: localToken, user: decoded || undefined }));
    }
  }, [token, dispatch, router]);

  const { data: order, isLoading, isFetching, error, refetch } = useGetOrderByIdQuery(id, {
    skip: !id || !token,
  });

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

  return (
    <div className="demo-one">
      <HeaderOne />

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
                <Link href="/account" className="rts-btn btn-secondary radious-sm">
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
                  <div className="d-flex justify-content-between mb-1">
                    <span>Tax</span>
                    <strong>{formatCurrency(order.tax)}</strong>
                  </div>
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
                          const thumb = it?.thumbnail || it?.product?.thumbnail || "/assets/images/placeholder.png";
                          const name = it?.name || it?.product?.name || "-";
                          const price = it?.price ?? it?.product?.price;
                          const qty = it?.quantity ?? 1;
                          const sub = it?.subtotal ?? (typeof price === "number" ? price * qty : undefined);
                          return (
                            <tr key={idx}>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  <img
                                    src={thumb}
                                    alt={name}
                                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                                  />
                                  <div>
                                    <div className="fw-semibold">{name}</div>
                                    {it?.selectedColor && (
                                      <div className="text-muted small">Color: {it.selectedColor}</div>
                                    )}
                                    {it?.selectedSize && (
                                      <div className="text-muted small">Size: {it.selectedSize}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>{formatCurrency(price)}</td>
                              <td>{qty}</td>
                              <td className="text-end">{formatCurrency(sub)}</td>
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
                  <div className="mb-2">Method: {order.paymentInfo?.method || "-"}</div>
                  <div className="mb-2">Status: {order.paymentInfo?.status || order.paymentStatus || "-"}</div>
                  {order.paymentInfo?.transactionId && (
                    <div className="mb-2">Txn ID: {order.paymentInfo.transactionId}</div>
                  )}
                  {order.paymentInfo?.paymentDate && (
                    <div className="mb-2">
                      Paid On: {new Date(order.paymentInfo.paymentDate).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card p-4 h-100">
                  <h5 className="mb-3">Shipping</h5>
                  <div className="mb-2">Method: {order.shippingMethod || "-"}</div>
                  {order.trackingNumber && (
                    <div className="mb-2">Tracking: {order.trackingNumber}</div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="mb-2">
                      ETA: {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Status History */}
              <div className="col-12">
                <div className="card p-4">
                  <h5 className="mb-3">Status History</h5>
                  {(order as any)?.statusHistory?.length ? (
                    <ul className="list-unstyled m-0">
                      {(order as any).statusHistory.map((h: any, i: number) => (
                        <li key={i} className="d-flex align-items-start gap-3 mb-2">
                          <i className="fa-regular fa-circle-check text-success mt-1" />
                          <div>
                            <div className="fw-semibold text-capitalize">{h.status}</div>
                            <div className="text-muted small">
                              {new Date(h.timestamp).toLocaleString()} {h.note ? `— ${h.note}` : ""}
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
