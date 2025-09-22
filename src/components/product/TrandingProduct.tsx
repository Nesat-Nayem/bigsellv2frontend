// components/product/TrandingProduct.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetTrendingProductsQuery, IProducts } from "@/store/productApi";
import { useCart } from "@/components/header/CartContext";

interface TrendingProductProps {
  limit?: number;
}

const TrandingProduct: React.FC<TrendingProductProps> = ({ limit = 8 }) => {
  const {
    data: trendingProducts = [],
    isLoading,
    error,
  } = useGetTrendingProductsQuery(limit);
  const { addToCart } = useCart();

  // local per-product quantity and "added" UI state
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // helpers
  const safeNumber = (v: any) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const cur = Math.max(1, prev[productId] ?? 1);
      return { ...prev, [productId]: Math.max(1, cur + delta) };
    });
  };

  const handleAddToCart = (product: IProducts) => {
    const id = product._id ?? String(Date.now());
    const quantity = quantities[id] ?? 1;
    const price = safeNumber(product.price);

    // 1) Add to CartContext (preferred)
    try {
      addToCart({
        id: Date.now(), // local id
        productId: product._id,
        image:
          product.thumbnail ||
          product.images?.[0] ||
          "/assets/images/grocery/default.jpg",
        title: product.name ?? "Untitled product",
        price,
        quantity,
        active: true,
      });
    } catch (err) {
      // don't block; show toast
      console.warn("CartContext addToCart failed:", err);
    }

    // 2) Backwards-compat: update localStorage snapshot for other code that reads it directly
    try {
      const raw = localStorage.getItem("cart");
      const parsed = Array.isArray(raw ? JSON.parse(raw) : null)
        ? JSON.parse(raw as string)
        : [];
      const existingIndex = parsed.findIndex(
        (it: any) =>
          it._id === product._id || String(it.productId) === String(product._id)
      );
      if (existingIndex > -1) {
        parsed[existingIndex].quantity =
          (parsed[existingIndex].quantity || 0) + quantity;
      } else {
        parsed.push({
          _id: product._id,
          name: product.name,
          thumbnail: product.thumbnail || product.images?.[0] || "",
          price,
          quantity,
        });
      }
      localStorage.setItem("cart", JSON.stringify(parsed));
    } catch (err) {
      console.error("Failed to update localStorage cart:", err);
    }

    // UX: toast + short-lived 'Added' state
    toast.success(`Added ${quantity} × ${product.name ?? "product"} to cart`);
    setAddedMap((s) => ({ ...s, [id]: true }));
    setTimeout(() => setAddedMap((s) => ({ ...s, [id]: false })), 2000);

    // reset qty to 1
    setQuantities((prev) => ({ ...prev, [id]: 1 }));
  };

  // memoized cards
  const productCards = useMemo(() => {
    if (!Array.isArray(trendingProducts)) return [];
    return trendingProducts.map((product: IProducts, idx: number) => {
      const id = product._id ?? `product-${idx}`;
      const thumbnail =
        product.thumbnail ||
        product.images?.[0] ||
        "/assets/images/grocery/default.jpg";
      const price = safeNumber(product.price);
      const originalPrice = safeNumber(product.originalPrice) || undefined;
      const rating =
        typeof product.rating === "number"
          ? product.rating
          : Number(product.rating) || undefined;
      const qty = quantities[id] ?? 1;
      const added = !!addedMap[id];

      return (
        <div key={id} className="col-xl-3 col-md-6 col-sm-12 col-6">
          <div className="single-shopping-card-one tranding-product">
            <Link
              href={`/shop/${id}`}
              className="thumbnail-preview"
              prefetch={false}
            >
              {product.discount && product.discount > 0 && (
                <div className="badge">
                  <span>
                    {product.discount}
                    {product.discountType === "percentage" ? "%" : "₹"} <br />
                    Off
                  </span>
                  <i className="fa-solid fa-bookmark" />
                </div>
              )}

              <div
                style={{
                  width: "100%",
                  height: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  src={thumbnail}
                  alt={product.name ?? "product"}
                  width={100}
                  height={100}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            </Link>

            <div className="body-content">
              <Link href={`/shop/${id}`}>
                <h4 className="title">{product.name ?? "Untitled product"}</h4>
              </Link>

              <span className="availability">
                {product.brand ?? product.subcategory ?? "Available"}
                {product.weight ? ` - ${product.weight}g` : ""}
              </span>

              <div className="price-area d-flex align-items-center gap-2">
                <span className="current">₹ {price.toFixed(2)}</span>
                {originalPrice && originalPrice > price && (
                  <div className="previous">₹ {originalPrice.toFixed(2)}</div>
                )}
              </div>

              {rating ? (
                <div className="rating-area">
                  <div className="stars" aria-hidden>
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fa-solid fa-star ${
                          i < Math.floor(rating) ? "active" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="rating-count">
                    {rating.toFixed(1)} ({product.reviewCount ?? 0})
                  </span>
                </div>
              ) : null}

              {/* quantity controls + add button */}
              <div className="cart-counter-action mt-3 d-flex align-items-center gap-2">
                <div className="quantity-controls d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-sm bg-black"
                    onClick={() => handleQuantityChange(id, -1)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control form-control-sm mx-1"
                    style={{ width: 60 }}
                    min={1}
                    value={qty}
                    onChange={(e) => {
                      const v = Math.max(1, Number(e.target.value) || 1);
                      setQuantities((prev) => ({ ...prev, [id]: v }));
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => handleQuantityChange(id, +1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className={`rts-btn btn-primary add-to-card radious-sm with-icon ${
                    added ? "added" : ""
                  }`}
                  onClick={() => handleAddToCart(product)}
                >
                  <div className="btn-text">{added ? "Added" : "Add"}</div>
                  <div className="arrow-icon">
                    <i
                      className={
                        added
                          ? "fa-solid fa-check"
                          : "fa-regular fa-cart-shopping"
                      }
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendingProducts, quantities, addedMap]);

  // Loading / Error / Empty states
  if (isLoading) {
    return (
      <section className="top-tranding-product rts-section-gap">
        <div className="container text-center">
          <h2 className="title-left mb--10">Top Trending Products</h2>
          <p>Loading trending products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="top-tranding-product rts-section-gap">
        <div className="container text-center">
          <h2 className="title-left mb--10">Top Trending Products</h2>
          <p>Error loading trending products. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (!Array.isArray(trendingProducts) || trendingProducts.length === 0) {
    return (
      <section className="top-tranding-product rts-section-gap">
        <div className="container text-center">
          <h2 className="title-left mb--10">Top Trending Products</h2>
          <p>No trending products available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <section className="top-tranding-product rts-section-gap">
        <div className="container">
          <div className="row mb-3">
            <div className="col-lg-12 d-flex justify-content-between align-items-center">
              <h2 className="title-left mb--10">Top Trending Products</h2>
              <Link
                href="/shop?filter=trending"
                className="btn btn-outline-primary"
              >
                View All Trending
              </Link>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="cover-card-main-over">
                <div className="row g-4">{productCards}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TrandingProduct;
