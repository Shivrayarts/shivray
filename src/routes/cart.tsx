import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { allProducts, type Product } from "@/data/products";
import { useServerFn } from "@tanstack/react-start";
import { useCart } from "@/hooks/use-cart";
import { getProductsFromDbServer } from "@/lib/server/products.functions";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Cart - Shivray" },
      {
        name: "description",
        content: "Review items in your cart and update quantities before checkout.",
      },
      { property: "og:title", content: "Cart - Shivray" },
    ],
  }),
});

function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
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

  const items = cart
    .map((entry) => {
      const product = catalog.find((p) => p.id === entry.id);
      if (!product) return null;
      return { product, quantity: entry.quantity };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div>
      <section className="bg-primary py-14 text-primary-foreground md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">Your Cart</h1>
          <p className="mt-2 text-sm opacity-90 md:text-base">
            Review your selected products before proceeding.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">Your cart is currently empty.</p>
              <Link
                to="/products"
                className="mt-4 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[96px_1fr_auto]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-24 rounded-md object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gold">
                      {product.category}
                    </p>
                    <Link
                      to="/products/$productId"
                      params={{ productId: product.id }}
                      className="mt-1 block font-heading text-base font-semibold text-foreground hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-primary">{product.price}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2 rounded-md border border-border p-1">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="rounded p-1 hover:bg-muted"
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="rounded p-1 hover:bg-muted"
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
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
                  onClick={clearCart}
                  className="rounded-md border border-border px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-muted"
                >
                  Clear Cart
                </button>
                <Link
                  to="/contact"
                  className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                >
                  Enquire / Order
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
