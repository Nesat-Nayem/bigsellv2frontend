"use client";

import { useState, useEffect } from "react";
import BannerOne from "@/components/banner/BannerOne";
import FeatureOne from "@/components/feature/FeatureOne";
import HeaderOne from "@/components/header/HeaderOne";
import DiscountProduct from "@/components/product/DiscountProduct";
import FeatureProduct from "@/components/product/FeatureProduct";
import WeeklyBestSelling from "@/components/product/WeeklyBestSelling";
import FeatureDiscount from "@/components/product/FeatureDiscount";
import TrandingProduct from "@/components/product/TrandingProduct";
import BlogOne from "@/components/blog/BlogOne";
import FooterOne from "@/components/footer/FooterOne";
import FooterBanner from "@/components/footer/FooterBanner";
import { CartProvider } from "@/components/header/CartContext";
import { WishlistProvider } from "@/components/header/WishlistContext";
import { ToastContainer } from "react-toastify";
import HeaderTwo from "@/components/header/HeaderTwo";
import HeaderThree from "@/components/header/HeaderThree";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-start space-y-6 p-4">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Header Skeleton */}
        <div className="w-full max-w-6xl h-16 bg-gray-300 rounded animate-pulse"></div>

        {/* Banner Skeleton */}
        <div className="w-full max-w-6xl h-64 bg-gray-300 rounded-lg animate-pulse"></div>

        {/* Product Sections Skeleton */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-48 bg-gray-300 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>

        {/* Footer Banner Skeleton */}
        <div className="w-full max-w-6xl h-48 bg-gray-300 rounded-lg animate-pulse"></div>

        {/* Footer Skeleton */}
        <div className="w-full max-w-6xl h-32 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <WishlistProvider>
      <CartProvider>
        <div className="demo-one">
          <ToastContainer position="top-right" autoClose={3000} />
          <HeaderThree />
          <BannerOne />
          {/* <FeatureProduct /> */}
          {/* <DiscountProduct /> */}
          {/* <WeeklyBestSelling /> */}
          {/* <FeatureDiscount /> */}
          {/* <TrandingProduct /> */}
          {/* <BlogOne /> */}
          {/* <FeatureOne /> */}
          <FooterBanner />
          <FooterOne />
        </div>
      </CartProvider>
    </WishlistProvider>
  );
}
