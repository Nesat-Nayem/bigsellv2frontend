"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useGetCategoryTreeQuery } from "@/store/productCategoryApi";

/**
 * Category shape (matches the JSON you provided)
 */
export interface ICategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  level?: number;
  path?: string;
  fullPath?: string;
  isActive?: boolean;
  displayOrder?: number;
  attributes?: any[];
  children?: ICategory[];
}

/**
 * NavItem — dynamic recursive megamenu
 */
function NavItem() {
  // your RTK Query call — sometimes backend wraps result in { data: [...] }
  const {
    data: rawCategoryTree,
    isLoading,
    isError,
  } = useGetCategoryTreeQuery({ maxDepth: 3 });

  // Normalize: accept either ICategory[] or { data: ICategory[] }
  const categoryTree: ICategory[] | undefined =
    (rawCategoryTree as any)?.data ??
    (rawCategoryTree as ICategory[] | undefined);

  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  // Recursive renderer for category columns (one column per node)
  const renderCategoryColumn = (category: ICategory) => {
    return (
      <div key={category._id} className="single-megamenu-wrapper">
        <p className="title">{category.title}</p>
        <ul>
          {category.children && category.children.length > 0 ? (
            category.children.map((child) => (
              <li key={child._id}>
                <Link href={`/shop?category=${encodeURIComponent(child.slug)}`}>
                  {child.title}
                </Link>
              </li>
            ))
          ) : (
            <li>
              <Link
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
              >
                View {category.title}
              </Link>
            </li>
          )}
        </ul>
      </div>
    );
  };

  // Render a main category with megamenu (columns = its direct children)
  const renderCategoryMenu = (mainCategory: ICategory) => (
    <li
      key={mainCategory._id}
      className={`parent with-megamenu`}
      onMouseEnter={() => setOpenMenuFor(mainCategory._id)}
      onMouseLeave={() =>
        setOpenMenuFor((id) => (id === mainCategory._id ? null : id))
      }
    >
      <Link href="#" className="fs-16">
        {mainCategory.title.toUpperCase()}
      </Link>

      {/* show megamenu only when this category is hovered (simple approach) */}
      <div
        className="rts-megamenu"
        style={{ display: openMenuFor === mainCategory._id ? "block" : "none" }}
        aria-hidden={openMenuFor !== mainCategory._id}
      >
        <div className="wrapper">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <div className="megamenu-item-wrapper">
                {/* If there are children, render each child as a column.
                    If a child has its own children (grandchildren), you might want a nested column
                    or additional links inside that child's list. */}
                {mainCategory.children && mainCategory.children.length > 0 ? (
                  mainCategory.children.map((child) =>
                    renderCategoryColumn(child)
                  )
                ) : (
                  <div className="single-megamenu-wrapper">
                    <p className="title">{mainCategory.title}</p>
                    <ul>
                      <li>
                        <Link
                          href={`/shop?category=${encodeURIComponent(
                            mainCategory.slug
                          )}`}
                        >
                          View {mainCategory.title}
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );

  if (isLoading) {
    return (
      <div>
        <nav>
          <ul className="parent-nav skeleton-nav-wrapper">
            {[...Array(7)].map((_, index) => (
              <li key={index} className="parent skeleton-nav-item">
                <div className="skeleton-nav-link"></div>
              </li>
            ))}
          </ul>
        </nav>

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }

          .skeleton-nav-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .skeleton-nav-item {
            animation: pulse 2s ease-in-out infinite;
          }

          .skeleton-nav-link {
            height: 20px;
            width: ${[120, 100, 140, 90, 110, 130, 95][Math.floor(Math.random() * 7)]}px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            display: inline-block;
          }

          .skeleton-nav-item:nth-child(1) .skeleton-nav-link {
            width: 120px;
          }

          .skeleton-nav-item:nth-child(2) .skeleton-nav-link {
            width: 100px;
          }

          .skeleton-nav-item:nth-child(3) .skeleton-nav-link {
            width: 140px;
          }

          .skeleton-nav-item:nth-child(4) .skeleton-nav-link {
            width: 90px;
          }

          .skeleton-nav-item:nth-child(5) .skeleton-nav-link {
            width: 110px;
          }

          .skeleton-nav-item:nth-child(6) .skeleton-nav-link {
            width: 95px;
          }

          .skeleton-nav-item:nth-child(7) .skeleton-nav-link {
            width: 105px;
          }
        `}</style>
      </div>
    );
  }

  if (isError || !categoryTree) {
    return (
      <div>
        <nav>
          <ul className="parent-nav">
            <li className="parent">Error loading categories</li>
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div>
      <nav>
        <ul className="parent-nav">
          {categoryTree.map((category) =>
            category.children && category.children.length > 0 ? (
              renderCategoryMenu(category)
            ) : (
              <li key={category._id} className="parent">
                <Link
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="fs-16"
                >
                  {category.title.toUpperCase()}
                </Link>
              </li>
            )
          )}

          {/* Keep static fallbacks or other nav items, but I recommend removing duplicates */}
          <li className="parent">
            <Link href="/about" className="fs-16">
              ABOUT US
            </Link>
          </li>
          <li className="parent">
            <Link href="/contact" className="fs-16">
              CONTACT US
            </Link>
          </li>
          {/* <li className="parent">
            <Link href="/payment-policy" className="fs-16">
              Pricing and Payment{" "}
            </Link>
          </li> */}
        </ul>
      </nav>
    </div>
  );
}

export default NavItem;
