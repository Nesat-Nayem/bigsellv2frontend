// src/app/(your-path)/page.tsx OR wherever your ShopContent file lives
"use client";
import HeaderOne from "@/components/header/HeaderOne";
import { useState, Suspense, useMemo, useEffect } from "react";
import ShopMain from "./ShopMain";
import ShopMainList from "./ShopMainList";
import FooterOne from "@/components/footer/FooterOne";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  useGetProductsPagedQuery,
  useGetProductFiltersQuery,
} from "@/store/productApi";
import HeaderThree from "@/components/header/HeaderThree";
import { useGetRootCategoriesQuery } from "@/store/productCategoryApi";

interface PostType {
  id: string;
  category?: string;
  slug: string;
  image: string;
  title?: string;
  price?: string;
  originalPrice?: string;
  discount?: number;
  discountType?: "percentage" | "fixed";
  color?: any;
  size?: any;
  productData?: any; // Store original product data
}

/**
 * Robust thumbnail resolver:
 * - Handles product.thumbnail as string or object
 * - Handles product.images as array of strings or array of objects({ url, src, path })
 * - Falls back to product.image
 * - Permanent fallback to /images/default.jpg (place in public/)
 */
const resolveThumbnail = (product: any): string => {
  // 1) product.thumbnail often is string or { url } or { src }
  if (product?.thumbnail) {
    if (typeof product.thumbnail === "string") return product.thumbnail;
    if (typeof product.thumbnail === "object") {
      return (
        product.thumbnail.url ||
        product.thumbnail.src ||
        product.thumbnail.path ||
        JSON.stringify(product.thumbnail) // last resort; probably not desired but stops undefined
      );
    }
  }

  // 2) product.images could be ['url', ...] OR [{ url, src }, ...]
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") {
      return first.url || first.src || first.path || first.filename || "";
    }
  }

  // 3) product.image field
  if (product?.image && typeof product.image === "string") return product.image;

  // 4) common nested cases: product.media?.thumbnail etc.
  if (product?.media?.thumbnail) {
    const t = product.media.thumbnail;
    if (typeof t === "string") return t;
    if (typeof t === "object") return t.url || t.src || "";
  }

  // 5) final fallback to public image
  return "/images/default.jpg";
};

const transformProductToPost = (product: any): PostType => {
  const name =
    product?.name && typeof product.name === "object"
      ? product.name?.title ||
        product.name?._id ||
        product.name?.name ||
        "Unknown Product"
      : product?.name ?? product?.title ?? "Unknown Product";

  const category =
    product?.category && typeof product.category === "object"
      ? product.category?.title ||
        product.category?._id ||
        product.category?.name ||
        "Unknown"
      : typeof product?.category === "string"
      ? product.category
      : "Unknown";

  const priceValue =
    product?.price && typeof product.price === "object"
      ? product.price?.amount ?? product.price?.value ?? 0
      : Number(product?.price ?? 0);

  const originalPriceValue =
    product?.originalPrice && typeof product.originalPrice === "object"
      ? product.originalPrice?.amount ?? product.originalPrice?.value ?? 0
      : Number(product?.originalPrice ?? priceValue);

  const discountValue =
    product?.discount && typeof product.discount === "object"
      ? Number(
          (product.discount as any)?.amount ??
            (product.discount as any)?.value ??
            0
        )
      : Number(product?.discount ?? 0);

  const thumbnail = resolveThumbnail(product);

  return {
    id: product?._id || product?.sku || String(product?.id || ""),
    category,
    slug:
      product?.slug ||
      (name + "-" + (product?._id || "")).toLowerCase().replace(/\s+/g, "-"),
    image: thumbnail || "/images/default.jpg",
    title: name,
    price: String(priceValue ?? 0),
    originalPrice: String(originalPriceValue ?? 0),
    discount: Number(discountValue ?? 0),
    discountType: product?.discountType || "percentage",
    color: product?.colors || product?.variants?.colors || [],
    size: product?.sizes || product?.variants?.sizes || [],
    productData: product, // Store original product data so detail components can use raw structure
  };
};

function ShopContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  // Product-category linkage params from HomeCategories clicks
  const pc = (searchParams.get('pc') || '').trim();
  const psc = (searchParams.get('psc') || '').trim();
  const pssc = (searchParams.get('pssc') || '').trim();
  const urlBrand = (searchParams.get('brand') || '').trim();

  const [activeTab, setActiveTab] = useState<string>("tab1");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(9);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState<number>(0);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<number>(100000);
  const [showFeatured, setShowFeatured] = useState<boolean>(false);
  const [showTrending, setShowTrending] = useState<boolean>(false);
  const [showNewArrivals, setShowNewArrivals] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  // Sync brand from URL when present
  useEffect(() => {
    setSelectedBrand(urlBrand);
  }, [urlBrand]);

  // Debounce price changes (3.5 seconds delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 3500);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Build server-side query params (prioritize deep link pssc > psc > pc)
  const paramsCategory = !pssc && !psc ? (selectedCategoryId || (pc || undefined)) : undefined;
  const paramsSubcategory = !pssc ? (psc || undefined) : undefined;
  const paramsSubSubcategory = pssc || undefined;

  // Server-side products with pagination and filters
  const {
    data: paged,
    isLoading: productsLoading,
    isFetching: productsFetching,
    error: productsError,
  } = useGetProductsPagedQuery({
    page,
    limit,
    sort: "createdAt",
    order: "desc",
    category: paramsCategory as any,
    subcategory: paramsSubcategory as any,
    subSubcategory: paramsSubSubcategory as any,
    brand: selectedBrand || undefined,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
    isFeatured: showFeatured || undefined,
    isTrending: showTrending || undefined,
    isNewArrival: showNewArrivals || undefined,
    search: searchQuery || undefined,
  });

  // NEW: fetch filter options from API
  const {
    data: filtersResponse,
    isLoading: filtersLoading,
    error: filtersError,
  } = useGetProductFiltersQuery();

  // Root (main) categories for sidebar filter
  const { data: rootCategories = [] } = useGetRootCategoriesQuery();

  // Extracted lists from API (safely)
  const apiBrands: string[] = filtersResponse?.data?.brands ?? [];
  const apiColors: string[] = filtersResponse?.data?.colors ?? [];
  const apiSizes: string[] = filtersResponse?.data?.sizes ?? [];
  const apiPriceMin: number | undefined =
    filtersResponse?.data?.priceRange?.minPrice;
  const apiPriceMax: number | undefined =
    filtersResponse?.data?.priceRange?.maxPrice;

  // If API gives a price range, initialize min/max only if user hasn't changed them yet.
  useEffect(() => {
    if (apiPriceMin !== undefined && apiPriceMax !== undefined) {
      // only set defaults if user hasn't already adjusted (basic heuristic)
      const isDefaultRange = minPrice === 0 && maxPrice === 100000;
      if (isDefaultRange) {
        setMinPrice(Math.floor(apiPriceMin));
        setMaxPrice(Math.ceil(apiPriceMax));
      }
    }
    // we intentionally do not include minPrice/maxPrice in dependency list to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPriceMin, apiPriceMax]);

  const items = useMemo(() => (paged?.items || []).map(transformProductToPost), [paged]);
  const meta = paged?.meta || { page: 1, limit: limit, total: 0, totalPages: 1 };
  const startIdx = (meta.page - 1) * meta.limit + 1;
  const endIdx = startIdx + items.length - 1;

  const pageItems = useMemo<(number | string)[]>(() => {
    const total = meta.totalPages || 1;
    const current = meta.page || 1;
    
    // Show all if 5 or fewer pages
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    
    // Always show first page
    pages.push(1);
    
    if (current <= 3) {
      // Near start: show 1, 2, 3, 4, ..., last
      pages.push(2, 3, 4);
      if (total > 5) pages.push("...");
      pages.push(total);
    } else if (current >= total - 2) {
      // Near end: show 1, ..., last-3, last-2, last-1, last
      pages.push("...");
      pages.push(total - 3, total - 2, total - 1, total);
    } else {
      // Middle: show 1, ..., current-1, current, current+1, ..., last
      pages.push("...");
      pages.push(current - 1, current, current + 1);
      pages.push("...");
      pages.push(total);
    }
    
    return pages;
  }, [meta.page, meta.totalPages]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId((prev) => (prev === categoryId ? "" : categoryId));
    setPage(1);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setPage(1);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setMinPrice(val);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setMaxPrice(val);
  };

  // Reset page when core filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedMinPrice, debouncedMaxPrice, showFeatured, showTrending, showNewArrivals, searchQuery, pc, psc, pssc, selectedBrand]);

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Loading / error states
  if (productsLoading || productsFetching || filtersLoading) {
    return (
      <div className="shop-page">
        {/* Breadcrumb Skeleton */}
        <div className="rts-navigation-area-breadcrumb bg_light-1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="navigator-breadcrumb-wrapper">
                  <div className="skeleton-breadcrumb"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-seperator bg_light-1">
          <div className="container">
            <hr className="section-seperator" />
          </div>
        </div>

        <div className="shop-grid-sidebar-area rts-section-gap">
          <div className="container">
            <div className="row g-0">
              {/* Sidebar Skeleton */}
              <div className="col-xl-3 col-lg-12 pr--70 pr_lg--10 pr_sm--10 pr_md--5">
                <div className="sidebar-filter-main">
                  {/* Price Filter Skeleton */}
                  <div className="single-filter-box mb-4">
                    <div className="skeleton-filter-title"></div>
                    <div className="skeleton-filter-body">
                      <div className="skeleton-price-inputs"></div>
                      <div className="skeleton-range"></div>
                    </div>
                  </div>

                  {/* Category Filter Skeleton */}
                  <div className="single-filter-box mb-4">
                    <div className="skeleton-filter-title"></div>
                    <div className="skeleton-filter-body">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton-checkbox-item"></div>
                      ))}
                    </div>
                  </div>

                  {/* Brand Filter Skeleton */}
                  <div className="single-filter-box">
                    <div className="skeleton-filter-title"></div>
                    <div className="skeleton-filter-body">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton-checkbox-item"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="col-xl-9 col-lg-12">
                {/* Filter Bar Skeleton */}
                <div className="filter-select-area mb-4">
                  <div className="top-filter">
                    <div className="skeleton-results-count"></div>
                    <div className="right-end">
                      <div className="skeleton-sort-button"></div>
                    </div>
                  </div>
                </div>

                {/* Product Grid Skeleton - Modern Design */}
                <div className="row g-4">
                  {[...Array(9)].map((_, index) => (
                    <div
                      key={index}
                      className="col-lg-4 col-md-6 col-sm-6 col-12"
                    >
                      <div className="skeleton-product-card-modern">
                        {/* Image Skeleton */}
                        <div className="skeleton-image-wrapper">
                          <div className="skeleton-image"></div>
                          <div className="skeleton-badge-top"></div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="skeleton-content">
                          {/* Title */}
                          <div className="skeleton-title"></div>
                          <div className="skeleton-title-short"></div>

                          {/* Rating */}
                          <div className="skeleton-rating-row">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="skeleton-star-modern"></div>
                            ))}
                          </div>

                          {/* Price */}
                          <div className="skeleton-price-row">
                            <div className="skeleton-price-main"></div>
                            <div className="skeleton-price-discount"></div>
                          </div>

                          {/* Actions */}
                          <div className="skeleton-actions-row">
                            <div className="skeleton-icon-circle"></div>
                            <div className="skeleton-add-to-cart"></div>
                            <div className="skeleton-icon-circle"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          .skeleton-breadcrumb {
            height: 20px;
            width: 150px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-filter-title {
            height: 24px;
            width: 60%;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 16px;
          }

          .skeleton-filter-body {
            padding: 12px 0;
          }

          .skeleton-price-inputs {
            height: 60px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
            margin-bottom: 12px;
          }

          .skeleton-range {
            height: 8px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-checkbox-item {
            height: 20px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 12px;
          }

          .skeleton-results-count {
            height: 20px;
            width: 150px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-sort-button {
            height: 36px;
            width: 120px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
          }

          .skeleton-product-card-modern {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            transition: transform 0.2s;
          }

          .skeleton-image-wrapper {
            position: relative;
            width: 100%;
            padding-bottom: 100%;
            background: #f8f9fa;
            overflow: hidden;
          }

          .skeleton-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #f8f8f8 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
          }

          .skeleton-badge-top {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 60px;
            height: 28px;
            background: linear-gradient(
              90deg,
              #e8e8e8 0%,
              #f4f4f4 20%,
              #e8e8e8 40%,
              #e8e8e8 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 14px;
          }

          .skeleton-content {
            padding: 16px;
          }

          .skeleton-title {
            height: 16px;
            width: 85%;
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #f8f8f8 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 4px;
            margin-bottom: 8px;
          }

          .skeleton-title-short {
            height: 16px;
            width: 60%;
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #f8f8f8 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 4px;
            margin-bottom: 12px;
          }

          .skeleton-rating-row {
            display: flex;
            gap: 4px;
            margin-bottom: 12px;
          }

          .skeleton-star-modern {
            width: 16px;
            height: 16px;
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #f8f8f8 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 3px;
          }

          .skeleton-price-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
          }

          .skeleton-price-main {
            width: 80px;
            height: 24px;
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #f8f8f8 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 6px;
          }

          .skeleton-price-discount {
            width: 60px;
            height: 18px;
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #f8f8f8 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 4px;
          }

          .skeleton-actions-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .skeleton-icon-circle {
            width: 44px;
            height: 44px;
            background: linear-gradient(
              90deg,
              #f0f0f0 0%,
              #f8f8f8 20%,
              #f0f0f0 40%,
              #f0f0f0 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 50%;
          }

          .skeleton-add-to-cart {
            flex: 1;
            height: 44px;
            background: linear-gradient(
              90deg,
              #e8e8e8 0%,
              #f4f4f4 20%,
              #e8e8e8 40%,
              #e8e8e8 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 8px;
          }

          @media (max-width: 991px) {
            .skeleton-content {
              padding: 12px;
            }
            .skeleton-title {
              height: 14px;
            }
            .skeleton-actions-row {
              gap: 8px;
            }
            .skeleton-icon-circle {
              width: 38px;
              height: 38px;
            }
            .skeleton-add-to-cart {
              height: 38px;
            }
          }
        `}</style>
      </div>
    );
  }

  if (productsError) {
    console.error(productsError);
    return (
      <div className="text-center py-20">
        <div className="alert alert-danger">
          <h4>Error Loading Products</h4>
          <p>Unable to load products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Breadcrumb */}
      <div className="rts-navigation-area-breadcrumb bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="navigator-breadcrumb-wrapper">
                <Link href="/">Home</Link>
                <i className="fa-regular fa-chevron-right" />
                <Link className="current" href="#">
                  Shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-seperator bg_light-1">
        <div className="container">
          <hr className="section-seperator" />
        </div>
      </div>

      <div className="shop-grid-sidebar-area rts-section-gap">
        <div className="container">
          <div className="row g-0">
            {/* Sidebar */}
            <div className="col-xl-3 col-lg-12 pr--70 pr_lg--10 pr_sm--10 pr_md--5 rts-sticky-column-item">
              <div className="sidebar-filter-main theiaStickySidebar">
                {/* Price Filter */}
                <div className="single-filter-box">
                  <h5 className="title">Widget Price Filter</h5>
                  <div className="filterbox-body">
                    <form
                      action="#"
                      className="price-input-area"
                      onSubmit={handlePriceFilterSubmit}
                    >
                      <div className="half-input-wrapper">
                        <div className="single">
                          <label htmlFor="min">Min price</label>
                          <input
                            id="min"
                            type="number"
                            value={minPrice}
                            min={0}
                            onChange={handleMinPriceChange}
                          />
                        </div>
                        <div className="single">
                          <label htmlFor="max">Max price</label>
                          <input
                            id="max"
                            type="number"
                            value={maxPrice}
                            min={0}
                            onChange={handleMaxPriceChange}
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        className="range"
                        min={apiPriceMin ? Math.floor(apiPriceMin) : 0}
                        max={
                          apiPriceMax
                            ? Math.ceil(apiPriceMax)
                            : Math.max(150, maxPrice)
                        }
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(parseInt(e.target.value, 10))
                        }
                      />
                      <div className="filter-value-min-max">
                        <span>
                          Price: ₹{minPrice} — ₹{maxPrice}
                        </span>
                        {(minPrice !== debouncedMinPrice || maxPrice !== debouncedMaxPrice) && (
                          <small style={{ display: 'block', marginTop: '4px', color: '#6c757d', fontSize: '11px' }}>
                            Updating in 3.5s...
                          </small>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Special Collections */}
                <div className="single-filter-box">
                  <h5 className="title">Special Collections</h5>
                  <div className="filterbox-body">
                    <div className="category-wrapper">
                      <div className="single-category">
                        <input
                          id="featured"
                          type="checkbox"
                          checked={showFeatured}
                          onChange={(e) => {
                            setShowFeatured(e.target.checked);
                            if (e.target.checked) {
                              setShowTrending(false);
                              setShowNewArrivals(false);
                            }
                          }}
                        />
                        <label htmlFor="featured">Featured Products</label>
                      </div>
                      <div className="single-category">
                        <input
                          id="trending"
                          type="checkbox"
                          checked={showTrending}
                          onChange={(e) => {
                            setShowTrending(e.target.checked);
                            if (e.target.checked) {
                              setShowFeatured(false);
                              setShowNewArrivals(false);
                            }
                          }}
                        />
                        <label htmlFor="trending">Trending Products</label>
                      </div>
                      <div className="single-category">
                        <input
                          id="newArrivals"
                          type="checkbox"
                          checked={showNewArrivals}
                          onChange={(e) => {
                            setShowNewArrivals(e.target.checked);
                            if (e.target.checked) {
                              setShowFeatured(false);
                              setShowTrending(false);
                            }
                          }}
                        />
                        <label htmlFor="newArrivals">New Arrivals</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="single-filter-box">
                  <h5 className="title">Product Categories</h5>
                  <div className="filterbox-body">
                    <div className="category-wrapper ">
                      {rootCategories && rootCategories.length > 0 ? (
                        rootCategories.map((cat: any, i: number) => (
                          <div className="single-category" key={cat._id || i}>
                            <input
                              id={`cat${i + 1}`}
                              type="radio"
                              name="category"
                              checked={selectedCategoryId === String(cat._id)}
                              onChange={() => handleCategoryChange(String(cat._id))}
                            />
                            <label htmlFor={`cat${i + 1}`}>{cat.title}</label>
                          </div>
                        ))
                      ) : (
                        <p>Loading categories...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div className="single-filter-box">
                  <h5 className="title">Brands</h5>
                  <div className="filterbox-body">
                    <div className="category-wrapper ">
                      <div className="single-category">
                        <input
                          id={`brandAll`}
                          type="radio"
                          name="brand"
                          checked={selectedBrand === ""}
                          onChange={() => handleBrandChange("")}
                        />
                        <label htmlFor={`brandAll`}>All Brands</label>
                      </div>
                      {apiBrands && apiBrands.length > 0 ? (
                        apiBrands.map((b: string, i: number) => (
                          <div className="single-category" key={b || i}>
                            <input
                              id={`brand${i + 1}`}
                              type="radio"
                              name="brand"
                              checked={selectedBrand === b}
                              onChange={() => handleBrandChange(b)}
                            />
                            <label htmlFor={`brand${i + 1}`}>{b}</label>
                          </div>
                        ))
                      ) : (
                        <p>No brands available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-xl-9 col-lg-12">
              <div className="filter-select-area">
                <div className="top-filter">
                  <span>
                    Showing {items.length > 0 ? `${startIdx}-${endIdx}` : 0} of {meta.total} results
                  </span>
                  {/* <div className="right-end">
                    <span>Sort: Short By Latest</span>
                    <div className="button-tab-area">
                      <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item" role="presentation">
                          <button
                            onClick={() => setActiveTab("tab1")}
                            className={`nav-link single-button ${
                              activeTab === "tab1" ? "active" : ""
                            }`}
                          >
                            <svg
                              width={16}
                              height={16}
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <rect
                                x="0.5"
                                y="0.5"
                                width={6}
                                height={6}
                                rx="1.5"
                                stroke="#2C3B28"
                              />
                              <rect
                                x="0.5"
                                y="9.5"
                                width={6}
                                height={6}
                                rx="1.5"
                                stroke="#2C3B28"
                              />
                              <rect
                                x="9.5"
                                y="0.5"
                                width={6}
                                height={6}
                                rx="1.5"
                                stroke="#2C3B28"
                              />
                              <rect
                                x="9.5"
                                y="9.5"
                                width={6}
                                height={6}
                                rx="1.5"
                                stroke="#2C3B28"
                              />
                            </svg>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Grid or List view */}
              <div className="tab-content" id="myTabContent">
                <div className="product-area-wrapper-shopgrid-list mt--20 tab-pane fade show active">
                  {activeTab === "tab1" && (
                    <div className="row g-4">
                      {items.length > 0 ? (
                        items.map(
                          (post: PostType, index: number) => {
                            return (
                              <div
                                key={index}
                                className="col-lg-4 col-lg-4 col-md-6 col-sm-6 col-12"
                              >
                                <div className="single-shopping-card-one">
                                  <ShopMain
                                    Id={post.id}
                                    Slug={post.slug}
                                    ProductImage={post.image}
                                    ProductTitle={post.title}
                                    Price={post.price}
                                    OriginalPrice={post.originalPrice}
                                    Discount={post.discount}
                                    DiscountType={post.discountType}
                                    Color={post.color}
                                    Size={post.size}
                                    productData={post.productData}
                                  />
                                </div>
                              </div>
                            );
                          }
                        )
                      ) : (
                        <div className="col-12 text-center py-5">
                          <h2>No Product Found</h2>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="product-area-wrapper-shopgrid-list with-list mt--20">
                  {activeTab === "tab2" && (
                    <div className="row">
                      {items.length > 0 ? (
                        items.map(
                          (post: PostType, index: number) => (
                            <div key={index} className="col-lg-6">
                              <div className="single-shopping-card-one discount-offer">
                                <ShopMainList
                                  Slug={post.slug}
                                  ProductImage={post.image}
                                  ProductTitle={post.title}
                                  Price={post.price}
                                />
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="col-12 text-center py-5">
                          <h2>No Product Found</h2>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {meta.totalPages > 0 && (
                  <div className="pagination-wrapper-outer mt-5">
                    <div className="pagination-wrapper">
                      <div className="pagination-scroll-container">
                        <div className="pagination-controls">
                          <button
                          style={{
                            width:"70px"
                          }}
                            className="pagination-btn pagination-prev"
                            disabled={meta.page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                          >
                            <i className="fa-solid fa-chevron-left"></i>
                            <span className="btn-text">Prev</span>
                          </button>
                          {pageItems.map((p, idx) =>
                            typeof p === "number" ? (
                              <button
                                key={`${p}-${idx}`}
                                className={`pagination-btn pagination-number ${meta.page === p ? "active" : ""}`}
                                disabled={meta.page === p}
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </button>
                            ) : (
                              <span key={`dots-${idx}`} className="pagination-dots">...</span>
                            )
                          )}
                          <button
                               style={{
                            width:"70px"
                          }}
                            className="pagination-btn pagination-next"
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                          >
                            <span className="btn-text">Next</span>
                            <i className="fa-solid fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                      <div className="items-per-page">
                        <label htmlFor="itemsPerPage" className="per-page-label">Per page:</label>
                        <select
                          id="itemsPerPage"
                          className="pagination-select"
                          value={limit}
                          onChange={(e) => {
                            setLimit(parseInt(e.target.value, 10));
                            setPage(1);
                          }}
                        >
                          <option value={9}>9</option>
                          <option value={18}>18</option>
                          <option value={27}>27</option>
                          <option value={36}>36</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <style jsx>{`
                  .pagination-wrapper-outer {
                    width: 100%;
                  }

                  .pagination-wrapper {
                    background: #fff;
                    padding: 16px 20px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    width: 100%;
                  }

                  .pagination-scroll-container {
                    flex: 1;
                    overflow-x: auto;
                    overflow-y: hidden;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: thin;
                    scrollbar-color: #ddd transparent;
                    min-width: 0;
                  }

                  .pagination-scroll-container::-webkit-scrollbar {
                    height: 6px;
                  }

                  .pagination-scroll-container::-webkit-scrollbar-track {
                    background: transparent;
                  }

                  .pagination-scroll-container::-webkit-scrollbar-thumb {
                    background: #ddd;
                    border-radius: 3px;
                  }

                  .pagination-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: #bbb;
                  }

                  .pagination-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                    width: max-content;
                    padding: 0;
                    margin: 0;
                  }

                  .pagination-controls > * {
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                  }

                  .pagination-controls > * + * {
                    margin-left: 8px !important;
                  }

                  .pagination-btn {
                    min-width: 40px;
                    height: 40px;
                    padding: 0 12px;
                    border: 1px solid #e0e0e0;
                    background: #fff;
                    color: #333;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex !important;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    flex-shrink: 0;
                    visibility: visible !important;
                    opacity: 1 !important;
                    margin: 0;
                    text-decoration: none;
                    box-sizing: border-box;
                  }

                  .pagination-btn i {
                    font-size: 12px;
                  }

                  .pagination-btn.pagination-prev,
                  .pagination-btn.pagination-next {
                    padding: 0 10px;
                  }

                  .pagination-btn:hover:not(:disabled) {
                    background: #f8f9fa;
                    border-color: #007bff;
                    color: #007bff;
                    transform: translateY(-1px);
                  }

                  .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }

                  .pagination-btn.active {
                    background: #007bff !important;
                    color: #fff !important;
                    border-color: #007bff !important;
                  }

                  .pagination-btn.pagination-number {
                    min-width: 40px;
                    width: 40px;
                    padding: 0;
                    margin: 0;
                  }

                  .pagination-dots {
                    padding: 0 4px;
                    color: #999;
                    font-weight: 600;
                    flex-shrink: 0;
                    display: inline-block;
                    line-height: 40px;
                  }

                  .items-per-page {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                  }

                  .per-page-label {
                    font-size: 14px;
                    color: #666;
                    white-space: nowrap;
                    margin: 0;
                  }

                  .pagination-select {
                    padding: 8px 32px 8px 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    background: #fff;
                    cursor: pointer;
                    transition: border-color 0.2s ease;
                    min-width: 70px;
                  }

                  .pagination-select:hover {
                    border-color: #007bff;
                  }

                  .pagination-select:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                  }

                  /* Tablet and below - hide Prev/Next text */
                  @media (max-width: 1199px) {
                    .btn-text {
                      display: none;
                    }

                    .pagination-btn.pagination-prev,
                    .pagination-btn.pagination-next {
                      min-width: 40px;
                      width: 40px;
                      padding: 0;
                    }
                  }

                  /* Tablet */
                  @media (max-width: 991px) {
                    .pagination-wrapper {
                      padding: 12px 16px;
                      gap: 10px;
                    }

                    .pagination-controls {
                      gap: 6px;
                    }

                    .pagination-controls > * + * {
                      margin-left: 6px !important;
                    }

                    .pagination-btn {
                      min-width: 36px;
                      height: 36px;
                      padding: 0 8px;
                      font-size: 13px;
                    }

                    .pagination-btn.pagination-number {
                      min-width: 36px;
                      width: 36px;
                      padding: 0;
                    }

                    .pagination-btn.pagination-prev,
                    .pagination-btn.pagination-next {
                      min-width: 36px;
                      width: 36px;
                      padding: 0;
                    }

                    .per-page-label {
                      font-size: 13px;
                    }

                    .pagination-select {
                      font-size: 13px;
                      padding: 6px 28px 6px 10px;
                      min-width: 60px;
                    }
                  }

                  /* Mobile */
                  @media (max-width: 576px) {
                    .pagination-wrapper {
                      padding: 10px 12px;
                      gap: 8px;
                    }

                    .pagination-controls {
                      gap: 5px;
                    }

                    .pagination-controls > * + * {
                      margin-left: 5px !important;
                    }

                    .pagination-btn {
                      min-width: 32px;
                      height: 32px;
                      padding: 0;
                      font-size: 12px;
                      gap: 0;
                    }

                    .pagination-btn i {
                      font-size: 10px;
                    }

                    .pagination-btn.pagination-number {
                      min-width: 32px;
                      width: 32px;
                      padding: 0;
                    }

                    .pagination-btn.pagination-prev,
                    .pagination-btn.pagination-next {
                      min-width: 32px;
                      width: 32px;
                      padding: 0;
                    }

                    .pagination-dots {
                      padding: 0 3px;
                      font-size: 12px;
                      line-height: 32px;
                    }

                    .per-page-label {
                      font-size: 11px;
                    }

                    .pagination-select {
                      font-size: 12px;
                      padding: 4px 24px 4px 8px;
                      min-width: 50px;
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <HeaderThree />
      <Suspense
        fallback={
          <div className="text-center py-20">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading products...</p>
          </div>
        }
      >
        <ShopContent />
      </Suspense>
      <FooterOne />
    </>
  );
}
