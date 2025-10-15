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
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetTrendingProductsQuery,
  useGetNewArrivalsQuery,
  useSearchProductsQuery,
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

  const [activeTab, setActiveTab] = useState<string>("tab1");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [showFeatured, setShowFeatured] = useState<boolean>(false);
  const [showTrending, setShowTrending] = useState<boolean>(false);
  const [showNewArrivals, setShowNewArrivals] = useState<boolean>(false);

  // Product data queries
  const {
    data: allProducts = [],
    isLoading: productsLoading,
    error: productsError,
  } = useGetProductsQuery();

  const { data: featuredProducts = [] } = useGetFeaturedProductsQuery();
  const { data: trendingProducts = [] } = useGetTrendingProductsQuery();
  const { data: newArrivals = [] } = useGetNewArrivalsQuery();
  const { data: searchResults = [] } = useSearchProductsQuery(searchQuery, {
    skip: !searchQuery,
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

  const shouldUseFallback =
    !!productsError || (Array.isArray(allProducts) && allProducts.length === 0);

  // Fallback products normalized so UI always receives consistent shape
  const fallbackProducts = shouldUseFallback
    ? (allProducts || []).map((p: any, index: number) => ({
        name: p.title || "Unknown Product",
        price: parseFloat(String(p.price || 0)) || 0,
        category: p.category || "Unknown",
        brand: "Local Brand",
        sku: p.slug || `product-${index}`,
        thumbnail: p.image || "/images/default.jpg",
        images: [p.image || "/images/default.jpg"],
        description: "Local product description",
        shortDescription: "Local product",
        originalPrice: (parseFloat(String(p.price || 0)) || 0) * 1.2,
        discount: p.discount || 0,
        discountType: p.discountType ? "percentage" : "fixed",
        stock: 100,
        minStock: 10,
        weight: 1,
        dimensions: { length: 10, width: 10, height: 10 },
        colors: [],
        sizes: [],
        tags: [],
        features: [],
        specifications: [],
        status: "active" as const,
        isFeatured: Math.random() > 0.5,
        isTrending: Math.random() > 0.5,
        isNewArrival: Math.random() > 0.5,
        seoTitle: p.title || "Product",
        seoDescription: "Product description",
        seoKeywords: [],
        vendor: "Local Store",
        shippingInfo: {
          weight: 1,
          freeShipping: true,
          shippingCost: 0,
          estimatedDelivery: "2-3 days",
        },
      }))
    : [];

  const effectiveProducts = shouldUseFallback ? fallbackProducts : allProducts;


  const currentProducts = useMemo(() => {
    let products = allProducts;

    if (searchQuery && (searchResults?.length ?? 0) > 0) {
      products = searchResults;
    } else if (showFeatured) {
      products = featuredProducts;
    } else if (showTrending) {
      products = trendingProducts;
    } else if (showNewArrivals) {
      products = newArrivals;
    }

    // Apply product-category deep link filters (prefer deepest specified)
    const idOf = (v: any) => (v && typeof v === 'object' ? v?._id : v);
    if (pssc) {
      products = (products || []).filter((p: any) => String(idOf(p?.subSubcategory) || '') === String(pssc));
    } else if (psc) {
      products = (products || []).filter((p: any) => String(idOf(p?.subcategory) || '') === String(psc));
    } else if (pc) {
      products = (products || []).filter((p: any) => String(idOf(p?.category) || '') === String(pc));
    }

    return (products || []).map(transformProductToPost);
  }, [
    allProducts,
    searchResults,
    featuredProducts,
    trendingProducts,
    newArrivals,
    searchQuery,
    showFeatured,
    showTrending,
    showNewArrivals,
    pc,
    psc,
    pssc,
  ]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setMinPrice(val);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setMaxPrice(val);
  };

  const filteredProducts: PostType[] = useMemo(() => {
    let products = currentProducts;

    const idOf = (v: any) => (v && typeof v === "object" ? v._id : v);

    if (selectedCategories.length > 0) {
      products = products.filter((product) => {
        const catId = idOf(product.productData?.category);
        return selectedCategories.includes(String(catId || ""));
      });
    }

    products = products.filter((product) => {
      const productPrice = parseFloat(product.price || "0");
      return productPrice >= minPrice && productPrice <= maxPrice;
    });

    if (searchQuery) {
      products = products.filter((product) => {
        const title = product.title?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        return title.includes(searchQuery) || category.includes(searchQuery);
      });
    }

    return products;
  }, [currentProducts, selectedCategories, minPrice, maxPrice, searchQuery]);

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Loading / error states
  if (productsLoading || filtersLoading) {
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

                {/* Product Grid Skeleton - 5 per row */}
                <div className="row g-4">
                  {[...Array(15)].map((_, index) => (
                    <div
                      key={index}
                      className="col-lg-20 col-lg-4 col-md-6 col-sm-6 col-12"
                    >
                      <div className="single-shopping-card-one skeleton-product-card">
                        {/* Image Skeleton */}
                        <div className="skeleton-product-image"></div>

                        {/* Badge Skeleton */}
                        <div className="skeleton-badge"></div>

                        {/* Content Skeleton */}
                        <div className="skeleton-product-content">
                          {/* Category */}
                          <div className="skeleton-line short"></div>

                          {/* Title */}
                          <div className="skeleton-line long"></div>
                          <div className="skeleton-line medium"></div>

                          {/* Rating */}
                          <div className="skeleton-rating">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="skeleton-star"></div>
                            ))}
                          </div>

                          {/* Price */}
                          <div className="skeleton-price-wrapper">
                            <div className="skeleton-price"></div>
                            <div className="skeleton-price-old"></div>
                          </div>

                          {/* Actions */}
                          <div className="skeleton-actions">
                            <div className="skeleton-icon-btn"></div>
                            <div className="skeleton-add-btn"></div>
                            <div className="skeleton-icon-btn"></div>
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

          .skeleton-product-card {
            position: relative;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #f0f0f0;
            animation: pulse 2s ease-in-out infinite;
          }

          .skeleton-product-image {
            width: 100%;
            padding-bottom: 100%;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 50px;
            height: 24px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 12px;
          }

          .skeleton-product-content {
            padding: 16px;
          }

          .skeleton-line {
            height: 12px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 10px;
          }

          .skeleton-line.short {
            width: 40%;
            height: 10px;
          }

          .skeleton-line.medium {
            width: 70%;
            height: 14px;
          }

          .skeleton-line.long {
            width: 90%;
            height: 14px;
          }

          .skeleton-rating {
            display: flex;
            gap: 4px;
            margin: 12px 0;
          }

          .skeleton-star {
            width: 14px;
            height: 14px;
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 2px;
          }

          .skeleton-price-wrapper {
            display: flex;
            gap: 8px;
            align-items: center;
            margin: 12px 0;
          }

          .skeleton-price {
            width: 60px;
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
          }

          .skeleton-price-old {
            width: 50px;
            height: 16px;
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

          .skeleton-actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
          }

          .skeleton-icon-btn {
            width: 40px;
            height: 40px;
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

          .skeleton-add-btn {
            flex: 1;
            height: 40px;
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
                              type="checkbox"
                              checked={selectedCategories.includes(String(cat._id))}
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

                {/* Brands removed as per request */}
              </div>
            </div>

            {/* Main Content */}
            <div className="col-xl-9 col-lg-12">
              <div className="filter-select-area">
                <div className="top-filter">
                  <span>Showing {filteredProducts.length} results</span>
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
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(
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
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(
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
