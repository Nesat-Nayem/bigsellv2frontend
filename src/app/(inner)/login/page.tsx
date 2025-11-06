"use client";
import ShortService from "@/components/service/ShortService";
import { generalSettingsApi } from "@/store/generalSettings";
import FooterOne from "@/components/footer/FooterOne";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import HeaderThree from "@/components/header/HeaderThree";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";

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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setMessage("");

    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();
      console.log("Google Sign-In successful:", user.email);

      // Send token to backend directly (no phone required)
      await sendGoogleTokenToBackend(idToken, "");
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      setMessage(
        error.message || "Failed to sign in with Google. Please try again."
      );
      setGoogleLoading(false);
    }
  };

  // Send Google token to backend (phone is optional)
  const sendGoogleTokenToBackend = async (
    idToken: string,
    phone: string
  ) => {
    try {
      const res = await axios.post(
        `${API}/auth/google-signin`,
        { idToken, phone: phone || undefined }, // Send phone only if provided
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Google login response:", res.data);

      if (res.data?.data?.token) {
        localStorage.setItem("authToken", res.data.data.token);

        // Decode and sync with Redux
        const decoded = decodeToken(res.data.data.token);
        if (decoded) {
          dispatch(
            setCredentials({ token: res.data.data.token, user: decoded })
          );
        }

        setMessage("Login Successful with Google!");

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error: any) {
      console.error("Backend Google auth error:", error);
      setMessage(
        error.response?.data?.message ||
          "Failed to authenticate with backend. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="demo-one">
      <HeaderThree />

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
                    <div className="d-flex justify-content-end mb-3">
                      <a href="/forgot-password" className="text-primary text-decoration-underline">
                        Forgot password?
                      </a>
                    </div>
                    <button
                      type="submit"
                      className="rts-btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login Account"}
                    </button>

                    {/* Divider */}
                    <div className="text-center my-3">
                      <span className="text-muted">OR</span>
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="rts-btn btn-outline-primary w-100"
                      disabled={googleLoading}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        color: "#333",
                      }}
                    >
                      {googleLoading ? (
                        "Signing in..."
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 48 48">
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                            <path fill="none" d="M0 0h48v48H0z" />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </button>

                    {message && (
                      <p
                        style={{
                          marginTop: "10px",
                          color: message.includes("Successful") ? "green" : "red",
                        }}
                      >
                        {message}
                      </p>
                    )}

                    <div className="another-way-to-registration">
     
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
