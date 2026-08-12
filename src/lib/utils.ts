import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product, ProductOption } from "@/lib/product-model"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function shouldNormalizeCaps(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false

  const lettersOnly = trimmed.replace(/[^A-Za-z]+/g, "")
  return lettersOnly.length > 1 && lettersOnly === lettersOnly.toUpperCase()
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
}

function toSentenceCase(value: string) {
  const lowerCased = value.toLowerCase()
  return lowerCased.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (match) => match.toUpperCase())
}

export function normalizeDisplayCase(
  value: string,
  mode: "title" | "sentence" = "sentence",
) {
  if (!shouldNormalizeCaps(value)) {
    // If not all caps, still apply the requested case transformation
    return mode === "title" ? toTitleCase(value) : toSentenceCase(value)
  }

  return mode === "title" ? toTitleCase(value.trim()) : toSentenceCase(value.trim())
}

export function parseCurrencyAmount(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 0

  const matchedNumber = trimmed.match(/\d[\d,]*(?:\.\d+)?/)
  if (!matchedNumber) return 0

  return Number(matchedNumber[0].replace(/,/g, "")) || 0
}

export function formatCurrencyAmount(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function normalizeDiscountPercentage(value: string) {
  const normalized = String(value || "").replace(/[^\d.]/g, "").trim()
  if (!normalized) return 0
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return Math.min(parsed, 100)
}

export function calculateDiscountedPrice(price: string, discount: string) {
  const originalPrice = parseCurrencyAmount(price)
  const discountPercentage = normalizeDiscountPercentage(discount)
  if (!originalPrice || discountPercentage <= 0) return 0
  return Number((originalPrice - originalPrice * (discountPercentage / 100)).toFixed(2))
}

export function getProductOptionPricing(option: ProductOption, fallbackPrice = "") {
  const discountPercentage = normalizeDiscountPercentage(option.discount)
  const originalPrice = option.price || fallbackPrice
  const computedFinalPrice = calculateDiscountedPrice(originalPrice, String(discountPercentage))
  const savedFinalPrice = parseCurrencyAmount(option.finalPrice) > 0 ? option.finalPrice : ""
  const finalPrice =
    savedFinalPrice ||
    (discountPercentage > 0 && computedFinalPrice > 0
      ? formatCurrencyAmount(computedFinalPrice)
      : originalPrice)

  return {
    hasDiscount: discountPercentage > 0,
    originalPrice,
    finalPrice,
    discountPercentage,
  }
}

export function getHighlightedProductOptionIndex(productOptions: ProductOption[] = [], fallbackPrice = "") {
  let highlightedIndex = -1
  let lowestFinalPrice = Number.POSITIVE_INFINITY

  productOptions.forEach((option, index) => {
    const { finalPrice } = getProductOptionPricing(option, fallbackPrice)
    const parsedFinalPrice = parseCurrencyAmount(finalPrice)

    if (!parsedFinalPrice || parsedFinalPrice >= lowestFinalPrice) return

    highlightedIndex = index
    lowestFinalPrice = parsedFinalPrice
  })

  return highlightedIndex
}

export function getProductPricing(product: Pick<Product, "price" | "discount" | "finalPrice" | "productOptions">) {
  const highlightedOptionIndex = getHighlightedProductOptionIndex(product.productOptions ?? [], product.price)
  const highlightedOption =
    highlightedOptionIndex >= 0
      ? (product.productOptions ?? [])[highlightedOptionIndex] ?? null
      : (product.productOptions ?? [])[0] ?? null

  if (highlightedOption) {
    return getProductOptionPricing(highlightedOption, product.price)
  }

  const productDiscount = normalizeDiscountPercentage(product.discount || "0")
  const originalPrice = product.price
  const computedFinalPrice = calculateDiscountedPrice(product.price, String(productDiscount))
  const finalPrice =
    product.finalPrice && parseCurrencyAmount(product.finalPrice) > 0
      ? product.finalPrice
      : productDiscount > 0
        ? formatCurrencyAmount(computedFinalPrice)
        : product.price

  return {
    hasDiscount: productDiscount > 0,
    originalPrice,
    finalPrice,
    discountPercentage: productDiscount,
  }
}
