// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import Nav from "./Nav";
// import CategoryMenu from "./CategoryMenu";
// import Cart from "./Cart";
// import WishList from "./WishList";
// import BackToTop from "@/components/common/BackToTop";
// import Sidebar from "./Sidebar";
// import { useCompare } from "@/components/header/CompareContext";
// import { useRouter } from "next/navigation";
// import { useSearchProductsQuery } from "@/store/productApi";
// import { skipToken } from "@reduxjs/toolkit/query/react";
// import type { IProducts } from "@/store/productApi";

// /**
//  * HeaderTwo - dynamic autocomplete using RTK Query
//  */

// function useDebounce<T>(value: T, delay = 300) {
//   const [debounced, setDebounced] = useState<T>(value);
//   useEffect(() => {
//     const t = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return debounced;
// }

// function HeaderTwo() {
//   const { compareItems } = useCompare();

//   // STICKY HEADER
//   const [isSticky, setIsSticky] = useState(false);
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 150) setIsSticky(true);
//       else setIsSticky(false);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleMenuClick = () => {
//     const sidebar = document.querySelector(".side-bar.header-two");
//     if (sidebar) sidebar.classList.toggle("show");
//   };

//   const handleSearchOpen = () => {
//     const sidebar = document.querySelector(".search-input-area");
//     if (sidebar) sidebar.classList.toggle("show");
//   };

//   // SEARCH + AUTOCOMPLETE (dynamic via API)
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");
//   const debouncedTerm = useDebounce(searchTerm, 300);

//   // Keep typing intact to avoid implicit any — default to IProducts[]
//   const { data: apiResults = [] as IProducts[], isFetching } =
//     useSearchProductsQuery(
//       debouncedTerm && debouncedTerm.trim().length > 0
//         ? debouncedTerm
//         : skipToken
//     );

//   // map to simple suggestions (you can later include slug/thumbnail)
//   const suggestions = (apiResults || []).map((p) => p.name ?? "").slice(0, 6);

//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(-1);

//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const suggestionsRef = useRef<HTMLUListElement | null>(null);

//   useEffect(() => {
//     if (
//       debouncedTerm &&
//       debouncedTerm.trim().length > 0 &&
//       suggestions.length > 0
//     ) {
//       setShowSuggestions(true);
//     } else {
//       setShowSuggestions(false);
//       setActiveIndex(-1);
//     }
//   }, [debouncedTerm, suggestions.length]);

//   // click outside to close
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as Node;
//       if (
//         inputRef.current &&
//         !inputRef.current.contains(target) &&
//         suggestionsRef.current &&
//         !suggestionsRef.current.contains(target)
//       ) {
//         setShowSuggestions(false);
//         setActiveIndex(-1);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSuggestionChoose = (value: string) => {
//     setSearchTerm(value);
//     setShowSuggestions(false);
//     setActiveIndex(-1);
//     router.push(`/shop?search=${encodeURIComponent(value)}`);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchTerm.trim()) {
//       router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
//       setShowSuggestions(false);
//     } else {
//       router.push("/shop");
//     }
//   };

//   const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (!showSuggestions) return;
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setActiveIndex((i) => Math.max(i - 1, 0));
//     } else if (e.key === "Enter") {
//       if (activeIndex >= 0 && suggestions[activeIndex]) {
//         e.preventDefault();
//         handleSuggestionChoose(suggestions[activeIndex]);
//       }
//     } else if (e.key === "Escape") {
//       setShowSuggestions(false);
//       setActiveIndex(-1);
//     }
//   };

//   return (
//     <div>
//       <>
//         {/* header style two start */}
//         <header className="header-style-two bg-primary-header">
//           <div className="header-top-area-two">
//             <div className="container-2">
//               <div className="row">
//                 <div className="col-lg-12">
//                   <div className="hader-top-between-two">
//                     <p>Welcome to our Organic store EkoMart!</p>
//                     <ul className="nav-header-top">
//                       <li>
//                         <a href="/trackorder">Track Order</a>
//                       </li>
//                       <li>
//                         <a href="/about">About Us</a>
//                       </li>
//                       <li>
//                         <a href="/contact">Contact</a>
//                       </li>
//                       <li>
//                         <a href="/faq">FAQ</a>
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="search-header-area-main">
//             <div className="container-2">
//               <div className="row">
//                 <div className="col-lg-12">
//                   <div className="logo-search-category-wrapper">
//                     <a href="/" className="logo-area">
//                       <img
//                         src="assets/images/logo/logo-02.svg"
//                         alt="logo-main"
//                         className="logo"
//                       />
//                     </a>
//                     <div className="category-search-wrapper">
//                       <div className="category-btn category-hover-header">
//                         <img
//                           className="parent"
//                           src="assets/images/icons/bar-1.svg"
//                           alt="icons"
//                         />
//                         <span>Categories</span>
//                         <CategoryMenu />
//                       </div>

