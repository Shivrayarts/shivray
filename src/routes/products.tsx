import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { categories } from "@/data/products";
import { getProductsFromDbServer } from "@/lib/server/products.functions";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";

export const Route = createFileRoute("/products")({
  loader: () => getProductsFromDbServer(),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Products - Shivray" },
      {
        name: "description",
        content:
          "Browse Shivray's mobile-first catalogue of handcrafted Maratha statues, weapons, shields, and decor pieces.",
      },
      { property: "og:title", content: "Products - Shivray" },
      {
        property: "og:description",
        content:
          "Fast, mobile-friendly product discovery for heritage-inspired handcrafted collections.",
      },
    ],
  }),
});

function parsePriceValue(value: string) {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

function formatRupees(value: number) {
  return `₹ ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getMobileDiscount(index: number) {
  return [4, 2, 6, 5][index % 4];
}

function getMobileBadge(productTag: string, index: number) {
  const normalizedTag = productTag.trim().toLowerCase();
  if (normalizedTag) {
    return normalizedTag === "featured" ? "hot" : normalizedTag;
  }

  return index % 2 === 0 ? "hot" : "new";
}

function getBadgeTone(label: string) {
  return label === "new" ? "bg-[#ff9800]" : "bg-[#e3162d]";
}

function ProductsPage() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [sortBy, setSortBy] = useState("featured");
  const [categorySlide, setCategorySlide] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const products = Route.useLoaderData();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isDetailPage = location.pathname.startsWith("/products/");

  const categoryCards = useMemo(
    () => [
      {
        title: "Maharaj Statues",
        key: "Statues" as const,
        count: `${products.filter((product) => product.category === "Statues").length} products`,
        image: productStatue1,
      },
      {
        title: "Warrior Weapons",
        key: "Weapons" as const,
        count: `${products.filter((product) => product.category === "Weapons").length} products`,
        image: productWeapon1,
      },
      {
        title: "Premium Shields",
        key: "Shields" as const,
        count: `${products.filter((product) => product.category === "Shields").length} products`,
        image: heroBanner3,
      },
      {
        title: "Dhoop Collection",
        key: "Dhoop" as const,
        count: `${products.filter((product) => product.category === "Dhoop").length} products`,
        image: productDhoop1,
      },
    ],
    [products],
  );

  const filtered = useMemo(() => {
    const matchedProducts = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...matchedProducts];

    switch (sortBy) {
      case "price-low":
        sortedProducts.sort((a, b) => parsePriceValue(a.price) - parsePriceValue(b.price));
        break;
      case "price-high":
        sortedProducts.sort((a, b) => parsePriceValue(b.price) - parsePriceValue(a.price));
        break;
      case "name":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return sortedProducts;
  }, [category, products, search, sortBy]);

  const handleCategoriesScroll = () => {
    const node = categoriesRef.current;
    if (!node || window.innerWidth >= 768) {
      return;
    }

    const firstCard = node.querySelector<HTMLElement>("[data-catalogue-category-card]");
    if (!firstCard) {
      return;
    }

    const cardWidth = firstCard.offsetWidth + 16;
    const nextSlide = Math.round(node.scrollLeft / cardWidth);
    setCategorySlide(Math.max(0, Math.min(nextSlide, categoryCards.length - 1)));
  };

  if (isDetailPage) {
    return <Outlet />;
  }

  return (
    <div className="bg-[#f5f5f5] pb-6 md:bg-[#f7f1e7] md:pb-10">
      <section className="hidden bg-[#2b130c] px-4 pb-8 pt-6 text-white md:block md:px-6 md:pb-12 md:pt-10">
        <div className="layout-shell">
          <span className="inline-flex rounded-full border border-[#f2bb64]/30 bg-[#f2bb64]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd68d]">
            Product Catalogue
          </span>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">
            Built for quick mobile product discovery.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#f4e7d8] md:text-base">
            This page follows the reference direction with visible filters, direct product
            discovery, and stronger mobile browsing density.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Published products", value: `${products.length}+` },
              { label: "Collections", value: "4" },
              { label: "Quick enquiry", value: "WhatsApp" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4"
              >
                <p className="font-heading text-2xl text-[#ffd68d]">{item.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/70">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hidden px-4 py-8 md:block md:px-6 md:py-10">
        <div className="layout-shell rounded-[34px] bg-[#fffdf8] px-4 py-6 md:px-8 md:py-8">
          <div className="text-center">
            <h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">
              Popular Categories
            </h2>
          </div>

          <div
            ref={categoriesRef}
            onScroll={handleCategoriesScroll}
            className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-x-6 md:gap-y-8 md:overflow-visible md:pb-0"
          >
            {categoryCards.map((card) => (
              <button
                key={card.key}
                type="button"
                data-catalogue-category-card
                onClick={() => setCategory(card.key)}
                className="group min-w-[78%] snap-center text-center sm:min-w-[calc(50%-0.5rem)] md:min-w-0"
              >
                <div className="relative overflow-hidden rounded-[30px] bg-[#b65a73] shadow-[0_18px_45px_-30px_rgba(89,34,49,0.65)]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="aspect-square w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105"
                    width={420}
                    height={420}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,226,152,0.16),rgba(132,33,58,0.28))]" />
                </div>
                <h3 className="mt-4 font-body text-xl font-semibold text-[#1c140f] md:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-1 text-base text-[#7d766f]">{card.count}</p>
              </button>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            {categoryCards.map((card, index) => (
              <span
                key={card.key}
                className={`rounded-full ${
                  index === categorySlide
                    ? "h-4 w-4 border border-[#1d150f] bg-white shadow-[inset_0_0_0_4px_#1d150f]"
                    : "h-2.5 w-2.5 bg-[#a9a29c]"
                }`}
              />
            ))}
          </div>

          <p className="mt-3 text-center text-sm text-[#8a837d]">Swipe to explore more categories</p>
        </div>
      </section>

      <section className="px-4 pt-3 md:hidden">
        <div className="layout-shell sticky top-[4.45rem] z-20 rounded-[18px] border border-[#e9e5df] bg-white px-4 py-3 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e7e3dc] bg-white px-4 py-3 text-[1.05rem] font-semibold text-[#121212]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>

            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-full w-full appearance-none rounded-[10px] border border-[#e7e3dc] bg-white px-4 py-3 pr-10 text-[1.05rem] font-medium text-[#2b2b2b] outline-none"
              >
                <option value="featured">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c4b33]" />
            </div>
          </div>

          {mobileFiltersOpen ? (
            <div className="mt-4 space-y-3 border-t border-[#f0ece6] pt-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6c52]" />
                <input
                  type="text"
                  placeholder="Search statue, sword, shield..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-full border border-[#ebddcb] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] outline-none transition placeholder:text-[#927863] focus:border-[#d6a35c] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                      category === cat
                        ? "bg-[#34180e] text-white"
                        : "border border-[#eadbc8] bg-white text-[#6c4b33]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="hidden px-4 pt-5 md:block md:px-6">
        <div className="layout-shell sticky top-[4.6rem] z-20 rounded-[28px] border border-[#e8d7c1] bg-white/95 p-4 shadow-[0_18px_50px_-35px_rgba(70,36,15,0.6)] backdrop-blur md:top-[5.4rem] md:p-5">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6c52]" />
              <input
                type="text"
                placeholder="Search statue, sword, shield..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-full border border-[#ebddcb] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] outline-none transition placeholder:text-[#927863] focus:border-[#d6a35c] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7efe5] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b4d1d]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </div>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    category === cat
                      ? "bg-[#34180e] text-white"
                      : "border border-[#eadbc8] bg-white text-[#6c4b33] hover:border-[#d6a35c] hover:bg-[#fff7ec]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-4 pt-4 md:px-6">
        <div className="layout-shell">
          <div className="mb-4 hidden items-center justify-between gap-3 md:flex">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
                Results
              </p>
              <h2 className="mt-1 font-heading text-2xl text-[#34180e]">
                {filtered.length} products for mobile users
              </h2>
            </div>
            <Link
              to="/required-catalogue"
              className="hidden rounded-full border border-[#d8b48b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#34180e] md:inline-flex"
            >
              Get full catalogue
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:hidden">
            {filtered.map((product, index) => {
              const priceValue = parsePriceValue(product.price);
              const discount = getMobileDiscount(index);
              const originalPrice = Math.round((priceValue * 100) / (100 - discount));
              const badgeLabel = getMobileBadge(product.tag, index);
              const dimensionMatch = product.dimensions.match(/(\d+)/);
              const sizeValue = dimensionMatch?.[1] ? `${dimensionMatch[1]} in` : product.category;

              return (
                <div
                  key={product.id}
                  className="overflow-hidden bg-white px-1 pb-1 pt-2 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.35)]"
                >
                  <div className="relative flex min-h-[11.4rem] items-start justify-center bg-white px-2 pb-1 pt-1">
                    <Link to="/products/$productId" params={{ productId: product.id }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        width={600}
                        height={700}
                        className="mx-auto aspect-[0.9] w-[73%] object-contain"
                      />
                    </Link>
                    <span
                      className={`absolute left-1 top-1 px-2.5 py-1 text-[0.8rem] font-semibold lowercase leading-none text-white ${getBadgeTone(
                        badgeLabel,
                      )}`}
                    >
                      {badgeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      className="absolute right-1 top-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e9e9e9] bg-white text-[#3d3d3d] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.65)]"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${isWishlisted(product.id) ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="px-2 pb-3 pt-1">
                    <Link
                      to="/products/$productId"
                      params={{ productId: product.id }}
                      className="block line-clamp-1 min-h-[1.8rem] text-[0.9rem] font-medium leading-7 text-[#111111]"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-2 min-h-[3rem] text-[0.9rem] font-medium leading-7 text-[#111111]">
                      {product.shortDescription}
                    </p>
                    <div className="mt-1 flex items-center gap-0.5 text-[#f5a300]">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={`${product.id}-star-${starIndex}`}
                          className="h-3 w-3 fill-current"
                        />
                      ))}
                    </div>
                    <div className="mt-2.5">
                      <div className="inline-flex overflow-hidden rounded-[8px] border border-[#43a047]">
                        <div className="bg-[#f5fff3] px-4 py-1 text-center text-[0.78rem] font-medium text-[#4a4a4a]">
                          {sizeValue}
                        </div>
                        <div className="bg-[#43a047] px-4 py-1 text-center text-[0.78rem] font-semibold text-white">
                          {discount}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[0.95rem] font-semibold leading-none text-[#111111]">
                          {formatRupees(priceValue)}
                        </p>
                        <p className="mt-1.5 text-[0.82rem] text-[#b5b5b5] line-through">
                          {formatRupees(originalPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        aria-label="Add to cart"
                        className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#ffbf1f] px-3.5 text-[0.9rem] font-semibold text-[#151515] shadow-[0_12px_22px_-18px_rgba(255,191,31,0.95)]"
                      >
                        <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden grid-cols-2 gap-3 md:grid md:gap-4 xl:grid-cols-4">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-[22px] border border-[#eadbc8] bg-white shadow-[0_18px_45px_-38px_rgba(70,36,15,0.65)] transition hover:-translate-y-1 hover:border-[#d6a35c]"
              >
                <div className="relative aspect-[0.82] overflow-hidden bg-[#f7efe5]">
                  <Link to="/products/$productId" params={{ productId: product.id }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      width={600}
                      height={700}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>
                  {product.tag ? (
                    <span className="absolute left-3 top-3 rounded-full bg-[#34180e] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ffd68d]">
                      {product.tag}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                      isWishlisted(product.id)
                        ? "border-[#34180e] bg-[#34180e] text-white"
                        : "border-white/70 bg-white/90 text-[#34180e]"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <div className="p-3 md:p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">
                    {product.category}
                  </p>
                  <Link
                    to="/products/$productId"
                    params={{ productId: product.id }}
                    className="mt-1.5 block min-h-[3.35rem] line-clamp-2 font-heading text-[1.05rem] leading-[1.05] text-[#34180e] md:text-[1.2rem]"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-[11px] leading-5 text-[#7e624b] md:text-xs">
                    {product.shortDescription}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#8b4d1d]">{product.price}</p>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      aria-label="Add to cart"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#34180e] text-white transition hover:bg-[#221008]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10 rounded-[28px] border border-dashed border-[#d8b48b] bg-white px-5 py-10 text-center">
              <p className="font-heading text-2xl text-[#34180e]">No matching products found</p>
              <p className="mt-3 text-sm text-[#7e624b]">
                Try another keyword or switch categories to continue browsing.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
