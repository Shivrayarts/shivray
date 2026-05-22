import type { LocalizedText } from "@/lib/language";
import heroBanner1 from "@/assets/products-poster.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

type Translatable = string | LocalizedText;

export const homeContent = {
  banners: [
    {
      id: "timeless-culture-banner",
      eyebrow: { en: "Premium Craftsmanship Since 2015", mr: "à¥¨à¥¦à¥§à¥« à¤ªà¤¾à¤¸à¥‚à¤¨ à¤ªà¥à¤°à¥€à¤®à¤¿à¤¯à¤® à¤•à¤¾à¤°à¤¾à¤—à¤¿à¤°à¥€" } as Translatable,
      titleTop: { en: "Timeless Culture", mr: "à¤•à¤¾à¤²à¤¾à¤¤à¥€à¤¤ à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¥€" } as Translatable,
      titleBottom: { en: "Modern Vision", mr: "à¤†à¤§à¥à¤¨à¤¿à¤• à¤¦à¥ƒà¤·à¥à¤Ÿà¥€" } as Translatable,
      copy: {
        en: "From heritage artifacts to custom statement pieces, each creation carries tradition, precision, and visual impact.",
        mr: "à¤µà¤¾à¤°à¤¸à¤¾à¤¹à¤•à¥à¤• à¤µà¤¸à¥à¤¤à¥‚à¤‚à¤ªà¤¾à¤¸à¥‚à¤¨ à¤•à¤¸à¥à¤Ÿà¤® à¤¶à¥‹à¤ªà¥€à¤¸à¤ªà¤°à¥à¤¯à¤‚à¤¤ à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤¨à¤¿à¤°à¥à¤®à¤¿à¤¤à¥€à¤¤ à¤ªà¤°à¤‚à¤ªà¤°à¤¾, à¤…à¤šà¥‚à¤•à¤¤à¤¾ à¤†à¤£à¤¿ à¤ªà¥à¤°à¤­à¤¾à¤µà¥€ à¤¸à¥Œà¤‚à¤¦à¤°à¥à¤¯ à¤†à¤¹à¥‡.",
      } as Translatable,
      image: heroBanner3,
    },
    {
      id: "warrior-legacy-banner",
      eyebrow: { en: "Made For Proud Spaces", mr: "à¤—à¥Œà¤°à¤µà¤¾à¤¸à¥à¤ªà¤¦ à¤œà¤¾à¤—à¤¾à¤‚à¤¸à¤¾à¤ à¥€ à¤¤à¤¯à¤¾à¤°" } as Translatable,
      titleTop: { en: "Warrior Legacy", mr: "à¤¯à¥‹à¤¦à¥à¤§à¤¾ à¤µà¤¾à¤°à¤¸à¤¾" } as Translatable,
      titleBottom: { en: "Handcrafted Detail", mr: "à¤¹à¤¾à¤¤à¤¾à¤¨à¥‡ à¤˜à¤¡à¤µà¤²à¥‡à¤²à¤¾ à¤¤à¤ªà¤¶à¥€à¤²" } as Translatable,
      copy: {
        en: "Bring home statues, shields, and decor pieces shaped with heritage-inspired artistry and a premium finish.",
        mr: "à¤µà¤¾à¤°à¤¸à¤¾-à¤ªà¥à¤°à¥‡à¤°à¤¿à¤¤ à¤•à¤²à¤¾à¤•à¥à¤¸à¤° à¤†à¤£à¤¿ à¤ªà¥à¤°à¥€à¤®à¤¿à¤¯à¤® à¤«à¤¿à¤¨à¤¿à¤¶à¤¸à¤¹ à¤¤à¤¯à¤¾à¤° à¤•à¥‡à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤®à¥‚à¤°à¥à¤¤à¥€, à¤¢à¤¾à¤²à¥€ à¤†à¤£à¤¿ à¤¸à¤œà¤¾à¤µà¤Ÿà¥€ à¤µà¤¸à¥à¤¤à¥‚ à¤˜à¤°à¤¾à¤¤ à¤†à¤£à¤¾.",
      } as Translatable,
      image: heroBanner1,
    },
    {
      id: "royal-presence-banner",
      eyebrow: { en: "Signature Heritage Collection", mr: "à¤µà¤¿à¤¶à¤¿à¤·à¥à¤Ÿ à¤µà¤¾à¤°à¤¸à¤¾ à¤¸à¤‚à¤—à¥à¤°à¤¹" } as Translatable,
      titleTop: { en: "Royal Presence", mr: "à¤°à¤¾à¤œà¥‡à¤¶à¤¾à¤¹à¥€ à¤‰à¤ªà¤¸à¥à¤¥à¤¿à¤¤à¥€" } as Translatable,
      titleBottom: { en: "Bold Display", mr: "à¤­à¤µà¥à¤¯ à¤ªà¥à¤°à¤¦à¤°à¥à¤¶à¤¨" } as Translatable,
      copy: {
        en: "Explore statement pieces designed for gifting, home decor, devotion, and unforgettable first impressions.",
        mr: "à¤­à¥‡à¤Ÿà¤µà¤¸à¥à¤¤à¥‚, à¤˜à¤° à¤¸à¤œà¤¾à¤µà¤Ÿ, à¤­à¤•à¥à¤¤à¥€ à¤†à¤£à¤¿ à¤…à¤µà¤¿à¤¸à¥à¤®à¤°à¤£à¥€à¤¯ à¤ªà¤¹à¤¿à¤²à¥à¤¯à¤¾ à¤›à¤¾à¤ªà¥‡à¤¸à¤¾à¤ à¥€ à¤¤à¤¯à¤¾à¤° à¤•à¥‡à¤²à¥‡à¤²à¥‡ à¤–à¤¾à¤¸ à¤¤à¥à¤•à¤¡à¥‡ à¤ªà¤¾à¤¹à¤¾.",
      } as Translatable,
      image: heroBanner2,
    },
  ],
  reviews: [
    {
      id: "review-1",
      authorName: "Prasad Jadhav",
      reviewText: { en: "The murti quality is excellent and the finishing feels premium. Delivery and support were both smooth.", mr: "à¤®à¥‚à¤°à¥à¤¤à¥€à¤šà¥€ à¤—à¥à¤£à¤µà¤¤à¥à¤¤à¤¾ à¤‰à¤¤à¥à¤•à¥ƒà¤·à¥à¤Ÿ à¤†à¤¹à¥‡ à¤†à¤£à¤¿ à¤«à¤¿à¤¨à¤¿à¤¶à¤¿à¤‚à¤— à¤–à¥‚à¤ª à¤ªà¥à¤°à¥€à¤®à¤¿à¤¯à¤® à¤µà¤¾à¤Ÿà¤¤à¥‡. à¤¡à¤¿à¤²à¤¿à¤µà¥à¤¹à¤°à¥€ à¤†à¤£à¤¿ à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ à¤¦à¥‹à¤¨à¥à¤¹à¥€ à¤›à¤¾à¤¨ à¤¹à¥‹à¤¤à¥‡." } as Translatable,
      rating: 5,
      location: { en: "Pune", mr: "à¤ªà¥à¤£à¥‡" } as Translatable,
    },
    {
      id: "review-2",
      authorName: "Snehal Patil",
      reviewText: { en: "We ordered a heritage gift piece for our office and it looked even better in person than in the photos.", mr: "à¤†à¤®à¥à¤¹à¥€ à¤‘à¤«à¤¿à¤¸à¤¸à¤¾à¤ à¥€ à¤µà¤¾à¤°à¤¸à¤¾-à¤¶à¥ˆà¤²à¥€à¤¤à¥€à¤² à¤­à¥‡à¤Ÿà¤µà¤¸à¥à¤¤à¥‚ à¤®à¤¾à¤—à¤µà¤²à¥€ à¤†à¤£à¤¿ à¤¤à¥€ à¤ªà¥à¤°à¤¤à¥à¤¯à¤•à¥à¤·à¤¾à¤¤ à¤«à¥‹à¤Ÿà¥‹à¤ªà¥‡à¤•à¥à¤·à¤¾ à¤…à¤§à¤¿à¤• à¤¸à¥à¤‚à¤¦à¤° à¤¦à¤¿à¤¸à¤²à¥€." } as Translatable,
      rating: 5,
      location: { en: "Kolhapur", mr: "à¤•à¥‹à¤²à¥à¤¹à¤¾à¤ªà¥‚à¤°" } as Translatable,
    },
    {
      id: "review-3",
      authorName: "Amit Deshmukh",
      reviewText: { en: "Very responsive team, great craftsmanship, and clear updates throughout the order process.", mr: "à¤Ÿà¥€à¤® à¤–à¥‚à¤ª à¤ªà¥à¤°à¤¤à¤¿à¤¸à¤¾à¤¦ à¤¦à¥‡à¤£à¤¾à¤°à¥€ à¤†à¤¹à¥‡, à¤•à¤¾à¤°à¤¾à¤—à¤¿à¤°à¥€ à¤¸à¥à¤‚à¤¦à¤° à¤†à¤¹à¥‡ à¤†à¤£à¤¿ à¤¸à¤‚à¤ªà¥‚à¤°à¥à¤£ à¤‘à¤°à¥à¤¡à¤° à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¥‡à¤¤ à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤…à¤ªà¤¡à¥‡à¤Ÿà¥à¤¸ à¤®à¤¿à¤³à¤¾à¤²à¥‡." } as Translatable,
      rating: 4,
      location: { en: "Mumbai", mr: "à¤®à¥à¤‚à¤¬à¤ˆ" } as Translatable,
    },
  ],
  videos: [
    {
      id: "video-1",
      title: { en: "Shivkalin Shastranche Aajche Shilpakar", mr: "à¤¶à¤¿à¤µà¤•à¤¾à¤²à¥€à¤¨ à¤¶à¤¸à¥à¤¤à¥à¤°à¤¾à¤‚à¤šà¥‡ à¤†à¤œà¤šà¥‡ à¤¶à¤¿à¤²à¥à¤ªà¤•à¤¾à¤°" } as Translatable,
      description: { en: "Shivray Arts shares its journey from passion to profession in historical weapon crafting.", mr: "à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤¶à¤¸à¥à¤¤à¥à¤°à¤¨à¤¿à¤°à¥à¤®à¤¿à¤¤à¥€à¤¤ à¤†à¤µà¤¡à¥€à¤¤à¥‚à¤¨ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯à¤¾à¤ªà¤°à¥à¤¯à¤‚à¤¤à¤šà¤¾ à¤ªà¥à¤°à¤µà¤¾à¤¸ à¤¶à¤¿à¤µà¤°à¤¾à¤¯ à¤†à¤°à¥à¤Ÿà¥à¤¸ à¤¸à¤¾à¤‚à¤—à¤¤à¥‡." } as Translatable,
      videoType: "youtube",
      videoUrl: "https://youtube.com/shorts/KI-DFCdpo8Y?si=PJP_RJem28YFOYYf",
    },
    {
      id: "video-2",
      title: { en: "Bhetarupi Aitihasik Shastra Banavnare Shivray Arts", mr: "à¤­à¥‡à¤Ÿà¤°à¥‚à¤ªà¥€ à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤¶à¤¸à¥à¤¤à¥à¤°à¥‡ à¤¬à¤¨à¤µà¤£à¤¾à¤°à¥‡ à¤¶à¤¿à¤µà¤°à¤¾à¤¯ à¤†à¤°à¥à¤Ÿà¥à¤¸" } as Translatable,
      description: { en: "Historic weapons as gifts and display pieces that preserve traditional craftsmanship.", mr: "à¤ªà¤¾à¤°à¤‚à¤ªà¤°à¤¿à¤• à¤•à¤¾à¤°à¤¾à¤—à¤¿à¤°à¥€ à¤œà¤ªà¤£à¤¾à¤°à¥€ à¤­à¥‡à¤Ÿà¤µà¤¸à¥à¤¤à¥‚ à¤†à¤£à¤¿ à¤ªà¥à¤°à¤¦à¤°à¥à¤¶à¤¨à¤¾à¤¸à¤¾à¤ à¥€ à¤¯à¥‹à¤—à¥à¤¯ à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤¶à¤¸à¥à¤¤à¥à¤°à¥‡." } as Translatable,
      videoType: "youtube",
      videoUrl: "https://youtube.com/shorts/1gEJzqW8fTo?si=DT-QIww8fOpn40xp",
    },
    {
      id: "video-3",
      title: { en: "Puratan Shastrancha Itihas Jopasanara Kalakar Mavala", mr: "à¤ªà¥à¤°à¤¾à¤¤à¤¨ à¤¶à¤¸à¥à¤¤à¥à¤°à¤¾à¤‚à¤šà¤¾ à¤‡à¤¤à¤¿à¤¹à¤¾à¤¸ à¤œà¤ªà¤£à¤¾à¤°à¤¾ à¤•à¤²à¤¾à¤•à¤¾à¤° à¤®à¤¾à¤µà¤³à¤¾" } as Translatable,
      description: { en: "A short feature on the artisan spirit and the story behind these heritage-inspired creations.", mr: "à¤•à¤¾à¤°à¤¾à¤—à¤¿à¤°à¤¾à¤‚à¤šà¤¾ à¤†à¤¤à¥à¤®à¤¾ à¤†à¤£à¤¿ à¤¯à¤¾ à¤µà¤¾à¤°à¤¸à¤¾-à¤ªà¥à¤°à¥‡à¤°à¤¿à¤¤ à¤¨à¤¿à¤°à¥à¤®à¤¿à¤¤à¥€à¤‚à¤šà¥€ à¤•à¤¥à¤¾ à¤¸à¤¾à¤‚à¤—à¤£à¤¾à¤°à¤¾ à¤›à¥‹à¤Ÿà¤¾ à¤ªà¤°à¤¿à¤šà¤¯." } as Translatable,
      videoType: "youtube",
      videoUrl: "https://youtube.com/shorts/nmTdnfcxtLk?si=VxODZbTQOtagwAvy",
    },
  ],
} as const;
