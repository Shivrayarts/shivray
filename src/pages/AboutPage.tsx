import { Link } from "@/lib/spa-router";
import { ArrowRight, Award, Flame, History, Shield, Target } from "lucide-react";
import aboutCraftsman from "@/assets/about-craftsman.jpg";
import { resolveLocalizedText, useLanguage, type LocalizedText } from "@/lib/language";

const popularCategories: LocalizedText[] = [
  { en: "Statues", mr: "मूर्ती" },
  { en: "Weapons", mr: "शस्त्रे" },
  { en: "Books", mr: "पुस्तके" },
  { en: "Broach", mr: "ब्रोच" },
  { en: "Tshirt", mr: "टी-शर्ट" },
];

const missionPillars = [
  {
    icon: Target,
    title: { en: "Historical Precision", mr: "ऐतिहासिक अचूकता" },
    desc: {
      en: "Every creation is shaped with respect for documented Maratha legacy, traditional form, and cultural authenticity.",
      mr: "प्रत्येक निर्मिती मराठा वारसा, पारंपरिक स्वरूप आणि सांस्कृतिक अस्सलतेचा आदर ठेवून घडवली जाते.",
    },
  },
  {
    icon: Flame,
    title: { en: "Spirit of Swarajya", mr: "स्वराज्याचा आत्मा" },
    desc: {
      en: "Our work is designed to carry the pride, courage, and inspiration of Hindavi Swarajya into modern homes and collections.",
      mr: "आमचे काम हिंदवी स्वराज्याचा अभिमान, शौर्य आणि प्रेरणा आधुनिक घरांपर्यंत आणि संग्रहांपर्यंत पोहोचवण्यासाठी घडवले जाते.",
    },
  },
  {
    icon: History,
    title: { en: "Living Heritage", mr: "जिवंत वारसा" },
    desc: {
      en: "We preserve weaponry, armour, and heritage craft traditions so future generations stay connected to their roots.",
      mr: "शस्त्रकला, कवच आणि वारसागत कारागिरी जतन करून पुढील पिढ्या त्यांच्या मुळांशी जोडलेल्या राहाव्यात यासाठी आम्ही काम करतो.",
    },
  },
  {
    icon: Award,
    title: { en: "Artisanal Quality", mr: "कारागिरीची गुणवत्ता" },
    desc: {
      en: "By blending traditional craftsmanship with modern quality standards, we deliver pieces that feel timeless and dependable.",
      mr: "पारंपरिक कारागिरी आणि आधुनिक गुणवत्ता मानके यांचा संगम घडवून आम्ही दीर्घकाळ टिकणाऱ्या आणि विश्वासार्ह कलाकृती सादर करतो.",
    },
  },
] as const;

