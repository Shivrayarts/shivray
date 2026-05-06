import heroBanner1 from "@/assets/products-poster.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

export const homeContent = {
  banners: [
    {
      id: "timeless-culture-banner",
      eyebrow: "Premium Craftsmanship Since 2015",
      titleTop: "Timeless Culture",
      titleBottom: "Modern Vision",
      copy:
        "From heritage artifacts to custom statement pieces, each creation carries tradition, precision, and visual impact.",
      image: heroBanner3,
    },
    {
      id: "warrior-legacy-banner",
      eyebrow: "Made For Proud Spaces",
      titleTop: "Warrior Legacy",
      titleBottom: "Handcrafted Detail",
      copy:
        "Bring home statues, shields, and decor pieces shaped with heritage-inspired artistry and a premium finish.",
      image: heroBanner1,
    },
    {
      id: "royal-presence-banner",
      eyebrow: "Signature Heritage Collection",
      titleTop: "Royal Presence",
      titleBottom: "Bold Display",
      copy:
        "Explore statement pieces designed for gifting, home decor, devotion, and unforgettable first impressions.",
      image: heroBanner2,
    },
  ],
  reviews: [
    {
      id: "review-1",
      authorName: "Prasad Jadhav",
      reviewText:
        "The murti quality is excellent and the finishing feels premium. Delivery and support were both smooth.",
      rating: 5,
      location: "Pune",
    },
    {
      id: "review-2",
      authorName: "Snehal Patil",
      reviewText:
        "We ordered a heritage gift piece for our office and it looked even better in person than in the photos.",
      rating: 5,
      location: "Kolhapur",
    },
    {
      id: "review-3",
      authorName: "Amit Deshmukh",
      reviewText:
        "Very responsive team, great craftsmanship, and clear updates throughout the order process.",
      rating: 4,
      location: "Mumbai",
    },
  ],
  videos: [
    {
      id: "video-1",
      title: "Shivkalin Shastranche Aajche Shilpakar",
      description:
        "Shivray Arts shares its journey from passion to profession in historical weapon crafting.",
      videoUrl: "https://youtu.be/xh-ibz0qxaA",
    },
    {
      id: "video-2",
      title: "Bhetarupi Aitihasik Shastra Banavnare Shivray Arts",
      description:
        "Historic weapons as gifts and display pieces that preserve traditional craftsmanship.",
      videoUrl: "https://youtu.be/2alkiZgDxMI",
    },
    {
      id: "video-3",
      title: "Puratan Shastrancha Itihas Jopasanara Kalakar Mavala",
      description:
        "A short feature on the artisan spirit and the story behind these heritage-inspired creations.",
      videoUrl: "https://youtu.be/WpBQTatwZhs",
    },
  ],
} as const;
