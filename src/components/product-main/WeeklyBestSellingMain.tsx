// src/components/product/BlogGridMain.tsx
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
import Image from "next/image";
import { IProducts } from "@/store/productApi";

interface BlogGridMainProps {
  Slug: string;
  ProductImage: string;
  ProductTitle?: string;
  Price?: string;
  del?: string;
  material?: string;
  productData?: IProducts; // optional: prefer this when present
}

const BlogGridMain: React.FC<BlogGridMainProps> = ({
  Slug,
  ProductImage,
  ProductTitle,
  Price,
  del,
  material,
  productData,
}) => {
  type ModalType = "one" | "two" | "three" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const handleClose = () => setActiveModal(null);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { addToCompare } = useCompare();

  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // price extraction
  const getFinalPrice = (): number => {
    const raw = productData?.price ?? Price ?? 0;
    return typeof raw === "number" ? raw : parseFloat(String(raw)) || 0;
  };

  // image src: prefer productData thumbnails, otherwise the static asset path (keeps design)
  const getImageSrc = (): string => {
    return (
      (productData?.thumbnail as string) ||
      (productData?.images && productData.images[0]) ||
      `/assets/images/bestSelling/${ProductImage}`
    );
  };

  /**
   * stableId -> ALWAYS return a number.
   * Try to coerce productData?._id or Slug into a number.
   * If coercion yields NaN (e.g. Mongo ObjectId or arbitrary slug),
   * fallback to Date.now() to guarantee a numeric id for client-side usage.
   */
  const stableId = (): number => {
    const raw = (productData?._id as any) ?? Slug ?? Date.now();
    const n = Number(raw);
    return Number.isFinite(n) && !Number.isNaN(n) ? n : Date.now();
  };

  const handleAdd = () => {
    const finalPrice = getFinalPrice();
    addToCart({
      id: stableId(),
      productId: (productData?._id as any) ?? undefined,
      image: getImageSrc(),
      title: productData?.name || ProductTitle || "Default Product Title",
      price: finalPrice,
      quantity: 1,
      active: true,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 5000);
  };

  const handleWishlist = () => {
    const finalPrice = getFinalPrice();
    addToWishlist({
      id: stableId(),
      //  productId: (productData?._id as any) ?? undefined,
      image: getImageSrc(),
      title: productData?.name || ProductTitle || "Default Product Title",
      price: finalPrice,
      quantity: 1,
    });
    setWishlisted(true);
    setTimeout(() => setWishlisted(false), 3000);
  };

  const handleCompare = () => {
    addToCompare({
      image: getImageSrc(),
      name: productData?.name ?? ProductTitle ?? "Default Product Title",
      price: String(getFinalPrice()),
      description:
        productData?.shortDescription ||
        productData?.description ||
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      rating: productData?.rating ?? 5,
      ratingCount: productData?.reviewCount ?? 25,
      weight: String(productData?.weight ?? "500g"),
      inStock: (productData?.stock ?? 1) > 0,
    });
    toast("Successfully Add To Compare !");
  };

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

  // helper: if src is remote and next/image not configured, fallback to <img>
  const isRemote = (src: string) => /^https?:\/\//i.test(src);

  return (
    <>
      <div className="image-and-action-area-wrapper">
        <Link href={`/shop/${Slug}`} className="thumbnail-preview">
          <div className="badge">
            <span>
              {/* show real discount if available; default 25% to keep UI unchanged */}
              {productData?.discount ?? "25"}% <br />
              Off
            </span>
            <i className="fa-solid fa-bookmark" />
          </div>

          <div style={{ width: "100%", height: "150px" }}>
            {isRemote(getImageSrc()) ? (
              // fallback <img> for remote images
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImageSrc()}
                alt={productData?.name || ProductTitle || "grocery"}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Image
                src={getImageSrc()}
                alt={productData?.name || ProductTitle || "grocery"}
                width={100}
                height={100}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>
        </Link>

        <div className="action-share-option w-100 d-flex gap-4 justify-content-center">
          <span
            className="single-action openuptip message-show-action"
            data-flow="up"
            title="Add To Wishlist"
            onClick={() => {
              handleWishlist();
              toast("Successfully Add To Wishlist !");
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

          <span
            className="single-action openuptip"
            data-flow="up"
            title="Add To Compare"
            onClick={() => {
              handleCompare();
            }}
          >
            <i className="fa-regular fa-scale-balanced" />
          </span>
        </div>
      </div>

      <div className="body-content">
        <Link href={`/shop/${Slug}`}>
          <h4 className="title">
            {ProductTitle ? ProductTitle.slice(0, 20) : "Default Title"}
          </h4>
        </Link>

        <span className="availability">
          {material ?? productData?.brand ?? ""}
        </span>
        <div className="price-area">
          <span className="current">{`₹ ${
            Price ?? productData?.price ?? ""
          }`}</span>
          <div className="previous">{`₹ ${
            del ?? productData?.originalPrice ?? ""
          }`}</div>
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
        productImage={getImageSrc()}
        productTitle={
          ProductTitle ?? productData?.name ?? "Default Product Title"
        }
        productPrice={Price ?? String(productData?.price ?? "0")}
      />

      <ToastContainer position="bottom-right" />
    </>
  );
};

export default BlogGridMain;