export default function AboutPage() {
  const { resolvedLocale } = useLanguage();
  const isMarathi = resolvedLocale === "mr";

  return (
    <div>
      <section className="bg-primary bg-heritage-pattern py-20 text-center text-primary-foreground md:py-28">
        <div className="mx-auto max-w-4xl px-4">
          <p className="font-heading text-xs uppercase tracking-[0.35em] text-gold/90">
            {isMarathi ? "शिवराय आर्ट बद्दल" : "About Shivray Art"}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold md:text-5xl lg:text-6xl">
            {isMarathi
              ? "स्वराज्याचा अभिमान, सामर्थ्य आणि वारसा घडवणारी कारागिरी"
              : "Crafting the Pride, Power, and Legacy of Swarajya"}
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 bg-gold" />
          <p className="mt-6 text-lg font-display italic opacity-90">
            {isMarathi
              ? "छत्रपतींचा वारसा अस्सल मूर्ती, पारंपरिक शस्त्रे आणि वारसाप्रेरित कलाकुसरीतून जिवंत राहतो."
              : "Chhatrapati's legacy lives on through authentic statues, traditional weapons, and heritage-inspired craftsmanship."}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="w-full px-4">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg shadow-heritage">
              <img src={aboutCraftsman} alt={isMarathi ? "काम करत असलेला कारागीर" : "Artisan at work"} className="h-96 w-full object-cover" />
            </div>
            <div>
              <span className="font-heading text-sm uppercase tracking-widest text-gold">
                {isMarathi ? "स्वराज्याच्या वारशातून जन्मलेले" : "Born from the Legacy of Swarajya"}
              </span>
              <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">
                {isMarathi ? "वारशात रुजलेले, ध्येयाने घडवलेले" : "Rooted in Heritage, Crafted with Purpose"}
              </h2>
              <div className="mt-3 h-1 w-16 bg-gold" />
              <p className="mt-6 leading-relaxed text-muted-foreground">
                {isMarathi
                  ? "मराठा वारसा आणि हिंदवी स्वराज्याच्या चिरंतन प्रेरणेचा गाढ आदर मनात ठेवून शिवराय आर्ट अँड हँडकाफ्टची सुरुवात झाली. पारंपरिक शस्त्रकला, कवच आणि ऐतिहासिक कारागिरीचे वैभव पुन्हा जिवंत करण्याच्या ध्येयाने हा प्रवास सुरू झाला."
                  : "Rooted in a profound respect for Maratha heritage and the enduring spirit of Hindavi Swarajya, Shivray Art & Handcraft was founded with a vision to revive the grandeur of traditional weaponry, armor, and historical craftsmanship."}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {isMarathi
                  ? "अस्सल कारागिरी आणि आधुनिक गुणवत्ता यांचा संगम साधत आम्ही अशा कलाकृती घडवतो ज्या छत्रपती शिवाजी महाराजांच्या शौर्य, सन्मान आणि वारशाला अभिवादन करतात. आमची प्रत्येक निर्मिती ही फक्त वस्तू नसून इतिहासाला प्रेरणादायी सलाम आहे."
                  : "By blending authentic artisanal techniques with modern standards of quality, we create masterpieces that embody courage, honor, and the timeless legacy of Chhatrapati Shivaji Maharaj. Every creation is more than a product - it is a tribute to history, crafted to inspire generations."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 rounded-3xl border border-border bg-background/90 p-6 shadow-heritage md:grid-cols-2 md:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                <Shield className="h-3.5 w-3.5" />
                {isMarathi ? "मराठी वारसा" : "Marathi Legacy"}
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">
                {isMarathi
                  ? "स्वराज्याच्या गौरवशाली वारशातून जन्मलेली प्रेरणा"
                  : "A Legacy Shaped by Swarajya"}
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {isMarathi
                  ? "हिंदवी स्वराज्याच्या इतिहासाचा अभिमान आणि मराठा पराक्रमाची परंपरा यांतून शिवराय आर्टची दिशा घडली आहे. हरवत चाललेली पारंपरिक शस्त्रकला, कलाकुसर आणि ऐतिहासिक स्वरूप नव्या पिढ्यांपर्यंत पोहोचवण्याचा आमचा प्रयत्न आहे."
                  : "Shivray Art takes its direction from the pride of Hindavi Swarajya and the enduring tradition of Maratha valor. Our work is focused on carrying traditional weapon craft, heritage forms, and historic artistry into the present generation with dignity."}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {isMarathi
                  ? "पारंपरिक कौशल्य, ऐतिहासिक संदर्भ आणि कलात्मक वैभव यांचा समतोल साधत आम्ही अशा निर्मिती सादर करतो ज्या वारशाशी नाते जोडतात आणि सांस्कृतिक अभिमान जागा ठेवतात."
                  : "By balancing traditional skill, historical context, and artistic detail, we create pieces that help people stay connected to heritage while keeping cultural pride visible in daily life."}
              </p>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                <History className="h-3.5 w-3.5" />
                {isMarathi ? "लोकप्रिय श्रेणी" : "Popular Categories"}
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">
                {isMarathi ? "ग्राहकांना आवडणारे वारसासंग्रह" : "Heritage Collections Our Customers Love"}
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {isMarathi
                  ? "स्वराज्याच्या प्रेरणेतील मूर्तींपासून संग्रहणीय वस्तू आणि अभिमानाने वापरता येतील अशा निर्मितींपर्यंत, आमचा संग्रह इतिहासाला दैनंदिन आयुष्यात जवळ ठेवण्यासाठी घडवलेला आहे."
                  : "From display-ready icons of Swarajya to collectible books and wearable pride, our collection is built to keep history close in everyday life."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {popularCategories.map((category) => (
                  <span
                    key={category.en}
                    className="rounded-full border border-[#d8c0a5] bg-[#f7f1e7] px-4 py-2 text-sm font-semibold text-primary"
                  >
                    {resolveLocalizedText(category, resolvedLocale)}
                  </span>
                ))}
              </div>
              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
              >
                {isMarathi ? "सर्व उत्पादने पहा" : "View All Products"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-heritage-pattern py-16 md:py-24">
        <div className="w-full px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              {isMarathi ? "आमचे ध्येय" : "Our Mission"}
            </h2>
            <div className="mx-auto mt-3 h-1 w-24 bg-gold" />
            <p className="mx-auto mt-5 max-w-4xl leading-relaxed text-muted-foreground">
              {isMarathi
                ? "शिवराय आर्ट अँड हँडकाफ्टचे ध्येय म्हणजे स्वराज्याचा गौरवशाली इतिहास, मराठा पराक्रम आणि पारंपरिक शस्त्रकलेचा अमूल्य वारसा जतन करून पुढील पिढ्यांपर्यंत पोहोचवणे."
                : "At Shivray Art & Handcraft, our mission is to preserve and celebrate the glorious legacy of Swarajya, Maratha valor, and traditional craftsmanship."}
            </p>
            <p className="mx-auto mt-4 max-w-4xl leading-relaxed text-muted-foreground">
              {isMarathi
                ? "उत्कृष्ट कारागिरी, ऐतिहासिक अचूकता आणि कलात्मक वैभव यांच्या माध्यमातून आम्ही अशा कलाकृती घडवतो ज्या प्रेरणा, अभिमान आणि सांस्कृतिक ओळखीचे दीर्घकाळ टिकणारे प्रतीक ठरतात."
                : "Through exceptional artistry, historical authenticity, and uncompromising quality, we create masterpieces that serve as enduring symbols of courage, heritage, and cultural pride."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {missionPillars.map((item) => (
              <div
                key={item.title.en}
                className="rounded-lg border border-border bg-background p-6 text-center shadow-heritage"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-heading text-base font-semibold">
                  {resolveLocalizedText(item.title, resolvedLocale)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {resolveLocalizedText(item.desc, resolvedLocale)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-heading text-3xl font-bold">
            {isMarathi ? "आमचे संग्रह पहा" : "Explore Our Collections"}
          </h2>
          <p className="mt-4 text-sm opacity-90 md:text-base">
            {isMarathi
              ? "मूर्ती, शस्त्रे, पुस्तके, ब्रोच आणि वारसाप्रेरित वस्तू शोधा ज्या स्वराज्याचा आत्मा जिवंत ठेवतात."
              : "Discover statues, weapons, books, broaches, and heritage pieces created to keep the spirit of Swarajya alive."}
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-gold px-8 py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-gold-foreground"
          >
            {isMarathi ? "आता खरेदी करा" : "Shop Now"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
