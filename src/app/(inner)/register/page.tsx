"use client";

import { useState } from "react";
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import axios from "axios";
import FooterOne from "@/components/footer/FooterOne";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "https://backend-node-vercel-bigsell.vercel.app//auth/signup",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data) {
        setMessage("Registerd Successfully");
        setFormData({ name: "", email: "", password: "", phone: "" });
        window.location.href = "/login";
      }
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Something went wrong, try again."
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
                    Register
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
                      src="assets/images/logo/fav.png"
                      alt="logo"
                    />
                  </div>
                  <h3 className="title">Register Into Your Account</h3>
                  <form onSubmit={handleSubmit} className="registration-form">
                    <div className="input-wrapper">
                      <label htmlFor="name">Username*</label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
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
                    <div className="input-wrapper">
                      <label htmlFor="phone">Phone*</label>
                      <input
                        type="text"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="rts-btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Register Account"}
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
                        Already Have Account? <a href="/login">Login</a>
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
