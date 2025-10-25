"use client";
import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import FeaturedGlosary from "../product-main/FeaturedGlosary";
import { useGetFeaturedProductsQuery, IProducts } from "@/store/productApi";
import DiscountProduct from "./DiscountProduct";
import Image from "next/image";

function FeatureProduct() {
  const {
    data: featuredProducts = [],
    isLoading,
    error,
  } = useGetFeaturedProductsQuery();

  // Debug logging
  useEffect(() => {}, [featuredProducts]);

  // number count up and down
  useEffect(() => {
    const handleQuantityClick = (e: Event) => {
      const button = e.currentTarget as HTMLElement;
      const parent = button.closest(".quantity-edit") as HTMLElement | null;
      if (!parent) return;

      const input = parent.querySelector(".input") as HTMLInputElement | null;
      const addToCart = parent.querySelector(
        "a.add-to-cart"
      ) as HTMLElement | null;
      if (!input) return;

      let oldValue = parseInt(input.value || "1", 10);
      let newVal = oldValue;

      if (button.classList.contains("plus")) {
        newVal = oldValue + 1;
      } else if (button.classList.contains("minus")) {
        newVal = oldValue > 1 ? oldValue - 1 : 1;
      }

      input.value = newVal.toString();
      if (addToCart) {
        addToCart.setAttribute("data-quantity", newVal.toString());
      }
    };

    const buttons = document.querySelectorAll(".quantity-edit .button");

    // Remove any existing handlers first (safe rebind)
    buttons.forEach((button) => {
      button.removeEventListener("click", handleQuantityClick);
      button.addEventListener("click", handleQuantityClick);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", handleQuantityClick);
      });
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom pt--40">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-area-between">
                <div
                  className="skeleton-title"
                  style={{
                    height: "32px",
                    width: "200px",
                    background:
                      "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    borderRadius: "4px",
                  }}
                ></div>
                <div
                  className="next-prev-swiper-wrapper"
                  style={{ opacity: 0.3 }}
                >
                  <div className="swiper-button-prev">
                    <i className="fa-regular fa-chevron-left" />
                  </div>
                  <div className="swiper-button-next">
                    <i className="fa-regular fa-chevron-right" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="category-area-main-wrapper-one">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  scrollbar={{ hide: true }}
                  autoplay={false}
                  loop={false}
                  navigation={false}
                  className="mySwiper-category-1"
                  breakpoints={{
                    0: { slidesPerView: 1, spaceBetween: 30 },
                    320: { slidesPerView: 2, spaceBetween: 30 },
                    480: { slidesPerView: 3, spaceBetween: 30 },
                    640: { slidesPerView: 3, spaceBetween: 30 },
                    840: { slidesPerView: 4, spaceBetween: 30 },
                    1140: { slidesPerView: 5, spaceBetween: 30 },
                  }}
                >
                  {[...Array(5)].map((_, index) => (
                    <SwiperSlide key={index}>
                      <div className="single-shopping-card-one skeleton-card">
                        <div className="skeleton-product-card">
                          {/* Image skeleton */}
                          <div className="skeleton-image"></div>

                          {/* Badge skeleton */}
                          <div className="skeleton-badge"></div>

                          {/* Content skeleton */}
                          <div className="skeleton-content">
                            <div className="skeleton-line short"></div>
                            <div className="skeleton-line medium"></div>
                            <div className="skeleton-line long"></div>
                            <div className="skeleton-rating">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className="skeleton-star"></div>
                              ))}
                            </div>
                            <div className="skeleton-price-wrapper">
                              <div className="skeleton-price"></div>
                              <div className="skeleton-price-old"></div>
                            </div>
                            <div className="skeleton-button"></div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }

          .skeleton-card {
            animation: pulse 2s ease-in-out infinite;
          }

          .skeleton-product-card {
            position: relative;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #f0f0f0;
          }

          .skeleton-image {
            width: 100%;
            padding-bottom: 100%;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 50px;
            height: 24px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 12px;
          }

          .skeleton-content {
            padding: 16px;
          }

          .skeleton-line {
            height: 12px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 8px;
          }

          .skeleton-line.short {
            width: 40%;
            height: 10px;
          }

          .skeleton-line.medium {
            width: 90%;
            height: 14px;
          }

          .skeleton-line.long {
            width: 70%;
            height: 14px;
          }

          .skeleton-rating {
            display: flex;
            gap: 4px;
            margin: 12px 0;
          }

          .skeleton-star {
            width: 14px;
            height: 14px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 2px;
          }

          .skeleton-price-wrapper {
            display: flex;
            gap: 8px;
            align-items: center;
            margin: 12px 0;
          }

          .skeleton-price {
            width: 60px;
            height: 20px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-price-old {
            width: 50px;
            height: 16px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-button {
            width: 100%;
            height: 40px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
            margin-top: 12px;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    // console.error("Featured Products Error:", error);
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom pt--40">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <h2>Error loading featured products</h2>
                <p>Please try again later</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom pt--40">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <h2>No featured products available</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* rts grocery feature area start */}
      <div className="rts-grocery-feature-area rts-section-gapBottom pt--0">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-area-between mb-0">
                {/* <h2 className="title-left">Featured Products</h2> */}
                <div className="mt-4 text-center mb-0">
                  <Image
                    src="/assets/hero/h1.webp"
                    alt="Hero Banner"
                    width={1200}
                    height={500}
                    className="w-full rounded-xl object-cover"
                  />
                </div>
                {/*  */}
                <div className="next-prev-swiper-wrapper">
                  <div className="swiper-button-prev">
                    <i className="fa-regular fa-chevron-left" />
                  </div>
                  <div className="swiper-button-next">
                    <i className="fa-regular fa-chevron-right" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="category-area-main-wrapper-one">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  scrollbar={{
                    hide: true,
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  }}
                  className="mySwiper-category-1"
                  breakpoints={{
                    0: { slidesPerView: 1, spaceBetween: 30 },
                    320: { slidesPerView: 2, spaceBetween: 30 },
                    480: { slidesPerView: 3, spaceBetween: 30 },
                    640: { slidesPerView: 3, spaceBetween: 30 },
                    840: { slidesPerView: 4, spaceBetween: 30 },
                    1140: { slidesPerView: 6, spaceBetween: 30 },
                  }}
                >
                  {featuredProducts.map((product: IProducts, index: number) => (
                    <SwiperSlide key={product._id || index}>
                      <div className="single-shopping-card-one">
                        <FeaturedGlosary
                          Id={product._id || `product-${index}`}
                          Slug={
                            product.slug || product._id || `product-${index}`
                          }
                          ProductImage={
                            product.thumbnail || product.images?.[0] || ""
                          }
                          ProductTitle={product.name}
                          Price={product.price ? `₹${product.price}` : ""}
                          originalPrice={
                            product.originalPrice
                              ? `₹${product.originalPrice}`
                              : undefined
                          }
                          DiscountProduct={product.discount}
                          productData={product}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* rts grocery feature area end */}
    </div>
  );
}

export default FeatureProduct;
