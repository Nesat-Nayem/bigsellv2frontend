"use client";
import React, { useState, useEffect, useRef } from "react";
import HeaderNav from "./HeaderNav";
import CategoryMenu from "./CategoryMenu";
import Cart from "./Cart";
import WishList from "./WishList";
import Sidebar from "./Sidebar";
import BackToTop from "@/components/common/BackToTop";
import { useCompare } from "@/components/header/CompareContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetGeneralSettingsQuery } from "@/store/generalSettings";
import { useSearchProductsQuery, IProducts } from "@/store/productApi";
import { skipToken } from "@reduxjs/toolkit/query/react";

/**
 * HeaderOne - now with dynamic autocomplete suggestions from API
 */

const DEFAULT_SETTINGS = {
  siteTitle: "BigSell",
  logo: "",
  headerTab: "Welcome to BigSell",
  number: "0000000000",
};

/** tiny debounce hook */
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function HeaderOne() {
  const {
    data: generalSettings,
    isLoading,
    isError,
  } = useGetGeneralSettingsQuery();

  const gs = {
    ...DEFAULT_SETTINGS,
    ...(generalSettings ?? {}),
  };

  const { compareItems } = useCompare();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  // RTK Query: will not run if debouncedTerm is empty (skipToken)
  const { data: apiResults = [], isFetching } = useSearchProductsQuery(
    debouncedTerm && debouncedTerm.trim().length > 0 ? debouncedTerm : skipToken
  );
  const typedResults: IProducts[] = apiResults;

  // Map API results to strings to show — adjust if you want other fields
  const suggestions = typedResults.map((p) => p.name).slice(0, 6);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    // show suggestions only when we have something debounced
    if (
      debouncedTerm &&
      debouncedTerm.trim().length > 0 &&
      suggestions.length
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  }, [debouncedTerm, suggestions.length]);

  // click outside to close suggestions
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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rts-header-one-area-one">
        <div style={{ padding: 12 }}>Loading header…</div>
      </div>
    );
  }

  if (isError) {
    console.warn("HeaderOne: failed to load generalSettings, using defaults.");
  }

  return (
    <>
      <div className="rts-header-one-area-one">
        {/* top bar */}
        <div className="header-top-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="bwtween-area-header-top">
                  <div className="discount-area">
                    <p className="disc">{gs.headerTab}</p>
                    {/* optional countdown handled elsewhere */}
                  </div>
                  <div className="contact-number-area">
                    <p>
                      Need help? Call Us:{" "}
                      <Link
                        href={`tel:${gs.number ?? DEFAULT_SETTINGS.number}`}
                      >
                        +91 {gs.number ?? DEFAULT_SETTINGS.number}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* logo + search */}
        <div className="search-header-area-main">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="logo-search-category-wrapper">
                  <Link href="/" className="logo-area">
                    <img
                      src={gs.logo ?? DEFAULT_SETTINGS.logo}
                      alt={gs.siteTitle ?? "logo-main"}
                      className="logo w-25 p-2"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          DEFAULT_SETTINGS.logo;
                      }}
                    />
                  </Link>

                  <div className="category-search-wrapper">
                    <form
                      onSubmit={handleSubmit}
                      className="search-header"
                      autoComplete="off"
                      style={{ position: "relative" }}
                      role="search"
                      aria-label="Site search"
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
                        <div className="arrow-icon" aria-hidden>
                          <svg
                            width={17}
                            height={16}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"
                              stroke="#fff"
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
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
                            maxHeight: "260px",
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
                                opacity: 0.8,
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

                          {suggestions.map((sugg, index) => (
                            <li
                              key={index}
                              id={`option-${index}`}
                              role="option"
                              aria-selected={index === activeIndex}
                              onClick={() => handleSuggestionChoose(sugg)}
                              onMouseDown={(e) => e.preventDefault()}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                background:
                                  index === activeIndex
                                    ? "rgba(0,0,0,0.05)"
                                    : "",
                              }}
                            >
                              {sugg}
                            </li>
                          ))}
                        </ul>
                      )}
                    </form>
                  </div>

                  <div className="actions-area">
                    <div className="search-btn" id="searchs" aria-hidden>
                      <svg
                        width={17}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path
                          d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"
                          stroke="#1F1F25"
                          strokeWidth={1.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <div className="menu-btn" id="menu-btn" aria-hidden>
                      <svg
                        width={20}
                        height={16}
                        viewBox="0 0 20 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect y={14} width={20} height={2} fill="#1F1F25" />
                        <rect y={7} width={20} height={2} fill="#1F1F25" />
                        <rect width={20} height={2} fill="#1F1F25" />
                      </svg>
                    </div>
                  </div>

                  <div className="accont-wishlist-cart-area-header">
                    <Link href="/account" className="btn-border-only account">
                      <i className="fa-light fa-user" />
                      <span>Account</span>
                    </Link>

                    <WishList />
                    <Cart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* main nav */}
        <HeaderNav />
      </div>

      <Sidebar />
      <BackToTop />
    </>
  );
}

export default HeaderOne;
