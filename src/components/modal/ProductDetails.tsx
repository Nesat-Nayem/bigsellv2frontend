"use client";

import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useCart } from "@/components/header/CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

interface ModalProps {
  show: boolean;
  handleClose: () => void;
  productImage: string;
  productTitle: string;
  productPrice: string;
  productOriginalPrice?: string;
  productData?: any;
}

const ProductDetails: React.FC<ModalProps> = ({
  show,
  handleClose,
  productImage,
  productTitle,
  productPrice,
  productOriginalPrice,
  productData,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>(productImage || "");
  const { addToCart } = useCart();

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const addcart = () => toast.success("Successfully Added To Cart!");

  const resolveUrl = (img: any): string => {
    if (!img) return "";
    if (typeof img === "string") return img;
    if (typeof img === "object") return img.url || img.src || img.path || img.filename || "";
    return "";
  };

  const candidateImages = [
    productData?.thumbnail,
    ...(Array.isArray(productData?.images) ? productData?.images : []),
  ]
    .map(resolveUrl)
    .filter(Boolean);

  const uniqueImages = Array.from(
    new Set(candidateImages.length > 0 ? candidateImages : [productImage])
  );

  useEffect(() => {
    const first = uniqueImages[0] || productImage || "";
    setSelectedImage(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, productImage, productData]);
  const handleAdd = () => {
    const item = {
      id: productData?._id ?? Date.now(),
      image: selectedImage || productImage,
      title:
        (typeof productData?.name === "string"
          ? productData?.name
          : productData?.name?.title) || productTitle,
      price:
        typeof productData?.price === "number"
          ? productData.price
          : parseFloat(productPrice || "0"),
      originalPrice: productOriginalPrice,
      quantity: quantity,
      active: true,
    };

    addToCart(item);
    addcart();
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        dialogClassName="modal-compare"
      >
        <div className="product-details-popup-wrapper popup">
          <div className="rts-product-details-section rts-product-details-section2 product-details-popup-section">
            <div className="product-details-popup">
              <button
                className="product-details-close-btn"
                onClick={handleClose}
              >
                <i className="fal fa-times" />
              </button>
              <div className="details-product-area">
                <div className="product-thumb-area">
                  <div className="cursor" />
                  <div className="thumb-wrapper one filterd-items figure">
                    <div className="product-thumb zoom">
                      <img src={selectedImage || productImage} alt="product-thumb" />
                    </div>
                  </div>
                  <div className="product-thumb-filter-group">
                    {uniqueImages.map((url, idx) => (
                      <div
                        key={url || idx}
                        onClick={() => setSelectedImage(url)}
                        className={`thumb-filter filter-btn ${
                          (selectedImage || productImage) === url ? "active" : ""
                        }`}
                      >
                        <img src={url} alt={`thumb-${idx}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="contents">
                  <div className="product-status">
                    {/* <span
                        className="product-catagory"
                        style={{ display: "inline-block" }}
                      >
                        {typeof product.category === "object" &&
                        product.category?.title
                          ? product.category.title
                          : typeof product.category === "string"
                          ? product.category
                          : "General"}
                      </span> */}

                    <div className="rating-stars-group">
                      <div className="rating-star">
                        <i className="fas fa-star" />
                      </div>
                      <div className="rating-star">
                        <i className="fas fa-star" />
                      </div>
                      <div className="rating-star">
                        <i className="fas fa-star-half-alt" />
                      </div>
                      <span>10 Reviews</span>
                    </div>
                  </div>

                  <h2 className="product-title">
                    {(
                      (typeof productData?.name === "string"
                        ? productData?.name
                        : productData?.name?.title) || productTitle || ""
                    ).slice(0, 50)}
                    {" "}...
                    <span className="stock">In Stock</span>
                  </h2>

                  <span className="product-price">
                    ₹ {typeof productData?.price === "number" ? productData.price : productPrice}
                  </span>

                  <p>
                    {productData?.shortDescription || productData?.description || ""}
                  </p>

                  <div className="product-bottom-action">
                    <div className="cart-edit">
                      <div className="quantity-edit action-item">
                        <button className="button" onClick={decreaseQuantity}>
                          <i className="fal fa-minus minus" />
                        </button>
                        <input
                          type="text"
                          className="input"
                          value={quantity}
                          readOnly
                        />
                        <button
                          className="button plus"
                          onClick={increaseQuantity}
                        >
                          <i className="fal fa-plus plus" />
                        </button>
                      </div>
                    </div>

                    <Link
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
                    </Link>

                    <Link
                      href="javascript:void(0);"
                      className="rts-btn btn-primary ml--20"
                    >
                      <i className="fa-light fa-heart" />
                    </Link>
                  </div>

                  <div className="product-uniques">
                    <span className="sku product-unipue">
                      <span>SKU: </span> {productData?.sku || productData?._id || ""}
                    </span>
                    <span className="catagorys product-unipue">
                      <span>Categories: </span>
                      {typeof productData?.category === "object"
                        ? productData?.category?.title || productData?.category?._id || ""
                        : productData?.category || ""}
                    </span>
                    <span className="tags product-unipue">
                      <span>Tags: </span>
                      {Array.isArray(productData?.tags)
                        ? productData?.tags.join(", ")
                        : ""}
                    </span>
                  </div>

                  <div className="share-social">
                    <span>Share:</span>
                    <Link
                      className="platform"
                      href="http://facebook.com"
                      target="_blank"
                    >
                      <i className="fab fa-facebook-f" />
                    </Link>
                    <Link
                      className="platform"
                      href="http://twitter.com"
                      target="_blank"
                    >
                      <i className="fab fa-twitter" />
                    </Link>
                    <Link
                      className="platform"
                      href="http://behance.com"
                      target="_blank"
                    >
                      <i className="fab fa-behance" />
                    </Link>
                    <Link
                      className="platform"
                      href="http://youtube.com"
                      target="_blank"
                    >
                      <i className="fab fa-youtube" />
                    </Link>
                    <Link
                      className="platform"
                      href="http://linkedin.com"
                      target="_blank"
                    >
                      <i className="fab fa-linkedin" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductDetails;
