import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Grid3X3, LayoutGrid } from "lucide-react";
import { categories } from "@/data/products";
import { getProductsFromDbServer } from "@/lib/server/products.functions";

export const Route = createFileRoute("/products")({
  loader: () => getProductsFromDbServer(),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Products - Shivray" },
      {
        name: "description",
        content:
          "Browse our collection of handcrafted Maratha statues, weapons, shields, and heritage artifacts.",
      },
      { property: "og:title", content: "Products - Shivray" },
      {
        property: "og:description",
        content: "Authentic handcrafted heritage artifacts and replicas.",
      },
    ],
  }),
});

function ProductsPage() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const products = Route.useLoaderData();
  const isDetailPage = location.pathname.startsWith("/products/");

  if (isDetailPage) {
    return <Outlet />;
  }

  const filtered = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "All" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <section className="bg-primary py-16 text-center text-primary-foreground md:py-20">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">Our Products</h1>
        <div className="mx-auto mt-3 h-1 w-24 bg-gold" />
        <p className="mt-4 text-lg font-display italic opacity-90">
          Discover handcrafted treasures that embody centuries of tradition
        </p>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search our collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground hover:border-gold/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="ml-4 hidden items-center gap-1 rounded-md border border-border md:flex">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 ${
                    gridCols === 3 ? "text-gold" : "text-muted-foreground"
                  }`}
                  aria-label="3 column grid"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 ${
                    gridCols === 4 ? "text-gold" : "text-muted-foreground"
                  }`}
                  aria-label="4 column grid"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
              gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
            }`}
          >
            {filtered.map((product) => (
              <Link
                key={product.id}
                to="/products/$productId"
                params={{ productId: product.id }}
                className="group block h-full overflow-hidden rounded-lg border border-border bg-card shadow-heritage transition-all duration-300 hover:border-gold/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.tag && (
                    <span className="absolute right-3 top-3 rounded-sm bg-gold px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-foreground">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-gold">
                    {product.category}
                  </span>
                  <h3 className="mt-1 line-clamp-1 font-heading text-sm font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {product.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">{product.price}</p>
                    <span className="rounded-md bg-primary px-4 py-2 font-heading text-xs font-medium uppercase tracking-wider text-primary-foreground">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No products found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