//                       <form
//                         onSubmit={handleSubmit}
//                         className="search-header"
//                         autoComplete="off"
//                         style={{ position: "relative" }}
//                       >
//                         <input
//                           ref={inputRef}
//                           type="text"
//                           placeholder="Search for products, categories or brands"
//                           required
//                           value={searchTerm}
//                           onChange={(e) => setSearchTerm(e.target.value)}
//                           onFocus={() =>
//                             searchTerm.length > 0 && setShowSuggestions(true)
//                           }
//                           onKeyDown={onKeyDown}
//                           aria-autocomplete="list"
//                           aria-controls="autocomplete-list"
//                           aria-activedescendant={
//                             activeIndex >= 0
//                               ? `option-${activeIndex}`
//                               : undefined
//                           }
//                         />
//                         <button
//                           type="submit"
//                           className="rts-btn btn-primary radious-sm with-icon"
//                         >
//                           <div className="btn-text">Search</div>
//                           <div className="arrow-icon">
//                             <i className="fa-light fa-magnifying-glass" />
//                           </div>
//                         </button>

//                         {/* Autocomplete dropdown */}
//                         {showSuggestions && (
//                           <ul
//                             id="autocomplete-list"
//                             ref={suggestionsRef}
//                             className="autocomplete-suggestions"
//                             style={{
//                               position: "absolute",
//                               backgroundColor: "#fff",
//                               border: "1px solid #ccc",
//                               marginTop: "4px",
//                               width: "100%",
//                               maxHeight: "200px",
//                               overflowY: "auto",
//                               zIndex: 1000,
//                               listStyleType: "none",
//                               padding: 0,
//                               borderRadius: "4px",
//                             }}
//                             role="listbox"
//                             aria-label="Search suggestions"
//                           >
//                             {isFetching && (
//                               <li
//                                 style={{
//                                   padding: "8px 12px",
//                                   fontStyle: "italic",
//                                 }}
//                               >
//                                 Loading...
//                               </li>
//                             )}
//                             {!isFetching && suggestions.length === 0 && (
//                               <li style={{ padding: "8px 12px", opacity: 0.8 }}>
//                                 No suggestions
//                               </li>
//                             )}

//                             {suggestions.map((suggestion, index) => (
//                               <li
//                                 key={index}
//                                 id={`option-${index}`}
//                                 role="option"
//                                 aria-selected={index === activeIndex}
//                                 onClick={() =>
//                                   handleSuggestionChoose(suggestion)
//                                 }
//                                 onMouseDown={(e) => e.preventDefault()}
//                                 style={{
//                                   padding: "8px 12px",
//                                   cursor: "pointer",
//                                   background:
//                                     index === activeIndex
//                                       ? "rgba(0,0,0,0.04)"
//                                       : undefined,
//                                 }}
//                               >
//                                 {suggestion}
//                               </li>
//                             ))}
//                           </ul>
//                         )}
//                       </form>
//                     </div>

//                     <div className="accont-wishlist-cart-area-header">
//                       <a
//                         href="account.html"
//                         className="btn-border-only account"
//                       >
//                         <i className="fa-light fa-user" />
//                         Account
//                       </a>
//                       <a
//                         href="/shop-compare"
//                         className="btn-border-only account compare-number"
//                       >
//                         <i className="fa-regular fa-code-compare"></i>
//                         <span className="number">{compareItems.length}</span>
//                       </a>
//                       <WishList />
//                       <Cart />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div
//             className={`rts-header-nav-area-one header--sticky  ${
//               isSticky ? "sticky" : ""
//             }`}
//           >
//             <div className="container-2">
//               <div className="row">
//                 <div className="col-lg-12">
//                   <div className="nav-and-btn-wrapper">
//                     <div className="nav-area">
//                       <Nav />
//                     </div>
//                     {/* button-area */}
//                     <div className="right-location-area">
//                       <i className="fa-solid fa-location-dot" />
//                       <p>
//                         Delivery: <a href="#">258 FKD Street, Berlin</a>
//                       </p>
//                     </div>
//                     {/* button-area end */}
//                   </div>

