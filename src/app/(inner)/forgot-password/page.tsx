"use client";
import React, { useState } from "react";
import HeaderThree from "@/components/header/HeaderThree";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const API = "/api";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/auth/forgot-password-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || "Failed to send reset code");
      setMessage("Reset code sent to your email. Check your inbox.");
      // Navigate user to reset page after a short delay with email prefilled
      setTimeout(() => {
        window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
      }, 800);
    } catch (err: any) {
      setMessage(err?.message || "Failed to send reset code");
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
            <span className="fw-semibold">Forgot Password</span>
          </div>
        </div>
      </div>

      <div className="rts-register-area rts-section-gap bg_light-1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="registration-wrapper-1 card p-5 shadow-lg border-0 rounded-4">
                <h3 className="title mb-4">Forgot your password?</h3>
                <p className="text-muted mb-4">Enter your account email and we'll send you a 4-digit code to reset your password.</p>
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
                  <button type="submit" className="rts-btn btn-primary" disabled={loading}>
                    {loading ? "Sending..." : "Send reset code"}
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
