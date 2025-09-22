"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetMyOrdersQuery } from "@/store/ordersApi"; // <-- import RTK hook
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "@/store/authSlice";

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

const AccountTabs = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("dashboard");

  const [user, setUser] = useState<any>(null);

  // Grab token for auth check
  useEffect(() => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("authToken");

    if (!token) {
      router.push("/login");
      return;
    }

    const decoded = decodeToken(token);
    if (decoded) {
      setUser((prev: any) => prev || decoded);
      // Sync with Redux store
      dispatch(setCredentials({ token, user: decoded }));
    }
  }, [router, dispatch]);

  // 🔥 Orders via RTK Query
  const { data: orders = [], error, isLoading } = useGetMyOrdersQuery();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(clearCredentials());
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="account-tab-area-start rts-section-gap">
        <div className="container-2">
          <div>Loading account…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-tab-area-start rts-section-gap">
      <div className="container-2">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="nav accout-dashborard-nav flex-column nav-pills me-3">
              <button
                className={`nav-link ${
                  activeTab === "dashboard" ? "active" : ""
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <i className="fa-regular fa-chart-line"></i> Dashboard
              </button>
              <button
                className={`nav-link ${activeTab === "order" ? "active" : ""}`}
                onClick={() => setActiveTab("order")}
              >
                <i className="fa-regular fa-bag-shopping"></i> Order
              </button>
              {/* <button
                className={`nav-link ${activeTab === "track" ? "active" : ""}`}
                onClick={() => setActiveTab("track")}
              >
                <i className="fa-regular fa-tractor"></i> Track Your Order
              </button> */}
              {/* <button
                className={`nav-link ${
                  activeTab === "address" ? "active" : ""
                }`}
                onClick={() => setActiveTab("address")}
              >
                <i className="fa-regular fa-location-dot"></i> My Address
              </button> */}
              <button
                className={`nav-link ${
                  activeTab === "account" ? "active" : ""
                }`}
                onClick={() => setActiveTab("account")}
              >
                <i className="fa-regular fa-user"></i> Account Details
              </button>
              <button className="nav-link" onClick={handleLogout}>
                <i className="fa-light fa-right-from-bracket" /> Log Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="col-lg-9 pl--50 pl_md--10 pl_sm--10 pt_md--30 pt_sm--30">
            <div className="tab-content">
              {/* {error && (
                <div className="alert alert-danger" role="alert">
                  Failed to fetch orders.
                </div>
              )} */}

              {activeTab === "dashboard" && (
                <div className="dashboard-account-area">
                  <h2 className="title">
                    Hello {user?.firstName || user?.name || user?.email}!{" "}
                    <a href="#" onClick={handleLogout}>
                      Log Out.
                    </a>
                  </h2>
                  <p className="disc">
                    From your account dashboard you can view your recent orders,
                    manage your shipping and billing addresses, and edit your
                    password and account details.
                  </p>
                </div>
              )}

              {activeTab === "order" && (
                <div className="order-table-account">
                  <div className="h2 title">Your Orders</div>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders && orders.length > 0 ? (
                          orders.map((o) => (
                            <tr key={o._id || null}>
                              <td>{o.orderNumber || `#${o._id?.slice(-6)}`}</td>
                              <td>
                                {o.createdAt
                                  ? new Date(o.createdAt).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td>{o.status}</td>
                              <td>
                                {o.totalAmount
                                  ? `₹ ${o.totalAmount} for ${
                                      o.items?.length || 0
                                    } item(s)`
                                  : "-"}
                              </td>
                              <td>
                                <Link
                                  href={`/orders/${o._id}`}
                                  className="btn-small d-block"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5}>No orders found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTabs;
