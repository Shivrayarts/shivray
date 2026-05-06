import { Link, useLocation } from "@/lib/spa-router";
import { useMemo, useRef, useState } from "react";
import { BookOpenText, ChevronDown, Heart, Search, ShoppingCart, SlidersHorizontal, Star, Tag } from "lucide-react";
import { categories } from "@/data/products";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useStoredProducts } from "@/lib/content-store";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";
import { normalizeDisplayCase, parseCurrencyAmount } from "@/lib/utils";

function formatRupees(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductsPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get("q") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [sortBy, setSortBy] = useState("featured");
  const [categorySlide, setCategorySlide] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const products = useStoredProducts();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const categoryCards = useMemo(
    () => [
      { title: "Maharaj Statues", key: "Statues" as const, count: `${products.filter((product) => product.category === "Statues").length} products`, image: productStatue1 },
      { title: "Warrior Weapons", key: "Weapons" as const, count: `${products.filter((product) => product.category === "Weapons").length} products`, image: productWeapon1 },
      { title: "Premium Shields", key: "Shields" as const, count: `${products.filter((product) => product.category === "Shields").length} products`, image: heroBanner3 },
      { title: "Dhoop Collection", key: "Dhoop" as const, count: `${products.filter((product) => product.category === "Dhoop").length} products`, image: productDhoop1 },
    ],
    [products],
  );

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchedProducts = products.filter((product) => {
      const haystack = [product.name, product.category, product.tag, product.shortDescription, product.details, product.material, product.dimensions].join(" ").toLowerCase();
      const matchesSearch = normalizedSearch.length === 0 || haystack.includes(normalizedSearch);
      const matchesCategory = category === "All" || product.category === category;
      return matchesSearch && matchesCategory;
    });
    const sortedProducts = [...matchedProducts];
    if (sortBy === "price-low") sortedProducts.sort((a, b) => parseCurrencyAmount(a.price) - parseCurrencyAmount(b.price));
    if (sortBy === "price-high") sortedProducts.sort((a, b) => parseCurrencyAmount(b.price) - parseCurrencyAmount(a.price));
    if (sortBy === "name") sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    return sortedProducts;
  }, [category, products, search, sortBy]);

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
      <section className="hidden bg-[#2b130c] px-4 pb-8 pt-6 text-white md:block md:px-6 md:pb-12 md:pt-10">
        <div className="layout-shell">
          <span className="inline-flex rounded-full border border-[#f2bb64]/30 bg-[#f2bb64]/10 px-3 py-1 text-[11px] font-semibold tracking-[0.28em] text-[#ffd68d]">Product Catalogue</span>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">Built for quick mobile product discovery.</h1>
        </div>
      </section>
      <section className="hidden px-4 py-8 md:block md:px-6 md:py-10">
        <div className="layout-shell rounded-[34px] bg-[#fffdf8] px-4 py-6 md:px-8 md:py-8">
          <div className="text-center"><h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">Popular Categories</h2></div>
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
            <button type="button" onClick={() => setMobileFiltersOpen((prev) => !prev)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e7e3dc] bg-white px-4 py-3 text-[1.05rem] font-semibold text-[#121212]">
              <SlidersHorizontal className="h-4 w-4" /> Filter
            </button>
            <div className="relative flex-1">
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-full w-full appearance-none rounded-[10px] border border-[#e7e3dc] bg-white px-4 py-3 pr-10 text-[1.05rem] font-medium text-[#2b2b2b]">
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
                <input type="text" placeholder="Search statue, sword, shield..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-full border border-[#ebddcb] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e]" />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.18em] ${category === cat ? "bg-[#34180e] text-white" : "border border-[#eadbc8] bg-white text-[#6c4b33]"}`}>
                    {cat}
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
              <input type="text" placeholder="Search statue, sword, shield..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-full border border-[#ebddcb] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e]" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7efe5] px-3 py-2 text-xs font-semibold tracking-[0.2em] text-[#8b4d1d]"><SlidersHorizontal className="h-3.5 w-3.5" />Filters</div>
              {categories.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.18em] ${category === cat ? "bg-[#34180e] text-white" : "border border-[#eadbc8] bg-white text-[#6c4b33]"}`}>
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
              <p className="text-[11px] font-semibold tracking-[0.28em] text-[#a86c2b]">Results</p>
              <h2 className="mt-1 font-heading text-2xl text-[#34180e]">{filtered.length} products for mobile users</h2>
            </div>
            <Link to="/required-catalogue" className="hidden rounded-full border border-[#d8b48b] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#34180e] md:inline-flex">Get full catalogue</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {filtered.map((product) => (
              <div key={product.id} className="overflow-hidden bg-white px-1 pb-1 pt-2 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.35)]">
                <div className="relative flex min-h-[11.4rem] items-start justify-center bg-white px-2 pb-1 pt-1">
                  <Link to="/products/$productId" params={{ productId: product.id }}>
                    <img src={product.image} alt={product.name} loading="lazy" className="mx-auto aspect-[0.9] w-[73%] object-contain" />
                  </Link>
                  <button type="button" onClick={() => toggleWishlist(product.id)} className="absolute right-1 top-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e9e9e9] bg-white text-[#3d3d3d]">
                    <Heart className={`h-3.5 w-3.5 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
                <div className="px-2 pb-3 pt-1">
                  <Link to="/products/$productId" params={{ productId: product.id }} className="block line-clamp-1 min-h-[1.8rem] text-[0.9rem] font-normal leading-7 text-[#111111]">
                    {normalizeDisplayCase(product.name)}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 min-h-[3rem] text-[0.9rem] font-normal leading-7 text-[#111111]">{product.shortDescription}</p>
                  <div className="mt-1 flex items-center gap-0.5 text-[#f5a300]">{Array.from({ length: 5 }).map((_, starIndex) => <Star key={`${product.id}-${starIndex}`} className="h-3 w-3 fill-current" />)}</div>
                  <div className="mt-2.5 flex items-end justify-between gap-2">
                    <div><p className="text-[0.95rem] font-normal leading-none text-[#111111]">{formatRupees(parseCurrencyAmount(product.price))}</p></div>
                    <button type="button" onClick={() => addToCart(product.id)} className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#ffbf1f] px-3.5 text-[0.9rem] font-semibold text-[#151515]">
                      <ShoppingCart className="mr-1 h-3.5 w-3.5" />Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden grid-cols-2 gap-3 md:grid md:gap-4 xl:grid-cols-4">
            {filtered.map((product) => (
              <div key={product.id} className="group rounded-[2.35rem] bg-white p-3 shadow-[0_24px_60px_-34px_rgba(27,32,50,0.28)]">
                <div className="overflow-hidden rounded-[2rem] bg-[#eef3f7]">
                  <Link to="/products/$productId" params={{ productId: product.id }}>
                    <img src={product.image} alt={product.name} loading="lazy" className="aspect-[0.9] w-full object-cover transition duration-500 group-hover:scale-105" />
                  </Link>
                </div>
                <div className="px-3 pb-3 pt-5">
                  <Link to="/products/$productId" params={{ productId: product.id }} className="block min-h-[3.2rem] line-clamp-2 text-[1.9rem] font-normal leading-[0.98] tracking-[-0.045em] text-[#181818]">{normalizeDisplayCase(product.name)}</Link>
                  <p className="mt-2 text-[1rem] font-normal text-[#b3b3b3]">{product.category}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.98rem]">
                    <div className="flex items-center gap-2 text-[#b8b8b8]"><Tag className="h-4 w-4 stroke-[1.8]" /><span className="font-normal text-[#1c1c1c]">from {product.price}</span></div>
                  </div>
                  <p className="mt-4 line-clamp-2 min-h-[3.1rem] text-[0.95rem] leading-6 text-[#747474]">{product.shortDescription}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <Link to="/products/$productId" params={{ productId: product.id }} className="flex-1 rounded-full bg-[#181818] px-4 py-3.5 text-center text-sm font-medium text-white">View details</Link>
                    <button type="button" onClick={() => toggleWishlist(product.id)} className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#ececec] bg-white text-[#ff6b77]">
                      <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
