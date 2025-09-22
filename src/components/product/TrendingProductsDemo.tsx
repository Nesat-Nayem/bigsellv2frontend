"use client";
import React from "react";
import { useGetTrendingProductsQuery, IProducts } from "@/store/productApi";
import Link from "next/link";

interface TrendingProductsDemoProps {
  title?: string;
  limit?: number;
  showViewAll?: boolean;
}

function TrendingProductsDemo({ 
  title = "Trending Products", 
  limit = 4, 
  showViewAll = true 
}: TrendingProductsDemoProps) {
  // Fetch trending products from API with limit
  const { data: trendingProducts = [], isLoading, error } = useGetTrendingProductsQuery(limit);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="trending-products-demo rts-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h3>{title}</h3>
              <div className="loading-spinner">
                <p>Loading trending products...</p>
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="trending-products-demo rts-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h3>{title}</h3>
              <div className="alert alert-danger">
                Error loading trending products. Please try again later.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (trendingProducts.length === 0) {
    return (
      <div className="trending-products-demo rts-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h3>{title}</h3>
              <div className="alert alert-info">
                No trending products available at the moment.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-products-demo rts-section-gap">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="title-area-between mb-4">
              <h3 className="title-left">{title}</h3>
              {showViewAll && (
                <Link href="/shop?filter=trending" className="btn btn-outline-primary">
                  View All ({trendingProducts.length}+ products)
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="row g-3">
          {trendingProducts.map((product: IProducts, index: number) => (
            <div key={product._id || index} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <div className="card product-card h-100">
                <div className="position-relative">
                  <Link href={`/shop/${product._id}`}>
                    <img
                      src={product.thumbnail || product.images?.[0] || "/assets/images/grocery/default.jpg"}
                      className="card-img-top"
                      alt={product.name}
                      style={{
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </Link>
                  {product.discount && product.discount > 0 && (
                    <span className="badge bg-danger position-absolute top-0 end-0 m-2">
                      -{product.discount}
                      {product.discountType === "percentage" ? "%" : "₹"}
                    </span>
                  )}
                  {product.isTrending && (
                    <span className="badge bg-success position-absolute top-0 start-0 m-2">
                      🔥 Trending
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    <Link href={`/shop/${product._id}`} className="text-decoration-none">
                      {product.name}
                    </Link>
                  </h5>
                  {product.shortDescription && (
                    <p className="card-text text-muted small">
                      {product.shortDescription.length > 80 
                        ? `${product.shortDescription.substring(0, 80)}...` 
                        : product.shortDescription}
                    </p>
                  )}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="price-info">
                      <strong className="text-primary">₹{product.price.toFixed(2)}</strong>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <small className="text-muted text-decoration-line-through ms-2">
                          ₹{product.originalPrice.toFixed(2)}
                        </small>
                      )}
                    </div>
                    {product.rating && (
                      <div className="rating-info">
                        <small className="text-warning">
                          ★ {product.rating.toFixed(1)}
                        </small>
                        {product.reviewCount && (
                          <small className="text-muted"> ({product.reviewCount})</small>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      {product.brand && `Brand: ${product.brand}`}
                      {product.category && typeof product.category === "object" && 
                        ` | ${product.category.title}`}
                      {product.stock !== undefined && ` | Stock: ${product.stock}`}
                    </small>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <Link 
                    href={`/shop/${product._id}`} 
                    className="btn btn-primary w-100"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row mt-4">
          <div className="col-lg-12 text-center">
            <p className="text-muted">
              Showing {trendingProducts.length} trending products
              {limit && ` (limited to ${limit})`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendingProductsDemo;
