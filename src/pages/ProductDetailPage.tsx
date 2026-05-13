import { Link } from "@/lib/spa-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, MessageCircle, ShoppingCart } from "lucide-react";
import { getCategoryLabel, type Product } from "@/data/products";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { useStoredProducts } from "@/lib/content-store";
import { siteConfig } from "@/lib/site-config";
import { normalizeDisplayCase } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import ProductGalleryCard from "@/components/ProductGalleryCard";

function getRandomValue(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getHistoricalBackground(
  product: {
    name: Product["name"];
  },
  locale: "en" | "mr",
) {
  const productName = normalizeDisplayCase(resolveLocalizedText(product.name, locale));

  if (locale === "mr") {
    return [
      `${productName} किंवा दांडपट्टा हे भारतीय उपखंडातून उद्भवलेले एक वैशिष्ट्यपूर्ण शस्त्र मानले जाते. याची खास ओळख म्हणजे तलवारीसह जोडलेला हातमोज्यासारखा गार्ड, ज्यामुळे इंग्रजीत याला gauntlet sword असेही म्हटले जाते.`,
      `या शस्त्राची पाती साधारण 10 ते 44 इंच लांबीची, सरळ आणि दोन्ही बाजूंनी धार असलेली असते. मूठ अर्ध्या हातमोज्याच्या आकाराची असते, आतून गादी लावलेली असू शकते, आणि पुढे जाणाऱ्या सजावटी धातूच्या बाहूंनी ती पात्याला जोडलेली असते.`,
      `मध्ययुगीन भारतात निर्माण झालेल्या या शस्त्राचा युद्धातील ठळक वापर विशेषतः 17वे आणि 18वे शतकात दिसून येतो, जेव्हा मराठा साम्राज्य प्रभावी झाले. छत्रपती शिवाजी महाराज आणि बाजी प्रभू देशपांडे यांना दांडपट्ट्याच्या वापराचे प्रशिक्षण होते, अशी परंपरागत नोंद आढळते.`,
      `याचा वापर प्रामुख्याने कापण्याच्या फटक्यांसाठी केला जात असे, भोसकण्यासाठी नव्हे. पुढच्या हाताला मिळणाऱ्या आधारामुळे जबरदस्त फटके देता येत, पण मनगटाची हालचाल मर्यादित होत असे; म्हणूनच गोल फिरतीच्या तंत्रांसह याचा उपयोग मर्दानी खेळात आणि युद्धतंत्रात महत्त्वाचा मानला गेला.`,
      `दांडपट्टा ढाल, दुसरा दांडपट्टा, भाला किंवा कुऱ्हाड यांसोबतही वापरला जात असे. ऐतिहासिक नोंदी, वीरशिळा शिलालेख आणि मराठा युद्धपरंपरेतील उल्लेख यामुळे हे शस्त्र केवळ सजावटी वस्तू नसून शौर्य, युद्धकौशल्य आणि वारशाचे प्रभावी प्रतीक ठरते.`,
    ];
  }

  return [
    `${productName}, traditionally known in Marathi as dandpatta, is a distinctive sword from the Indian subcontinent. Its defining feature is a gauntlet-style handguard integrated into the hilt, which is why it is often described in English as a gauntlet sword.`,
    `The pata typically has a long, straight, double-edged blade ranging from about 10 to 44 inches. Its hilt takes the shape of a half-gauntlet, often padded inside, and is joined to the blade by decorative side arms, while the extended cuff protects the forearm during combat.`,
    `Although created in Medieval India, the weapon is most strongly associated with the 17th and 18th centuries, when the Marathas rose to prominence. It is widely linked with Maratha warfare, and historical tradition also associates its practice with Shivaji I and Baji Prabhu Deshpande.`,
    `In use, the pata was valued more for powerful cutting strikes than for thrusting. The forearm-supported grip allowed forceful slashes and spinning motions, making it especially effective in close combat and in techniques later preserved through mardani khel demonstrations.`,
    `The weapon was commonly paired with a shield, another pata, or even arms such as a javelin or axe. More than a battlefield tool, the pata remains an important symbol of Indian martial craftsmanship, Maratha military history, and the enduring legacy of regional weapon design.`,
  ];
}

export default function ProductDetailPage({ productId }: { productId: string }) {
  const { resolvedLocale } = useLanguage();
  const products = useStoredProducts();
  const product = products.find((item) => item.id === productId);
  const [addedCount, setAddedCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState({ soldLast7Days: 7, viewingNow: 20 });
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const relatedProducts = useMemo(
    () => products.filter((item) => item.category === product?.category && item.id !== product?.id).slice(0, 4),
    [product?.category, product?.id, products],
  );
  useEffect(() => {
    if (!product) return;
    setLiveMetrics({
      soldLast7Days: getRandomValue(5, 9),
      viewingNow: getRandomValue(20, 99),
    });
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(product.image);
    setGalleryIndex(0);
  }, [product]);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <h1 className="font-heading text-4xl text-[#34180e]">Product not found</h1>
          <Link to="/products" className="mt-6 inline-flex rounded-full bg-[#34180e] px-6 py-3 text-sm font-semibold text-white">
            {resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u093e\u0902\u0915\u0921\u0947 \u092a\u0930\u0924" : "Back to Products"}
          </Link>
        </div>
      </div>
    );
  }

  const whatsappLink = `${siteConfig.whatsappHref}?text=${encodeURIComponent(
    `Hi Shivray, I want details for ${normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}. Please share price and availability.`,
  )}`;
  const galleryImages = [product.image, ...relatedProducts.map((item) => item.image)].slice(0, 4);
  const visibleGalleryImages = galleryImages.slice(galleryIndex, galleryIndex + 3);
  const canSlideGalleryBack = galleryIndex > 0;
  const canSlideGalleryForward = galleryIndex + 3 < galleryImages.length;
  const historicalBackground = getHistoricalBackground(product, resolvedLocale);

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      <section className="bg-[#f7f1e7] px-4 pb-8 pt-6 text-[#34180e] md:px-6 md:pb-12 md:pt-10">
        <div className="layout-shell">
          <div className="rounded-[24px] bg-[#2b130c] px-4 py-4 text-[#f4e7d8] shadow-[0_18px_40px_-30px_rgba(43,19,12,0.75)]">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#f4e7d8]">
              <Link to="/" className="transition hover:text-white">{resolvedLocale === "mr" ? "\u092e\u0941\u0916\u094d\u092f\u092a\u0943\u0937\u094d\u0920" : "Home"}</Link>
              <ChevronRight className="h-4 w-4 text-[#d8b48b]" />
              <Link to="/products" className="transition hover:text-white">{resolvedLocale === "mr" ? "\u0915\u0945\u091f\u0932\u0949\u0917" : "Catalog"}</Link>
            </div>
            <Link to="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#ffd68d] transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />{resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u093e\u0902\u0915\u0921\u0947 \u092a\u0930\u0924" : "Back to Products"}
            </Link>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f2bb64] md:text-center">{getCategoryLabel(product.category, resolvedLocale)}</p>
          <h1 className="mt-2 font-heading text-4xl leading-none text-black md:text-center md:text-6xl">{normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black md:mx-auto md:text-center md:text-base">{resolveLocalizedText(product.shortDescription, resolvedLocale)}</p>
        </div>
      </section>
      <section className="px-4 pt-4 md:px-6 md:pt-3">
        <div className="layout-shell grid gap-6 md:items-start md:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[20px] bg-[#f5f1e8] p-4 md:flex md:min-h-[51rem] md:flex-col md:rounded-[24px] md:p-5">
            <div className="overflow-hidden rounded-[24px] bg-white md:min-h-[35rem] md:flex-1">
              <img
                src={selectedImage || product.image}
                alt={normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))}
                className="aspect-[1/1.02] w-full object-cover md:h-full md:aspect-auto"
                width={900}
                height={920}
              />
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-3">
                {visibleGalleryImages.map((image, index) => (
                  <button
                    key={`${image}-${galleryIndex + index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-[18px] border bg-white transition ${
                      image === (selectedImage || product.image) ? "border-[#1f1f1f]" : "border-[#ddd4c5]"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale))} preview ${galleryIndex + index + 1}`}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              {galleryImages.length > 3 ? (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGalleryIndex((value) => Math.max(0, value - 1))}
                    disabled={!canSlideGalleryBack}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                      canSlideGalleryBack
                        ? "border-[#d8b48b] bg-white text-[#34180e]"
                        : "border-[#eadbc8] bg-[#f5f1e8] text-[#b9ab9a]"
                    }`}
                    aria-label="Previous gallery images"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex((value) => Math.min(galleryImages.length - 3, value + 1))}
                    disabled={!canSlideGalleryForward}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                      canSlideGalleryForward
                        ? "border-[#d8b48b] bg-white text-[#34180e]"
                        : "border-[#eadbc8] bg-[#f5f1e8] text-[#b9ab9a]"
                    }`}
                    aria-label="Next gallery images"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="mt-5 rounded-[24px] bg-[#fff8f4] p-5">
              <p className="text-xl font-semibold text-[#e53b49]">{liveMetrics.soldLast7Days} {resolvedLocale === "mr" ? "\u092e\u093e\u0917\u0940\u0932 \u096d \u0926\u093f\u0935\u0938\u093e\u0902\u0924 \u0935\u093f\u0915\u094d\u0930\u0940" : "sold in last 7 days"}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-bold text-white">{liveMetrics.viewingNow}</div>
                <p className="text-sm font-semibold text-[#34180e]">{resolvedLocale === "mr" ? "\u0932\u094b\u0915 \u0938\u0927\u094d\u092f\u093e \u0939\u0947 \u092a\u093e\u0939\u0924 \u0906\u0939\u0947\u0924" : "People are viewing this right now"}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[32px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:px-7 md:pb-7 md:pt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#fcf1dc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b17024]">{resolveLocalizedText(product.tag, resolvedLocale) || (resolvedLocale === "mr" ? "\u0935\u093f\u0936\u0947\u0937 \u0924\u0941\u0915\u0921\u093e" : "Featured piece")}</span>
              <p className="text-2xl font-semibold text-[#8b4d1d]">{product.price}</p>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#6c4b33]">{resolveLocalizedText(product.details, resolvedLocale)}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-[#fcf8f2] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">{resolvedLocale === "mr" ? "\u0938\u093e\u0939\u093f\u0924\u094d\u092f" : "Material"}</p><p className="mt-2 text-sm text-[#34180e]">{resolveLocalizedText(product.material, resolvedLocale)}</p></div>
              <div className="rounded-[24px] bg-[#fcf8f2] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">{resolvedLocale === "mr" ? "\u092a\u0930\u093f\u092e\u093e\u0923" : "Dimensions"}</p><p className="mt-2 text-sm text-[#34180e]">{resolveLocalizedText(product.dimensions, resolvedLocale)}</p></div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => { addToCart(product.id); setAddedCount((value) => value + 1); }} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                <ShoppingCart className="h-4 w-4" />{resolvedLocale === "mr" ? "\u0915\u093e\u0930\u094d\u091f\u092e\u0927\u094d\u092f\u0947 \u091c\u094b\u0921\u093e" : "Add to Cart"}
              </button>
              <button type="button" onClick={() => toggleWishlist(product.id)} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] ${isWishlisted(product.id) ? "bg-[#34180e] text-white" : "border border-[#d8b48b] text-[#34180e]"}`}>
                <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
                {isWishlisted(product.id) ? (resolvedLocale === "mr" ? "\u0906\u0935\u0921\u0932\u0947" : "Liked") : (resolvedLocale === "mr" ? "\u0906\u0935\u0921\u0932\u0947" : "Like")}
              </button>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e]">
                <MessageCircle className="h-4 w-4" />{resolvedLocale === "mr" ? "\u0906\u0924\u093e \u091a\u094c\u0915\u0936\u0940 \u0915\u0930\u093e" : "Enquire Now"}
              </a>
            </div>
            <div className="mt-6 rounded-[24px] bg-[#fcf8f2] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">{resolvedLocale === "mr" ? "\u0907\u0924\u093f\u0939\u093e\u0938\u093f\u0915 \u092a\u093e\u0930\u094d\u0936\u094d\u0935\u092d\u0942\u092e\u0940" : "Historical Background"}</p>
              <div className="mt-4 h-[360px] space-y-4 overflow-y-auto pr-2 text-sm leading-7 text-[#6c4b33]">
                {historicalBackground.map((paragraph, index) => (
                  <p key={`${product.id}-history-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>
            {addedCount > 0 ? <p className="mt-3 text-sm text-green-700">{resolvedLocale === "mr" ? `\u0915\u093e\u0930\u094d\u091f\u092e\u0927\u094d\u092f\u0947 \u091c\u094b\u0921\u0932\u0947 (${addedCount}).` : `Added to cart (${addedCount}).`}</p> : null}
          </div>
        </div>
      </section>
      {relatedProducts.length ? (
        <section className="px-4 pt-8 md:px-6">
          <div className="layout-shell">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">{resolvedLocale === "mr" ? "\u0938\u092e\u093e\u0928 \u0928\u093f\u0935\u0921\u0940" : "Similar Picks"}</p><h2 className="mt-1 font-heading text-3xl text-[#34180e]">{resolvedLocale === "mr" ? "\u092f\u093e \u0938\u0902\u0917\u094d\u0930\u0939\u093e\u0924\u0940\u0932 \u0906\u0923\u0916\u0940" : "More from this collection"}</h2></div>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductGalleryCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
