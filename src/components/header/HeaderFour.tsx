"use client";
import React, { useState, useEffect, useRef } from "react";
import Nav from "./Nav";
import CategoryMenu from "./CategoryMenu";
import Cart from "./Cart";
import WishList from "./WishList";
import BackToTop from "@/components/common/BackToTop";
import Sidebar from "./Sidebar";
import { useCompare } from "@/components/header/CompareContext";
import { useRouter } from "next/navigation";
import { useSearchProductsQuery } from "@/store/productApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import type { IProducts } from "@/store/productApi";

/**
 * HeaderOne with dynamic autocomplete using your products API
 */

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function HeaderOne() {
  const { compareItems } = useCompare();

  // COUNTDOWN (kept as original)
  useEffect(() => {
    const countDownElements =
      document.querySelectorAll<HTMLElement>(".countDown");
    const endDates: Date[] = [];

    countDownElements.forEach((el) => {
      const match = el.innerText.match(
        /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/
      );
      if (!match) return;

      const end = new Date(
        +match[3],
        +match[1] - 1,
        +match[2],
        +match[4],
        +match[5],
        +match[6]
      );
      if (end > new Date()) {
        endDates.push(end);
        const next = calcTime(end.getTime() - new Date().getTime());
        el.innerHTML = renderDisplay(next);
      } else {
        el.innerHTML = `<p class="end">Sorry, your session has expired.</p>`;
      }
    });

    const interval = setInterval(() => {
      countDownElements.forEach((el, i) => {
        const end = endDates[i];
        if (!end) return;
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) {
          el.innerHTML = `<p class="end">Sorry, your session has expired.</p>`;
        } else {
          const next = calcTime(diff);
          el.innerHTML = renderDisplay(next);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calcTime = (milliseconds: number) => {
    const secondsTotal = Math.floor(milliseconds / 1000);
    const days = Math.floor(secondsTotal / 86400);
    const hours = Math.floor((secondsTotal % 86400) / 3600);
    const minutes = Math.floor((secondsTotal % 3600) / 60);
    const seconds = secondsTotal % 60;
    return [days, hours, minutes, seconds].map((v) =>
      v.toString().padStart(2, "0")
    );
  };

  const renderDisplay = (timeArr: string[]) => {
    return timeArr
      .map(
        (item) =>
          `<div class='container'><div class='a'><div>${item}</div></div></div>`
      )
      .join("");
  };

  // STICKY HEADER
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) setIsSticky(true);
      else setIsSticky(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuClick = () => {
    const sidebar = document.querySelector(".side-bar.header-two");
    if (sidebar) sidebar.classList.toggle("show");
  };

  const handleSearchOpen = () => {
    const sidebar = document.querySelector(".search-input-area");
    if (sidebar) sidebar.classList.toggle("show");
  };

  // SEARCH + AUTOCOMPLETE (dynamic via API)
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, 300);

  // NOTE: keep the type annotation here to avoid implicit any issues
  const { data: apiResults = [] as IProducts[], isFetching } =
    useSearchProductsQuery(
      debouncedTerm && debouncedTerm.trim().length > 0
        ? debouncedTerm
        : skipToken
    );

  // Build suggestions from API results (use name; you can include slug/_id later)
  const suggestions = (apiResults || []).map((p) => p.name ?? "").slice(0, 6);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (
      debouncedTerm &&
      debouncedTerm.trim().length > 0 &&
      suggestions.length > 0
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  }, [debouncedTerm, suggestions.length]);

  // click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target)
      ) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionChoose = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(false);
    setActiveIndex(-1);
    router.push(`/shop?search=${encodeURIComponent(value)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    } else {
      router.push("/shop");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSuggestionChoose(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  return (
    <>
      <header className="header-style-two header-four bg-primary-header header-primary-sticky header--fft">
        <div className="header-top-area bg_primary">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="bwtween-area-header-top header-top-style-four">
                  <div className="hader-top-menu">
                    <a href="#">About Us</a>
                    <a href="#">My Account </a>
                    <a href="#">Wishlist</a>
                    <a href="#">Order Tracking</a>
                  </div>
                  <p>Welcome to our Organic store&nbsp;EkoMart!</p>
                  <div className="follow-us-social">
                    <span>Follow Us:</span>
                    <div className="social">
                      <a href="#">
                        <i className="fa-brands fa-facebook-f" />
                      </a>
                      <a href="#">
                        <i className="fa-brands fa-youtube" />
                      </a>
                      <a href="#">
                        <i className="fa-regular fa-basketball" />
                      </a>
                      <a href="#">
                        <i className="fa-brands fa-skype" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="search-header-area-main bg_white without-category">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="logo-search-category-wrapper">
                  <a href="/" className="logo-area">
                    <img
                      src="/assets/images/logo/logo-01.svg"
                      alt="logo-main"
                      className="logo"
                    />
                  </a>
                  <div className="category-search-wrapper">
                    <div className="location-area">
                      <div className="icon">
                        <i className="fa-light fa-location-dot" />
                      </div>
                      <div className="information">
                        <span>Your location</span>
                        <p>Select Location</p>
                      </div>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="search-header"
                      autoComplete="off"
                      style={{ position: "relative" }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for products, categories or brands"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() =>
                          searchTerm.length > 0 && setShowSuggestions(true)
                        }
                        onKeyDown={onKeyDown}
                        aria-autocomplete="list"
                        aria-controls="autocomplete-list"
                        aria-activedescendant={
                          activeIndex >= 0 ? `option-${activeIndex}` : undefined
                        }
                      />
                      <button
                        type="submit"
                        className="rts-btn btn-primary radious-sm with-icon"
                      >
                        <div className="btn-text">Search</div>
                        <div className="arrow-icon">
                          <i className="fa-light fa-magnifying-glass" />
                        </div>
                      </button>

                      {/* Autocomplete dropdown */}
                      {showSuggestions && (
                        <ul
                          id="autocomplete-list"
                          ref={suggestionsRef}
                          className="autocomplete-suggestions"
                          style={{
                            position: "absolute",
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            marginTop: "4px",
                            width: "100%",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1000,
                            listStyleType: "none",
                            padding: 0,
                            borderRadius: "4px",
                          }}
                          role="listbox"
                          aria-label="Search suggestions"
                        >
                          {isFetching && (
                            <li
                              style={{
                                padding: "8px 12px",
                                fontStyle: "italic",
                              }}
                            >
                              Loading...
                            </li>
                          )}
                          {!isFetching && suggestions.length === 0 && (
                            <li style={{ padding: "8px 12px", opacity: 0.8 }}>
                              No suggestions
                            </li>
                          )}

                          {suggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              id={`option-${index}`}
                              role="option"
                              aria-selected={index === activeIndex}
                              onClick={() => handleSuggestionChoose(suggestion)}
                              onMouseDown={(e) => e.preventDefault()}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                background:
                                  index === activeIndex
                                    ? "rgba(0,0,0,0.04)"
                                    : undefined,
                              }}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </form>
                  </div>

                  <div className="accont-wishlist-cart-area-header">
                    <a href="#" className="btn-border-only account">
                      <i className="fa-light fa-user" />
                      Account
                    </a>
                    <a
                      href="/shop-compare"
                      className="btn-border-only account compare-number"
                    >
                      <i className="fa-regular fa-code-compare"></i>
                      <span className="number">{compareItems.length}</span>
                    </a>
                    <WishList />
                    <Cart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rts-header-nav-area-one  header-four header--sticky  ${
            isSticky ? "sticky" : ""
          }`}
        >
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="nav-and-btn-wrapper">
                  <div className="nav-area-bottom-left-header-four">
                    <div className="category-btn category-hover-header">
                      <span>All Categories</span>
                      <CategoryMenu />
                    </div>
                    <div className="nav-area">
                      <Nav />
                    </div>
                  </div>

                  <div className="right-location-area fourt">
                    <p>
                      Get 30% Discount Now <span>Sale</span>
                    </p>
                  </div>
                </div>

                <div className="logo-search-category-wrapper">
                  <a href="/" className="logo-area">
                    <img
                      src="/assets/images/logo/logo-01.svg"
                      alt="logo-main"
                      className="logo"
                    />
                  </a>
                  {/* ... rest of the markup left intact (categories, cart preview, etc.) */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <BackToTop />
      <Sidebar />
    </>
  );
}

export default HeaderOne;
