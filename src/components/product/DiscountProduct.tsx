// src/components/product/DiscountProduct.tsx
"use client";
import React from "react";
import DiscountProductMain from "@/components/product-main/DiscountProductMain";
import { useGetDiscountProductsQuery, IProducts } from "@/store/productApi";
import Link from "next/link";

interface PostType {
  id?: string;
  category?: string;
  slug: string;
  image: string;
  title?: string;
  author?: string;
  publishedDate?: string;
  price?: string;
  del?: string;
  material?: string;
}

function DiscountProduct() {
  // Request a larger page (limit) from backend so we get unique items if backend supports it
  const {
    data: discountProducts = [],
    isLoading,
    error,
  } = useGetDiscountProductsQuery(12); // <-- request up to 12 items

  // Transform API products to PostType format (include id!)
  const transformProductToPost = (product: IProducts): PostType => {
    let material = product.brand || "";
    if (product.specifications) {
      if (Array.isArray(product.specifications)) {
        const materialSpec = product.specifications.find(
          (spec) => spec.key?.toLowerCase() === "material"
        );
        material = materialSpec?.value || product.brand || "";
      } else if (typeof product.specifications === "object") {
        material =
          (product.specifications as any).Material || product.brand || "";
      }
    }

    return {
      id: (product as any).id || (product as any)._id || undefined,
      slug:
        product.slug || product.name?.toLowerCase().replace(/\s+/g, "-") || "",
      image: product.thumbnail || product.images?.[0] || "",
      title: product.name || "",
      price: product.price?.toString() || "0",
      del: product.originalPrice?.toString() || "",
      material,
      category:
        typeof product.category === "object"
          ? (product.category as any)?.title
          : (product.category as string | undefined),
    };
  };

  // Map API results into PostType
  const selectedPosts: PostType[] = (discountProducts || [])
    .map(transformProductToPost)
    .slice(0, 12); // keep up to 12 mapped posts (matches the requested limit)

  // Robust helper: get posts by indices but return unique posts and avoid infinite repeats
  const getPostsByIndices = (indices: number[]): PostType[] => {
    if (!selectedPosts.length) return [];

    // normalize index into [0..len-1]
    const normalizeIndex = (idx: number) =>
      ((idx % selectedPosts.length) + selectedPosts.length) %
      selectedPosts.length;

    const picked: PostType[] = [];
    const pickedIds = new Set<string | undefined>();

    // try to pick indices in order; skip duplicates
    for (const rawIdx of indices) {
      const idx = normalizeIndex(rawIdx);
      const candidate = selectedPosts[idx];
      const id = candidate?.id ?? candidate?.slug ?? `${idx}`;

      if (!pickedIds.has(id)) {
        picked.push(candidate);
        pickedIds.add(id);
      }

      // if we've collected as many unique as available, we can stop early
      if (picked.length >= selectedPosts.length) break;
    }

    // If the indices wanted more cards than unique products available,
    // optionally append remaining unique products (in order) until we reach the requested count
    let i = 0;
    while (
      picked.length < indices.length &&
      picked.length < selectedPosts.length
    ) {
      const candidate = selectedPosts[i++];
      const id = candidate?.id ?? candidate?.slug ?? `${i}`;
      if (!pickedIds.has(id)) {
        picked.push(candidate);
        pickedIds.add(id);
      }
    }

    // If still fewer than indices length, we will return what we have (no duplicates).
    // This avoids repeating the same product many times when only 1 product exists.
    return picked;
  };

  // Define section sizes / indices (you can keep these or reduce them to match available products)
  const postIndicesSection1 = [0, 1, 2, 3];
  const postIndicesSection2 = [4, 5, 6, 7, 8, 9];
  const postIndicesSection3 = [5, 6, 8, 7, 3, 2];
  const postIndicesSection4 = [1, 2, 6, 7, 8, 2];

  const postsSection1 = getPostsByIndices(postIndicesSection1);
  const postsSection2 = getPostsByIndices(postIndicesSection2);
  const postsSection3 = getPostsByIndices(postIndicesSection3);
  const postsSection4 = getPostsByIndices(postIndicesSection4);

  if (isLoading) {
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <p>Loading discount products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <p>Error loading discount products. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPosts.length) {
    return (
      <div className="rts-grocery-feature-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <p>No discounted products available right now.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* rts grocery feature area start */}
      <div className="rts-grocery-feature-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-area-between">
                <h2 className="title-left">Products With Discounts</h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="product-with-discount">
                <div className="row g-5">
                  <div className="col-xl-4 col-lg-12">
                    <Link
                      href="shop-details.html"
                      className="single-discount-with-bg"
                    >
                      <div className="inner-content">
                        <h4 className="title" style={{ color: "#000" }}>
                          New Arrivals Fashion <br /> Seasonal Collection
                        </h4>
                        <div className="price-area">
                          <h4 className="title" style={{ color: "#1b3f76" }}>
                            Up to 75% Off
                          </h4>
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="shop-details.html"
                      className="single-discount-with-bg bg-2"
                    >
                      <div className="inner-content text-end">
                        <h2 className="title " style={{ color: "#000" }}>
                          New Arrivals Fashion Seasonal Collection
                        </h2>
                        <div className="price-area">
                          <h4 className="title" style={{ color: "#1b3f76" }}>
                            Up to 75% Off
                          </h4>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-xl-8 col-lg-12">
                    <div className="row g-4">
                      {postsSection1.map((post: PostType, index: number) => (
                        <div key={post.id ?? index} className="col-lg-6 col-6">
                          <div className="single-shopping-card-one discount-offer">
                            <DiscountProductMain
                              productData={post}
                              Slug={post.slug || post.id || ""}
                              ProductImage={post.image}
                              ProductTitle={post.title}
                              Price={post.price}
                              del={post.del}
                              material={post.material}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* render other sections if you want */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* rts grocery feature area end */}
    </div>
  );
}

export default DiscountProduct;
