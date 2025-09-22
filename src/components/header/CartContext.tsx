// components/header/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItemRaw {
  id?: number | string;
  productId?: string | number;
  image?: string;
  title?: string;
  price?: any;
  quantity?: any;
  active?: any;
  [k: string]: any;
}

export interface CartItem {
  id: string;
  productId?: string;
  image: string;
  title: string;
  price: number;
  quantity: number;
  active: boolean;
  raw?: CartItemRaw;
}

interface CartContextProps {
  cartItems: CartItem[]; // full storage
  activeCartItems: CartItem[]; // only active (in-cart)
  wishlistItems: CartItem[];
  addToCart: (item: CartItemRaw) => void;
  addToWishlist: (item: CartItemRaw) => void;
  removeFromCart: (idOrProductId: number | string) => void;
  updateItemQuantity: (
    idOrProductId: number | string,
    quantity: number
  ) => void;
  clearCart: () => void;

  // loading + totals + shipping
  isCartLoaded: boolean;
  subtotal: number;
  discount: number; // e.g. 0.1 = 10%
  finalTotal: number;
  FREE_SHIPPING_THRESHOLD: number;

  // coupon API
  coupon: string;
  couponMessage: string;
  applyCoupon: (code: string) => void;
  setCoupon: (c: string) => void;
  setCouponMessage: (m: string) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};

/* ---------- helpers ---------- */
const sanitizeNumber = (v: any): number => {
  if (typeof v === "number" && isFinite(v)) return v;
  if (v == null) return 0;
  if (typeof v === "object") {
    if (typeof v.amount !== "undefined") return sanitizeNumber(v.amount);
    if (typeof v.value !== "undefined") return sanitizeNumber(v.value);
    if (typeof v.price !== "undefined") return sanitizeNumber(v.price);
    return 0;
  }
  const s = String(v)
    .trim()
    .replace(/[,₹\s]/g, "")
    .replace(/[^\d.-]/g, "");
  const n = Number(s);
  return isFinite(n) ? n : 0;
};

const normalizeRawItem = (raw: CartItemRaw): CartItem => {
  const productIdRaw =
    typeof raw.productId !== "undefined" ? raw.productId : undefined;
  const productId =
    typeof productIdRaw !== "undefined" ? String(productIdRaw) : undefined;

  const idSource =
    typeof raw.id !== "undefined"
      ? raw.id
      : productId ?? `${Math.random().toString(36).slice(2, 9)}`;
  const id = String(idSource);

  let quantity = Math.floor(sanitizeNumber(raw.quantity));
  if (!quantity || quantity < 1) quantity = 1;

  const price = sanitizeNumber(raw.price);

  const active = typeof raw.active === "undefined" ? true : !!raw.active;

  const title = raw.title ?? "Untitled product";
  const image = raw.image ?? "/placeholder.png";

  if (raw.price == null || price === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[CartProvider] Suspicious price for item:", {
        rawPrice: raw.price,
        normalizedPrice: price,
        id,
        title,
      });
    }
  }

  return { id, productId, image, title, price, quantity, active, raw };
};

