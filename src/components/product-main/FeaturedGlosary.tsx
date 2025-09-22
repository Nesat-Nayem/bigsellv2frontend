"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProductDetails from "@/components/modal/ProductDetails";
import CompareModal from "@/components/modal/CompareModal";
import { useCart } from "@/components/header/CartContext";
import { useWishlist } from "@/components/header/WishlistContext";
import { useCompare } from "@/components/header/CompareContext";
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

const FeaturedGlosary: React.FC<BlogGridMainProps> = ({
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

  const { addToCart } = useCart();
  const { addToWishlist } = useCart();
  const { addToCompare } = useCompare();

  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Debug log to show all product data is available
  useEffect(() => {
    // if (productData) {
    //   // console.log("Product Data in FeaturedGlosary:", productData);
    // }
  }, [productData]);

  const handleAdd = () => {
    // Use productData.price if available, otherwise fallback to Price prop
    const finalPrice = productData?.price ?? parseFloat(Price ?? "0");

    addToCart({
      id: Date.now(),
      productId: productData?._id,
      image:
        productData?.thumbnail || productData?.images?.[0] || `${ProductImage}`,
      title: productData?.name || (ProductTitle ?? "Default Product Title"),
      price: finalPrice,
      quantity: 1,
      active: true,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 5000);
  };

  const handleWishlist = () => {
    // Use productData.price if available, otherwise fallback to Price prop
    const finalPrice = productData?.price ?? parseFloat(Price ?? "0");

    addToWishlist({
      id: Date.now(),
      productId: productData?._id,
      image:
        productData?.thumbnail || productData?.images?.[0] || `${ProductImage}`,
      title: productData?.name || (ProductTitle ?? "Default Product Title"),
      price: finalPrice,
      quantity: 1,
      active: false,
    });
    setWishlisted(true);
    setTimeout(() => setWishlisted(false), 3000);
  };

  const handleCompare = () => {
    addToCompare({
      image: `${ProductImage}`,
      name: ProductTitle ?? "Default Product Title",
      price: Price ?? "0",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      rating: 5,
      ratingCount: 25,
      weight: "500g",
      inStock: true,
    });
  };

  useEffect(() => {
    const handleQuantityClick = (e: Event) => {
      const button = e.currentTarget as HTMLElement;
      const parent = button.closest(".quantity-edit") as HTMLElement | null;
      if (!parent) return;

      const input = parent.querySelector(".input") as HTMLInputElement | null;
      const addToCart = parent.querySelector(
        "a.add-to-cart"
      ) as HTMLElement | null;
      if (!input) return;

      let oldValue = parseInt(input.value || "1", 10);
      let newVal = oldValue;

      if (button.classList.contains("plus")) {
        newVal = oldValue + 1;
      } else if (button.classList.contains("minus")) {
        newVal = oldValue > 1 ? oldValue - 1 : 1;
      }

      input.value = newVal.toString();
      if (addToCart) {
        addToCart.setAttribute("data-quantity", newVal.toString());
      }
    };

    const buttons = document.querySelectorAll(".quantity-edit .button");
    buttons.forEach((button) => {
      button.removeEventListener("click", handleQuantityClick);
      button.addEventListener("click", handleQuantityClick);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", handleQuantityClick);
      });
    };
  }, []);

  // tostify
  const compare = () => toast("Successfully Add To Compare !");
  const wishList = () => toast("Successfully Add To Wishlist !");

  return (
    <>
      <div className="image-and-action-area-wrapper">
        <a href={`/shop/${Slug}`} className="thumbnail-preview">
          <div className="badge">
            <span>
              25% <br />
              Off
            </span>
            <i className="fa-solid fa-bookmark" />
          </div>
          <div style={{ overflow: "hidden", width: "100%", height: "150px" }}>
            <img
              src={`${ProductImage}`}
              alt="grocery"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </a>
        <div className="action-share-option w-100 d-flex gap-4 justify-content-center">
          <span
            className="single-action openuptip message-show-action"
            data-flow="up"
            title="Add To Wishlist"
            onClick={() => {
              handleWishlist();
              wishList();
            }}
          >
            <i className="fa-light fa-heart" />
          </span>

          <span
            className="single-action openuptip cta-quickview product-details-popup-btn"
            data-flow="up"
            title="Quick View"
            onClick={() => setActiveModal("two")}
          >
            <i className="fa-regular fa-eye" />
          </span>
        </div>
      </div>

      <div className="body-content">
        <Link href={`/shop/${Slug}`}>
          <h4 className="title">
            {ProductTitle
              ? ProductTitle.slice(0, 15).concat("...")
              : "Default Title"}
          </h4>
        </Link>

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
          <Link
            href="#"
            className="rts-btn btn-primary add-to-card radious-sm with-icon"
            onClick={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <div className="btn-text">{added ? "Added" : "Add"}</div>
            <div className="arrow-icon">
              <i
                className={
                  added ? "fa-solid fa-check" : "fa-regular fa-cart-shopping"
                }
              />
            </div>
            <div className="arrow-icon">
              <i
                className={
                  added ? "fa-solid fa-check" : "fa-regular fa-cart-shopping"
                }
              />
            </div>
          </Link>
        </div>
      </div>

      <CompareModal show={activeModal === "one"} handleClose={handleClose} />
      <ProductDetails
        show={activeModal === "two"}
        handleClose={handleClose}
        productImage={
          productData?.thumbnail || productData?.images?.[0] || ProductImage
        }
        productTitle={
          productData?.name || ProductTitle || "Default Product Title"
        }
        productPrice={
          productData?.price ? `₹${productData.price}` : `₹${Price || "0"}`
        }
        productData={productData}
      />
    </>
  );
};

export default FeaturedGlosary;
