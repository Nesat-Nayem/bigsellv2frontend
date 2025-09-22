"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import { useGetCategoriesQuery } from "@/store/categoryApi";

function CategoryBannerBottom() {
  const { data, isLoading, isError } = useGetCategoriesQuery();

  if (isLoading)
    return (
      <div className="d-flex justify-content-center align-items-center">
        Loading...
      </div>
    );

  if (isError)
    return (
      <div className="d-flex justify-content-center align-items-center">
        Error...
      </div>
    );

  // Ensure data is always an array
  const categories = data ?? [];

  if (categories.length === 0) {
    return (
      <div className="text-center py-5">
        <p>No categories available</p>
      </div>
    );
  }

  return (
    <div className="rts-category-area-one pt--20">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="category-area-main-wrapper-one">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={5}
                slidesPerView={10}
                loop
                speed={1000}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  0: { slidesPerView: 2, spaceBetween: 12 },
                  320: { slidesPerView: 2, spaceBetween: 12 },
                  480: { slidesPerView: 3, spaceBetween: 12 },
                  640: { slidesPerView: 4, spaceBetween: 12 },
                  840: { slidesPerView: 4, spaceBetween: 12 },
                  1140: { slidesPerView: 10, spaceBetween: 8 },
                }}
              >
                {categories.map((cat, idx) => (
                  <SwiperSlide key={cat._id || idx}>
                    <Link
                      href={`/shop?category=${encodeURIComponent(cat._id)}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "100px",
                            height: "100px",
                            position: "relative",
                            borderRadius: "8px",
                            overflow: "hidden",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          <Image
                            src={cat.image || "/images/category-fallback.png"}
                            alt={cat.title || "category"}
                            fill
                            sizes="100px"
                            style={{
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            maxWidth: "110px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1f2937",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={cat.title}
                        >
                          {cat.title || "Untitled"}
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryBannerBottom;
