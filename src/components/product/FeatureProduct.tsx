"use client";
import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import FeaturedGlosary from "../product-main/FeaturedGlosary";
import { useGetFeaturedProductsQuery, IProducts } from "@/store/productApi";
import DiscountProduct from "./DiscountProduct";

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
              <div className="text-center">
                <h2>Loading featured products...</h2>
              </div>
            </div>
          </div>
        </div>
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
      <div className="rts-grocery-feature-area rts-section-gapBottom pt--40">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-area-between">
                <h2 className="title-left">Featured Products</h2>
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
