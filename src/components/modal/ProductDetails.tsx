"use client";

import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<string>("tab1");
  const { addToCart } = useCart();

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const addcart = () => toast.success("Successfully Added To Cart!");
  const handleAdd = () => {
    const item = {
      id: Date.now(),
      image: productImage,
      title: productTitle,
      price: productPrice,
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
                    {activeTab === "tab1" && (
                      <div className="product-thumb zoom">
                        <img src={productImage} alt="product-thumb" />
                      </div>
                    )}
                    {activeTab === "tab2" && (
                      <div className="product-thumb zoom">
                        <img src={productImage} alt="product-thumb" />
                      </div>
                    )}
                    {activeTab === "tab3" && (
                      <div className="product-thumb zoom">
                        <img src={productImage} alt="product-thumb" />
                      </div>
                    )}
                  </div>
                  <div className="product-thumb-filter-group">
                    {["tab1", "tab2", "tab3"].map((tab) => (
                      <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`thumb-filter filter-btn ${
                          activeTab === tab ? "active" : ""
                        }`}
                      >
                        <img src={productImage} alt={`thumb-${tab}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="contents">
                  <div className="product-status">
                    <span className="product-catagory">Electronics</span>
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
                    {productTitle} <span className="stock">In Stock</span>
                  </h2>

                  <span className="product-price">
                    <span className="old-price">₹ {productOriginalPrice}</span>{" "}
                    {productPrice}
                  </span>

                  <p>
                    Priyoshop has brought to you the Hijab 3 Pieces Combo Pack
                    PS23. Priyoshop has brought to you the Hijab 3 Pieces Combo
                    Pack PS23
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
                      <span>SKU: </span> BO1D0MX8SJ
                    </span>
                    <span className="catagorys product-unipue">
                      <span>Categories: </span> Electronics
                    </span>
                    <span className="tags product-unipue">
                      <span>Tags: </span> fashion, t-shirts, Men
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
