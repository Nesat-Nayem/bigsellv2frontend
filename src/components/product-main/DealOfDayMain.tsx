"use client";
import { useState, useEffect } from "react";
import ProductDetails from "@/components/modal/ProductDetails";
import CompareModal from "@/components/modal/CompareModal";
import { useCart } from "@/components/header/CartContext";
import { useWishlist } from "@/components/header/WishlistContext";

import { useCompare } from "@/components/header/CompareContext"; //
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IProducts } from "@/store/productApi";

interface BlogGridMainProps {
  Slug: string;
  ProductImage: string;
  ProductTitle?: string;
  Price?: string;
  originalPrice?: string;
  DiscountProduct?: number;
  productData?: IProducts;
}

const BlogGridMain: React.FC<BlogGridMainProps> = ({
  Slug,
  ProductImage,
  ProductTitle,
  Price,
  originalPrice,
  DiscountProduct,
  productData,
}) => {
  type ModalType = "one" | "two" | "three" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const handleClose = () => setActiveModal(null);

  // add to cart
  const { addToCart } = useCart();

  const handleAdd = () => {
    // Use productData.price if available, otherwise fallback to Price prop
    const finalPrice = productData?.price ?? (Price ? parseFloat(Price) : 0);

    addToCart({
      id: Date.now(),
      productId: productData?._id,
      image:
        productData?.thumbnail ||
        productData?.images?.[0] ||
        `/assets/images/grocery/${ProductImage}`,
      title:
        productData?.name || (ProductTitle ?? "How to growing your business"),
      price: finalPrice,
      quantity: 1,
      active: true,
    });
  };

  const { addToWishlist } = useCart();
  const handleWishlist = () => {
    // Use productData.price if available, otherwise fallback to Price prop
    const finalPrice = productData?.price ?? parseFloat(Price ?? "0");

    addToWishlist({
      id: Date.now(),
      productId: productData?._id,
      image:
        productData?.thumbnail ||
        productData?.images?.[0] ||
        `/assets/images/grocery/${ProductImage}`,
      title: productData?.name || (ProductTitle ?? "Default Product Title"),
      price: finalPrice,
      quantity: 1,
      active: false,
    });
  };

  const { addToCompare } = useCompare();
  const handleCompare = () => {
    addToCompare({
      image: `/assets/images/grocery/${ProductImage}`,
      name: ProductTitle ?? "Default Product Title",
      price: Price ?? "0",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", // Or dynamic if available
      rating: 5, // Static or dynamic value
      ratingCount: 25, // You can replace this
      weight: "500g", // If you have dynamic, replace it
      inStock: true, // Or false
    });
  };

  // tostify
  const compare = () => toast("Successfully Add To Compare !");
  const wishList = () => toast("Successfully Add To Wishlist !");

  return (
    <>
      <div className="onsale-offer">
        <span>On sale</span>
      </div>
      <div className="image-and-action-area-wrapper">
        <a href={`/shop/${Slug}`} className="thumbnail-preview">
          <img src={`/assets/images/grocery/${ProductImage}`} alt="grocery" />
        </a>
        <div className="action-share-option">
          <div
            className="single-action openuptip message-show-action"
            data-flow="up"
            title="Add To Wishlist"
            onClick={() => {
              handleWishlist();
              wishList();
            }}
          >
            <i className="fa-light fa-heart" />
          </div>
          <div
            className="single-action openuptip"
            data-flow="up"
            title="Compare"
            onClick={() => {
              handleCompare();
              compare();
            }}
          >
            <i className="fa-solid fa-arrows-retweet" />
          </div>
          <div
            className="single-action openuptip cta-quickview product-details-popup-btn"
            data-flow="up"
            title="Quick View"
            onClick={() => setActiveModal("two")}
          >
            <i className="fa-regular fa-eye" />
          </div>
        </div>
      </div>
      <div className="body-content">
        <div className="start-area-rating">
          <i className="fa-solid fa-star" />
          <i className="fa-solid fa-star" />
          <i className="fa-solid fa-star" />
          <i className="fa-solid fa-star" />
          <i className="fa-solid fa-star" />
        </div>
        <a href={`/shop/${Slug}`}>
          <h4 className="title">
            {ProductTitle ? ProductTitle : "How to growing your business"}
          </h4>
        </a>
        <span className="availability">
          {productData?.stock ? `${productData.stock} in stock` : "In Stock"}
        </span>
        <div className="price-area">
          <span className="current">₹{productData?.price || Price}</span>
          {productData?.originalPrice && (
            <div className="previous">₹{productData.originalPrice}</div>
          )}
          {productData?.discount && (
            <span className="discount-badge">
              -{productData.discount}
              {productData.discountType === "percentage" ? "%" : ""}
            </span>
          )}
        </div>
        <div className="cart-counter-action">
          <a
            href="#"
            className="rts-btn btn-primary radious-sm with-icon"
            onClick={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <div className="btn-text">Add To Cart</div>
            <div className="arrow-icon">
              <i className="fa-regular fa-cart-shopping" />
            </div>
            <div className="arrow-icon">
              <i className="fa-regular fa-cart-shopping" />
            </div>
          </a>
        </div>
      </div>

      <CompareModal show={activeModal === "one"} handleClose={handleClose} />
      <ProductDetails
        show={activeModal === "two"}
        handleClose={handleClose}
        productImage={`/assets/images/grocery/${ProductImage}`}
        productTitle={ProductTitle ?? "Default Product Title"}
        productPrice={Price ?? "0"}
      />
    </>
  );
};

export default BlogGridMain;
