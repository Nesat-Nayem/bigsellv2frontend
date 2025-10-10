'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WishlistItem {
  id: number | string;
  productId?: string;
  _id?: string; // sometimes product documents are stored
  image: string;
  title: string;
  price: number;
  quantity: number;
}

interface WishlistContextProps {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number | string) => void;
  updateItemQuantity: (id: number | string, quantity: number) => void;
  isWishlistLoaded: boolean;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

export const useWishlist = (): WishlistContextProps => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);

  // Load from localStorage on first mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      try {
        setWishlistItems(JSON.parse(storedWishlist));
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage:', error);
        localStorage.removeItem('wishlist');
      }
    }
    setIsWishlistLoaded(true);
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (isWishlistLoaded) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isWishlistLoaded]);

  // Add to wishlist (no duplicates)
  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev;
      return [...prev, item];
    });
  };

  // Remove from wishlist
  const removeFromWishlist = (id: number | string) => {
    setWishlistItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  // Update quantity
  const updateItemQuantity = (id: number | string, quantity: number) => {
    setWishlistItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(id) ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        updateItemQuantity,
        isWishlistLoaded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
