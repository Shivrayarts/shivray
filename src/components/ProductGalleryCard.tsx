import { memo } from "react";
import { Heart } from "lucide-react";
import { Link } from "@/lib/spa-router";
import { getCategoryLabel, type Product } from "@/data/products";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { getProductPricing, normalizeDisplayCase, normalizeDiscountPercentage } from "@/lib/utils";

type ProductGalleryCardProps = {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  imageClassName?: string;
  titleClassName?: string;
  className?: string;
  categoryLabel?: string;
};

function ProductGalleryCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  imageClassName = "h-[14rem] md:h-[18rem] lg:h-[20rem]",
  titleClassName = "min-h-[3rem] text-[1.2rem] md:min-h-[3.6rem] md:text-[1.6rem]",
  className = "",
  categoryLabel,
}: ProductGalleryCardProps) {
  const { resolvedLocale } = useLanguage();
  const localizedName = normalizeDisplayCase(resolveLocalizedText(product.name, resolvedLocale), "sentence");
  const localizedCategoryLabel =
    categoryLabel || getCategoryLabel(product.category, resolvedLocale);
  const productOptions = product.productOptions ?? [];
  const pricing = getProductPricing(product);
  const optionChips = productOptions.slice(0, 2);
  const isMarathi = resolvedLocale === "mr";
  const marathiTextStyle = isMarathi
    ? { fontFamily: '"Nirmala UI", "Noto Sans Devanagari", Mangal, Arial, sans-serif' }
    : undefined;

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
            decoding="async"
            fetchPriority="low"
            className={`w-full object-cover ${imageClassName}`.trim()}
          />
        </Link>
      </div>
      <div className={`bg-[#fffdf9] px-4 ${isMarathi ? "pb-4 pt-3" : "pb-5 pt-4"}`}>
        <p
          className={`text-[0.78rem] font-semibold text-[#c77628] ${isMarathi ? "leading-5 tracking-normal" : "uppercase tracking-[0.22em]"}`}
          style={marathiTextStyle}
        >
          {localizedCategoryLabel}
        </p>
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className={`block tracking-normal text-[#6f2d06] ${isMarathi ? "mt-1 font-semibold leading-[1.28]" : `mt-2 font-heading leading-[0.96] ${titleClassName}`}`.trim()}
          style={marathiTextStyle}
        >
          <span className={isMarathi ? "block pb-1" : "line-clamp-2"}>{localizedName}</span>
        </Link>
        {optionChips.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {optionChips.map((option, index) => {
              const optionDiscount = normalizeDiscountPercentage(option.discount);
              return (
              <div
                key={`${product.id}-chip-${index}`}
                className={`overflow-hidden rounded-2xl border text-center ${
                  optionDiscount > 0
                    ? "border-[#59b85c]"
                    : "border-[#d7d7d7]"
                }`}
              >
                <p className="bg-[#f8faf7] px-4 py-2 text-sm font-semibold text-[#5f645f]">{option.label}</p>
                {optionDiscount > 0 ? (
                  <p className="bg-[#45ae4a] px-4 py-1 text-sm font-semibold text-white">{optionDiscount.toFixed(0)}%</p>
                ) : null}
              </div>
              );
            })}
          </div>
        ) : null}
        <div className={`${isMarathi ? "mt-2" : "mt-3"}`}>
          <p className="text-[1.15rem] font-semibold text-[#b46a16] md:text-[1.35rem]">
            {pricing.finalPrice}
          </p>
          {pricing.hasDiscount ? (
            <div className="mt-1 flex items-center gap-2">
              <p className="text-base font-medium text-[#a8a29b] line-through">{pricing.originalPrice}</p>
              <p className="rounded-full bg-[#45ae4a] px-2 py-0.5 text-xs font-semibold text-white">
                {pricing.discountPercentage.toFixed(0)}% OFF
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default memo(ProductGalleryCard);
