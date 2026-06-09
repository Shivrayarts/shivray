import { Link } from "@/lib/spa-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  useStoredHomeContent,
  useStoredCatalogueTypes,
  useStoredProducts,
} from "@/lib/content-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { getCategoryLabel, productCategories } from "@/data/products";
import { useLanguage } from "@/lib/language";
import productStatue1 from "@/assets/Products/product-2.jpeg";
import productWeapon1 from "@/assets/Products/product-5.jpeg";

const HomeDeferredSections = lazy(() => import("@/components/HomeDeferredSections"));
const productShield1 = "/assets/product-shield-1.jpg";
const productDhoop1 = "/assets/product-dhoop-1.jpg";

export default function HomePage() {
  const { resolvedLocale } = useLanguage();
  const products = useStoredProducts();
  const catalogueTypes = useStoredCatalogueTypes();
  const storedHomeContent = useStoredHomeContent();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [categorySlide, setCategorySlide] = useState(0);
  const [showDeferredSections, setShowDeferredSections] = useState(false);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const deferredSectionsRef = useRef<HTMLDivElement | null>(null);
  const reviews = storedHomeContent.reviews;
  const featuredVideos = storedHomeContent.videos;
  const homeProducts = products.slice(0, 8);
  const spotlightIds = storedHomeContent.spotlightProductIds?.length ? storedHomeContent.spotlightProductIds : [];
  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const key = String(product.category || "").trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const homeCategoryCards = useMemo(() => {
    const fallbackImages: Record<string, string> = {
      Statues: productStatue1,
      Weapons: productWeapon1,
      Shields: productShield1,
      Dhoop: productDhoop1,
    };

    const adminCards = catalogueTypes
      .filter((catalogue) => catalogue.isActive)
      .filter((catalogue) => {
        const key =
          (typeof catalogue.shortLabel === "string"
            ? catalogue.shortLabel
            : catalogue.shortLabel.en || catalogue.shortLabel.mr || "")
            .trim();
        return (productCountByCategory.get(key) ?? 0) > 0;
      })
      .map((catalogue) => {
        const key =
          (typeof catalogue.shortLabel === "string"
            ? catalogue.shortLabel
            : catalogue.shortLabel.en || catalogue.shortLabel.mr || "")
            .trim() || "General";
        const title =
          (typeof catalogue.title === "string" ? catalogue.title : catalogue.title[resolvedLocale]) || key;
        return {
          title,
          key,
          count: `${products.filter((product) => product.category === key).length} ${resolvedLocale === "mr" ? "उत्पादने" : "products"}`,
          image: catalogue.image || fallbackImages[key] || productStatue1,
        };
      });

    if (adminCards.length > 0) return adminCards;

    return productCategories.map((key) => ({
      title: getCategoryLabel(key, resolvedLocale),
      key,
      count: resolvedLocale === "mr" ? "कलेक्शन पाहा" : "Explore collection",
      image: fallbackImages[key] || productStatue1,
    }));
  }, [catalogueTypes, productCountByCategory, products, resolvedLocale]);

  const categoryLabelByKey = useMemo(() => {
    const labels = new Map<string, string>();
    for (const catalogue of catalogueTypes) {
      const key =
        (typeof catalogue.shortLabel === "string"
          ? catalogue.shortLabel
          : catalogue.shortLabel.en || catalogue.shortLabel.mr || "")
          .trim();
      if (!key) continue;
      const localizedLabel =
        typeof catalogue.shortLabel === "string"
          ? catalogue.shortLabel
          : catalogue.shortLabel[resolvedLocale] || catalogue.shortLabel.en || catalogue.shortLabel.mr || key;
      labels.set(key, localizedLabel);
    }
    return labels;
  }, [catalogueTypes, resolvedLocale]);

  const spotlightProducts = useMemo(() => {
    const selected = spotlightIds.flatMap((productId) => {
      const matchedProduct = products.find((item) => item.id === productId);
      return matchedProduct ? [matchedProduct] : [];
    });

    return selected.length > 0 ? selected : products.slice(0, 4);
  }, [products, spotlightIds]);

  const handleCategoriesScroll = () => {
    const node = categoriesRef.current;
    if (!node || window.innerWidth >= 768) return;
    const firstCard = node.querySelector<HTMLElement>("[data-category-card]");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 16;
    const nextSlide = Math.round(node.scrollLeft / cardWidth);
    setCategorySlide(Math.max(0, Math.min(nextSlide, homeCategoryCards.length - 1)));
  };

  const scrollToCategorySlide = (index: number, behavior: ScrollBehavior = "smooth") => {
    const node = categoriesRef.current;
    if (!node) return;
    const firstCard = node.querySelector<HTMLElement>("[data-category-card]");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 16;
    const safeIndex = Math.max(0, Math.min(index, homeCategoryCards.length - 1));
    node.scrollTo({ left: safeIndex * cardWidth, behavior });
    setCategorySlide(safeIndex);
  };

  useEffect(() => {
    const node = deferredSectionsRef.current;
    if (!node || showDeferredSections) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShowDeferredSections(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [showDeferredSections]);

  return (
    <div className="bg-[#f7f1e7]">
      <section className="relative isolate overflow-hidden bg-[#2b0b08] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#2b0b08_0%,#3b120d_45%,#1f0b07_100%)]" />
        <div className="relative mx-auto flex min-h-[280px] w-full max-w-[72rem] items-center justify-center px-6 py-14 text-center md:min-h-[360px] md:px-8 md:py-20">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e3a92b] md:text-sm">
              {resolvedLocale === "mr" ? "शिवराय आर्ट" : "Shivray Art"}
            </p>
            <h1 className="mt-5 font-heading text-4xl leading-tight text-[#fff3e1] md:text-6xl">
              {resolvedLocale === "mr" ? "मराठा वारशाची अस्सल कलाकुसर" : "Authentic Maratha Heritage Craftsmanship"}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#ecd7c0] md:text-base">
              {resolvedLocale === "mr"
                ? "मूर्ती, शस्त्रे, ढाली आणि वारसाप्रेरित संग्रह यांसाठी शिवराय आर्टचे निवडक हस्तकला काम पहा."
                : "Explore Shivray Art's handcrafted statues, weapons, shields, and heritage collections."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex rounded-full bg-[#e3a92b] px-6 py-3 text-sm font-semibold text-[#34180e]"
              >
                {resolvedLocale === "mr" ? "उत्पादने पहा" : "Browse Products"}
              </Link>
              <Link
                to="/contact"
                className="inline-flex rounded-full border border-[#a66a28] px-6 py-3 text-sm font-semibold text-[#fff3e1]"
              >
                {resolvedLocale === "mr" ? "संपर्क करा" : "Contact Us"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="layout-shell rounded-[34px] bg-[#fffdf8] px-4 py-6 md:px-8 md:py-8">
          <div className="text-center">
            <h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">
              {resolvedLocale === "mr" ? "लोकप्रिय श्रेणी" : "Popular Categories"}
            </h2>
          </div>
          {homeCategoryCards.length > 0 ? (
            <>
              <div
                ref={categoriesRef}
                onScroll={handleCategoriesScroll}
                className="category-carousel-scroll mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
              >
                {homeCategoryCards.map((card) => (
                  <Link
                    key={card.key}
                    to="/products"
                    search={{ category: card.key }}
                    data-category-card
                    className="group w-[78vw] max-w-[22rem] shrink-0 snap-center text-center sm:w-[19rem] md:w-[16.5rem]"
                  >
                    <div className="relative overflow-hidden rounded-[30px] bg-[#b65a73] shadow-[0_18px_45px_-30px_rgba(89,34,49,0.65)]">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="aspect-square w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <h3 className="mt-4 font-body text-xl font-semibold text-[#1c140f] md:text-2xl">{card.title}</h3>
                    <p className="mt-1 text-base text-[#7d766f]">{card.count}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-7 flex items-center justify-center gap-3">
                {homeCategoryCards.map((card, index) => (
                  <button
                    key={card.key}
                    type="button"
                    aria-label={`Go to category slide ${index + 1}`}
                    onClick={() => scrollToCategorySlide(index)}
                    className={`rounded-full ${index === categorySlide ? "h-4 w-4 border border-[#1d150f] bg-white shadow-[inset_0_0_0_4px_#1d150f]" : "h-2.5 w-2.5 bg-[#a9a29c]"}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-8 text-center text-base text-[#7d766f]">
              {resolvedLocale === "mr"
                ? "सध्या कोणत्याही श्रेणी प्रकाशित केलेल्या नाहीत."
                : "No categories are currently published."}
            </p>
          )}
        </div>
      </section>

      <div ref={deferredSectionsRef}>
        {!showDeferredSections ? (
          <>
            <section className="px-4 pb-8 md:px-6 md:pb-14">
              <div className="layout-shell">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#a86c2b]">{resolvedLocale === "mr" ? "सर्वाधिक विक्री" : "Best selling products"}</p>
                    <h2 className="mt-2 font-heading text-3xl text-[#34180e]">{resolvedLocale === "mr" ? "आठवड्याची सर्वाधिक विक्री झालेली उत्पादने" : "Recommended Products for You"}</h2>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`home-placeholder-${index}`}
                      className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-[#fffdf9] shadow-[0_24px_50px_-38px_rgba(77,41,19,0.45)]"
                    >
                      <div className="h-[14rem] animate-pulse bg-[#efe6d9] md:h-[18rem] lg:h-[20rem]" />
                      <div className="space-y-3 px-4 pb-5 pt-4">
                        <div className="h-3 w-24 rounded-full bg-[#f2e7d8]" />
                        <div className="h-5 w-3/4 rounded-full bg-[#eadfce]" />
                        <div className="h-5 w-1/3 rounded-full bg-[#eadfce]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="px-4 pb-8 md:px-6 md:pb-14">
              <div className="layout-shell rounded-[28px] border border-[#eadfce] bg-[#fffdf9] p-6 text-[#6c4b33]">
                {resolvedLocale === "mr" ? "अधिक विभाग लोड होत आहेत..." : "Loading more sections..."}
              </div>
            </section>
          </>
        ) : (
          <Suspense
            fallback={
              <section className="px-4 pb-8 md:px-6 md:pb-14">
                <div className="layout-shell rounded-[28px] border border-[#eadfce] bg-[#fffdf9] p-6 text-[#6c4b33]">
                  {resolvedLocale === "mr" ? "अधिक विभाग लोड होत आहेत..." : "Loading more sections..."}
                </div>
              </section>
            }
          >
            <HomeDeferredSections
              resolvedLocale={resolvedLocale}
              homeProducts={homeProducts}
              spotlightProducts={spotlightProducts}
              reviews={reviews}
              featuredVideos={featuredVideos}
              categoryLabelByKey={categoryLabelByKey}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
