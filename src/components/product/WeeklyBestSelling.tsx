"use client";
import { useState } from "react";
import WeeklyBestSellingMain from "@/components/product-main/WeeklyBestSellingMain";
import {
  useGetWeeklyBestSellingProductsQuery,
  IProducts,
} from "@/store/productApi";

const WeeklyBestSelling: React.FC = () => {
  // call API with limit=12 (so UI has enough items)
  const {
    data = [],
    isLoading,
    error,
  } = useGetWeeklyBestSellingProductsQuery(12);

  // tab & modal state (kept for consistency)
  const [activeTab, setActiveTab] = useState<string>("tab1");
  type ModalType = "one" | "two" | "three" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const handleClose = () => setActiveModal(null);

  // normalize + dedupe
  const normalized: IProducts[] = (data || []).filter(Boolean).filter(
    ((seen) => (p: IProducts) => {
      const key = String(p?._id ?? p?.slug ?? p?.name ?? JSON.stringify(p));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })(new Set<string>())
  );

  if (isLoading) {
    return (
      <div className="weekly-best-selling-area rts-section-gap bg_light-1">
        <div className="container text-center">
          <h2>Loading Weekly Best Selling Products...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-best-selling-area rts-section-gap bg_light-1">
        <div className="container text-center">
          <h2>Error loading weekly best selling products</h2>
        </div>
      </div>
    );
  }

  if (normalized.length === 0) {
    return (
      <div className="weekly-best-selling-area rts-section-gap bg_light-1">
        <div className="container text-center">
          <h2>No Weekly Best Selling Products Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="weekly-best-selling-area rts-section-gap bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-area-between">
                <h2 className="title-left">Weekly Best Selling Products</h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div>
                <div className="row g-4">
                  {normalized.map((product, index) => (
                    <div
                      key={product._id ?? `wbs-${index}`}
                      className="col-xxl-2 col-xl-2 col-lg-2 col-md-3 col-sm-6 col-6"
                    >
                      <div className="single-shopping-card-one">
                        <WeeklyBestSellingMain
                          productData={product} // full object
                          Slug={
                            product.slug ?? product._id ?? `product-${index}`
                          }
                          ProductImage={
                            product.thumbnail ?? product.images?.[0] ?? ""
                          }
                          ProductTitle={product.name}
                          Price={product.price ? `${product.price}` : ""}
                          del={
                            product.originalPrice
                              ? `${product.originalPrice}`
                              : ""
                          }
                          material={product.brand ?? ""}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyBestSelling;
