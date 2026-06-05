"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getCookie } from "cookies-next";

export interface CartItem {
  cart_item_id: string | number; // Local temporary ID or Database ID
  product_id: string | number;
  name: string | { [key: string]: string };
  image: string;
  color: string | { [key: string]: string };
  size: string | { [key: string]: string };
  price: number;
  quantity: number;
}

export interface CouponDetails {
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  max_discount?: number;
}

interface CartContextProps {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "cart_item_id">) => Promise<void>;
  removeFromCart: (cartItemId: string | number) => Promise<void>;
  updateQuantity: (cartItemId: string | number, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  subtotal: number;
  totalQuantity: number;
  isLoading: boolean;
  appliedCoupon: CouponDetails | null;
  setAppliedCoupon: (coupon: CouponDetails | null) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'ak_zeMJGONZsh8S7wzrGjCrKYAMHIJJB5pP';
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || 'sk_IAnHqVXKSo4jiZTQLgk1MdK04jsqEoYucYHA6yRBsBTcCPFV';

function getOrCreateUUID(): string {
  if (typeof window === 'undefined') return '';
  let uuid = localStorage.getItem('elegance_cart_uuid');
  if (!uuid) {
    uuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    localStorage.setItem('elegance_cart_uuid', uuid);
  }
  return uuid;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDetails | null>(null);

  const getHeaders = () => {
    const token = getCookie('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-KEY': API_KEY,
      'X-SECRET-KEY': SECRET_KEY,
      'X-Cart-UUID': getOrCreateUUID()
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const mapDbCartToState = (dbCart: any) => {
    if (!dbCart || !dbCart.items) {
      setItems([]);
      return;
    }
    
    const mappedItems: CartItem[] = dbCart.items.map((item: any) => ({
      cart_item_id: item.id,
      product_id: item.product_id,
      name: item.name,
      image: item.image || '/no-image.jpg',
      color: item.color || '',
      size: item.size || '',
      price: parseFloat(item.price),
      quantity: item.quantity
    }));
    setItems(mappedItems);
  };

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/cart`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        mapDbCartToState(data.cart);
      }
    } catch (e) {
      console.error("Failed to fetch cart", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (item: Omit<CartItem, "cart_item_id">) => {
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...item, cart_item_id: tempId };
    
    // Helper to extract comparable string value from a potentially multilingual field
    const getFieldValue = (field: any): string => {
      if (typeof field === 'object' && field !== null) {
        return field.en || field[Object.keys(field)[0]] || '';
      }
      return field || '';
    };

    // Check if exists optimistically (compare by product_id + color/size values)
    const existingIndex = items.findIndex(i => 
      i.product_id === item.product_id && 
      getFieldValue(i.color) === getFieldValue(item.color) && 
      getFieldValue(i.size) === getFieldValue(item.size)
    );
    
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += item.quantity;
      setItems(newItems);
    } else {
      setItems(prev => [...prev, optimisticItem]);
    }

    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const data = await res.json();
        // Server has ultimate truth returning the DB Cart
        mapDbCartToState(data.cart);
      } else {
        // Revert on fail
        await fetchCart();
      }
    } catch (e) {
      console.error(e);
      await fetchCart();
    }
  };

  const removeFromCart = async (cartItemId: string | number) => {
    if (String(cartItemId).startsWith('temp')) return; // Ignore temporary
    
    // Optimistic UI update
    setItems(prev => prev.filter(i => String(i.cart_item_id) !== String(cartItemId)));
    
    try {
      const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      if (res.ok) {
        const data = await res.json();
        mapDbCartToState(data.cart);
      } else {
        await fetchCart(); // Revert on fail
      }
    } catch (e) {
      console.error(e);
      await fetchCart();
    }
  };

  const updateQuantity = async (cartItemId: string | number, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (String(cartItemId).startsWith('temp')) return;
    
    // Optimistic
    setItems(prev => prev.map(i => String(i.cart_item_id) === String(cartItemId) ? { ...i, quantity: newQuantity } : i));
    
    try {
      const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (res.ok) {
        const data = await res.json();
        mapDbCartToState(data.cart);
      } else {
        await fetchCart(); // Revert
      }
    } catch (e) {
      console.error(e);
      await fetchCart();
    }
  };

  const clearCart = async () => {
    setItems([]);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        mapDbCartToState(data.cart);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const syncCart = async () => {
    const uuid = getCookie('elegance_cart_uuid') || (typeof window !== 'undefined' ? localStorage.getItem('elegance_cart_uuid') : null);
    if (!uuid) return;
    
    try {
      const res = await fetch(`${API_URL}/cart/sync`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ uuid })
      });
      if (res.ok) {
        const data = await res.json();
        mapDbCartToState(data.cart);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart,
        subtotal,
        totalQuantity,
        isLoading,
        appliedCoupon,
        setAppliedCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
