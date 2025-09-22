// src/components/product/FeatureDiscount.tsx
"use client";
import Link from "next/link";
import React from "react";
import {
  useGetWeeklyDiscountProductsQuery,
  IProducts,
} from "@/store/productApi";

/**
 * FeatureDiscount (dynamic)
 * - Requests weekly-discount?limit=10 and uses up to 3 unique products to populate the 3 feature cards.
 * - Preserves existing markup and CSS classes exactly so design doesn't change.
 * - Falls back to original static content when API returns empty or errors.
 */

function FeatureDiscount() {
  const {
    data: weekly = [],
    isLoading,
    isError,
  } = useGetWeeklyDiscountProductsQuery(10);

  // map to a lightweight shape and keep unique by _id/slug/title
  const mapped = (weekly || [])
    .map((p: IProducts) => ({
      id: p._id,
      title: p.name || "Product",
      subtitle:
        p.discount && typeof p.discount === "number"
          ? `Sale ${p.discount}% Off`
          : p.shortDescription || p.brand || "",
      href: p.slug ? `/shop/${p.slug}` : p._id ? `/shop/${p._id}` : "/shop",
      image: p.thumbnail || p.images?.[0] || undefined,
    }))
    .filter(
      ((seen) => (item: { id?: string; title?: string }) => {
        const key = item.id ?? item.title ?? Math.random().toString();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })(new Set<string>())
    )
    .slice(0, 3);

  // original static fallback (keeps same classes & text as your original)
  const fallback = [
    {
      key: "a",
      title: "Pro camera",
      subtitle: "Sale 20% Off",
      href: "/shop",
      imageClass: "one",
    },
    {
      key: "b",
      title: "Smart watches",
      subtitle: "Black friday sale",
      href: "/shop",
      imageClass: "two",
    },
    {
      key: "c",
      title: "Headphone",
      subtitle: "Flat 25% off",
      href: "/shop",
      imageClass: "three",
    },
  ];

  // determine cards to render: prefer API results if available and not error
  const cards = !isError && mapped.length > 0 ? mapped : fallback;

  // assign imageClass for dynamic cards to preserve CSS look (one/two/three)
  const imageClasses = ["one", "two", "three"];

  return (
    <div>
      <>
        {/* rts category feature area start */}
        <div className="category-feature-area rts-section-gapTop">
          <div className="container">
            <div className="row g-4">
              {cards.map((c: any, idx: number) => {
                const isFallback = Boolean((c as any).imageClass);
                const imageClass = isFallback
                  ? (c as any).imageClass
                  : imageClasses[idx] ?? imageClasses[0];

                // keep markup identical to original; just substitute title/subtitle/href
                return (
                  <div
                    key={c.id ?? (c as any).key ?? idx}
                    className="col-lg-4 col-md-6 col-sm-12 col-12"
                  >
                    <div
                      className={`single-feature-card bg_image ${imageClass}`}
                    >
                      <div className="content-area">
                        <Link
                          href={c.href ?? "/shop"}
                          className="rts-btn btn-primary"
                        >
                          Weekend Discount
                        </Link>
                        <h3 className="title">
                          {c.title}
                          <br />
                          <span>{c.subtitle}</span>
                        </h3>
                        <Link
                          href={c.href ?? "/shop"}
                          className="shop-now-goshop-btn"
                        >
                          <span className="text">Shop Now</span>
                          <div className="plus-icon">
                            <i className="fa-sharp fa-regular fa-plus" />
                          </div>
                          <div className="plus-icon">
                            <i className="fa-sharp fa-regular fa-plus" />
                          </div>
                        </Link>
                      </div>

                      {/* optional: show product thumbnail for dynamic cards without changing layout.
                          It's positioned absolutely so it won't break your existing CSS. */}
                      {!isFallback && c.image ? (
                        <img
                          src={c.image}
                          alt={c.title}
                          style={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                            pointerEvents: "none",
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {/* When still loading and no data yet, we still keep the layout identical —
                  render three placeholder cards so layout doesn't jump. */}
              {isLoading && (mapped.length === 0 || !mapped) ? (
                <>
                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="single-feature-card bg_image one">
                      <div className="content-area">
                        <div className="rts-btn btn-primary" aria-hidden>
                          &nbsp;
                        </div>
                        <h3 className="title">
                          <span className="skeleton" style={{ width: "80%" }} />
                          <br />
                          <span className="skeleton" style={{ width: "50%" }} />
                        </h3>
                        <div className="shop-now-goshop-btn" aria-hidden>
                          <span
                            className="text skeleton"
                            style={{ width: "30%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="single-feature-card bg_image two">
                      <div className="content-area">
                        <div className="rts-btn btn-primary" aria-hidden>
                          &nbsp;
                        </div>
                        <h3 className="title">
                          <span className="skeleton" style={{ width: "80%" }} />
                          <br />
                          <span className="skeleton" style={{ width: "50%" }} />
                        </h3>
                        <div className="shop-now-goshop-btn" aria-hidden>
                          <span
                            className="text skeleton"
                            style={{ width: "30%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="single-feature-card bg_image three">
                      <div className="content-area">
                        <div className="rts-btn btn-primary" aria-hidden>
                          &nbsp;
                        </div>
                        <h3 className="title">
                          <span className="skeleton" style={{ width: "80%" }} />
                          <br />
                          <span className="skeleton" style={{ width: "50%" }} />
                        </h3>
                        <div className="shop-now-goshop-btn" aria-hidden>
                          <span
                            className="text skeleton"
                            style={{ width: "30%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
        {/* rts category feature area end */}
      </>
    </div>
  );
}

export default FeatureDiscount;
