import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  quantity: number;
};

const CART_STORAGE_KEY = "shivray-cart";
const LEGACY_CART_STORAGE_KEY = "shivay-arts-cart";
const CART_UPDATED_EVENT = "shivray-cart-updated";

function readStoredCart() {
  const currentRaw = localStorage.getItem(CART_STORAGE_KEY);
  if (currentRaw) return currentRaw;

  const legacyRaw = localStorage.getItem(LEGACY_CART_STORAGE_KEY);
  if (legacyRaw) {
    localStorage.setItem(CART_STORAGE_KEY, legacyRaw);
    localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  }

  return legacyRaw;
}

function getCartItemsFromStorage(): CartItem[] {
  const raw = readStoredCart();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncCart = () => {
      setCart(getCartItemsFromStorage());
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  const addToCart = (productId: string) => {
    if (typeof window === "undefined") return;

    const existing = getCartItemsFromStorage();
    const index = existing.findIndex((item) => item.id === productId);

    if (index >= 0) {
      existing[index] = {
        ...existing[index],
        quantity: existing[index].quantity + 1,
      };
    } else {
      existing.push({ id: productId, quantity: 1 });
    }

    persistCart(existing);
    setCart(existing);
  };

  const removeFromCart = (productId: string) => {
    if (typeof window === "undefined") return;

    const existing = getCartItemsFromStorage();
    const filtered = existing.filter((item) => item.id !== productId);

    persistCart(filtered);
    setCart(filtered);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (typeof window === "undefined") return;

    const existing = getCartItemsFromStorage();
    const index = existing.findIndex((item) => item.id === productId);

    if (index >= 0) {
      if (quantity <= 0) {
        existing.splice(index, 1);
      } else {
        existing[index] = {
          ...existing[index],
          quantity,
        };
      }
    }

    persistCart(existing);
    setCart(existing);
  };

  const clearCart = () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  };
}
