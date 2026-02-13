'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Id } from '@/convex/_generated/dataModel';

export interface CartItem {
  productId: Id<'products'>;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  imageKey?: string;
  stock: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: Id<'products'>) => void;
  updateQuantity: (productId: Id<'products'>, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: Id<'products'>) => number;
  totalItems: number;
  totalPrice: number;
  storefrontSlug: string | null;
  setStorefrontSlug: (slug: string) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ma5zani-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storefrontSlug, setStorefrontSlug] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.items || []);
        setStorefrontSlug(parsed.storefrontSlug || null);
      } catch {
        // Invalid stored data
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items, storefrontSlug })
      );
    }
  }, [items, storefrontSlug, isLoaded]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((current) => {
      const existing = current.find(
        (i) =>
          i.productId === item.productId &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor === item.selectedColor
      );
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, item.stock);
        return current.map((i) =>
          i.productId === item.productId &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor === item.selectedColor
            ? { ...i, quantity: newQuantity }
            : i
        );
      }
      return [...current, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  };

  const removeItem = (productId: Id<'products'>) => {
    setItems((current) => current.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: Id<'products'>, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((current) =>
      current.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: Id<'products'>) => {
    return items.find((i) => i.productId === productId)?.quantity || 0;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.salePrice ?? item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        totalItems,
        totalPrice,
        storefrontSlug,
        setStorefrontSlug,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
