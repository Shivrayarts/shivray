import { Link } from "@/lib/spa-router";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { getCategoryLabel } from "@/data/products";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { useCart } from "@/hooks/use-cart";
import { useStoredProducts } from "@/lib/content-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { getProductPricing, normalizeDisplayCase } from "@/lib/utils";
import { toast } from "sonner";

export default function WishlistPage() {
  const { resolvedLocale } = useLanguage();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const catalog = useStoredProducts();
  const items = wishlist
    .map((id) => catalog.find((product) => product.id === id) ?? null)
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div>
      <section className="bg-primary py-14 text-primary-foreground md:py-16">
        <div className="layout-shell px-4">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            {resolvedLocale === "mr" ? "तुमची आवडीची यादी" : "Your Wishlist"}
          </h1>
          <p className="mt-2 text-sm opacity-90 md:text-base">
            {resolvedLocale === "mr"
              ? "तुम्हाला आवडलेली उत्पादने पाहा आणि तयार झाल्यावर कार्टमध्ये हलवा."
              : "Review the products you liked and move them to cart whenever you are ready."}
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="layout-shell px-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                {resolvedLocale === "mr"
                  ? "तुम्ही अजून कोणतेही उत्पादन आवडीत जोडलेले नाही."
                  : "You have not liked any products yet."}
              </p>
              <Link
                to="/products"
                className="mt-4 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
              >
                {resolvedLocale === "mr" ? "उत्पादने पहा" : "Browse Products"}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((product) => {
                const pricing = getProductPricing(product);
                return (
                <div
                  key={product.id}
                  className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[96px_1fr_auto]"
                >
                  <img
                    src={product.image}
                    alt={normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}
                    className="h-24 w-24 rounded-md object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gold">
                      {getCategoryLabel(product.category, resolvedLocale)}
                    </p>
                    <Link
                      to="/products/$productId"
                      params={{ productId: product.id }}
                      className="mt-1 block font-heading text-base font-semibold text-foreground hover:text-primary"
                    >
                      {normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-primary">{pricing.finalPrice}</p>
                    {pricing.hasDiscount ? (
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-xs text-muted-foreground line-through">{pricing.originalPrice}</p>
                        <p className="rounded-full bg-[#45ae4a] px-2 py-0.5 text-[10px] font-semibold text-white">{pricing.discountPercentage.toFixed(0)}% OFF</p>
                      </div>
                    ) : null}
                    <p className="mt-2 text-sm text-muted-foreground">
                      {resolveLocalizedText(product.shortDescription, resolvedLocale)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <button
                      onClick={() => {
                        addToCart(product.id);
                        toast.success(
                          resolvedLocale === "mr" ? "उत्पादन कार्टमध्ये जोडले." : "Product added to cart.",
                          {
                            action: {
                              label: resolvedLocale === "mr" ? "कार्ट" : "Cart",
                              onClick: () => {
                                window.location.href = "/cart";
                              },
                            },
                          },
                        );
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {resolvedLocale === "mr" ? "कार्टमध्ये जोडा" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:opacity-80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {resolvedLocale === "mr" ? "काढा" : "Remove"}
                    </button>
                  </div>
                </div>
              )})}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={clearWishlist}
                  className="rounded-md border border-border px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-muted"
                >
                  {resolvedLocale === "mr" ? "आवडीची यादी साफ करा" : "Clear Wishlist"}
                </button>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
                >
                  <Heart className="h-4 w-4 fill-current" />
                  {resolvedLocale === "mr" ? "खरेदी सुरू ठेवा" : "Continue Browsing"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
