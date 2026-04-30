import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { getProductsFromDbServer } from "@/lib/server/products.functions";
import { getCatalogueTypesFromDbServer } from "@/lib/server/catalogues.functions";
import { useWishlist } from "@/hooks/use-wishlist";
import { normalizeDisplayCase } from "@/lib/utils";
import heroBanner1 from "@/assets/products-poster.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productShowcase1 from "@/assets/product-1.png";
import productWeapon1 from "@/assets/product-weapon-1.jpg";

export const Route = createFileRoute("/")({
  loader: async () => ({
    products: await getProductsFromDbServer(),
    catalogueTypes: await getCatalogueTypesFromDbServer(),
  }),
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Shivray - Mobile First Heritage Store" },
      {
        name: "description",
        content:
          "Discover handcrafted Maratha statues, weapons, and heritage decor in a fast, mobile-first shopping experience.",
      },
      { property: "og:title", content: "Shivray - Mobile First Heritage Store" },
      {
        property: "og:description",
        content:
          "Browse collections, request catalogue access, and enquire instantly from a mobile-first Shivray storefront.",
      },
    ],
  }),
});

const spotlightProducts = [
  {
    id: "shastradhari-maharaj-coloured",
    title: "Shastradhari Maharaj",
    price: "Rs. 5,100",
    image: productStatue1,
  },
  {
    id: "roudra-shambhu-chatrapati",
    title: "Roudra Shambhu Chatrapati",
    price: "Rs. 5,100",
    image: productShowcase1,
  },
  {
    id: "royal-khanjar-with-sheath",
    title: "Royal Khanjar",
    price: "Rs. 8,500",
    image: productWeapon1,
  },
  {
    id: "brass-dhoop-stand",
    title: "Brass Dhoop Stand",
    price: "Rs. 2,200",
    image: productDhoop1,
  },
] as const;

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted Craftsmanship",
    copy: "Hand-finished products inspired by heritage, made for display, gifting, and devotion.",
  },
  {
    icon: Clock3,
    title: "Fast Enquiry Flow",
    copy: "Designed for mobile users who want quick browsing, quick contact, and quick buying decisions.",
  },
  {
    icon: BookOpenText,
    title: "Catalogue Support",
    copy: "Customers can request a full catalogue and get tailored recommendations for their budget.",
  },
] as const;

const heroSlides = [
  {
    eyebrow: "Premium Craftsmanship Since 2015",
    titleTop: "Timeless Culture",
    titleBottom: "Modern Vision",
    copy:
      "From heritage artifacts to custom statement pieces, each creation carries tradition, precision, and visual impact.",
    image: heroBanner3,
  },
  {
    eyebrow: "Made For Proud Spaces",
    titleTop: "Warrior Legacy",
    titleBottom: "Handcrafted Detail",
    copy:
      "Bring home statues, shields, and decor pieces shaped with heritage-inspired artistry and a premium finish.",
    image: heroBanner1,
  },
  {
    eyebrow: "Signature Heritage Collection",
    titleTop: "Royal Presence",
    titleBottom: "Bold Display",
    copy:
      "Explore statement pieces designed for gifting, home decor, devotion, and unforgettable first impressions.",
    image: heroBanner2,
  },
] as const;

