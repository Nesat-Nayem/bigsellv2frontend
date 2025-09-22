"use client";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";

function DemoContent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-node-vercel-bigsell.vercel.app/";

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
      const res = await axios.post(`${API}/auth/signin`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data) {
        if (res.data.token) {
          localStorage.setItem("authToken", res.data.token);
        }
        setMessage("Login Successful!");
        setFormData({ email: "", password: "" });
        window.location.href = "/";
      }
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Invalid credentials, try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body-root-inner">
      <div className="registration-wrapper-1">
        <div className="logo-area mb--0">
          <img
            className="mb--10"
            src="/assets/images/logo/fav.png"
            alt="logo"
          />
        </div>
        <h3 className="title animated fadeIn">Login Into Your Account</h3>
        <form action="#" className="registration-form">
          <div className="input-wrapper">
            <label htmlFor="email">Email*</label>
            <input type="email" id="email" />
          </div>
          <div className="input-wrapper">
            <label htmlFor="password">Password*</label>
            <input type="password" id="password" />
          </div>
          <button className="rts-btn btn-primary">Login Account</button>
          <div className="another-way-to-registration">
            <div className="registradion-top-text">
              <span>Or Register With</span>
            </div>
            <div className="login-with-brand">
              <a href="#" className="single">
                <img src="/assets/images/form/google.svg" alt="login" />
              </a>
              <a href="#" className="single">
                <img src="/assets/images/form/facebook.svg" alt="login" />
              </a>
            </div>
            <p>
              Already Have Account? <a href="#">Login</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DemoContent;
