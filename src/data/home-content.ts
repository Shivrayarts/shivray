import type { LocalizedText } from "@/lib/language";
import heroBanner1 from "@/assets/products-poster.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

type Translatable = string | LocalizedText;

export const homeContent = {
  banners: [
    {
      id: "timeless-culture-banner",
      eyebrow: { en: "Premium Craftsmanship Since 2015", mr: "२०१५ पासून प्रीमियम कारागिरी" } as Translatable,
      titleTop: { en: "Timeless Culture", mr: "कालातीत संस्कृती" } as Translatable,
      titleBottom: { en: "Modern Vision", mr: "आधुनिक दृष्टी" } as Translatable,
      copy: {
        en: "From heritage artifacts to custom statement pieces, each creation carries tradition, precision, and visual impact.",
        mr: "वारसाहक्क वस्तूंपासून कस्टम शोपीसपर्यंत प्रत्येक निर्मितीत परंपरा, अचूकता आणि प्रभावी सौंदर्य आहे.",
      } as Translatable,
      image: heroBanner3,
    },
    {
      id: "warrior-legacy-banner",
      eyebrow: { en: "Made For Proud Spaces", mr: "गौरवास्पद जागांसाठी तयार" } as Translatable,
      titleTop: { en: "Warrior Legacy", mr: "योद्धा वारसा" } as Translatable,
      titleBottom: { en: "Handcrafted Detail", mr: "हाताने घडवलेला तपशील" } as Translatable,
      copy: {
        en: "Bring home statues, shields, and decor pieces shaped with heritage-inspired artistry and a premium finish.",
        mr: "वारसा-प्रेरित कलाकुसर आणि प्रीमियम फिनिशसह तयार केलेल्या मूर्ती, ढाली आणि सजावटी वस्तू घरात आणा.",
      } as Translatable,
      image: heroBanner1,
    },
    {
      id: "royal-presence-banner",
      eyebrow: { en: "Signature Heritage Collection", mr: "विशिष्ट वारसा संग्रह" } as Translatable,
      titleTop: { en: "Royal Presence", mr: "राजेशाही उपस्थिती" } as Translatable,
      titleBottom: { en: "Bold Display", mr: "भव्य प्रदर्शन" } as Translatable,
      copy: {
        en: "Explore statement pieces designed for gifting, home decor, devotion, and unforgettable first impressions.",
        mr: "भेटवस्तू, घर सजावट, भक्ती आणि अविस्मरणीय पहिल्या छापेसाठी तयार केलेले खास तुकडे पाहा.",
      } as Translatable,
      image: heroBanner2,
    },
  ],
  reviews: [
    {
      id: "review-1",
      authorName: "Prasad Jadhav",
      reviewText: { en: "The murti quality is excellent and the finishing feels premium. Delivery and support were both smooth.", mr: "मूर्तीची गुणवत्ता उत्कृष्ट आहे आणि फिनिशिंग खूप प्रीमियम वाटते. डिलिव्हरी आणि सपोर्ट दोन्ही छान होते." } as Translatable,
      rating: 5,
      location: { en: "Pune", mr: "पुणे" } as Translatable,
    },
    {
      id: "review-2",
      authorName: "Snehal Patil",
      reviewText: { en: "We ordered a heritage gift piece for our office and it looked even better in person than in the photos.", mr: "आम्ही ऑफिससाठी वारसा-शैलीतील भेटवस्तू मागवली आणि ती प्रत्यक्षात फोटोपेक्षा अधिक सुंदर दिसली." } as Translatable,
      rating: 5,
      location: { en: "Kolhapur", mr: "कोल्हापूर" } as Translatable,
    },
    {
      id: "review-3",
      authorName: "Amit Deshmukh",
      reviewText: { en: "Very responsive team, great craftsmanship, and clear updates throughout the order process.", mr: "टीम खूप प्रतिसाद देणारी आहे, कारागिरी सुंदर आहे आणि संपूर्ण ऑर्डर प्रक्रियेत स्पष्ट अपडेट्स मिळाले." } as Translatable,
      rating: 4,
      location: { en: "Mumbai", mr: "मुंबई" } as Translatable,
    },
  ],
  videos: [
    {
      id: "video-1",
      title: { en: "Shivkalin Shastranche Aajche Shilpakar", mr: "शिवकालीन शस्त्रांचे आजचे शिल्पकार" } as Translatable,
      description: { en: "Shivray Arts shares its journey from passion to profession in historical weapon crafting.", mr: "ऐतिहासिक शस्त्रनिर्मितीत आवडीतून व्यवसायापर्यंतचा प्रवास शिवराय आर्ट्स सांगते." } as Translatable,
      videoType: "youtube",
      videoUrl: "https://youtu.be/xh-ibz0qxaA",
    },
    {
      id: "video-2",
      title: { en: "Bhetarupi Aitihasik Shastra Banavnare Shivray Arts", mr: "भेटरूपी ऐतिहासिक शस्त्रे बनवणारे शिवराय आर्ट्स" } as Translatable,
      description: { en: "Historic weapons as gifts and display pieces that preserve traditional craftsmanship.", mr: "पारंपरिक कारागिरी जपणारी भेटवस्तू आणि प्रदर्शनासाठी योग्य ऐतिहासिक शस्त्रे." } as Translatable,
      videoType: "youtube",
      videoUrl: "https://youtu.be/2alkiZgDxMI",
    },
    {
      id: "video-3",
      title: { en: "Puratan Shastrancha Itihas Jopasanara Kalakar Mavala", mr: "पुरातन शस्त्रांचा इतिहास जपणारा कलाकार मावळा" } as Translatable,
      description: { en: "A short feature on the artisan spirit and the story behind these heritage-inspired creations.", mr: "कारागिरांचा आत्मा आणि या वारसा-प्रेरित निर्मितींची कथा सांगणारा छोटा परिचय." } as Translatable,
      videoType: "youtube",
      videoUrl: "https://youtu.be/WpBQTatwZhs",
    },
  ],
} as const;
