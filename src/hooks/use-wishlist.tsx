import { useEffect, useState } from "react";

const WISHLIST_STORAGE_KEY = "shivray-wishlist";
const WISHLIST_UPDATED_EVENT = "shivray-wishlist-updated";

function getWishlistFromStorage(): string[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function persistWishlist(items: string[]) {
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncWishlist = () => setWishlist(getWishlistFromStorage());

    syncWishlist();
    window.addEventListener("storage", syncWishlist);
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncWishlist);

    return () => {
      window.removeEventListener("storage", syncWishlist);
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncWishlist);
    };
  }, []);

  const toggleWishlist = (productId: string) => {
    if (typeof window === "undefined") return;

    const current = getWishlistFromStorage();
    const next = current.includes(productId)
      ? current.filter((item) => item !== productId)
      : [...current, productId];

    persistWishlist(next);
    setWishlist(next);
  };

  const removeFromWishlist = (productId: string) => {
    if (typeof window === "undefined") return;

    const next = getWishlistFromStorage().filter((item) => item !== productId);
    persistWishlist(next);
    setWishlist(next);
  };

  const clearWishlist = () => {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
    window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
    setWishlist([]);
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  return {
    wishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    isWishlisted,
  };
}
