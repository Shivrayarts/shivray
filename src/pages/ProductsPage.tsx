import { Link, useLocation } from "@/lib/spa-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { categories, getCategoryLabel } from "@/data/products";
import { useWishlist } from "@/hooks/use-wishlist";
import { useStoredProducts } from "@/lib/content-store";
import { getSearchableText, resolveLocalizedText, useLanguage } from "@/lib/language";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";
import { parseCurrencyAmount } from "@/lib/utils";
import ProductGalleryCard from "@/components/ProductGalleryCard";

export default function ProductsPage() {
  const { resolvedLocale } = useLanguage();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get("q") ?? "";
  const categoryParam = params.get("category");
  const initialCategory = categories.includes((categoryParam ?? "") as (typeof categories)[number])
    ? ((categoryParam ?? "All") as (typeof categories)[number])
    : "All";
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<(typeof categories)[number]>(initialCategory);
  const [sortBy, setSortBy] = useState("featured");
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [categorySlide, setCategorySlide] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const products = useStoredProducts();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    const nextParams = new URLSearchParams(location.search);
    const nextSearch = nextParams.get("q") ?? "";
    const nextCategoryParam = nextParams.get("category");
    const nextCategory = categories.includes(
      (nextCategoryParam ?? "") as (typeof categories)[number],
    )
      ? ((nextCategoryParam ?? "All") as (typeof categories)[number])
      : "All";

    setSearch(nextSearch);
    setCategory(nextCategory);
  }, [location.search]);

  const categoryCards = useMemo(
    () => [
      {
        title: resolvedLocale === "mr" ? "\u092e\u0939\u093e\u0930\u093e\u091c \u092e\u0942\u0930\u094d\u0924\u0940" : "Maharaj Statues",
        key: "Statues" as const,
        count: `${products.filter((product) => product.category === "Statues").length} ${resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947" : "products"}`,
        image: productStatue1,
      },
      {
        title: resolvedLocale === "mr" ? "\u092f\u094b\u0926\u094d\u0927\u093e \u0936\u0938\u094d\u0924\u094d\u0930\u0947" : "Warrior Weapons",
        key: "Weapons" as const,
        count: `${products.filter((product) => product.category === "Weapons").length} ${resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947" : "products"}`,
        image: productWeapon1,
      },
      {
        title: resolvedLocale === "mr" ? "\u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e \u0922\u093e\u0932\u0940" : "Premium Shields",
        key: "Shields" as const,
        count: `${products.filter((product) => product.category === "Shields").length} ${resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947" : "products"}`,
        image: heroBanner3,
      },
      {
        title: resolvedLocale === "mr" ? "\u0927\u0942\u092a \u0938\u0902\u0917\u094d\u0930\u0939" : "Dhoop Collection",
        key: "Dhoop" as const,
        count: `${products.filter((product) => product.category === "Dhoop").length} ${resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947" : "products"}`,
        image: productDhoop1,
      },
    ],
    [products, resolvedLocale],
  );

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchedProducts = products.filter((product) => {
      const haystack = [
        getSearchableText(product.name),
        product.category,
        getSearchableText(product.tag),
        getSearchableText(product.shortDescription),
        getSearchableText(product.details),
        getSearchableText(product.material),
        getSearchableText(product.dimensions),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = normalizedSearch.length === 0 || haystack.includes(normalizedSearch);
      const matchesCategory = category === "All" || product.category === category;
      return matchesSearch && matchesCategory;
    });
    const sortedProducts = [...matchedProducts];
    if (sortBy === "price-low") sortedProducts.sort((a, b) => parseCurrencyAmount(a.price) - parseCurrencyAmount(b.price));
    if (sortBy === "price-high") sortedProducts.sort((a, b) => parseCurrencyAmount(b.price) - parseCurrencyAmount(a.price));
    if (sortBy === "name") sortedProducts.sort((a, b) => resolveLocalizedText(a.name, resolvedLocale).localeCompare(resolveLocalizedText(b.name, resolvedLocale)));
    return sortedProducts;
  }, [category, products, resolvedLocale, search, sortBy]);

  const sortLabel =
    sortBy === "price-low"
      ? (resolvedLocale === "mr" ? "\u0915\u093f\u0902\u092e\u0924: \u0915\u092e\u0940 \u0924\u0947 \u091c\u093e\u0938\u094d\u0924" : "Price: Low to High")
      : sortBy === "price-high"
        ? (resolvedLocale === "mr" ? "\u0915\u093f\u0902\u092e\u0924: \u091c\u093e\u0938\u094d\u0924 \u0924\u0947 \u0915\u092e\u0940" : "Price: High to Low")
        : sortBy === "name"
          ? (resolvedLocale === "mr" ? "\u0928\u093e\u0935" : "Name")
          : (resolvedLocale === "mr" ? "\u0915\u094d\u0930\u092e\u0935\u093e\u0930\u0940" : "Sort By");

  const selectSort = (value: string) => {
    setSortBy(value);
    setMobileSortOpen(false);
  };

  const handleCategoriesScroll = () => {
    const node = categoriesRef.current;
    if (!node || window.innerWidth >= 768) return;
    const firstCard = node.querySelector<HTMLElement>("[data-catalogue-category-card]");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 16;
    const nextSlide = Math.round(node.scrollLeft / cardWidth);
    setCategorySlide(Math.max(0, Math.min(nextSlide, categoryCards.length - 1)));
  };

  return (
    <div className="bg-[#f5f5f5] pb-6 md:bg-[#f7f1e7] md:pb-10">
      {/* <section className="hidden bg-[#2b130c] px-4 pb-8 pt-6 text-white md:block md:px-6 md:pb-12 md:pt-10">
        <div className="layout-shell">
          <span className="inline-flex rounded-full border border-[#f2bb64]/30 bg-[#f2bb64]/10 px-3 py-1 text-[11px] font-semibold tracking-[0.28em] text-[#ffd68d]">
            {resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928 \u0915\u0945\u091f\u0932\u0949\u0917" : "Product Catalogue"}
          </span>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">
            {resolvedLocale === "mr" ? "\u092e\u094b\u092c\u093e\u0908\u0932\u0935\u0930 \u091c\u0932\u0926 \u0909\u0924\u094d\u092a\u093e\u0926\u0928 \u0936\u094b\u0927\u093e\u0938\u093e\u0920\u0940 \u0924\u092f\u093e\u0930." : "Built for quick mobile product discovery."}
          </h1>
        </div>
      </section> */}
      <section className="hidden px-4 py-8 md:block md:px-6 md:py-10">
        <div className="layout-shell rounded-[34px] bg-[#fffdf8] px-4 py-6 md:px-8 md:py-8">
          <div className="text-center">
            <h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">
              {resolvedLocale === "mr" ? "\u0932\u094b\u0915\u092a\u094d\u0930\u093f\u092f \u0936\u094d\u0930\u0947\u0923\u0940" : "Popular Categories"}
            </h2>
          </div>
          <div ref={categoriesRef} onScroll={handleCategoriesScroll} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-x-6 md:overflow-visible md:pb-0">
            {categoryCards.map((card) => (
              <button key={card.key} type="button" data-catalogue-category-card onClick={() => setCategory(card.key)} className="group min-w-[78%] snap-center text-center sm:min-w-[calc(50%-0.5rem)] md:min-w-0">
                <div className="relative overflow-hidden rounded-[30px] bg-[#b65a73] shadow-[0_18px_45px_-30px_rgba(89,34,49,0.65)]">
                  <img src={card.image} alt={card.title} className="aspect-square w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 font-body text-xl font-semibold text-[#1c140f] md:text-2xl">{card.title}</h3>
                <p className="mt-1 text-base text-[#7d766f]">{card.count}</p>
              </button>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-center gap-3">
            {categoryCards.map((card, index) => (
              <span key={card.key} className={`rounded-full ${index === categorySlide ? "h-4 w-4 border border-[#1d150f] bg-white shadow-[inset_0_0_0_4px_#1d150f]" : "h-2.5 w-2.5 bg-[#a9a29c]"}`} />
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 pt-3 md:hidden">
        <div className="layout-shell sticky top-[4.45rem] z-20 rounded-[18px] border border-[#e9e5df] bg-white px-4 py-3 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMobileFiltersOpen((prev) => !prev);
                setMobileSortOpen(false);
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e7e3dc] bg-white px-4 py-3 text-[1.05rem] font-semibold text-[#121212]"
            >
              <SlidersHorizontal className="h-4 w-4" /> {resolvedLocale === "mr" ? "\u092b\u093f\u0932\u094d\u091f\u0930" : "Filter"}
            </button>
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => {
                  setMobileSortOpen((prev) => !prev);
                  setMobileFiltersOpen(false);
                }}
                className="inline-flex w-full items-center justify-between rounded-[10px] border border-[#e7e3dc] bg-white px-4 py-3 text-left text-[1.05rem] font-medium text-[#2b2b2b]"
              >
                <span className="truncate">{sortLabel}</span>
              </button>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c4b33]" />
            </div>
          </div>
          {mobileSortOpen ? (
            <div className="mt-4 space-y-2 border-t border-[#f0ece6] pt-4">
              {[
                { value: "featured", label: resolvedLocale === "mr" ? "\u0915\u094d\u0930\u092e\u0935\u093e\u0930\u0940" : "Sort By" },
                { value: "price-low", label: resolvedLocale === "mr" ? "\u0915\u093f\u0902\u092e\u0924: \u0915\u092e\u0940 \u0924\u0947 \u091c\u093e\u0938\u094d\u0924" : "Price: Low to High" },
                { value: "price-high", label: resolvedLocale === "mr" ? "\u0915\u093f\u0902\u092e\u0924: \u091c\u093e\u0938\u094d\u0924 \u0924\u0947 \u0915\u092e\u0940" : "Price: High to Low" },
                { value: "name", label: resolvedLocale === "mr" ? "\u0928\u093e\u0935" : "Name" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectSort(option.value)}
                  className={`block w-full rounded-[12px] px-4 py-3 text-left text-[1rem] ${
                    sortBy === option.value ? "bg-[#34180e] text-white" : "bg-[#f8f5f0] text-[#34180e]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
          {mobileFiltersOpen ? (
            <div className="mt-4 space-y-3 border-t border-[#f0ece6] pt-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6c52]" />
                <input type="text" placeholder={resolvedLocale === "mr" ? "\u092e\u0942\u0930\u094d\u0924\u0940, \u0924\u0932\u0935\u093e\u0930, \u0922\u093e\u0932 \u0936\u094b\u0927\u093e..." : "Search statue, sword, shield..."} value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-full border border-[#ebddcb] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e]" />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.18em] ${category === cat ? "bg-[#34180e] text-white" : "border border-[#eadbc8] bg-white text-[#6c4b33]"}`}>
                    {cat === "All" ? (resolvedLocale === "mr" ? "\u0938\u0930\u094d\u0935" : "All") : getCategoryLabel(cat, resolvedLocale)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <section className="hidden px-4 pt-5 md:block md:px-6">
        <div className="layout-shell sticky top-[4.6rem] z-20 rounded-[28px] border border-[#e8d7c1] bg-white/95 p-4 shadow-[0_18px_50px_-35px_rgba(70,36,15,0.6)]">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6c52]" />
              <input type="text" placeholder={resolvedLocale === "mr" ? "\u092e\u0942\u0930\u094d\u0924\u0940, \u0924\u0932\u0935\u093e\u0930, \u0922\u093e\u0932 \u0936\u094b\u0927\u093e..." : "Search statue, sword, shield..."} value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-full border border-[#ebddcb] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e]" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7efe5] px-3 py-2 text-xs font-semibold tracking-[0.2em] text-[#8b4d1d]"><SlidersHorizontal className="h-3.5 w-3.5" />{resolvedLocale === "mr" ? "\u092b\u093f\u0932\u094d\u091f\u0930\u094d\u0938" : "Filters"}</div>
              {categories.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.18em] ${category === cat ? "bg-[#34180e] text-white" : "border border-[#eadbc8] bg-white text-[#6c4b33]"}`}>
                  {cat === "All" ? (resolvedLocale === "mr" ? "\u0938\u0930\u094d\u0935" : "All") : getCategoryLabel(cat, resolvedLocale)}
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
              <p className="text-[11px] font-semibold tracking-[0.28em] text-[#a86c2b]">{resolvedLocale === "mr" ? "\u0928\u093f\u0915\u093e\u0932" : "Results"}</p>
              <h2 className="mt-1 font-heading text-2xl text-[#34180e]">{filtered.length} {resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947" : "products for mobile users"}</h2>
            </div>
            <Link to="/required-catalogue" className="hidden rounded-full border border-[#d8b48b] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#34180e] md:inline-flex">{resolvedLocale === "mr" ? "\u092a\u0942\u0930\u094d\u0923 \u0915\u0945\u091f\u0932\u0949\u0917 \u092e\u093f\u0933\u0935\u093e" : "Get full catalogue"}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {filtered.map((product) => (
              <ProductGalleryCard
                key={product.id}
                product={product}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
          <div className="hidden grid-cols-2 gap-3 md:grid md:gap-4 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductGalleryCard
                key={product.id}
                product={product}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