//                   <div className="logo-search-category-wrapper">
//                     <a href="/" className="logo-area">
//                       <img
//                         src="assets/images/logo/logo-01.svg"
//                         alt="logo-main"
//                         className="logo"
//                       />
//                     </a>
//                     <div className="category-search-wrapper">
//                       <div className="category-btn category-hover-header">
//                         <img
//                           className="parent"
//                           src="assets/images/icons/bar-1.svg"
//                           alt="icons"
//                         />
//                         <span>Categories</span>
//                         <ul className="category-sub-menu">
//                           {/* ...category items left intact */}
//                         </ul>
//                       </div>
//                       <form action="#" className="search-header">
//                         <input
//                           type="text"
//                           placeholder="Search for products, categories"
//                           required
//                         />
//                         <a
//                           href="#"
//                           className="rts-btn btn-primary radious-sm with-icon"
//                         >
//                           <div className="btn-text">Search</div>
//                           <div className="arrow-icon">
//                             <i className="fa-light fa-magnifying-glass" />
//                           </div>
//                         </a>
//                       </form>
//                     </div>

//                     <div className="main-wrapper-action-2 d-flex">
//                       <div className="accont-wishlist-cart-area-header">
//                         <a
//                           href="account.html"
//                           className="btn-border-only account"
//                         >
//                           <i className="fa-light fa-user" />
//                           Account
//                         </a>
//                         <a
//                           href="wishlist.html"
//                           className="btn-border-only wishlist"
//                         >
//                           <i className="fa-regular fa-heart" />
//                           Wishlist
//                         </a>
//                         <div className="btn-border-only cart category-hover-header">
//                           <i className="fa-sharp fa-regular fa-cart-shopping" />
//                           <span className="text">My Cart</span>
//                           {/* ...cart preview markup intact */}
//                           <a href="cart.html" className="over_link" />
//                         </div>
//                       </div>

//                       <div className="actions-area">
//                         <div
//                           className="search-btn"
//                           id="search"
//                           onClick={handleSearchOpen}
//                         >
//                           {/* search icon */}
//                           <svg
//                             width={17}
//                             height={16}
//                             viewBox="0 0 17 16"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               d="M15.75 14.7188L11.5625 10.5312C12.4688 9.4375 12.9688 8.03125 12.9688 6.5C12.9688 2.9375 10.0312 0 6.46875 0C2.875 0 0 2.9375 0 6.5C0 10.0938 2.90625 13 6.46875 13C7.96875 13 9.375 12.5 10.5 11.5938L14.6875 15.7812C14.8438 15.9375 15.0312 16 15.25 16C15.4375 16 15.625 15.9375 15.75 15.7812C16.0625 15.5 16.0625 15.0312 15.75 14.7188ZM1.5 6.5C1.5 3.75 3.71875 1.5 6.5 1.5C9.25 1.5 11.5 3.75 11.5 6.5C11.5 9.28125 9.25 11.5 6.5 11.5C3.71875 11.5 1.5 9.28125 1.5 6.5Z"
//                               fill="#1F1F25"
//                             />
//                           </svg>
//                         </div>
//                         <div
//                           className="menu-btn"
//                           id="menu-btn"
//                           onClick={handleMenuClick}
//                         >
//                           <svg
//                             width={20}
//                             height={16}
//                             viewBox="0 0 20 16"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <rect y={14} width={20} height={2} fill="#1F1F25" />
//                             <rect y={7} width={20} height={2} fill="#1F1F25" />
//                             <rect width={20} height={2} fill="#1F1F25" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>
//         {/* header style two end */}
//       </>
//       <BackToTop />
//       <Sidebar />
//     </div>
//   );
// }

// export default HeaderTwo;
