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
      <div className="rts-category-area-one pt--0">
        <div className="container">
          {/* Top Banner Skeleton */}
          <div className="mt-0 text-center mb-0 mb-sm-5">
            <div className="skeleton-banner" style={{ width: '100%', height: '500px', borderRadius: '12px' }}></div>
          </div>

          {/* Section 1: First 10 categories skeleton */}
          <div className="row mb-0 mb-sm-5">
            <div className="col-lg-12">
              <div className="d-flex gap-3 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-shrink-0" style={{ width: '140px' }}>
                    <div className="skeleton-category-card"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Banner Between Sections Skeleton */}
          <div className="text-center mb-0 mb-sm-5">
            <div className="skeleton-banner" style={{ width: '100%', height: '500px', borderRadius: '12px' }}></div>
          </div>

          {/* Section 2: Next 10 categories skeleton */}
          <div className="row mb-0 mb-sm-5">
            <div className="col-lg-12">
              <div className="d-flex gap-3 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-shrink-0" style={{ width: '140px' }}>
                    <div className="skeleton-category-card"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Banner Skeleton */}
          <div className="mt-0 mb-0 mb-sm-5 text-center">
            <div className="skeleton-banner" style={{ width: '100%', height: '500px', borderRadius: '12px' }}></div>
          </div>

          {/* Section 3: Grid categories skeleton */}
          <div className="mt-3">
            <div className="row g-4 d-flex justify-content-center">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="col-6 col-md-3 col-lg-2">
                  <div className="skeleton-category-grid"></div>
                </div>
              ))}
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

          .skeleton-banner {
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-category-card {
            width: 100%;
            height: 200px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
          }

          .skeleton-category-grid {
            width: 100%;
            height: 250px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
          }
        `}</style>
      </div>
    );

  if (isError)
    return (
      <div className="d-flex justify-content-center align-items-center">
        Error...
      </div>
    );

  const categories = data ?? [];

  if (categories.length === 0) {
    return (
      <div className="text-center py-5">
        <p>No categories available</p>
      </div>
    );
  }

  // Split categories into sections
  const firstTen = categories.slice(0, 9);
  const nextTen = categories.slice(9, 20);
  const remaining = categories.slice(20);

  const swiperSettings = {
    modules: [Navigation, Autoplay],
    spaceBetween: 0,
    slidesPerView: 10,
    loop: true,
    speed: 1000,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    breakpoints: {
      0: { slidesPerView: 3, spaceBetween: 8 },
      320: { slidesPerView: 3, spaceBetween: 12 },
      480: { slidesPerView: 3, spaceBetween: 12 },
      640: { slidesPerView: 4, spaceBetween: 12 },
      840: { slidesPerView: 4, spaceBetween: 12 },
      1140: { slidesPerView: 7, spaceBetween: 8 },
    },
  };

  const buildShopHref = (cat: any) => {
    const pc = cat?.productCategory
    const psc = cat?.productSubcategory
    const pssc = cat?.productSubSubcategory
    const params = new URLSearchParams()
    if (pc) params.set('pc', String(pc))
    if (psc) params.set('psc', String(psc))
    if (pssc) params.set('pssc', String(pssc))
    const qs = params.toString()
    return `/shop${qs ? `?${qs}` : ''}`
  }

  const renderSlide = (cat: any, idx: number) => (
    <SwiperSlide key={cat._id || idx}>
      <Link href={buildShopHref(cat)}>
        <div className="flex flex-col items-center text-center">
          <div
            style={{
              width: "100%",
              height: "200px",
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <Image
              src={cat.image || "/images/category-fallback.png"}
              alt={cat.title || "category"}
              fill
              sizes="100px"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </Link>
    </SwiperSlide>
  );

  return (
    <div className="rts-category-area-one pt--0">
      <div className="container">
        {/* Top Banner */}
        <div className="mt-0 text-center  mb-0 mb-sm-5">
          <Image
            src="/assets/hero/h1.webp"
            alt="Hero Banner"
            width={1400}
            height={500}
            className="w-full rounded-xl object-cover"
          />
        </div>

        {/* Section 1: First 10 categories */}
            {firstTen.length > 0 && (
              <div className="row  mb-0 mb-sm-5">
                <div className="col-lg-12">
                  <Swiper {...swiperSettings}>
                    {firstTen.map((cat, idx) => renderSlide(cat, idx))}
                  </Swiper>
                </div>
              </div>
            )}

        {/* Banner Between Sections */}
        <div className="text-center  mb-0 mb-sm-5">
          <Image
            src="/assets/hero/banner1.webp"
            alt="Banner"
            width={1200}
            height={500}
            className="w-full rounded-xl object-cover"
          />
        </div>

        {/* Section 2: Next 10 categories */}
        {nextTen.length > 0 && (
          <div className="row  mb-0 mb-sm-5">
            <div className="col-lg-12">
              <Swiper {...swiperSettings}>
                {nextTen.map((cat, idx) => renderSlide(cat, idx))}
              </Swiper>
            </div>
          </div>
        )}

        {/* Section 3: Remaining categories */}
        {remaining.length > 0 && (
          <>
            <div className="mt-0  mb-0 mb-sm-5 text-center">
              <Image
                src="/assets/hero/h2.webp"
                alt="Banner"
                width={1200}
                height={500}
                className="w-full rounded-xl object-cover"
              />
            </div>
            <div className=" mt-3">
              <div className="row g-4 d-flex justify-content-center">
                {remaining.map((cat, idx) => (
                  <div key={cat._id || idx} className="col-6 col-md-3 col-lg-2">
                    <Link href={buildShopHref(cat)}>
                      <div className="d-flex flex-column align-items-center text-center">
                        <div
                          className="ratio ratio-1x1 w-100 bg-light rounded overflow-hidden"
                          style={{
                            width: "200px",
                            height: "250px",
                            position: "relative",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            src={cat.image || "/images/category-fallback.png"}
                            alt={cat.title || "category"}
                            fill
                            className="object-fit-contain h-100"
                          />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CategoryBannerBottom;
