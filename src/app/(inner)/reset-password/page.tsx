"use client";
import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HeaderThree from "@/components/header/HeaderThree";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const initialEmail = params.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const API = "/api";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/auth/reset-password-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || "Failed to reset password");
      setMessage("Password reset successfully. Redirecting to login...");
      setTimeout(() => { window.location.href = "/login"; }, 1000);
    } catch (err: any) {
      setMessage(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-one">
      <HeaderThree />

      <div className="rts-navigation-area-breadcrumb bg_light-1">
        <div className="container">
          <div className="navigator-breadcrumb-wrapper">
            <a href="/" className="text-muted">Home</a>
            <i className="fa-regular fa-chevron-right mx-2 text-muted" />
            <span className="fw-semibold">Reset Password</span>
          </div>
        </div>
      </div>

      <div className="rts-register-area rts-section-gap bg_light-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="registration-wrapper-1 card p-5 shadow-lg border-0 rounded-4">
                <h3 className="title mb-4">Reset your password</h3>
                <form onSubmit={onSubmit} className="registration-form">
                  <div className="input-wrapper mb-3">
                    <label htmlFor="email">Email*</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-wrapper mb-3">
                    <label htmlFor="otp">Reset Code (4 digits)*</label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={4}
                    />
                  </div>
                  <div className="input-wrapper mb-3">
                    <label htmlFor="newPassword">New Password*</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <button type="submit" className="rts-btn btn-primary" disabled={loading}>
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                  {message && (
                    <p style={{ marginTop: 12 }} className={message.toLowerCase().includes("failed") ? "text-danger" : "text-success"}>
                      {message}
                    </p>
                  )}
                </form>
                <div className="mt-3">
                  <a href="/login" className="text-primary text-decoration-underline">Back to login</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShortService />
      <FooterOne />
    </div>
  );
}