function HomePage() {
  const { products, catalogueTypes } = Route.useLoaderData();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categorySlide, setCategorySlide] = useState(0);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const categoryCollections = catalogueTypes.slice(0, 4);
  const spotlightProductCards = spotlightProducts.map((product) => {
    const matchedProduct = products.find((item) => item.id === product.id);

    return {
      id: product.id,
      name: matchedProduct?.name ?? product.title,
      price: matchedProduct?.price ?? product.price,
      image: product.image,
      category: matchedProduct?.category ?? "Statues",
    };
  });
  const homeCatalogueProducts = products;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const handleCategoriesScroll = () => {
    const node = categoriesRef.current;
    if (!node || window.innerWidth >= 768) {
      return;
    }

    const firstCard = node.querySelector<HTMLElement>("[data-category-card]");
    if (!firstCard) {
      return;
    }

    const cardWidth = firstCard.offsetWidth + 16;
    const nextSlide = Math.round(node.scrollLeft / cardWidth);
    setCategorySlide(Math.max(0, Math.min(nextSlide, categoryCollections.length - 1)));
  };

  const renderHomeProductCard = (product: {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
  }) => (
    <div
      key={product.id}
      className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-[#fffdf9] shadow-[0_24px_50px_-38px_rgba(77,41,19,0.45)] transition hover:-translate-y-1"
    >
      <div className="relative overflow-hidden rounded-t-[1.65rem] bg-[radial-gradient(circle_at_top,rgba(112,53,20,0.28),rgba(24,10,6,0.96))]">
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-[#8b4d1d] shadow-[0_10px_18px_-14px_rgba(0,0,0,0.85)] transition hover:scale-105"
        >
          <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current text-[#c76b2c]" : ""}`} />
        </button>
        <Link to="/products/$productId" params={{ productId: product.id }} className="block">
          <img
            src={product.image}
            alt={product.name}
            width={600}
            height={700}
            className="h-[10.5rem] w-full object-cover transition duration-500 hover:scale-[1.02] md:h-[15rem]"
          />
        </Link>
      </div>

      <div className="bg-[#fffdf9] px-4 pb-5 pt-4">
        <p className="text-sm font-medium text-[#c77628]">{product.category}</p>
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className="mt-2 block min-h-[3.5rem] font-heading text-[1.35rem] leading-[0.96] tracking-[-0.03em] text-[#6f2d06] md:min-h-[4.2rem] md:text-[1.9rem] md:leading-[0.94] md:tracking-[-0.04em]"
        >
          <span className="line-clamp-2">{normalizeDisplayCase(product.name, "title")}</span>
        </Link>
        <p className="mt-4 text-[1.5rem] font-semibold text-[#b46a16]">{product.price}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f7f1e7]">
      <section className="relative isolate overflow-hidden bg-[#2b0b08] text-white">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.titleTop}
            src={slide.image}
            alt={slide.titleTop}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            width={1920}
            height={1080}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,4,4,0.58)_0%,rgba(57,7,11,0.86)_38%,rgba(42,5,8,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,168,58,0.12),transparent_34%),radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(90deg,rgba(150,86,33,0.38),transparent)] md:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(270deg,rgba(150,86,33,0.38),transparent)] md:w-28" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#a66a28]/70" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[33%] h-px bg-[#a66a28]/55" />
        <div className="pointer-events-none absolute left-[18%] top-0 h-[42%] w-px bg-[#a66a28]/70" />
        <div className="pointer-events-none absolute right-[19%] top-0 h-[42%] w-px bg-[#a66a28]/70" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[34%] w-[18%] rounded-tr-[90px] border-r border-t border-[#a66a28]/65" />
        <div className="pointer-events-none absolute left-0 top-0 h-[38%] w-[18%] rounded-br-[90px] border-b border-r border-[#a66a28]/65" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[34%] w-[18%] rounded-tl-[90px] border-l border-t border-[#a66a28]/65" />
        <div className="pointer-events-none absolute right-0 top-0 h-[38%] w-[18%] rounded-bl-[90px] border-b border-l border-[#a66a28]/65" />

        <div className="layout-shell relative flex min-h-[560px] items-center justify-center px-5 py-16 text-center md:min-h-[720px] md:px-8 md:py-24">
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[#e3a92b] md:text-sm">
              {heroSlides[currentSlide].eyebrow}
            </p>
            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.92] text-[#fbf2e2] sm:text-6xl md:text-8xl">
              {heroSlides[currentSlide].titleTop}
            </h1>
            <h2 className="mt-2 font-heading text-5xl font-semibold leading-[0.92] text-[#e1a126] sm:text-6xl md:text-8xl">
              {heroSlides[currentSlide].titleBottom}
            </h2>
            <p className="mx-auto mt-7 max-w-4xl text-lg leading-9 text-[#f6e6d4] md:text-[1.05rem]">
              {heroSlides[currentSlide].copy}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex min-w-[20rem] items-center justify-center gap-3 rounded-xl bg-[#e1a126] px-8 py-4 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-[#331208] transition hover:brightness-105"
              >
                Explore Products
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-w-[20rem] items-center justify-center rounded-xl border border-[#d6a43c] bg-[#5a0a15]/20 px-8 py-4 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-[#f6d37d] transition hover:bg-[#5a0a15]/35"
              >
                Get Custom Design
              </Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
          }
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#a66a28] bg-[#4b0912]/45 text-[#e3a92b] transition hover:bg-[#4b0912]/70 md:left-8 md:h-14 md:w-14"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#a66a28] bg-[#4b0912]/45 text-[#e3a92b] transition hover:bg-[#4b0912]/70 md:right-8 md:h-14 md:w-14"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.titleTop}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-3 rounded-full transition-all ${
                index === currentSlide ? "w-10 bg-[#e1a126]" : "w-3 bg-[#d7bc90]/60"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
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
            {categoryCollections.map((collection) => (
              <Link
                key={collection.id}
                to="/products"
                search={{}}
                data-category-card
                className="group min-w-[78%] snap-center rounded-[2.3rem] bg-white p-3 text-left shadow-[0_24px_55px_-32px_rgba(80,40,20,0.38)] ring-1 ring-black/5 transition hover:-translate-y-1 sm:min-w-[calc(50%-0.5rem)] md:min-w-0"
              >
                <div className="relative overflow-hidden rounded-[2rem] bg-[#b65a73]">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="aspect-[0.92] w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105"
                    width={420}
                    height={420}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,226,152,0.16),rgba(132,33,58,0.28))]" />
                </div>
                <div className="px-2 pb-2 pt-5">
                  <h3 className="font-body text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[#1c140f] md:text-[2.1rem]">
                    {collection.shortLabel}
                  </h3>
                  <p className="mt-2 text-[1.02rem] text-[#a09a93]">{collection.itemCountLabel}</p>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#635d57]">
                    {collection.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            {categoryCollections.map((collection, index) => (
              <span
                key={collection.id}
                className={`rounded-full ${
                  index === categorySlide
                    ? "h-4 w-4 border border-[#1d150f] bg-white shadow-[inset_0_0_0_4px_#1d150f]"
                    : "h-2.5 w-2.5 bg-[#a9a29c]"
                }`}
              />
            ))}
          </div>

          <p className="mt-3 text-center text-sm text-[#8a837d]">
            Swipe to explore more categories
          </p>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
                Best Selling Products
              </p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">
                Best Selling Products Of The Week
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden text-sm font-semibold text-[#8b4d1d] md:inline-flex"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {spotlightProductCards.map((product) => renderHomeProductCard(product))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
                Full Product Range
              </p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">
                Browse all products directly on home
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden text-sm font-semibold text-[#8b4d1d] md:inline-flex"
            >
              Open product page
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {homeCatalogueProducts.map((product) => renderHomeProductCard(product))}
          </div>
        </div>
      </section>

      <section className="bg-[#f2e7d7] py-10 md:py-14">
        <div className="layout-shell grid gap-5 px-4 md:grid-cols-3 md:px-6">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-[#e1cdb5] bg-white p-5 shadow-[0_20px_45px_-35px_rgba(58,27,9,0.55)]"
            >
              <div className="inline-flex rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-2xl text-[#34180e]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6c4b33]">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
