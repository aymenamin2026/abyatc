"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { fetchWishlistIds, toggleWishlistItem } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistIds: number[];
  wishlistCount: number;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isToggling: number | null;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  wishlistCount: 0,
  isInWishlist: () => false,
  toggleWishlist: async () => {},
  refreshWishlist: async () => {},
  isToggling: null,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isToggling, setIsToggling] = useState<number | null>(null);

  const refreshWishlist = useCallback(async () => {
    if (!user || !token) {
      setWishlistIds([]);
      setWishlistCount(0);
      return;
    }

    try {
      const data = await fetchWishlistIds();
      if (data.product_ids) {
        setWishlistIds(data.product_ids);
        setWishlistCount(data.count || data.product_ids.length);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  }, [user, token]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const toggleWishlist = useCallback(async (productId: number) => {
    if (!user || !token) return;

    setIsToggling(productId);
    
    // Optimistic update
    const wasInWishlist = wishlistIds.includes(productId);
    if (wasInWishlist) {
      setWishlistIds(prev => prev.filter(id => id !== productId));
      setWishlistCount(prev => Math.max(0, prev - 1));
    } else {
      setWishlistIds(prev => [...prev, productId]);
      setWishlistCount(prev => prev + 1);
    }

    try {
      const result = await toggleWishlistItem(productId);
      // Sync with server response
      setWishlistCount(result.count);
    } catch (error) {
      // Revert optimistic update on error
      if (wasInWishlist) {
        setWishlistIds(prev => [...prev, productId]);
        setWishlistCount(prev => prev + 1);
      } else {
        setWishlistIds(prev => prev.filter(id => id !== productId));
        setWishlistCount(prev => Math.max(0, prev - 1));
      }
      console.error("Failed to toggle wishlist:", error);
    } finally {
      setIsToggling(null);
    }
  }, [user, token, wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistCount, isInWishlist, toggleWishlist, refreshWishlist, isToggling }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
