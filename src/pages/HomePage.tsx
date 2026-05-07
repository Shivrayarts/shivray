import { Link } from "@/lib/spa-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Play,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  useStoredCatalogueTypes,
  useStoredHomeContent,
  useStoredProducts,
} from "@/lib/content-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import ProductGalleryCard from "@/components/ProductGalleryCard";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productShowcase1 from "@/assets/Products/product-1.png";
import productWeapon1 from "@/assets/product-weapon-1.jpg";
import type { Product } from "@/data/products";

const spotlightProducts = [
  { id: "shastradhari-maharaj-coloured", title: "Shastradhari Maharaj", price: "Rs. 5,100", image: productStatue1 },
  { id: "roudra-shambhu-chatrapati", title: "Roudra Shambhu Chatrapati", price: "Rs. 5,100", image: productShowcase1 },
  { id: "royal-khanjar-with-sheath", title: "Royal Khanjar", price: "Rs. 8,500", image: productWeapon1 },
  { id: "brass-dhoop-stand", title: "Brass Dhoop Stand", price: "Rs. 2,200", image: productDhoop1 },
] as const;

// const features = [
//   { icon: ShieldCheck, title: "Trusted Craftsmanship", copy: "Hand-finished products inspired by heritage, made for display, gifting, and devotion." },
//   { icon: Clock3, title: "Fast Enquiry Flow", copy: "Designed for mobile users who want quick browsing, quick contact, and quick buying decisions." },
//   { icon: BookOpenText, title: "Catalogue Support", copy: "Customers can request a full catalogue and get tailored recommendations for their budget." },
// ] as const;

function getProductCategoryFromCatalogueId(id: string): Product["category"] | null {
  if (id.includes("statue")) return "Statues";
  if (id.includes("weapon")) return "Weapons";
  if (id.includes("shield")) return "Shields";
  if (id.includes("dhoop")) return "Dhoop";
  return null;
}

