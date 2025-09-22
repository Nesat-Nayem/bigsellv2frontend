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
          <ul className="parent-nav">
            <li className="parent">Loading categories...</li>
          </ul>
        </nav>
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
          <li className="parent">
            <Link href="/payment-policy" className="fs-16">
              Pricing and Payment{" "}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default NavItem;
