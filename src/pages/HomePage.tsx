import { Link } from "@/lib/spa-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  PlayCircle,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  useStoredCatalogueTypes,
  useStoredHomeContent,
  useStoredProducts,
} from "@/lib/content-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { normalizeDisplayCase } from "@/lib/utils";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productShowcase1 from "@/assets/Products/product-1.png";
import productWeapon1 from "@/assets/product-weapon-1.jpg";

const spotlightProducts = [
  { id: "shastradhari-maharaj-coloured", title: "Shastradhari Maharaj", price: "Rs. 5,100", image: productStatue1 },
  { id: "roudra-shambhu-chatrapati", title: "Roudra Shambhu Chatrapati", price: "Rs. 5,100", image: productShowcase1 },
  { id: "royal-khanjar-with-sheath", title: "Royal Khanjar", price: "Rs. 8,500", image: productWeapon1 },
  { id: "brass-dhoop-stand", title: "Brass Dhoop Stand", price: "Rs. 2,200", image: productDhoop1 },
] as const;

const features = [
  { icon: ShieldCheck, title: "Trusted Craftsmanship", copy: "Hand-finished products inspired by heritage, made for display, gifting, and devotion." },
  { icon: Clock3, title: "Fast Enquiry Flow", copy: "Designed for mobile users who want quick browsing, quick contact, and quick buying decisions." },
  { icon: BookOpenText, title: "Catalogue Support", copy: "Customers can request a full catalogue and get tailored recommendations for their budget." },
] as const;

function getVideoEmbedUrl(url: string) {
  const trimmed = url.trim();
  if (trimmed.includes("youtube.com/watch?v=")) {
    const videoId = trimmed.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
  }
  if (trimmed.includes("youtu.be/")) {
    const videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
  }
  return trimmed;
}

