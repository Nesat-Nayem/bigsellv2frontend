"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/components/header/CartContext";
import { useWishlist } from "@/components/header/WishlistContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BlogGridMainProps {
  id?: number | string;
  Slug?: string;
  ProductImage: string;
  ProductTitle?: string;
  Price?: string | number;
  del?: string | number;
  material?: string;
  productData?: any;
  discount?: number;
}

const BlogGridMain: React.FC<BlogGridMainProps> = ({
  id,
  Slug,
  ProductImage,
  ProductTitle,
  Price,
  del,
  material,
  discount = 0,
  productData,
}) => {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  // FIXED: use correct optional chaining syntax: productData?._id (not productData?.._id)
  const productId: string | number =
    productData?._id ?? productData?.id ?? id ?? `temp-${Date.now()}`;

  const finalPrice: number = (() => {
    const p = productData?.price ?? Price ?? 0;
    return typeof p === "number" ? p : parseFloat(p?.toString() || "0");
  })();

  const handleAdd = () => {
    addToCart({
      id: productId,
      image:
        productData?.thumbnail ||
        productData?.images?.[0] ||
        `/assets/images/discount-product/${ProductImage}`,
      title: productData?.name || ProductTitle || "Default Product Title",
      price: finalPrice,
      quantity: 1,
      active: true,
      category: productData?.category?.title || productData?.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 5000);
  };

  const { addToWishlist } = useWishlist();
  // const handleWishlist = () => {
  //   addToWishlist({
  //     id: productId,
  //     image:
  //       productData?.thumbnail || productData?.images?.[0] || `${ProductImage}`,
  //     title: productData?.name || ProductTitle || "Default Product Title",
  //     price: finalPrice,
  //     quantity: 1,
  //   });
  //   toast("Added to wishlist");
  // };

  useEffect(() => {
    const handleQuantityClick = (e: Event) => {
      const button = e.currentTarget as HTMLElement;
      const parent = button.closest(".quantity-edit") as HTMLElement | null;
      if (!parent) return;

      const input = parent.querySelector(".input") as HTMLInputElement | null;
      const addToCartEl = parent.querySelector(
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
      if (addToCartEl) {
        addToCartEl.setAttribute("data-quantity", newVal.toString());
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

  return (
    <>
      <Link href={`/shop/${productId}`} className="thumbnail-preview">
        <div className="badge">
          <span>
            {discount}% <br />
            Off
          </span>
          <i className="fa-solid fa-bookmark" />
        </div>
        <img
          width={300}
          height={300}
          src={
            productData?.thumbnail ||
            productData?.images?.[0] ||
            `${ProductImage}`
          }
          alt={productData?.name || ProductTitle || "grocery"}
        />
      </Link>

      <div className="body-content">
        <Link href={`/shop/${productId}`}>
          <h4 className="title">
            {(
              (productData?.name ||
                ProductTitle ||
                "How to growing your business") as string
            )
              .slice(0, 40)
              .concat("...")}
          </h4>
        </Link>
        <span className="availability">{material || productData?.brand}</span>
        <div className="price-area">
          <span className="current">{`₹ ${finalPrice}`}</span>
          <div className="previous d-none d-md-block">{`₹ ${
            productData?.originalPrice ?? del ?? ""
          }`}</div>
        </div>
        <div className="cart-counter-action">
          <Link
            href="#"
            className="rts-btn btn-primary radious-sm with-icon add-to-cart"
            onClick={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <div className="btn-text">{added ? "Added" : "Add"}</div>
            <div className="arrow-icon">
              <i
                className={`fa-regular ${
                  added ? "fa-check" : "fa-cart-shopping"
                }`}
              />
            </div>
            <div className="arrow-icon">
              <i
                className={`fa-regular ${
                  added ? "fa-check" : "fa-cart-shopping"
                }`}
              />
            </div>
          </Link>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </>
  );
};

export default BlogGridMain;
