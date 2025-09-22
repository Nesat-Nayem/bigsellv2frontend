"use client";
import Link from "next/link";
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

  // number count up and down
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

    // 💡 Remove any existing handlers first (safe rebind)
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

  // cart item
  const { addToCart } = useCart(); // Now works
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    // Use productData.price if available, otherwise fallback to Price prop
    const finalPrice = productData?.price ?? parseFloat(Price ?? "0");

    addToCart({
      id: Date.now(),
      productId: productData?._id,
      image:
        productData?.thumbnail ||
        productData?.images?.[0] ||
        `/assets/images/grocery/${ProductImage}`,
      title: productData?.name || (ProductTitle ?? "Default Product Title"),
      price: finalPrice,
      quantity: 1,
      active: true,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 5000);
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
  const addwishlist = () => toast("Successfully Add To Wishlist !");

  return (
    <>
      {/* iamge and sction area start */}
      <div className="image-and-action-area-wrapper">
        <a href={`/shop/${Slug}`} className="thumbnail-preview">
          <div className="badge">
            <span>
              25% <br />
              Off
            </span>
            <i className="fa-solid fa-bookmark" />
          </div>
          <img src={`/assets/images/grocery/${ProductImage}`} alt="grocery" />
        </a>
        <div className="action-share-option">
          <div
            className="single-action openuptip message-show-action"
            data-flow="up"
            title="Add To Wishlist"
            onClick={() => {
              handleWishlist();
              addwishlist();
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
      {/* iamge and sction area start */}
      <div className="body-content">
        {/* <div class="time-tag">
                                          <i class="fa-light fa-clock"></i>
                                          9 MINS
                                      </div> */}
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
          <div className="quantity-edit">
            <input type="text" className="input" defaultValue={1} />
            <div className="button-wrapper-action">
              <button className="button minus">
                <i className="fa-regular fa-chevron-down" />
              </button>
              <button className="button plus">
                +<i className="fa-regular fa-chevron-up" />
              </button>
            </div>
          </div>
          <a
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
