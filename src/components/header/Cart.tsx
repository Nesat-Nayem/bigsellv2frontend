// components/header/CartDropdown.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/header/CartContext";

const CartDropdown: React.FC = () => {
  const router = useRouter();
  const {
    activeCartItems,
    removeFromCart,
    isCartLoaded,
    subtotal,
    FREE_SHIPPING_THRESHOLD,
  } = useCart();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/cart");
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/checkout");
  };

  if (!isCartLoaded) {
    return (
      <div className="btn-border-only cart category-hover-header">
        <i className="fa-sharp fa-regular fa-cart-shopping" />
        <span className="text">Cart</span>
        <span className="number">0</span>
      </div>
    );
  }

  return (
    <div className="btn-border-only cart category-hover-header position-relative">
      <i className="fa-sharp fa-regular fa-cart-shopping" />
      <span className="text">Cart</span>
      <span className="number">{activeCartItems.length}</span>

      <div
        className="category-sub-menu card-number-show position-absolute"
        style={{ right: 0, zIndex: 50 }}
      >
        <h5 className="shopping-cart-number">
          Shopping Cart ({activeCartItems.length.toString().padStart(2, "0")})
        </h5>

        {activeCartItems.length === 0 ? (
          <div className="empty-cart-message text-center py-4">
            <p>Your cart is empty</p>
            <Link href="/shop" className="rts-btn btn-sm btn-primary mt-2">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div
              className="cart-items-container"
              style={{ maxHeight: 300, overflowY: "auto" }}
            >
              {activeCartItems.map((item) => {
                const identifier = String(item.productId ?? item.id ?? "");
                const lineTotal = item.price * item.quantity;

                return (
                  <div
                    key={`${identifier}-${item.id}`}
                    className="cart-item-1 border-top d-flex p-2"
                  >
                    <div className="img-name d-flex">
                      <div
                        className="close section-activation me-2"
                        onClick={() => removeFromCart(identifier)}
                        role="button"
                        tabIndex={0}
                      >
                        <i className="fa-regular fa-x" />
                      </div>

                      <div className="thumbanil me-2">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.title || "product"}
                          width={60}
                          height={60}
                        />
                      </div>

                      <div className="details">
                        <Link href={`/shop/${item.productId || item.id}`}>
                          <h5 className="title">
                            {item.title ?? "Untitled product"}
                          </h5>
                        </Link>

                        {(item.raw?.selectedColor ||
                          item.raw?.selectedSize) && (
                          <div className="variants">
                            {item.raw?.selectedColor && (
                              <small className="text-muted">
                                Color: {item.raw.selectedColor}
                              </small>
                            )}
                            {item.raw?.selectedSize && (
                              <small className="text-muted d-block">
                                Size: {item.raw.selectedSize}
                              </small>
                            )}
                          </div>
                        )}

                        <div className="number">
                          {item.quantity} <i className="fa-regular fa-x" />{" "}
                          <span> ₹ {lineTotal.toFixed(2)} </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sub-total-cart-balance p-3">
              <div className="top d-flex justify-content-between">
                <span>Sub Total:</span>
                <span className="number-c">₹ {subtotal.toFixed(2)}</span>
              </div>

              <div className="single-progress-area-incard mt-2">
                <div className="progress">
                  <div
                    className="progress-bar wow fadeInLeft"
                    role="progressbar"
                    style={{
                      width: `${Math.min(
                        (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {subtotal < FREE_SHIPPING_THRESHOLD ? (
                <p className="mt-2">
                  Spend More <span>₹ {remaining.toFixed(2)}</span> to reach{" "}
                  <span>Free Shipping</span>
                </p>
              ) : (
                <p className="text-success mt-2">
                  <span>Free Shipping</span> unlocked!
                </p>
              )}

              <div className="button-wrapper d-flex align-items-center justify-content-between mt-3">
                <button
                  onClick={handleViewCart}
                  className="rts-btn btn-primary"
                  type="button"
                >
                  View Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="rts-btn btn-primary border-only"
                  type="button"
                >
                  CheckOut
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDropdown;
