"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import CategoryBb from "./CategoryBb";
import Image from "next/image";
import {
  IHeaderBanner,
  useGetHeaderBannerQuery,
} from "@/store/headerBannerApi";
import { useGetMainBannerQuery } from "@/store/mainBannerApi";

// import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const BannerOne = () => {
  const { data: headerBanners } = useGetHeaderBannerQuery();
  const { data: mainBanners = [] } = useGetMainBannerQuery();

  return (
    <div className="background-light-gray-color pt_sm--20">
      {/* rts banner area start */}
      <div className="rts-banner-area-one mb--30">
        <div className="container">
          {/* Top offer Banner */}
          <div className="mb-4 text-center">
            {headerBanners?.[0]?.image && (
              <Image
                src={headerBanners[0].image}
                alt="Hero Banner"
                width={800}
                height={500}
                className="w-full rounded-xl object-cover"
                style={{ objectFit: "contain" }}
              />
            )}
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="category-area-main-wrapper-one relative">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={16}
                  slidesPerView={1}
                  loop={true}
                  speed={2000}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                  }}
                  navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  }}
                  breakpoints={{
                    640: { slidesPerView: 1, spaceBetween: 16 },
                    840: { slidesPerView: 1, spaceBetween: 16 },
                    1140: { slidesPerView: 1, spaceBetween: 24 },
                  }}
                >
                  {mainBanners.map((banner, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className="bg_one-banner h-[400px] w-full rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: `url(${banner.image})` }}
                      ></div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Navigation Buttons */}
                <button className="swiper-button-next !text-black">
                  <i className="fa-regular fa-arrow-right"></i>
                </button>
                <button className="swiper-button-prev !text-black">
                  <i className="fa-regular fa-arrow-left"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom offer Banner */}
          <div className="mt-4 text-center">
            <Image
              src="/assets/hero/8.webp"
              alt="Hero Banner"
              width={1200}
              height={500}
              className="w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
      {/* rts banner area end */}
      <CategoryBb />
    </div>
  );
};

export default BannerOne;
