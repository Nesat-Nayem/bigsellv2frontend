"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetMyOrdersQuery } from "@/store/ordersApi";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, clearCredentials, setUser } from "@/store/authSlice";
import { 
  useGetMyProfileQuery, 
  useUpdateMyProfileMutation, 
  useChangePasswordMutation 
} from "@/store/userApi";
import {
  useGetMyAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  type IAddress,
} from "@/store/addressApi";
import { toast } from "react-toastify";

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
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check for tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [user, setUserState] = useState<any>(null);

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
      setUserState((prev: any) => prev || decoded);
      dispatch(setCredentials({ token, user: decoded }));
    }
  }, [router, dispatch]);

  // API Hooks
  const { data: orders = [], isLoading: ordersLoading } = useGetMyOrdersQuery();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetMyProfileQuery();
  const { data: addresses = [], isLoading: addressesLoading, refetch: refetchAddresses } = useGetMyAddressesQuery();
  
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateMyProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [createAddress, { isLoading: creatingAddress }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: updatingAddress }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Address form state
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

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Update profile form when data loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(clearCredentials());
    router.push("/login");
  };

  // Profile update handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateProfile(profileForm).unwrap();
      
      // Update token if returned
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        dispatch(setCredentials({ token: result.token, user: result.user }));
      }
      
      toast.success("Profile updated successfully!");
      refetchProfile();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  // Address save handler
  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAddressId) {
        await updateAddress({ id: editingAddressId, data: addressForm }).unwrap();
        toast.success("Address updated successfully!");
      } else {
        await createAddress(addressForm as IAddress).unwrap();
        toast.success("Address created successfully!");
      }
      
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();
      refetchAddresses();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save address");
    }
  };

  const handleEditAddress = (address: IAddress) => {
    setAddressForm(address);
    setEditingAddressId(address._id || null);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await deleteAddress(id).unwrap();
      toast.success("Address deleted successfully!");
      refetchAddresses();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultAddress(id).unwrap();
      toast.success("Default address updated!");
      refetchAddresses();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to set default address");
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
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
  };

  if (ordersLoading || profileLoading) {
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
                className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <i className="fa-regular fa-chart-line"></i> Dashboard
              </button>
              <button
                className={`nav-link ${activeTab === "order" ? "active" : ""}`}
                onClick={() => setActiveTab("order")}
              >
                <i className="fa-regular fa-bag-shopping"></i> Orders
              </button>
              <button
                className={`nav-link ${activeTab === "address" ? "active" : ""}`}
                onClick={() => setActiveTab("address")}
              >
                <i className="fa-regular fa-location-dot"></i> Addresses
              </button>
              <button
                className={`nav-link ${activeTab === "account" ? "active" : ""}`}
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
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="dashboard-account-area">
                  <h2 className="title">
                    Hello {profile?.name || user?.name || "User"}!{" "}
                    <a href="#" onClick={handleLogout}>
                      Log Out.
                    </a>
                  </h2>
                  <p className="disc">
                    From your account dashboard you can view your recent orders,
                    manage your shipping addresses, and edit your password and account details.
                  </p>
                </div>
              )}

              {/* Orders Tab */}
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
                                  ? `₹ ${o.totalAmount} for ${o.items?.length || 0} item(s)`
                                  : "-"}
                              </td>
                              <td>
                                <Link href={`/orders/${o._id}`} className="btn-small d-block">
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

              {/* Addresses Tab */}
              {activeTab === "address" && (
                <div className="address-management-area">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="title mb-0">My Addresses</h2>
                    <button 
                      className="rts-btn btn-primary"
                      onClick={() => {
                        resetAddressForm();
                        setEditingAddressId(null);
                        setShowAddressForm(true);
                      }}
                    >
                      <i className="fa fa-plus"></i> Add New Address
                    </button>
                  </div>

                  {showAddressForm && (
                    <div className="address-form-wrapper mb-4 p-4 border rounded">
                      <h4>{editingAddressId ? "Edit Address" : "Add New Address"}</h4>
                      <form onSubmit={handleAddressSave}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label>Full Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.fullName || ""}
                              onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label>Phone *</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={addressForm.phone || ""}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label>Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={addressForm.email || ""}
                              onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label>Address Type</label>
                            <select
                              className="form-control"
                              value={addressForm.addressType || "home"}
                              onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value as any })}
                            >
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="col-12 mb-3">
                            <label>Address Line 1 *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.addressLine1 || ""}
                              onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-12 mb-3">
                            <label>Address Line 2</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.addressLine2 || ""}
                              onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label>City *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.city || ""}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label>State *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.state || ""}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label>Postal Code *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.postalCode || ""}
                              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label>Country *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressForm.country || "India"}
                              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="form-check mt-4">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="isDefault"
                                checked={addressForm.isDefault || false}
                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                              />
                              <label className="form-check-label" htmlFor="isDefault">
                                Set as default address
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button 
                            type="submit" 
                            className="rts-btn btn-primary"
                            disabled={creatingAddress || updatingAddress}
                          >
                            {creatingAddress || updatingAddress ? "Saving..." : "Save Address"}
                          </button>
                          <button 
                            type="button" 
                            className="rts-btn btn-secondary"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddressId(null);
                              resetAddressForm();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="row">
                    {addressesLoading ? (
                      <div>Loading addresses...</div>
                    ) : addresses && addresses.length > 0 ? (
                      addresses.map((addr) => (
                        <div key={addr._id} className="col-md-6 mb-3">
                          <div className={`address-card p-3 border rounded ${addr.isDefault ? "border-primary" : ""}`}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="mb-0">
                                {addr.fullName}
                                {addr.isDefault && (
                                  <span className="badge bg-primary ms-2">Default</span>
                                )}
                              </h5>
                              <span className="badge bg-secondary">{addr.addressType}</span>
                            </div>
                            <p className="mb-1">{addr.addressLine1}</p>
                            {addr.addressLine2 && <p className="mb-1">{addr.addressLine2}</p>}
                            <p className="mb-1">{addr.city}, {addr.state} {addr.postalCode}</p>
                            <p className="mb-1">{addr.country}</p>
                            <p className="mb-1">Phone: {addr.phone}</p>
                            {addr.email && <p className="mb-1">Email: {addr.email}</p>}
                            
                            <div className="d-flex gap-2 mt-3">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditAddress(addr)}
                              >
                                Edit
                              </button>
                              {!addr.isDefault && (
                                <button 
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleSetDefaultAddress(addr._id!)}
                                >
                                  Set Default
                                </button>
                              )}
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteAddress(addr._id!)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <p>No addresses found. Add your first address above.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Details Tab */}
              {activeTab === "account" && (
                <div className="account-details-area">
                  <h2 className="title mb-4">Account Details</h2>
                  
                  {/* Profile Update Form */}
                  <div className="profile-form-wrapper mb-5">
                    <h4>Update Profile</h4>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <label>Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Email *</label>
                          <input
                            type="email"
                            className="form-control"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Phone *</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="rts-btn btn-primary"
                        disabled={updatingProfile}
                      >
                        {updatingProfile ? "Updating..." : "Update Profile"}
                      </button>
                    </form>
                  </div>

                  {/* Password Change Form */}
                  <div className="password-form-wrapper">
                    <h4>Change Password</h4>
                    <form onSubmit={handlePasswordChange}>
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <label>Current Password *</label>
                          <input
                            type="password"
                            className="form-control"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>New Password *</label>
                          <input
                            type="password"
                            className="form-control"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Confirm New Password *</label>
                          <input
                            type="password"
                            className="form-control"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="rts-btn btn-primary"
                        disabled={changingPassword}
                      >
                        {changingPassword ? "Changing..." : "Change Password"}
                      </button>
                    </form>
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