/* ---------- Provider ---------- */

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // coupon state
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discount, setDiscount] = useState(0); // fraction

  const FREE_SHIPPING_THRESHOLD = 5000; // canonical value used across app

  const persist = (items: CartItem[]) => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed writing cart to localStorage", e);
    }
  };

  const loadCartFromStorage = () => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((it) =>
            typeof it.price === "number" && typeof it.quantity === "number"
              ? {
                  id: String(
                    it.id ??
                      it.productId ??
                      `${Math.random().toString(36).slice(2, 9)}`
                  ),
                  productId:
                    typeof it.productId !== "undefined"
                      ? String(it.productId)
                      : undefined,
                  image: it.image ?? "/placeholder.png",
                  title: it.title ?? "Untitled product",
                  price: sanitizeNumber(it.price),
                  quantity: Math.max(
                    1,
                    Math.floor(sanitizeNumber(it.quantity))
                  ),
                  active: typeof it.active === "undefined" ? true : !!it.active,
                  raw: it,
                }
              : normalizeRawItem(it)
          );
          setCartItems(normalized);
          persist(normalized);
        } else {
          console.warn(
            "[CartProvider] Unexpected cart shape in localStorage:",
            parsed
          );
          localStorage.removeItem("cart");
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error(
        "Failed to parse or normalize cart from localStorage:",
        error
      );
      localStorage.removeItem("cart");
      setCartItems([]);
    } finally {
      setIsCartLoaded(true);
    }
  };

  useEffect(() => {
    loadCartFromStorage();

    // Listen for storage events to refresh cart when localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        loadCartFromStorage();
      }
    };

    // Listen for custom refresh event
    const handleRefresh = () => {
      loadCartFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("refreshCart", handleRefresh);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("refreshCart", handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isCartLoaded) return;
    persist(cartItems);
  }, [cartItems, isCartLoaded]);

  const activeCartItems = useMemo(
    () => cartItems.filter((i) => i.active),
    [cartItems]
  );
  const wishlistItems = useMemo(
    () => cartItems.filter((i) => !i.active),
    [cartItems]
  );

  const subtotal = useMemo(
    () => activeCartItems.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [activeCartItems]
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 50;
  const finalTotal = useMemo(() => {
    const applied = Math.max(0, discount);
    const discounted = subtotal - subtotal * applied;
    return Math.max(0, discounted + shipping);
  }, [subtotal, discount, shipping]);

  /* operations */
  const addToCart = (raw: CartItemRaw) => {
    const item = normalizeRawItem(raw);
    item.active = true;
    const identifier = String(item.productId ?? item.id);
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => String(i.productId ?? i.id) === identifier && i.active === true
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: Math.max(1, copy[existingIndex].quantity + item.quantity),
          price: copy[existingIndex].price || item.price,
        };
        return copy;
      } else {
        return [...prev, item];
      }
    });
  };

  const addToWishlist = (raw: CartItemRaw) => {
    const item = normalizeRawItem(raw);
    item.active = false;
    const identifier = String(item.productId ?? item.id);
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => String(i.productId ?? i.id) === identifier && i.active === false
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: Math.max(1, copy[existingIndex].quantity + item.quantity),
        };
        return copy;
      } else {
        return [...prev, item];
      }
    });
  };

  const removeFromCart = (idOrProductId: number | string) => {
    const target = String(idOrProductId);
    setCartItems((prev) =>
      prev.filter((i) => String(i.productId ?? i.id) !== target)
    );
  };

  const updateItemQuantity = (
    idOrProductId: number | string,
    quantity: number
  ) => {
    const q = Math.max(1, Math.floor(quantity));
    const target = String(idOrProductId);
    setCartItems((prev) =>
      prev.map((i) =>
        String(i.productId ?? i.id) === target ? { ...i, quantity: q } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems((prev) => prev.filter((i) => !i.active));
  };

  /* coupon rules (client-side only; validate on server before charging) */
  const couponRules: Record<
    string,
    { type: "percent" | "flat"; value: number; message?: string }
  > = {
    SAVE10: {
      type: "percent",
      value: 0.1,
      message: "SAVE10 applied — 10% off",
    },
    WELCOME20: {
      type: "percent",
      value: 0.2,
      message: "WELCOME20 applied — 20% off",
    },
    "12345": { type: "percent", value: 0.05, message: "Promo 12345 — 5% off" },
  };

  const applyCoupon = (code: string) => {
    const c = (code ?? "").toString().trim().toUpperCase();
    if (!c) {
      setDiscount(0);
      setCouponMessage("Please enter a coupon code.");
      setCoupon("");
      return;
    }
    const rule = couponRules[c];
    if (!rule) {
      setDiscount(0);
      setCouponMessage("Invalid coupon code.");
      setCoupon(c);
      return;
    }
    if (rule.type === "percent") {
      setDiscount(rule.value);
      setCouponMessage(rule.message ?? `Coupon ${c} applied.`);
      setCoupon(c);
    } else {
      // flat: translate to percent relative to subtotal
      const flat = rule.value;
      const percent = subtotal > 0 ? Math.min(flat / subtotal, 1) : 0;
      setDiscount(percent);
      setCouponMessage(rule.message ?? `Coupon ${c} applied.`);
      setCoupon(c);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        activeCartItems,
        wishlistItems,
        addToCart,
        addToWishlist,
        removeFromCart,
        updateItemQuantity,
        clearCart,
        isCartLoaded,
        subtotal,
        discount,
        finalTotal,
        FREE_SHIPPING_THRESHOLD,
        coupon,
        couponMessage,
        applyCoupon,
        setCoupon,
        setCouponMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
