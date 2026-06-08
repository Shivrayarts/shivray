import type { LocalizedText } from "@/lib/language";

type Translatable = string | LocalizedText;

export const homeContent = {
  announcementBar: {
    enabled: false,
    text: {
      en: "",
      mr: "",
    } as Translatable,
  },
  spotlightProductIds: [],
  banners: [],
  reviews: [
    {
      id: "review-1",
      authorName: "Prasad Jadhav",
      reviewText: {
        en: "The murti quality is excellent and the finishing feels premium. Delivery and support were both smooth.",
        mr: "The murti quality is excellent and the finishing feels premium. Delivery and support were both smooth.",
      } as Translatable,
      rating: 5,
      location: { en: "Pune", mr: "Pune" } as Translatable,
    },
    {
      id: "review-2",
      authorName: "Snehal Patil",
      reviewText: {
        en: "We ordered a heritage gift piece for our office and it looked even better in person than in the photos.",
        mr: "We ordered a heritage gift piece for our office and it looked even better in person than in the photos.",
      } as Translatable,
      rating: 5,
      location: { en: "Kolhapur", mr: "Kolhapur" } as Translatable,
    },
    {
      id: "review-3",
      authorName: "Amit Deshmukh",
      reviewText: {
        en: "Very responsive team, great craftsmanship, and clear updates throughout the order process.",
        mr: "Very responsive team, great craftsmanship, and clear updates throughout the order process.",
      } as Translatable,
      rating: 4,
      location: { en: "Mumbai", mr: "Mumbai" } as Translatable,
    },
  ],
  videos: [],
  blogPosts: [],
} as const;
