"use client";
import React from "react";
import { useGetWeeklyDiscountProductsQuery, IProducts } from "@/store/productApi";
import Link from "next/link";

interface WeeklyDiscountProductsProps {
  limit?: number;
}

function WeeklyDiscountProducts({ limit = 10 }: WeeklyDiscountProductsProps) {
  // Fetch weekly discount products from API
  const { data: weeklyDiscountProducts = [], isLoading, error } = useGetWeeklyDiscountProductsQuery(limit);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <p>Loading weekly discount products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <p>Error loading weekly discount products. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (weeklyDiscountProducts.length === 0) {
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <p>No weekly discount products available at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rts-grocery-feature-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-area-between">
                <h2 className="title-left">Weekly Discount Products</h2>
                <Link href="/shop?filter=weekly-discount" className="btn btn-primary">
                  View All
                </Link>
              </div>
            </div>
          </div>
          <div className="row g-3">
            {weeklyDiscountProducts.map((product: IProducts, index: number) => (
              <div key={product._id || index} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                <div className="product-card">
                  <div className="product-image">
                    <Link href={`/shop/${product._id}`}>
                      <img
                        src={product.thumbnail || product.images?.[0] || "/assets/images/grocery/default.jpg"}
                        alt={product.name}
                        className="img-fluid"
                      />
                    </Link>
                    {product.discount && product.discount > 0 && (
                      <div className="discount-badge">
                        -{product.discount}
                        {product.discountType === "percentage" ? "%" : "₹"}
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h5 className="product-title">
                      <Link href={`/shop/${product._id}`}>
                        {product.name}
                      </Link>
                    </h5>
                    <div className="product-price">
                      <span className="current-price">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price">₹{product.originalPrice}</span>
                      )}
                    </div>
                    {product.rating && (
                      <div className="product-rating">
                        <span>★ {product.rating}</span>
                        {product.reviewCount && (
                          <span> ({product.reviewCount} reviews)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyDiscountProducts;
