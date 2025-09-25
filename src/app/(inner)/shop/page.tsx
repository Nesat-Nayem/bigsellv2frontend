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
      ? Number((product.discount as any)?.amount ?? (product.discount as any)?.value ?? 0)
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

  const [activeTab, setActiveTab] = useState<string>("tab1");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
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

  // Categories derived from actual products (keeps existing behavior)
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    (allProducts || []).forEach((p: any) => {
      if (p && p.category) {
        const category =
          typeof p.category === "object"
            ? p.category.title || p.category._id || p.category.name
            : p.category;
        if (category && typeof category === "string") categories.add(category);
      }
    });
    return Array.from(categories);
  }, [allProducts]);

  // Brands: prefer API list if available, else derive from products
  const derivedBrands = useMemo(() => {
    const brands = new Set<string>();
    (allProducts || []).forEach((p: any) => {
      if (p && p.brand) {
        const brand =
          typeof p.brand === "object"
            ? p.brand.title || p.brand._id || p.brand.name
            : p.brand;
        if (brand && typeof brand === "string") brands.add(brand);
      }
    });
    return Array.from(brands);
  }, [allProducts]);

  const allBrands = apiBrands.length > 0 ? apiBrands : derivedBrands;

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
  ]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
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

    if (selectedCategories.length > 0) {
      products = products.filter((product) =>
        selectedCategories.includes(product.category || "")
      );
    }

    if (selectedBrands.length > 0) {
      // Build a map of slug -> brand from effectiveProducts
      const brandsMap = new Map<string, string>();
      (effectiveProducts || []).forEach((p: any) => {
        const slug =
          p.sku ||
          p._id ||
          (p.name && typeof p.name === "string"
            ? p.name.toLowerCase().replace(/\s+/g, "-")
            : "unknown");
        const brand =
          p?.brand && typeof p.brand === "object"
            ? p.brand?.title || p.brand?._id || p.brand?.name
            : p?.brand;
        brandsMap.set(slug, brand || "");
      });

      products = products.filter((product) => {
        const brand = brandsMap.get(product.slug);
        return selectedBrands.includes(brand || "");
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
  }, [
    currentProducts,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    searchQuery,
    effectiveProducts,
  ]);

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Loading / error states
  if (productsLoading || filtersLoading) {
    return (
      <div className="text-center py-20">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading products and filters...</p>
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
                        <button type="submit" className="rts-btn btn-primary">
                          Filter
                        </button>
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
                      {allCategories.length > 0 ? (
                        allCategories.map((cat, i) => (
                          <div className="single-category" key={i}>
                            <input
                              id={`cat${i + 1}`}
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={() => handleCategoryChange(cat)}
                            />
                            <label htmlFor={`cat${i + 1}`}>{cat}</label>
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
                  <h5 className="title">Select Brands</h5>
                  <div className="filterbox-body">
                    <div className="category-wrapper">
                      {allBrands.length > 0 ? (
                        allBrands.map((brand, i) => (
                          <div className="single-category" key={i}>
                            <input
                              id={`brand${i + 1}`}
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => handleBrandChange(brand)}
                            />
                            <label htmlFor={`brand${i + 1}`}>{brand}</label>
                          </div>
                        ))
                      ) : (
                        <p>Loading brands...</p>
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
                  <span>Showing {filteredProducts.length} results</span>
                  <div className="right-end">
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
                  </div>
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
                                className="col-lg-20 col-lg-4 col-md-6 col-sm-6 col-12"
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
      <HeaderOne />
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
