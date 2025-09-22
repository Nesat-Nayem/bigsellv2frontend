"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLazyGetCategoryTreeQuery } from "@/store/productCategoryApi";
import type { ICategory } from "@/store/productCategoryApi";

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="nav-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <li key={i} className="parent">
          <div className="skeleton-item fs-16"></div>
        </li>
      ))}
    </div>
  );
}

// Individual category column for megamenu
function CategoryColumn({ category }: { category: ICategory }) {
  return (
    <div className="single-megamenu-wrapper">
      <p className="title">{category.title}</p>
      <ul>
        {category.children && category.children.length > 0 ? (
          category.children.map((child) => (
            <li key={child._id}>
              <Link
                href={`/shop?category=${encodeURIComponent(
                  child.slug || child._id
                )}`}
                className="megamenu-link"
              >
                {child.title}
              </Link>
            </li>
          ))
        ) : (
          <li>
            <Link
              href={`/shop?category=${encodeURIComponent(
                category.slug || category._id
              )}`}
              className="megamenu-link"
            >
              {category.title}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

// Main navigation component
export default function NavItem() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [activeRootCategory, setActiveRootCategory] =
    useState<ICategory | null>(null);
  const [mounted, setMounted] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use lazy query to avoid SSR issues and rendering during hydration
  const [
    triggerGetCategories,
    { data: categoryTree = [], isLoading, error, isUninitialized },
  ] = useLazyGetCategoryTreeQuery();

  // Handle component mount
  useEffect(() => {
    setMounted(true);
    // Trigger the query after component is mounted
    if (mounted) {
      triggerGetCategories({ maxDepth: 3 });
    }
  }, [mounted, triggerGetCategories]);

  // Handle mouse enter on root category
  const handleCategoryMouseEnter = useCallback((category: ICategory) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setActiveRootCategory(category);
    setHoveredCategory(category._id);

    if (category.children && category.children.length > 0) {
      setShowMegaMenu(true);
    }
  }, []);

  // Handle mouse leave from navigation
  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowMegaMenu(false);
      setActiveRootCategory(null);
      setHoveredCategory(null);
    }, 300); // 300ms delay before hiding
  }, []);

  // Handle mouse enter on mega menu (prevent hiding)
  const handleMegaMenuMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Don't render anything until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <nav aria-label="Primary" className="primary-navigation">
        <ul className="parent-nav">
          <LoadingSkeleton />
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
    );
  }

  // Loading state
  if (isLoading || isUninitialized) {
    return (
      <nav aria-label="Primary" className="primary-navigation">
        <ul className="parent-nav">
          <LoadingSkeleton />
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
    );
  }

  // Error state
  if (error) {
    return (
      <nav aria-label="Primary" className="primary-navigation">
        <ul className="parent-nav">
          <li className="parent">
            <Link href="/shop" className="fs-16">
              SHOP
            </Link>
          </li>
          <li className="parent">
            <button
              onClick={() => triggerGetCategories({ maxDepth: 3 })}
              className="retry-btn fs-16"
            >
              Retry Categories
            </button>
          </li>
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
    );
  }

  return (
    <div className="navigation-container">
      <nav aria-label="Primary" className="primary-navigation">
        <ul className="parent-nav" onMouseLeave={handleMouseLeave}>
          {/* Dynamic Category Navigation */}
          {Array.isArray(categoryTree) &&
            categoryTree.map((rootCategory) => (
              <li
                key={rootCategory._id}
                className={`parent ${
                  rootCategory.children?.length ? "with-megamenu" : ""
                } ${hoveredCategory === rootCategory._id ? "active" : ""}`}
                onMouseEnter={() => handleCategoryMouseEnter(rootCategory)}
              >
                <Link
                  href={`/shop?category=${encodeURIComponent(
                    rootCategory.slug || rootCategory._id
                  )}`}
                  className="fs-16 nav-link"
                >
                  {rootCategory.title?.toUpperCase()}
                  {/* {rootCategory.children?.length > 0 && (
                  <span className="dropdown-icon">▾</span>
                )} */}
                </Link>
              </li>
            ))}

          {/* Static Navigation Items */}
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

      {/* Mega Menu */}
      {showMegaMenu && activeRootCategory && activeRootCategory.children && (
        <div
          className={`rts-megamenu ${showMegaMenu ? "visible" : ""}`}
          role="region"
          aria-label={`${activeRootCategory.title} categories menu`}
          onMouseEnter={handleMegaMenuMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="wrapper">
            <div className="row">
              <div className="col-12">
                <div className="megamenu-item-wrapper">
                  {/* Category Columns */}
                  {activeRootCategory.children.map((subcategory) => (
                    <CategoryColumn
                      key={subcategory._id}
                      category={subcategory}
                    />
                  ))}

                  {/* See All Section */}
                  <div className="single-megamenu-wrapper see-all-wrapper">
                    <p className="title">See All</p>
                    <ul>
                      <li>
                        <Link
                          href={`/shop?category=${encodeURIComponent(
                            activeRootCategory.slug || activeRootCategory._id
                          )}`}
                          className="see-all-link"
                        >
                          All {activeRootCategory.title}
                        </Link>
                      </li>
                      <li>
                        <Link href={`/shop`} className="see-all-link">
                          Browse All Products
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Megamenu Background Overlay */}
          <div className="megamenu-bg"></div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .navigation-container {
          position: relative;
        }

        .primary-navigation {
          position: relative;
          z-index: 100;
        }

        .parent-nav {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
        }

        .parent {
          position: relative;
          margin: 0 1rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0;
          text-decoration: none;
          transition: color 0.3s ease;
          color: inherit;
        }

        .nav-link:hover {
          color: #007bff;
        }

        .dropdown-icon {
          font-size: 0.8rem;
          transition: transform 0.3s ease;
        }

        .parent.active .dropdown-icon {
          transform: rotate(180deg);
        }

        .rts-megamenu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1000;
          min-height: 300px;
        }

        .rts-megamenu.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .wrapper {
          padding: 2rem;
        }

        .megamenu-item-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .single-megamenu-wrapper {
          min-height: 150px;
        }

        .single-megamenu-wrapper .title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.5rem;
        }

        .single-megamenu-wrapper ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .single-megamenu-wrapper li {
          margin-bottom: 0.5rem;
        }

        .megamenu-link {
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: block;
          padding: 0.25rem 0;
          border-radius: 4px;
        }

        .megamenu-link:hover {
          color: #007bff;
          padding-left: 0.5rem;
          background-color: rgba(0, 123, 255, 0.05);
        }

        .see-all-wrapper {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 1.5rem;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
          position: relative;
          overflow: hidden;
        }

        .see-all-wrapper::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #007bff, #28a745, #007bff);
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .see-all-wrapper:hover::before {
          opacity: 0.1;
        }

        .see-all-link {
          color: #007bff;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .see-all-link:hover {
          color: #0056b3;
          text-decoration: underline;
        }

        .megamenu-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          z-index: -1;
          backdrop-filter: blur(2px);
        }

        .nav-skeleton {
          display: flex;
          gap: 2rem;
        }

        .skeleton-item {
          width: 100px;
          height: 20px;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .retry-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
          font-size: inherit;
        }

        .retry-btn:hover {
          background: #c82333;
        }

        /* Enhanced hover effects */
        .parent.with-megamenu:hover .nav-link {
          color: #007bff;
        }

        .parent.active {
          background: rgba(0, 123, 255, 0.05);
          border-radius: 4px;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .megamenu-item-wrapper {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .wrapper {
            padding: 1rem;
          }

          .parent {
            margin: 0 0.5rem;
          }

          .rts-megamenu {
            left: 1rem;
            right: 1rem;
            border-radius: 12px;
          }

          .nav-link {
            padding: 0.5rem 0;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .parent {
            margin: 0 0.25rem;
          }

          .nav-link {
            font-size: 0.8rem;
          }

          .wrapper {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
