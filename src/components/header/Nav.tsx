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

  // Build shop URL with product-category deep link params
  const buildShopHref = (ids: { pc?: string; psc?: string; pssc?: string }) => {
    const params = new URLSearchParams();
    if (ids.pc) params.set('pc', String(ids.pc));
    if (ids.psc) params.set('psc', String(ids.psc));
    if (ids.pssc) params.set('pssc', String(ids.pssc));
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ''}`;
  };

  // Recursive renderer for category columns (one column per node)
  const renderCategoryColumn = (category: ICategory) => {
    return (
      <div key={category._id} className="single-megamenu-wrapper">
        <p className="title">{category.title}</p>
        <ul>
          {category.children && category.children.length > 0 ? (
            category.children.map((child) => (
              <li key={child._id}>
                <Link href={buildShopHref({ pc: category.parentId || undefined, psc: category._id, pssc: child._id })}>
                  {child.title}
                </Link>
              </li>
            ))
          ) : (
            <li>
              <Link href={buildShopHref({ pc: category.parentId || undefined, psc: category._id })}>
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
                  <div className="single-megamenu-wrapper single-megamenu-wrapper-with-megalink">
                    <p className="title">{mainCategory.title}</p>
                    <ul>
                      <li>
                        <Link href={buildShopHref({ pc: mainCategory._id })}>
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
            {[120, 100, 140, 90, 110, 130, 95].map((width, index) => (
              <li key={index} className="parent skeleton-nav-item">
                <div className="skeleton-nav-link" style={{ width: `${width}px` }}></div>
              </li>
            ))}
          </ul>
        </nav>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          .skeleton-nav-wrapper {
            display: flex;
            align-items: center;
            gap: 24px;
            list-style: none;
            margin: 0;
            padding: 12px 0;
          }

          .skeleton-nav-item {
            position: relative;
            overflow: hidden;
          }

          .skeleton-nav-link {
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
            border-radius: 6px;
            display: block;
          }

          @media (max-width: 991px) {
            .skeleton-nav-wrapper {
              gap: 16px;
            }
            .skeleton-nav-link {
              height: 16px;
            }
          }

          @media (max-width: 767px) {
            .skeleton-nav-wrapper {
              flex-wrap: wrap;
              gap: 12px;
            }
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
                <Link href={buildShopHref({ pc: category._id })} className="fs-16">
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
   
        </ul>
      </nav>
    </div>
  );
}

export default NavItem;
