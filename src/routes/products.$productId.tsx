import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { getProductsFromDbServer, getProductByIdFromDbServer } from "@/lib/server/products.functions";
import { useCart } from "@/hooks/use-cart";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    const [product, products] = await Promise.all([
      getProductByIdFromDbServer({
        data: { id: params.productId },
      }),
      getProductsFromDbServer(),
    ]);

    if (!product) throw notFound();
    return { product, products };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { product, products } = Route.useLoaderData();
  const [addedCount, setAddedCount] = useState(0);
  const { addToCart } = useCart();

  const relatedProducts = useMemo(
    () =>
      products
        .filter(
          (item) =>
            item.category === product.category && item.id !== product.id,
        )
        .slice(0, 3),
    [products, product.category, product.id],
  );

  return (
    <div>
      <section className="bg-primary py-14 text-primary-foreground md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium opacity-90 transition-opacity hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <h1 className="mt-4 font-heading text-3xl font-bold md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm opacity-90 md:text-base">
            {product.shortDescription}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-border shadow-heritage">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              width={900}
              height={900}
            />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              {product.category}
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-foreground md:text-3xl">
              {product.name}
            </h2>
            <p className="mt-3 text-2xl font-bold text-primary">{product.price}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {product.details}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Material
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {product.material}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Dimensions
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {product.dimensions}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  addToCart(product.id);
                  setAddedCount((prev) => prev + 1);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-gold/40 hover:bg-card"
              >
                Enquire Now
              </Link>
            </div>

            {addedCount > 0 && (
              <p className="mt-3 text-sm text-green-700">
                Added to cart ({addedCount}).
              </p>
            )}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="pb-14 md:pb-16">
          <div className="mx-auto max-w-7xl px-4">
            <h3 className="font-heading text-2xl font-bold text-foreground">
              Related Products
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to="/products/$productId"
                  params={{ productId: item.id }}
                  className="group block h-full overflow-hidden rounded-lg border border-border bg-card shadow-heritage transition-all hover:border-gold/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wide text-gold">
                      {item.category}
                    </p>
                    <p className="mt-1 font-heading text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-2 font-bold text-primary">{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
