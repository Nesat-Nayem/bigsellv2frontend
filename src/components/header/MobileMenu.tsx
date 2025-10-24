"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IAttribute,
  useGetCategoryTreeQuery,
} from "@/store/productCategoryApi";

export interface ICategory {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  level?: number;
  path?: string;
  fullPath?: string;
  isActive?: boolean;
  displayOrder?: number;
  attributes?: IAttribute[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  image?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  children?: ICategory[];
}
const MobileMenu = () => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openThirdLevelKey, setOpenThirdLevelKey] = useState<string | null>(
    null
  );

  const { data: categories, isLoading } = useGetCategoryTreeQuery({ maxDepth: 3 });

  const toggleMenu = (index: number) => {
    setOpenMenuIndex((prev) => (prev === index ? null : index));
  };

  const toggleThirdMenu = (key: string) => {
    setOpenThirdLevelKey((prev) => (prev === key ? null : key));
  };

  const buildShopHref = (ids: { pc?: string; psc?: string; pssc?: string }) => {
    const params = new URLSearchParams();
    if (ids.pc) params.set('pc', String(ids.pc));
    if (ids.psc) params.set('psc', String(ids.psc));
    if (ids.pssc) params.set('pssc', String(ids.pssc));
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ''}`;
  };

  return (
    <nav className="nav-main mainmenu-nav mt--30">
      <ul className="mainmenu metismenu" id="mobile-menu-active">
        {/* Static Links */}
        <li className={`${openMenuIndex === 0 ? "mm-active" : ""}`}>
          <Link href="/" className="main" onClick={() => toggleMenu(0)}>
            Home
          </Link>
        </li>

        {isLoading ? (
          <li>Loading...</li>
        ) : (
          categories?.map((category: ICategory, index: number) => (
            <li
              key={category._id}
              className={`${category.children?.length ? "has-droupdown" : ""} ${
                openMenuIndex === index + 1 ? "mm-active" : ""
              }`}
            >
              <a
                href="#"
                className="main"
                onClick={(e) => { e.preventDefault(); toggleMenu(index + 1); }}
              >
                {category.title}
              </a>

              {/* 2nd Level */}
              {category.children && category.children.length > 0 && (
                <ul
                  className={`submenu mm-collapse ${
                    openMenuIndex === index + 1 ? "mm-show" : ""
                  }`}
                >
                  {category.children.map((child) => (
                    <li
                      key={child._id}
                      className={`${
                        child.children?.length ? "has-droupdown third-lvl" : ""
                      }`}
                    >
                      <a
                        href="#"
                        className="main"
                        onClick={(e) => { e.preventDefault(); toggleThirdMenu(child._id); }}
                      >
                        {child.title}
                      </a>

                      {/* 3rd Level */}
                      {child.children && child.children.length > 0 && (
                        <ul
                          className={`submenu-third-lvl mm-collapse ${
                            openThirdLevelKey === child._id ? "mm-show" : ""
                          }`}
                        >
                          {child.children.map((grand) => (
                            <li key={grand._id}>
                              <Link href={buildShopHref({ pc: category._id, psc: child._id, pssc: grand._id })}>
                                {grand.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
        )}

        {/* Static Bottom Links */}
        <li>
          <Link className="main" href="/about">
            ABOUT US
          </Link>
        </li>
        <li>
          <Link className="main" href="/blog">
            BLOG
          </Link>
        </li>
        <li>
          <Link className="main" href="/contact">
            CONTACT US
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MobileMenu;