export default function HomePage() {
  const { resolvedLocale } = useLanguage();
  const products = useStoredProducts();
  const catalogueTypes = useStoredCatalogueTypes();
  const storedHomeContent = useStoredHomeContent();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categorySlide, setCategorySlide] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const heroSlides = storedHomeContent.banners;
  const reviews = storedHomeContent.reviews;
  const hasHeroSlides = heroSlides.length > 0;
  const hasReviews = reviews.length > 0;
  const featuredVideos = storedHomeContent.videos.slice(0, 6);
  const categoryCollections = catalogueTypes.filter((item) => item.isActive).slice(0, 4);
  const spotlightProductCards = spotlightProducts.map((product) => {
    const matchedProduct = products.find((item) => item.id === product.id);
    return {
      id: product.id,
      name: matchedProduct?.name ?? product.title,
      price: matchedProduct?.price ?? product.price,
      image: product.image,
      category: matchedProduct?.category ?? "Statues",
      tag: matchedProduct?.tag ?? "",
      shortDescription: matchedProduct?.shortDescription ?? "",
      details: matchedProduct?.details ?? "",
      material: matchedProduct?.material ?? "",
      dimensions: matchedProduct?.dimensions ?? "",
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
    setCurrentSlide((prev) => (heroSlides.length === 0 ? 0 : Math.min(prev, heroSlides.length - 1)));
  }, [heroSlides.length]);

  useEffect(() => {
    setCurrentReview((prev) => (reviews.length === 0 ? 0 : Math.min(prev, reviews.length - 1)));
  }, [reviews.length]);

  const activeReview = hasReviews ? reviews[currentReview] : null;
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
                
              </>
            ) : (
              <>
                
                <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.92] text-[#fbf2e2] sm:text-6xl md:text-8xl">{resolvedLocale === "mr" ? "बॅनर" : "No banner"}</h1>
                <h2 className="mt-2 font-heading text-5xl font-semibold leading-[0.92] text-[#e1a126] sm:text-6xl md:text-8xl">{resolvedLocale === "mr" ? "अजून सेट नाही" : "configured yet"}</h2>
                <p className="mx-auto mt-7 max-w-4xl text-lg leading-9 text-[#f6e6d4] md:text-[1.05rem]">
                  {resolvedLocale === "mr" ? "येथे दाखवण्यासाठी अॅडमिन पॅनेलमधून मुख्यपृष्ठ बॅनर जोडा किंवा संपादित करा." : "Add or edit homepage banners from the admin panel to show them here."}
                </p>
              </>
            )}
            
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
            <h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">{resolvedLocale === "mr" ? "लोकप्रिय श्रेणी" : "Popular Categories"}</h2>
          </div>
          <div ref={categoriesRef} onScroll={handleCategoriesScroll} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-x-6 md:overflow-visible md:pb-0">
            {categoryCollections.map((collection) => {
              const productCategory = getProductCategoryFromCatalogueId(collection.id);

              return (
              <Link
                key={collection.id}
                to={productCategory ? "/products" : "/required-catalogue"}
                search={productCategory ? { category: productCategory } : undefined}
                data-category-card
                className="group min-w-[78%] snap-center rounded-[2.3rem] bg-white p-3 text-left shadow-[0_24px_55px_-32px_rgba(80,40,20,0.38)] sm:min-w-[calc(50%-0.5rem)] md:min-w-0"
              >
                <div className="relative overflow-hidden rounded-[2rem] bg-[#b65a73]">
                  <img src={collection.image} alt={resolveLocalizedText(collection.title, resolvedLocale)} className="aspect-[0.92] w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105" width={420} height={420} />
                </div>
                <div className="px-2 pb-2 pt-5">
                  <h3 className="font-body text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[#1c140f] md:text-[2.1rem]">{resolveLocalizedText(collection.shortLabel, resolvedLocale)}</h3>
                  <p className="mt-2 text-[1.02rem] text-[#a09a93]">{resolveLocalizedText(collection.itemCountLabel, resolvedLocale)}</p>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#635d57]">{resolveLocalizedText(collection.description, resolvedLocale)}</p>
                </div>
              </Link>
              );
            })}
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
              <p className="text-sm font-semibold text-[#a86c2b]">{resolvedLocale === "mr" ? "सर्वाधिक विक्री" : "Best selling products"}</p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">{resolvedLocale === "mr" ? "आठवड्याची सर्वाधिक विक्री झालेली उत्पादने" : "Best Selling Products of the Week"}</h2>
            </div>
            <Link to="/products" className="hidden text-sm font-semibold text-[#8b4d1d] md:inline-flex">{resolvedLocale === "mr" ? "सर्व पहा" : "View all"}</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {spotlightProductCards.map((product) => (
              <ProductGalleryCard key={product.id} product={product} isWishlisted={isWishlisted(product.id)} onToggleWishlist={toggleWishlist} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#a86c2b]">{resolvedLocale === "mr" ? "संपूर्ण उत्पादने" : "Full product range"}</p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">{resolvedLocale === "mr" ? "मुख्यपृष्ठावर सर्व उत्पादने पहा" : "Browse All Products on the Home Page"}</h2>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductGalleryCard key={product.id} product={product} isWishlisted={isWishlisted(product.id)} onToggleWishlist={toggleWishlist} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell bg-[#fffdf8] px-0 py-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#a86c2b]">{resolvedLocale === "mr" ? "ग्राहक अभिप्राय" : "Customer reviews"}</p>
            <h2 className="mt-2 font-heading text-3xl text-[#34180e]">{resolvedLocale === "mr" ? "ग्राहक काय म्हणत आहेत" : "What Customers Are Saying"}</h2>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="rounded-[26px] bg-white p-6 text-left shadow-[0_20px_45px_-38px_rgba(79,40,16,0.45)] md:p-8">
              {activeReview ? (
                <>
                  <p className="text-[1.6rem] font-semibold leading-none text-[#1f1711] md:text-[1.8rem]">{activeReview.authorName}</p>
                  <p className="mt-2 text-sm text-[#8c8177]">{resolveLocalizedText(activeReview.location, resolvedLocale)}</p>
                  <div className="mt-3 flex items-center gap-1 text-[#f4bc12]">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={`${activeReview.id}-${starIndex}`} className={`h-4 w-4 ${starIndex < activeReview.rating ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <p className="mt-5 text-[1.05rem] leading-8 text-[#4c433d] md:text-[1.12rem]">{resolveLocalizedText(activeReview.reviewText, resolvedLocale)}</p>
                </>
              ) : (
                <p className="text-[1.05rem] leading-8 text-[#4c433d] md:text-[1.12rem]">
                  {resolvedLocale === "mr" ? "अजून ग्राहक अभिप्राय जोडलेले नाहीत. तुम्ही ते अॅडमिन पॅनेलमधून प्रकाशित करू शकता." : "No customer reviews have been added yet. You can publish them from the admin panel."}
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

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell rounded-[34px] bg-[linear-gradient(180deg,#2b0b08_0%,#4d160f_100%)] px-4 py-8 text-white md:px-8 md:py-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#e3a92b]">{resolvedLocale === "mr" ? "व्हिडिओ आणि रील्स" : "Videos and reels"}</p>
              <h2 className="mt-2 font-heading text-3xl text-[#fbf2e2]">{resolvedLocale === "mr" ? "आमचे काम पाहा" : "See our work in motion"}</h2>
            </div>
            <p className="hidden max-w-xl text-sm leading-6 text-[#f6dbc2]">
              {resolvedLocale === "mr" ? "जलद स्क्रोलसाठी व्हर्टिकल रील्स आणि लांब कथनासाठी YouTube व्हिडिओ अॅडमिन पॅनेलमधून जोडा." : "Add vertical reels for quick scroll content and YouTube videos for longer storytelling directly from the admin panel."}
            </p>
          </div>
          {featuredVideos.length > 0 ? (
            <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
              {featuredVideos.map((video) => {
                const isYoutube = video.videoType === "youtube";

                return (
                  <article
                    key={video.id}
                    className={`min-w-[85%] snap-center overflow-hidden rounded-[28px] border border-white/10 bg-white/95 text-[#34180e] shadow-[0_26px_60px_-36px_rgba(0,0,0,0.6)] md:min-w-[22rem] xl:min-w-[24rem] ${
                      isYoutube ? "md:col-span-1" : ""
                    }`}
                  >
                    <div className={`relative bg-[#120907] ${isYoutube ? "aspect-video" : "mx-auto aspect-[9/16] max-w-[22rem]"}`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,169,43,0.32),transparent_45%),linear-gradient(180deg,rgba(12,5,4,0.22)_0%,rgba(12,5,4,0.88)_100%)]" />
                      <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center text-[#f6dbc2]">
                        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                          <Play className="h-7 w-7 text-[#f3bf56]" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f3bf56]">
                            {isYoutube ? (resolvedLocale === "mr" ? "YouTube प्लेसहोल्डर" : "YouTube placeholder") : (resolvedLocale === "mr" ? "रील प्लेसहोल्डर" : "Reel placeholder")}
                          </p>
                          <p className="hidden mt-3 text-sm leading-6 text-[#f6dbc2]">
                            {resolvedLocale === "mr" ? "सध्या व्हिडिओ प्लेबॅक काढलेला आहे. हे कार्ड भविष्यातील मीडियासाठी सेक्शनचे लेआउट तयार ठेवते." : "Video playback has been removed for now. This card keeps the section layout ready for future media."}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#fff1d9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b4d1d]">
                          {isYoutube ? "YouTube" : (resolvedLocale === "mr" ? "रील" : "Reel")}
                        </span>
                        {!isYoutube ? (
                          <span className="rounded-full bg-[#34180e] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                            {resolvedLocale === "mr" ? "उभा" : "Vertical"}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-4 font-heading text-2xl text-[#34180e]">{resolveLocalizedText(video.title, resolvedLocale)}</h3>
                      <p className="hidden mt-3 text-sm leading-6 text-[#6c4b33]">{resolveLocalizedText(video.description, resolvedLocale)}</p>
                      <p className="hidden mt-5 text-sm font-semibold text-[#8b4d1d]">
                        {resolvedLocale === "mr" ? "फक्त प्लेसहोल्डर" : "Placeholder only"}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/10 p-6 text-[#f6dbc2]">
              {resolvedLocale === "mr" ? "अजून व्हिडिओ जोडलेले नाहीत. तुम्ही रील्स आणि YouTube व्हिडिओ अॅडमिन पॅनेलमधून प्रकाशित करू शकता." : "No videos added yet. You can publish reels and YouTube videos from the admin panel."}
            </div>
          )}
        </div>
      </section>

      {/* <section className="bg-[#f2e7d7] py-10 md:py-14">
        <div className="layout-shell grid gap-5 px-4 md:grid-cols-3 md:px-6">
          {features.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-[#e1cdb5] bg-white p-5 shadow-[0_20px_45px_-35px_rgba(58,27,9,0.55)]">
              <div className="inline-flex rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]"><item.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-heading text-2xl text-[#34180e]">{resolvedLocale === "mr" ? ({
                "Trusted Craftsmanship": "विश्वासार्ह कारागिरी",
                "Fast Enquiry Flow": "जलद चौकशी प्रक्रिया",
                "Catalogue Support": "कॅटलॉग सहाय्य",
              }[item.title] ?? item.title) : item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6c4b33]">{resolvedLocale === "mr" ? ({
                "Trusted Craftsmanship": "वारसा प्रेरित, प्रदर्शन, भेटवस्तू आणि भक्तीसाठी हाताने पूर्ण केलेली उत्पादने.",
                "Fast Enquiry Flow": "मोबाइल वापरकर्त्यांसाठी जलद ब्राउझिंग, संपर्क आणि खरेदी निर्णयासाठी तयार केलेले.",
                "Catalogue Support": "ग्राहक पूर्ण कॅटलॉग मागवू शकतात आणि त्यांच्या बजेटनुसार शिफारसी मिळवू शकतात.",
              }[item.title] ?? item.copy) : item.copy}</p>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  );
}