export default function HomePage() {
  const products = useStoredProducts();
  const catalogueTypes = useStoredCatalogueTypes();
  const storedHomeContent = useStoredHomeContent();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categorySlide, setCategorySlide] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(0);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const heroSlides = storedHomeContent.banners;
  const reviews = storedHomeContent.reviews;
  const videos = storedHomeContent.videos;
  const hasHeroSlides = heroSlides.length > 0;
  const hasReviews = reviews.length > 0;
  const hasVideos = videos.length > 0;
  const categoryCollections = catalogueTypes.filter((item) => item.isActive).slice(0, 4);
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

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  useEffect(() => {
    if (videos.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [videos.length]);

  useEffect(() => {
    setCurrentSlide((prev) => (heroSlides.length === 0 ? 0 : Math.min(prev, heroSlides.length - 1)));
  }, [heroSlides.length]);

  useEffect(() => {
    setCurrentReview((prev) => (reviews.length === 0 ? 0 : Math.min(prev, reviews.length - 1)));
  }, [reviews.length]);

  useEffect(() => {
    setCurrentVideo((prev) => (videos.length === 0 ? 0 : Math.min(prev, videos.length - 1)));
  }, [videos.length]);

  const activeReview = hasReviews ? reviews[currentReview] : null;
  const activeVideo = hasVideos ? videos[currentVideo] : null;
  const activeHeroSlide = hasHeroSlides ? heroSlides[currentSlide] : null;

  const handleCategoriesScroll = () => {
    const node = categoriesRef.current;
    if (!node || window.innerWidth >= 768) return;
    const firstCard = node.querySelector<HTMLElement>("[data-category-card]");
    if (!firstCard) return;
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
    <div key={product.id} className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-[#fffdf9] shadow-[0_24px_50px_-38px_rgba(77,41,19,0.45)] transition hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-[1.65rem] bg-[radial-gradient(circle_at_top,rgba(112,53,20,0.28),rgba(24,10,6,0.96))]">
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-[#8b4d1d]"
        >
          <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current text-[#c76b2c]" : ""}`} />
        </button>
        <Link to="/products/$productId" params={{ productId: product.id }} className="block">
          <img src={product.image} alt={product.name} width={600} height={700} className="h-[10.5rem] w-full object-cover md:h-[15rem]" />
        </Link>
      </div>
      <div className="bg-[#fffdf9] px-4 pb-5 pt-4">
        <p className="text-sm font-medium text-[#c77628]">{product.category}</p>
        <Link to="/products/$productId" params={{ productId: product.id }} className="mt-2 block min-h-[3.5rem] font-heading text-[1.35rem] leading-[0.96] tracking-[-0.03em] text-[#6f2d06] md:min-h-[4.2rem] md:text-[1.9rem]">
          <span className="line-clamp-2">{normalizeDisplayCase(product.name, "sentence")}</span>
        </Link>
        <p className="mt-4 text-[1.5rem] font-semibold text-[#b46a16]">{product.price}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f7f1e7]">
      <section className="relative isolate overflow-hidden bg-[#2b0b08] text-white">
        {heroSlides.map((slide, index) => (
          <img key={slide.id} src={slide.image} alt={slide.titleTop} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === currentSlide ? "opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,4,4,0.58)_0%,rgba(57,7,11,0.86)_38%,rgba(42,5,8,0.92)_100%)]" />
        <div className="layout-shell relative flex min-h-[560px] items-center justify-center px-5 py-16 text-center md:min-h-[720px] md:px-8 md:py-24">
          <div className="mx-auto max-w-5xl">
            {activeHeroSlide ? (
              <>
                <p className="text-sm font-semibold text-[#e3a92b] md:text-base">{activeHeroSlide.eyebrow}</p>
                <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.92] text-[#fbf2e2] sm:text-6xl md:text-8xl">{activeHeroSlide.titleTop}</h1>
                <h2 className="mt-2 font-heading text-5xl font-semibold leading-[0.92] text-[#e1a126] sm:text-6xl md:text-8xl">{activeHeroSlide.titleBottom}</h2>
                <p className="mx-auto mt-7 max-w-4xl text-lg leading-9 text-[#f6e6d4] md:text-[1.05rem]">{activeHeroSlide.copy}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#e3a92b] md:text-base">Shivray Home</p>
                <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.92] text-[#fbf2e2] sm:text-6xl md:text-8xl">No banner</h1>
                <h2 className="mt-2 font-heading text-5xl font-semibold leading-[0.92] text-[#e1a126] sm:text-6xl md:text-8xl">configured yet</h2>
                <p className="mx-auto mt-7 max-w-4xl text-lg leading-9 text-[#f6e6d4] md:text-[1.05rem]">
                  Add or edit homepage banners from the admin panel to show them here.
                </p>
              </>
            )}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/products" className="inline-flex min-w-[20rem] items-center justify-center gap-3 rounded-xl bg-[#e1a126] px-8 py-4 font-heading text-sm font-semibold text-[#331208]">
                Explore Products
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/contact" className="inline-flex min-w-[20rem] items-center justify-center rounded-xl border border-[#d6a43c] bg-[#5a0a15]/20 px-8 py-4 font-heading text-sm font-semibold text-[#f6d37d]">
                Get Custom Design
              </Link>
            </div>
          </div>
        </div>
        {heroSlides.length > 1 ? (
          <>
            <button type="button" onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous slide" className="absolute left-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#a66a28] bg-[#4b0912]/45 text-[#e3a92b] md:left-8 md:h-14 md:w-14">
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button type="button" onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)} aria-label="Next slide" className="absolute right-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#a66a28] bg-[#4b0912]/45 text-[#e3a92b] md:right-8 md:h-14 md:w-14">
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        ) : null}
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="layout-shell rounded-[34px] bg-[#fffdf8] px-4 py-6 md:px-8 md:py-8">
          <div className="text-center">
            <h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">Popular Categories</h2>
          </div>
          <div ref={categoriesRef} onScroll={handleCategoriesScroll} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-x-6 md:overflow-visible md:pb-0">
            {categoryCollections.map((collection) => (
              <Link key={collection.id} to="/required-catalogue" data-category-card className="group min-w-[78%] snap-center rounded-[2.3rem] bg-white p-3 text-left shadow-[0_24px_55px_-32px_rgba(80,40,20,0.38)] sm:min-w-[calc(50%-0.5rem)] md:min-w-0">
                <div className="relative overflow-hidden rounded-[2rem] bg-[#b65a73]">
                  <img src={collection.image} alt={collection.title} className="aspect-[0.92] w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105" width={420} height={420} />
                </div>
                <div className="px-2 pb-2 pt-5">
                  <h3 className="font-body text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[#1c140f] md:text-[2.1rem]">{collection.shortLabel}</h3>
                  <p className="mt-2 text-[1.02rem] text-[#a09a93]">{collection.itemCountLabel}</p>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#635d57]">{collection.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-center gap-3">
            {categoryCollections.map((collection, index) => (
              <span key={collection.id} className={`rounded-full ${index === categorySlide ? "h-4 w-4 border border-[#1d150f] bg-white shadow-[inset_0_0_0_4px_#1d150f]" : "h-2.5 w-2.5 bg-[#a9a29c]"}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#a86c2b]">Best selling products</p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">Best Selling Products of the Week</h2>
            </div>
            <Link to="/products" className="hidden text-sm font-semibold text-[#8b4d1d] md:inline-flex">View all</Link>
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
              <p className="text-sm font-semibold text-[#a86c2b]">Full product range</p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">Browse All Products on the Home Page</h2>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => renderHomeProductCard(product))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell bg-[linear-gradient(180deg,#fffaf1_0%,#f6ead8_100%)] px-0 py-5 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#a86c2b]">Featured videos</p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">Stories and Workshop Moments in Motion</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.75fr] xl:items-stretch">
            <div className="overflow-hidden rounded-[28px] bg-[#2a140e] shadow-[0_24px_50px_-35px_rgba(0,0,0,0.55)]">
              {activeVideo ? getVideoEmbedUrl(activeVideo.videoUrl).includes("youtube.com/embed/") ? (
                <iframe src={getVideoEmbedUrl(activeVideo.videoUrl)} title={activeVideo.title} className="aspect-video w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <video src={activeVideo.videoUrl} controls className="aspect-video w-full bg-black" />
              ) : (
                <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-[#f6e6d4]">
                  No featured videos have been added yet.
                </div>
              )}
            </div>
            <div className="rounded-[28px] bg-white/80 p-6 shadow-[0_24px_55px_-40px_rgba(80,40,20,0.55)]">
              <div className="inline-flex rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]"><PlayCircle className="h-5 w-5" /></div>
              <h3 className="mt-5 font-heading text-3xl text-[#34180e]">{activeVideo?.title ?? "Featured videos"}</h3>
              <p className="mt-4 text-sm leading-7 text-[#6c4b33]">
                {activeVideo?.description ?? "Use the admin panel to add workshop videos, reels, or YouTube embeds for the homepage."}
              </p>
              {videos.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {videos.map((video, index) => (
                    <button key={video.id} type="button" onClick={() => setCurrentVideo(index)} className={`rounded-full px-4 py-2 text-xs font-semibold ${index === currentVideo ? "bg-[#34180e] text-white" : "bg-[#f8efe4] text-[#8b4d1d]"}`}>
                      Video {index + 1}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell bg-[#fffdf8] px-0 py-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#a86c2b]">Customer reviews</p>
            <h2 className="mt-2 font-heading text-3xl text-[#34180e]">What Customers Are Saying</h2>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="rounded-[26px] bg-white p-6 text-left shadow-[0_20px_45px_-38px_rgba(79,40,16,0.45)] md:p-8">
              {activeReview ? (
                <>
                  <p className="text-[1.6rem] font-semibold leading-none text-[#1f1711] md:text-[1.8rem]">{activeReview.authorName}</p>
                  <p className="mt-2 text-sm text-[#8c8177]">{activeReview.location}</p>
                  <div className="mt-3 flex items-center gap-1 text-[#f4bc12]">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={`${activeReview.id}-${starIndex}`} className={`h-4 w-4 ${starIndex < activeReview.rating ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <p className="mt-5 text-[1.05rem] leading-8 text-[#4c433d] md:text-[1.12rem]">{activeReview.reviewText}</p>
                </>
              ) : (
                <p className="text-[1.05rem] leading-8 text-[#4c433d] md:text-[1.12rem]">
                  No customer reviews have been added yet. You can publish them from the admin panel.
                </p>
              )}
            </div>
          </div>
          {reviews.length > 0 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              {reviews.map((review, index) => (
                <button key={review.id} type="button" onClick={() => setCurrentReview(index)} aria-label={`Go to review ${index + 1}`} className={`rounded-full transition-all ${index === currentReview ? "h-3 w-10 bg-[#8b4d1d]" : "h-3 w-3 bg-[#d9c0a1]"}`} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-[#f2e7d7] py-10 md:py-14">
        <div className="layout-shell grid gap-5 px-4 md:grid-cols-3 md:px-6">
          {features.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-[#e1cdb5] bg-white p-5 shadow-[0_20px_45px_-35px_rgba(58,27,9,0.55)]">
              <div className="inline-flex rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]"><item.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-heading text-2xl text-[#34180e]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6c4b33]">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
