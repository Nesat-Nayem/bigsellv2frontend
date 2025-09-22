"use client";
import HeaderOne from "@/components/header/HeaderOne";
import AboutBanner from "@/components/banner/AboutBanner";
import CounterOne from "@/components/counterup/CounterOne";
import AboutOne from "@/components/about/AboutOne";
import Team from "@/components/about/Team";
import ServiceOne from "@/components/service/ServiceOne";
import TestimonilsOne from "@/components/testimonials/TestimonilsOne";
import ShortService from "@/components/service/ShortService";
import { generalSettingsApi } from "@/store/generalSettings";
import FooterOne from "@/components/footer/FooterOne";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";

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

export default function Home() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const API = "/api"; // Use local proxy API

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const { data: settings } = generalSettingsApi.useGetGeneralSettingsQuery();
  console.log(settings);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log("Attempting login with:", formData);
      console.log("API URL:", `${API}/auth/signin`);
      
      const res = await axios.post(`${API}/auth/signin`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Login response:", res.data);

      if (res.data) {
        if (res.data.token) {
          localStorage.setItem("authToken", res.data.token);
          console.log("Token saved to localStorage");
          
          // Decode token and sync with Redux store
          const decoded = decodeToken(res.data.token);
          console.log("Decoded token:", decoded);
          
          if (decoded) {
            dispatch(setCredentials({ token: res.data.token, user: decoded }));
            console.log("Token synced to Redux store");
          }
        }
        setMessage("Login Successful!");
        setFormData({ email: "", password: "" });
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error response:", error.response);
      setMessage(
        error.response?.data?.message || "Invalid credentials, try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-one">
      <HeaderOne />

      <>
        <div className="rts-navigation-area-breadcrumb bg_light-1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="navigator-breadcrumb-wrapper">
                  <a href="/">Home</a>
                  <i className="fa-regular fa-chevron-right" />
                  <a className="current" href="register.html">
                    Log In
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="section-seperator bg_light-1">
          <div className="container">
            <hr className="section-seperator" />
          </div>
        </div>
        {/* rts register area start */}
        <div className="rts-register-area rts-section-gap bg_light-1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="registration-wrapper-1">
                  <div className="logo-area mb--0">
                    <img
                      className="mb--10"
                      src="https://res.cloudinary.com/drulco0au/image/upload/v1757665542/restaurant-uploads/ky5oucgmhlroyxcxstyr.png"
                      alt="logo"
                    />
                  </div>
                  <h3 className="title">Login Into Your Account</h3>
                  <form onSubmit={handleSubmit} className="registration-form">
                    <div className="input-wrapper">
                      <label htmlFor="email">Email*</label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="input-wrapper">
                      <label htmlFor="password">Password*</label>
                      <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="rts-btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login Account"}
                    </button>
                    {message && (
                      <p
                        style={{
                          marginTop: "10px",
                          color: message.startsWith("") ? "green" : "red",
                        }}
                      >
                        {message}
                      </p>
                    )}

                    <div className="another-way-to-registration">
                      <div className="registradion-top-text">
                        <span>Or Register With</span>
                      </div>
                      <div className="login-with-brand">
                        <a href="#" className="single">
                          <img
                            src="assets/images/form/google.svg"
                            alt="login"
                          />
                        </a>
                        <a href="#" className="single">
                          <img
                            src="assets/images/form/facebook.svg"
                            alt="login"
                          />
                        </a>
                      </div>
                      <p>
                        Don't have Acocut? <a href="/register">Registration</a>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* rts register area end */}
      </>

      <ShortService />
      <FooterOne />
    </div>
  );
}
