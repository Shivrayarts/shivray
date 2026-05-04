import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { allProducts, type Product } from "@/data/products";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { getProductsFromDbServer } from "@/lib/server/products.functions";
import { normalizeDisplayCase } from "@/lib/utils";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Wishlist - Shivray" },
      {
        name: "description",
        content: "Review the products you liked and move them to cart or open their detail pages.",
      },
      { property: "og:title", content: "Wishlist - Shivray" },
    ],
  }),
});

function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const fetchProducts = useServerFn(getProductsFromDbServer);
  const [catalog, setCatalog] = useState<Product[]>(allProducts);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      try {
        const products = await fetchProducts();
        if (isMounted && Array.isArray(products) && products.length > 0) {
          setCatalog(products);
        }
      } catch {
        // Keep static fallback if fetch fails.
      }
    };

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, [fetchProducts]);

  const items = wishlist
    .map((id) => catalog.find((product) => product.id === id) ?? null)
    .filter((item): item is Product => item !== null);

  return (
    <div>
      <section className="bg-primary py-14 text-primary-foreground md:py-16">
        <div className="layout-shell px-4">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">Your Wishlist</h1>
          <p className="mt-2 text-sm opacity-90 md:text-base">
            Review the products you liked and move them to cart whenever you are ready.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="layout-shell px-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">You have not liked any products yet.</p>
              <Link
                to="/products"
                className="mt-4 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[96px_1fr_auto]"
                >
                  <img
                    src={product.image}
                    alt={normalizeDisplayCase(product.name)}
                    className="h-24 w-24 rounded-md object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gold">{product.category}</p>
                    <Link
                      to="/products/$productId"
                      params={{ productId: product.id }}
                      className="mt-1 block font-heading text-base font-semibold text-foreground hover:text-primary"
                    >
                      {normalizeDisplayCase(product.name)}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-primary">{product.price}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{product.shortDescription}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <button
                      onClick={() => addToCart(product.id)}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:opacity-80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={clearWishlist}
                  className="rounded-md border border-border px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-muted"
                >
                  Clear Wishlist
                </button>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                >
                  <Heart className="h-4 w-4 fill-current" />
                  Continue Browsing
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
