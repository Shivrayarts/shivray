import { Heart } from "lucide-react";
import { Link } from "@/lib/spa-router";
import { getCategoryLabel, type Product } from "@/data/products";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { normalizeDisplayCase } from "@/lib/utils";

type ProductGalleryCardProps = {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  imageClassName?: string;
  titleClassName?: string;
  className?: string;
};

export default function ProductGalleryCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  imageClassName = "h-[14rem] md:h-[18rem] lg:h-[20rem]",
  titleClassName = "min-h-[3rem] text-[1.2rem] md:min-h-[3.6rem] md:text-[1.6rem]",
  className = "",
}: ProductGalleryCardProps) {
  const { resolvedLocale } = useLanguage();
  const localizedName = normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale), "sentence");

  return (
    <div
      className={`overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-[#fffdf9] shadow-[0_24px_50px_-38px_rgba(77,41,19,0.45)] transition hover:-translate-y-1 ${className}`.trim()}
    >
      <div className="relative overflow-hidden rounded-t-[1.65rem] bg-[radial-gradient(circle_at_top,rgba(112,53,20,0.28),rgba(24,10,6,0.96))]">
        {onToggleWishlist ? (
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-[#8b4d1d]"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current text-[#c76b2c]" : ""}`} />
          </button>
        ) : null}
        <Link to="/products/$productId" params={{ productId: product.id }} className="block">
          <img
            src={product.image}
            alt={localizedName}
            width={600}
            height={700}
            loading="lazy"
            className={`w-full object-cover ${imageClassName}`.trim()}
          />
        </Link>
      </div>
      <div className="bg-[#fffdf9] px-4 pb-5 pt-4">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-[#c77628]">{getCategoryLabel(product.category, resolvedLocale)}</p>
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className={`mt-2 block font-heading leading-[0.96] tracking-[-0.03em] text-[#6f2d06] ${titleClassName}`.trim()}
        >
          <span className="line-clamp-2">{localizedName}</span>
        </Link>
        <p className="mt-3 text-[1.15rem] font-semibold text-[#b46a16] md:text-[1.35rem]">{product.price}</p>
      </div>
    </div>
  );
}
