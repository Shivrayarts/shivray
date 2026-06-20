import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/spa-router";
import { Play, Star } from "lucide-react";
import type { HomeReview, HomeVideo } from "@/lib/content-store";
import type { Product } from "@/data/products";
import { resolveLocalizedText } from "@/lib/language";
import ProductGalleryCard from "@/components/ProductGalleryCard";

type HomeDeferredSectionsProps = {
  resolvedLocale: "en" | "mr";
  homeProducts: Product[];
  spotlightProducts: Product[];
  reviews: HomeReview[];
  featuredVideos: HomeVideo[];
  categoryLabelByKey: Map<string, string>;
  isWishlisted: (productId: string) => boolean;
  onToggleWishlist: (productId: string) => void;
};

function getYoutubeEmbedUrl(value: string) {
  if (!value.trim()) return "";

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    let videoId = "";

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host.endsWith("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/").filter(Boolean)[1] ?? "";
      } else if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/").filter(Boolean)[1] ?? "";
      } else {
        videoId = url.searchParams.get("v") ?? "";
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  } catch {
    return "";
  }
}

function isYoutubeShortUrl(value: string) {
  if (!value.trim()) return false;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    return host.endsWith("youtube.com") && url.pathname.startsWith("/shorts/");
  } catch {
    return false;
  }
}

export default function HomeDeferredSections({
  resolvedLocale,
  homeProducts,
  spotlightProducts,
  reviews,
  featuredVideos,
  categoryLabelByKey,
  isWishlisted,
  onToggleWishlist,
}: HomeDeferredSectionsProps) {
  const [currentReview, setCurrentReview] = useState(0);
  const [videoSlide, setVideoSlide] = useState(0);
  const videosRef = useRef<HTMLDivElement | null>(null);
  const hasReviews = reviews.length > 0;
  const activeReview = hasReviews ? reviews[currentReview] : null;

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  useEffect(() => {
    setCurrentReview((prev) => (reviews.length === 0 ? 0 : Math.min(prev, reviews.length - 1)));
  }, [reviews.length]);

  const handleVideosScroll = () => {
    const node = videosRef.current;
    if (!node) return;
    const firstCard = node.querySelector<HTMLElement>("article");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 20;
    const nextSlide = Math.round(node.scrollLeft / cardWidth);
    setVideoSlide(Math.max(0, Math.min(nextSlide, featuredVideos.length - 1)));
  };

  const scrollToVideoSlide = (index: number, behavior: ScrollBehavior = "smooth") => {
    const node = videosRef.current;
    if (!node) return;
    const firstCard = node.querySelector<HTMLElement>("article");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 20;
    const safeIndex = Math.max(0, Math.min(index, featuredVideos.length - 1));
    node.scrollTo({ left: safeIndex * cardWidth, behavior });
    setVideoSlide(safeIndex);
  };

  return (
    <>
      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#a86c2b]">{resolvedLocale === "mr" ? "सर्वाधिक विक्री" : "Best selling products"}</p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">{resolvedLocale === "mr" ? "आठवड्याची सर्वाधिक विक्री झालेली उत्पादने" : "Recommended Products for You"}</h2>
            </div>
            <Link to="/products" className="hidden text-sm font-semibold text-[#8b4d1d] md:inline-flex">{resolvedLocale === "mr" ? "सर्व पहा" : "View all"}</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {spotlightProducts.map((product) => (
              <ProductGalleryCard
                key={product.id}
                product={product}
                categoryLabel={categoryLabelByKey.get(product.category)}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-14">
        <div className="layout-shell">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#a86c2b]">{resolvedLocale === "mr" ? "निवडक उत्पादने" : "Selected products"}</p>
              <h2 className="mt-2 font-heading text-3xl text-[#34180e]">{resolvedLocale === "mr" ? "अधिक उत्पादने पाहण्यासाठी कॅटलॉग उघडा" : "Open the catalogue to browse more"}</h2>
            </div>
            <Link to="/products" className="hidden text-sm font-semibold text-[#8b4d1d] md:inline-flex">{resolvedLocale === "mr" ? "पूर्ण कॅटलॉग" : "Full catalogue"}</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {homeProducts.map((product) => (
              <ProductGalleryCard
                key={product.id}
                product={product}
                categoryLabel={categoryLabelByKey.get(product.category)}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
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
                  <p className="text-[1.6rem] font-semibold leading-none text-[#1f1711] md:text-[1.8rem]">{resolveLocalizedText(activeReview.authorName, resolvedLocale)}</p>
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
            <div
              ref={videosRef}
              onScroll={handleVideosScroll}
              className="category-carousel-scroll mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
            >
              {featuredVideos.map((video, index) => {
                const isYoutube = video.videoType === "youtube";
                const isShort = isYoutube && isYoutubeShortUrl(video.videoUrl);
                const embedUrl = isYoutube ? getYoutubeEmbedUrl(video.videoUrl) : "";
                const hasPlayableMedia = Boolean(embedUrl || (!isYoutube && video.videoUrl));

                return (
                  <article
                    key={video.id}
                    className={`min-w-[78%] snap-center overflow-hidden rounded-[28px] border border-white/10 bg-[#120907] text-[#34180e] shadow-[0_26px_60px_-36px_rgba(0,0,0,0.6)] sm:min-w-[20rem] md:min-w-[22rem] xl:min-w-[24rem] ${
                      isYoutube ? "md:col-span-1" : ""
                    }`}
                  >
                    <div className={`relative bg-[#120907] ${isShort || !isYoutube ? "mx-auto aspect-[9/16] max-w-[22rem]" : "aspect-video"}`}>
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={resolveLocalizedText(video.title, resolvedLocale)}
                          className="h-full w-full"
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : !isYoutube && video.videoUrl ? (
                        <video
                          src={video.videoUrl}
                          poster={video.thumbnail || undefined}
                          className="h-full w-full object-cover"
                          controls
                          preload="metadata"
                          playsInline
                        />
                      ) : null}
                      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,169,43,0.32),transparent_45%),linear-gradient(180deg,rgba(12,5,4,0.22)_0%,rgba(12,5,4,0.88)_100%)] ${hasPlayableMedia ? "hidden" : ""}`} />
                      <div className={`relative flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center text-[#f6dbc2] ${hasPlayableMedia ? "hidden" : ""}`}>
                        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                          <Play className="h-7 w-7 text-[#f3bf56]" />
                        </span>
                      </div>
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
          {featuredVideos.length > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              {featuredVideos.map((video, index) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => scrollToVideoSlide(index)}
                  aria-label={`Go to video ${index + 1}`}
                  className={`rounded-full transition-all ${index === videoSlide ? "h-3 w-9 bg-[#e3a92b]" : "h-2.5 w-2.5 bg-[#9d7f61]"}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
