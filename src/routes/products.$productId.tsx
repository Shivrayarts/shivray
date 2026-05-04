import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  ShoppingCart,
  Star,
} from "lucide-react";
import {
  getProductByIdFromDbServer,
  getProductsFromDbServer,
} from "@/lib/server/products.functions";
import { siteConfig } from "@/lib/site-config";
import { normalizeDisplayCase } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    const [product, products] = await Promise.all([
      getProductByIdFromDbServer({
        data: { id: params.productId },
      }),
      getProductsFromDbServer(),
    ]);

    if (!product) throw notFound();
    return { product, products };
  },
  component: ProductDetailPage,
});

function getRandomValue(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ProductDetailPage() {
  const { product, products } = Route.useLoaderData();
  const [addedCount, setAddedCount] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState({
    soldLast7Days: 42,
    viewingNow: 11,
    reviewCount: 36,
  });
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const relatedProducts = useMemo(
    () =>
      products
        .filter(
          (item) =>
            item.category === product.category && item.id !== product.id,
        )
        .slice(0, 4),
    [product.category, product.id, products],
  );

  const whatsappLink = `${siteConfig.whatsappHref}?text=${encodeURIComponent(
    `Hi Shivray, I want details for ${normalizeDisplayCase(product.name)}. Please share price and availability.`,
  )}`;
  const galleryImages = [product.image, ...relatedProducts.map((item) => item.image)].slice(0, 4);

  useEffect(() => {
    setLiveMetrics({
      soldLast7Days: getRandomValue(18, 86),
      viewingNow: getRandomValue(4, 23),
      reviewCount: getRandomValue(18, 74),
    });
  }, [product.id]);

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      <section className="bg-[#2b130c] px-4 pb-8 pt-6 text-white md:px-6 md:pb-12 md:pt-10">
        <div className="layout-shell">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#f4e7d8]">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-[#d8b48b]" />
            <Link to="/products" className="transition hover:text-white">
              Catalog
            </Link>
            <ChevronRight className="h-4 w-4 text-[#d8b48b]" />
            <span className="text-white">{normalizeDisplayCase(product.name)}</span>
          </div>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#ffd68d] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f2bb64]">
            {product.category}
          </p>
          <h1 className="mt-2 font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">
            {normalizeDisplayCase(product.name)}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#f4e7d8] md:text-base">
            {product.shortDescription}
          </p>
        </div>
      </section>

      <section className="px-4 pt-6 md:px-6">
        <div className="layout-shell grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#eadbc8] bg-white shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)]">
          <img
            src={product.image}
            alt={normalizeDisplayCase(product.name)}
            className="h-full w-full object-cover"
            width={900}
            height={900}
          />
          <div className="grid grid-cols-4 gap-3 border-t border-[#f0e3d5] p-4">
            {galleryImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`overflow-hidden rounded-2xl border ${
                  index === 0 ? "border-[#c98f49]" : "border-[#eadbc8]"
                } bg-[#fcf8f2]`}
              >
                <img
                  src={image}
                  alt={`${normalizeDisplayCase(product.name)} preview ${index + 1}`}
                  className="h-18 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          </div>

          <div className="rounded-[32px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-[#fcf1dc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b17024]">
              {product.tag || "Featured piece"}
            </span>
            <p className="text-2xl font-semibold text-[#8b4d1d]">{product.price}</p>
          </div>

          <div className="mt-5 flex items-center gap-1 text-[#f09b21]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-2 text-sm text-[#6c4b33]">({liveMetrics.reviewCount} reviews)</span>
          </div>

          <p className="mt-5 text-sm leading-7 text-[#6c4b33]">{product.details}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-[#fcf8f2] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">
                Material
              </p>
              <p className="mt-2 text-sm text-[#34180e]">{product.material}</p>
            </div>
            <div className="rounded-[24px] bg-[#fcf8f2] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">
                Dimensions
              </p>
              <p className="mt-2 text-sm text-[#34180e]">{product.dimensions}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                addToCart(product.id);
                setAddedCount((value) => value + 1);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#221008]"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition ${
                isWishlisted(product.id)
                  ? "bg-[#34180e] text-white"
                  : "border border-[#d8b48b] text-[#34180e] hover:bg-[#fff7ec]"
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
              {isWishlisted(product.id) ? "Liked" : "Like"}
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e] transition hover:bg-[#fff7ec]"
            >
              <MessageCircle className="h-4 w-4" />
              Enquire Now
            </a>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#fff8f4] p-5">
            <p className="text-xl font-semibold text-[#e53b49]">
              {liveMetrics.soldLast7Days} sold in last 7 days
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {liveMetrics.viewingNow}
              </div>
              <p className="text-sm font-semibold text-[#34180e]">
                People are viewing this right now
              </p>
            </div>
          </div>

          {addedCount > 0 ? (
            <p className="mt-3 text-sm text-green-700">Added to cart ({addedCount}).</p>
          ) : null}
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="px-4 pt-8 md:px-6">
          <div className="layout-shell">
            <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
                Similar Picks
              </p>
              <h2 className="mt-1 font-heading text-3xl text-[#34180e]">
                More from this collection
              </h2>
            </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                to="/products/$productId"
                params={{ productId: item.id }}
                className="group overflow-hidden rounded-[24px] border border-[#eadbc8] bg-white shadow-[0_22px_55px_-40px_rgba(70,36,15,0.7)] transition hover:-translate-y-1"
              >
                <div className="aspect-[0.95] overflow-hidden bg-[#f7efe5]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">
                    {item.category}
                  </p>
                  <p className="mt-2 line-clamp-2 font-heading text-lg leading-5 text-[#34180e]">
                    {item.name}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[#8b4d1d]">{item.price}</p>
                </div>
              </Link>
            ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
