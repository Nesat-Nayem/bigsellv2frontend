"use client";

import { useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";

interface CustomSidebarProps {
  minPrice: number;
  maxPrice: number;
  debouncedMinPrice: number;
  debouncedMaxPrice: number;
  apiPriceMin?: number;
  apiPriceMax?: number;
  handleMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePriceFilterSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  showFeatured: boolean;
  setShowFeatured: (value: boolean) => void;
  showTrending: boolean;
  setShowTrending: (value: boolean) => void;
  showNewArrivals: boolean;
  setShowNewArrivals: (value: boolean) => void;
  rootCategories: { _id: string; title: string }[];
  selectedCategoryId: string;
  handleCategoryChange: (id: string) => void;
  apiBrands: string[];
  selectedBrand: string;
  handleBrandChange: (brand: string) => void;
}

const CustomSidebar: React.FC<CustomSidebarProps> = ({
  minPrice,
  maxPrice,
  debouncedMinPrice,
  debouncedMaxPrice,
  apiPriceMin,
  apiPriceMax,
  handleMinPriceChange,
  handleMaxPriceChange,
  handlePriceFilterSubmit,
  showFeatured,
  setShowFeatured,
  showTrending,
  setShowTrending,
  showNewArrivals,
  setShowNewArrivals,
  rootCategories,
  selectedCategoryId,
  handleCategoryChange,
  apiBrands,
  selectedBrand,
  handleBrandChange,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const renderSidebarContent = () => (
    <div className="sidebar-filter-main theiaStickySidebar">
      {/* Price Filter */}
      <div className="single-filter-box">
        <h5 className="title">Widget Price Filter</h5>
        <div className="filterbox-body">
          <form className="price-input-area" onSubmit={handlePriceFilterSubmit}>
            <div className="half-input-wrapper">
              <div className="single">
                <label htmlFor="min">Min price</label>
                <input
                  id="min"
                  type="number"
                  value={minPrice}
                  min={0}
                  onChange={handleMinPriceChange}
                />
              </div>
              <div className="single">
                <label htmlFor="max">Max price</label>
                <input
                  id="max"
                  type="number"
                  value={maxPrice}
                  min={0}
                  onChange={handleMaxPriceChange}
                />
              </div>
            </div>
            <input
              type="range"
              className="range"
              min={apiPriceMin ? Math.floor(apiPriceMin) : 0}
              max={
                apiPriceMax ? Math.ceil(apiPriceMax) : Math.max(150, maxPrice)
              }
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e as any)}
            />
            <div className="filter-value-min-max">
              <span>
                Price: ₹{minPrice} — ₹{maxPrice}
              </span>
              {(minPrice !== debouncedMinPrice ||
                maxPrice !== debouncedMaxPrice) && (
                <small
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: "#6c757d",
                    fontSize: 11,
                  }}
                >
                  Updating in 3.5s...
                </small>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Special Collections */}
      <div className="single-filter-box">
        <h5 className="title">Special Collections</h5>
        <div className="filterbox-body">
          <div className="category-wrapper">
            {[
              {
                id: "featured",
                label: "Featured Products",
                value: showFeatured,
                setter: setShowFeatured,
              },
              {
                id: "trending",
                label: "Trending Products",
                value: showTrending,
                setter: setShowTrending,
              },
              {
                id: "newArrivals",
                label: "New Arrivals",
                value: showNewArrivals,
                setter: setShowNewArrivals,
              },
            ].map((item) => (
              <div className="single-category" key={item.id}>
                <input
                  id={item.id}
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => {
                    item.setter(e.target.checked);
                    if (e.target.checked) {
                      // uncheck others
                      if (item.id !== "featured") setShowFeatured(false);
                      if (item.id !== "trending") setShowTrending(false);
                      if (item.id !== "newArrivals") setShowNewArrivals(false);
                    }
                  }}
                />
                <label htmlFor={item.id}>{item.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="single-filter-box">
        <h5 className="title">Product Categories</h5>
        <div className="filterbox-body">
          <div className="category-wrapper">
            {rootCategories.length > 0 ? (
              rootCategories.map((cat, i) => (
                <div className="single-category" key={cat._id || i}>
                  <input
                    id={`cat${i + 1}`}
                    type="radio"
                    name="category"
                    checked={selectedCategoryId === cat._id}
                    onChange={() => handleCategoryChange(cat._id)}
                  />
                  <label htmlFor={`cat${i + 1}`}>{cat.title}</label>
                </div>
              ))
            ) : (
              <p>Loading categories...</p>
            )}
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="single-filter-box">
        <h5 className="title">Brands</h5>
        <div className="filterbox-body">
          <div className="category-wrapper">
            <div className="single-category">
              <input
                id="brandAll"
                type="radio"
                name="brand"
                checked={selectedBrand === ""}
                onChange={() => handleBrandChange("")}
              />
              <label htmlFor="brandAll">All Brands</label>
            </div>
            {apiBrands.length > 0 ? (
              apiBrands.map((b, i) => (
                <div className="single-category" key={b || i}>
                  <input
                    id={`brand${i + 1}`}
                    type="radio"
                    name="brand"
                    checked={selectedBrand === b}
                    onChange={() => handleBrandChange(b)}
                  />
                  <label htmlFor={`brand${i + 1}`}>{b}</label>
                </div>
              ))
            ) : (
              <p>No brands available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Button */}
      <Button
        className="d-lg-none mb-3 p-3"
        variant="dark"
        onClick={() => setShowDrawer(true)}
      >
        <i className="fa-solid fa-filter me-2"></i>
        Filters
      </Button>

      {/* Mobile Drawer */}
      <Offcanvas
        show={showDrawer}
        onHide={() => setShowDrawer(false)}
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{renderSidebarContent()}</Offcanvas.Body>
      </Offcanvas>

      {/* Desktop Sidebar */}
      <div className="d-none d-lg-block col-xl-3 col-lg-12 pr--70 pr_lg--10 pr_sm--10 pr_md--5">
        {renderSidebarContent()}
      </div>
    </>
  );
};

export default CustomSidebar;
