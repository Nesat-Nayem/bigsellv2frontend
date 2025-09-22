"use client";

import React, { useState } from "react";
import Link from "next/link";

const MobileMenu = () => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openThirdLevelKey, setOpenThirdLevelKey] = useState<string | null>(
    null
  );

  const toggleMenu = (index: number) => {
    setOpenMenuIndex((prev) => (prev === index ? null : index));
  };

  const toggleThirdMenu = (key: string) => {
    setOpenThirdLevelKey((prev) => (prev === key ? null : key));
  };

  return (
    <nav className="nav-main mainmenu-nav mt--30">
      <ul className="mainmenu metismenu" id="mobile-menu-active">
        {/* Home */}
        <li className={`${openMenuIndex === 0 ? "mm-active" : ""}`}>
          <Link href="/" className="main" onClick={() => toggleMenu(0)}>
            Home
          </Link>
        </li>

        {/* Men */}
        <li
          className={`has-droupdown ${openMenuIndex === 2 ? "mm-active" : ""}`}
        >
          <Link href="shop" className="main" onClick={() => toggleMenu(2)}>
            MEN
          </Link>
          <ul
            className={`submenu mm-collapse ${
              openMenuIndex === 2 ? "mm-show" : ""
            }`}
          >
            {/* Shop Layout */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Topwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Details */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Bottomwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Product Feature */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Footware
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Others */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Innearwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>

        {/* woMen */}
        <li
          className={`has-droupdown ${openMenuIndex === 2 ? "mm-active" : ""}`}
        >
          <Link href="shop" className="main" onClick={() => toggleMenu(2)}>
            WOMEN
          </Link>
          <ul
            className={`submenu mm-collapse ${
              openMenuIndex === 2 ? "mm-show" : ""
            }`}
          >
            {/* Shop Layout */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Topwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Details */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Bottomwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Product Feature */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Footware
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Others */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Innearwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>

        {/* kids */}
        <li
          className={`has-droupdown ${openMenuIndex === 2 ? "mm-active" : ""}`}
        >
          <Link href="shop" className="main" onClick={() => toggleMenu(2)}>
            KIDS
          </Link>
          <ul
            className={`submenu mm-collapse ${
              openMenuIndex === 2 ? "mm-show" : ""
            }`}
          >
            {/* Shop Layout */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Topwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Details */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Bottomwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Product Feature */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Footware
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Others */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Innearwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>

        {/* Home */}
        <li
          className={`has-droupdown ${openMenuIndex === 2 ? "mm-active" : ""}`}
        >
          <Link href="shop" className="main" onClick={() => toggleMenu(2)}>
            HOME
          </Link>
          <ul
            className={`submenu mm-collapse ${
              openMenuIndex === 2 ? "mm-show" : ""
            }`}
          >
            {/* Shop Layout */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Topwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Details */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Bottomwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Product Feature */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Footware
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Others */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Innearwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>

        {/* Beauty */}
        <li
          className={`has-droupdown ${openMenuIndex === 2 ? "mm-active" : ""}`}
        >
          <Link href="shop" className="main" onClick={() => toggleMenu(2)}>
            ELECTRONICS
          </Link>
          <ul
            className={`submenu mm-collapse ${
              openMenuIndex === 2 ? "mm-show" : ""
            }`}
          >
            {/* Shop Layout */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Topwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Details */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Bottomwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Product Feature */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Footware
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Others */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Innearwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>

        {/* Genz */}
        <li
          className={`has-droupdown ${openMenuIndex === 2 ? "mm-active" : ""}`}
        >
          <Link href="shop" className="main" onClick={() => toggleMenu(2)}>
            GENZ
          </Link>
          <ul
            className={`submenu mm-collapse ${
              openMenuIndex === 2 ? "mm-show" : ""
            }`}
          >
            {/* Shop Layout */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Topwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Details */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Bottomwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Product Feature */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Footware
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>

            {/* Shop Others */}
            <li className="has-droupdown third-lvl">
              <Link
                href="#"
                className="main"
                onClick={() => toggleThirdMenu("shopLayout")}
              >
                Innearwear
              </Link>
              <ul
                className={`submenu-third-lvl mm-collapse ${
                  openThirdLevelKey === "shopLayout" ? "mm-show" : ""
                }`}
              >
                <li>
                  <Link href="/shop">T-Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Casual Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Formal Shirts</Link>
                </li>
                <li>
                  <Link href="/shop">Sweatshirts</Link>
                </li>
                <li>
                  <Link href="/shop">Jackets</Link>
                </li>
                <li>
                  <Link href="/shop">Blazers & Coats</Link>
                </li>
                <li>
                  <Link href="/shop">Suits</Link>
                </li>
                <li>
                  <Link href="/shop">Rain Jackets</Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>

        {/* About */}
        <li>
          <Link className="main" href="/about">
            ABOUT US
          </Link>
        </li>
        {/* Blog */}
        <li>
          <Link className="main" href="/blog">
            BLOG
          </Link>
        </li>

        {/* Contact */}
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
