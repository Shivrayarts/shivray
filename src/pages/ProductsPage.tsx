import { Link, useLocation } from "@/lib/spa-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { getCategoryLabel } from "@/lib/product-model";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useWishlist } from "@/hooks/use-wishlist";
import {
  categoriesMatch,
  countProductsForCatalogue,
  findFirstProductImageForCatalogue,
  findMatchingCatalogue,
  getCataloguePrimaryCategoryKey,
  isUnchangedLegacySeededCatalogue,
  resolveCategoryMatchKey,
} from "@/lib/category-matching";
import { useStoredCatalogueTypes, useStoredProducts } from "@/lib/content-store";
import { getSearchableText, resolveLocalizedText, useLanguage } from "@/lib/language";
import { getProductPricing, parseCurrencyAmount } from "@/lib/utils";
import ProductGalleryCard from "@/components/ProductGalleryCard";

const PRODUCTS_PER_PAGE = 12;
const PLACEHOLDER_IMAGE = "/placeholder.svg";

export default function ProductsPage() {
  const { resolvedLocale } = useLanguage();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get("q") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [categorySlide, setCategorySlide] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const products = useStoredProducts();
  const catalogueTypes = useStoredCatalogueTypes();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const getDisplayCategoryLabel = (rawCategory: string) => {
    const normalized = String(rawCategory || "").trim();
    if (!normalized || normalized === "All") {
      return resolvedLocale === "mr" ? "\u0938\u0930\u094d\u0935" : "All";
    }

    const matchedCatalogue = findMatchingCatalogue(normalized, catalogueTypes);

    if (matchedCatalogue) {
      return resolveLocalizedText(matchedCatalogue.shortLabel, resolvedLocale);
    }

    return getCategoryLabel(normalized, resolvedLocale);
  };

  const categories = useMemo(() => {
    const normalizedCategories = new Set<string>();

    for (const product of products) {
      const rawCategory = String(product.category || "").trim();
      if (!rawCategory) continue;
      normalizedCategories.add(resolveCategoryMatchKey(rawCategory, catalogueTypes));
    }

    return ["All", ...Array.from(normalizedCategories)];
  }, [catalogueTypes, products]);

  const categoryParam = params.get("category");
  const initialCategory =
    categoryParam == null
      ? "All"
      : categories.find((item) => categoriesMatch(item, categoryParam, catalogueTypes)) ?? "All";
  const hasRouteCategoryFilter = initialCategory !== "All";

  useEffect(() => {
    const nextParams = new URLSearchParams(location.search);
    const nextSearch = nextParams.get("q") ?? "";
    const nextCategoryParam = nextParams.get("category");
    const nextCategory =
      nextCategoryParam == null
        ? "All"
        : categories.find((item) => categoriesMatch(item, nextCategoryParam, catalogueTypes)) ?? "All";

    setSearch(nextSearch);
    setCategory(nextCategory);
  }, [catalogueTypes, categories, location.search]);

  const categoryCards = useMemo(() => {
    return catalogueTypes
      .filter((catalogue) => catalogue.isActive)
      .filter((catalogue) => !isUnchangedLegacySeededCatalogue(catalogue))
      .map((catalogue) => {
        const key = getCataloguePrimaryCategoryKey(catalogue) || "General";
        const title =
          (typeof catalogue.title === "string" ? catalogue.title : catalogue.title[resolvedLocale]) || key;
        const productCount = countProductsForCatalogue(catalogue, products);
        if (productCount === 0) return null;

        return {
          title,
          key,
          count: `${productCount} ${resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947" : "products"}`,
          image: catalogue.image || findFirstProductImageForCatalogue(catalogue, products) || PLACEHOLDER_IMAGE,
        };
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);
  }, [catalogueTypes, products, resolvedLocale]);

  const visibleCategoryCards = useMemo(
    () =>
      hasRouteCategoryFilter && category !== "All"
        ? categoryCards.filter((card) => categoriesMatch(card.key, category, catalogueTypes))
        : categoryCards,
    [catalogueTypes, category, categoryCards, hasRouteCategoryFilter],
  );

  useEffect(() => {
    setCategorySlide(0);
  }, [visibleCategoryCards.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, sortBy]);

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
      const matchesCategory =
        category === "All" || categoriesMatch(product.category, category, catalogueTypes);
      return matchesSearch && matchesCategory;
    });
    const sortedProducts = [...matchedProducts];
    if (sortBy === "price-low") sortedProducts.sort((a, b) => parseCurrencyAmount(getProductPricing(a).finalPrice) - parseCurrencyAmount(getProductPricing(b).finalPrice));
    if (sortBy === "price-high") sortedProducts.sort((a, b) => parseCurrencyAmount(getProductPricing(b).finalPrice) - parseCurrencyAmount(getProductPricing(a).finalPrice));
    if (sortBy === "name") sortedProducts.sort((a, b) => resolveLocalizedText(a.name, resolvedLocale).localeCompare(resolveLocalizedText(b.name, resolvedLocale)));
    return sortedProducts;
  }, [catalogueTypes, category, products, resolvedLocale, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentPage, filtered]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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
    setCategorySlide(Math.max(0, Math.min(nextSlide, visibleCategoryCards.length - 1)));
  };

  const scrollToCategorySlide = (index: number, behavior: ScrollBehavior = "smooth") => {
    const node = categoriesRef.current;
    if (!node) return;
    const firstCard = node.querySelector<HTMLElement>("[data-catalogue-category-card]");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 16;
    const safeIndex = Math.max(0, Math.min(index, visibleCategoryCards.length - 1));
    node.scrollTo({ left: safeIndex * cardWidth, behavior });
    setCategorySlide(safeIndex);
  };

  useEffect(() => {
    if (visibleCategoryCards.length <= 1) return;
    const timer = window.setInterval(() => {
      setCategorySlide((prev) => {
        const next = (prev + 1) % visibleCategoryCards.length;
        scrollToCategorySlide(next);
        return next;
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, [visibleCategoryCards.length]);

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
      {visibleCategoryCards.length > 0 ? (
        <section className="px-4 py-6 md:px-6 md:py-10">
          <div className="layout-shell rounded-[34px] bg-[#fffdf8] px-4 py-6 md:px-8 md:py-8">
            <div className="text-center">
              <h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">
                {resolvedLocale === "mr" ? "\u0932\u094b\u0915\u092a\u094d\u0930\u093f\u092f \u0936\u094d\u0930\u0947\u0923\u0940" : "Popular Categories"}
              </h2>
            </div>
            <div ref={categoriesRef} onScroll={handleCategoriesScroll} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {visibleCategoryCards.map((card) => (
                <button key={card.key} type="button" data-catalogue-category-card onClick={() => setCategory(card.key)} className="group w-[78vw] max-w-[22rem] shrink-0 snap-center text-center sm:w-[19rem] md:w-[16.5rem]">
                  <div className="relative overflow-hidden rounded-[30px] bg-[#b65a73] shadow-[0_18px_45px_-30px_rgba(89,34,49,0.65)]">
                    <img src={card.image} alt={card.title} className="aspect-square w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-4 font-body text-xl font-semibold text-[#1c140f] md:text-2xl">{card.title}</h3>
                  <p className="mt-1 text-base text-[#7d766f]">{card.count}</p>
                </button>
              ))}
            </div>
            <div className="mt-7 flex items-center justify-center gap-3">
              {visibleCategoryCards.map((card, index) => (
                <button
                  key={card.key}
                  type="button"
                  aria-label={`Go to category slide ${index + 1}`}
                  onClick={() => scrollToCategorySlide(index)}
                  className={`rounded-full ${index === categorySlide ? "h-4 w-4 border border-[#1d150f] bg-white shadow-[inset_0_0_0_4px_#1d150f]" : "h-2.5 w-2.5 bg-[#a9a29c]"}`}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
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
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.18em] ${category === cat ? "bg-[#34180e] text-white" : "border border-[#eadbc8] bg-white text-[#6c4b33]"}`}>
                    {getDisplayCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <section className="hidden px-4 pt-5 md:block md:px-6">
        <div className="layout-shell sticky top-[4.6rem] z-20 rounded-[28px] border border-[#e8d7c1] bg-white/95 p-4 shadow-[0_18px_50px_-35px_rgba(70,36,15,0.6)]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7efe5] px-3 py-2 text-xs font-semibold tracking-[0.2em] text-[#8b4d1d]"><SlidersHorizontal className="h-3.5 w-3.5" />{resolvedLocale === "mr" ? "\u092b\u093f\u0932\u094d\u091f\u0930\u094d\u0938" : "Filters"}</div>
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.18em] ${category === cat ? "bg-[#34180e] text-white" : "border border-[#eadbc8] bg-white text-[#6c4b33]"}`}>
                {getDisplayCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 pb-4 pt-4 md:px-6">
        <div className="layout-shell">
          <div className="mb-4 hidden items-center justify-between gap-3 md:flex">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.28em] text-[#a86c2b]">{resolvedLocale === "mr" ? "\u0928\u093f\u0915\u093e\u0932" : "Results"}</p>
              <h2 className="mt-1 font-heading text-2xl text-[#34180e]">{resolvedLocale === "mr" ? "\u0924\u0941\u092e\u091a\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u0936\u093f\u092b\u093e\u0930\u0938 \u0915\u0947\u0932\u0947\u0932\u0940 \u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947" : "Recommended Products for You"}</h2>
            </div>
            <Link to="/required-catalogue" className="hidden rounded-full border border-[#d8b48b] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#34180e] md:inline-flex">{resolvedLocale === "mr" ? "\u092a\u0942\u0930\u094d\u0923 \u0915\u0945\u091f\u0932\u0949\u0917 \u092e\u093f\u0933\u0935\u093e" : "Get full catalogue"}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {paginatedProducts.map((product) => (
              <ProductGalleryCard
                key={product.id}
                product={product}
                categoryLabel={getDisplayCategoryLabel(product.category)}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
          <div className="hidden grid-cols-2 gap-3 md:grid md:gap-4 xl:grid-cols-4">
            {paginatedProducts.map((product) => (
              <ProductGalleryCard
                key={product.id}
                product={product}
                categoryLabel={getDisplayCategoryLabel(product.category)}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
          {totalPages > 1 ? (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.max(1, page - 1));
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(page);
                      }}
                      className={currentPage === page ? "border-[#34180e] bg-[#34180e] text-white hover:bg-[#34180e] hover:text-white" : "text-[#34180e]"}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage((page) => Math.min(totalPages, page + 1));
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      </section>
    </div>
  );
}
