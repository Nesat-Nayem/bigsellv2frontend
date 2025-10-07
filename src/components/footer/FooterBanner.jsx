import Image from "next/image";
import React from "react";

const FooterBanner = () => {
  return (
    <div className="category-feature-area">
      <div className="container-fluid">
        {/* below banner */}
        <div className="mt-0 text-center mb-5 w-full">
          <a href="/shop" className="block w-full">
            <Image
              src="/assets/hero/footer-banner.webp"
              alt="Hero Banner"
              width={1400}
              height={500}
              className="w-full rounded-xl object-cover"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FooterBanner;
