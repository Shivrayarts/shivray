import type { Locale } from "@/lib/language";

export function getGeneralWhatsappMessage(locale: Locale) {
  if (locale === "mr") {
    return "जय शिवराय ⛳️\n\nमी आपले प्रोडक्ट्स पाहिले. घर सजावट व देवपूजेसाठी काही वस्तू घ्यायच्या आहेत. कृपया कॅटलॉग व किंमत पाठवा.";
  }

  return "Jai Shivray,\n\nI have seen your products. I want to buy some items for home decor and devotional worship. Please send the catalogue and prices.";
}

export function buildWhatsappUrl(baseHref: string, message: string) {
  return `${baseHref}?text=${encodeURIComponent(message)}`;
}
