import { Link } from "@/lib/spa-router";
import { ArrowRight, Award, Flame, History, Shield, Target } from "lucide-react";
import aboutCraftsman from "@/assets/about-craftsman.jpg";

const popularCategories = ["Statues", "Weapons", "Books", "Broach", "Tshirt"];

const missionPillars = [
  {
    icon: Target,
    title: "Historical Precision",
    desc: "Every creation is shaped with respect for documented Maratha legacy, traditional form, and cultural authenticity.",
  },
  {
    icon: Flame,
    title: "Spirit of Swarajya",
    desc: "Our work is designed to carry the pride, courage, and inspiration of Hindavi Swarajya into modern homes and collections.",
  },
  {
    icon: History,
    title: "Living Heritage",
    desc: "We preserve weaponry, armour, and heritage craft traditions so future generations stay connected to their roots.",
  },
  {
    icon: Award,
    title: "Artisanal Quality",
    desc: "By blending traditional craftsmanship with modern quality standards, we deliver pieces that feel timeless and dependable.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-primary bg-heritage-pattern py-20 text-center text-primary-foreground md:py-28">
        <div className="mx-auto max-w-4xl px-4">
          <p className="font-heading text-xs uppercase tracking-[0.35em] text-gold/90">About Shivray Art</p>
          <h1 className="mt-4 font-heading text-4xl font-bold md:text-5xl lg:text-6xl">
            Crafting the Pride, Power, and Legacy of Swarajya
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 bg-gold" />
          <p className="mt-6 text-lg font-display italic opacity-90">
            Chhatrapati&apos;s legacy lives on through authentic statues, traditional weapons, and heritage-inspired craftsmanship.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="w-full px-4">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg shadow-heritage">
              <img src={aboutCraftsman} alt="Artisan at work" className="h-96 w-full object-cover" />
            </div>
            <div>
              <span className="font-heading text-sm uppercase tracking-widest text-gold">Born from the Legacy of Swarajya</span>
              <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">Rooted in Heritage, Crafted with Purpose</h2>
              <div className="mt-3 h-1 w-16 bg-gold" />
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Rooted in a profound respect for Maratha heritage and the enduring spirit of Hindavi Swarajya, Shivray Art &amp; Handcraft was founded with a vision to revive the grandeur of traditional weaponry, armor, and historical craftsmanship.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                By blending authentic artisanal techniques with modern standards of quality, we create masterpieces that embody courage, honor, and the timeless legacy of Chhatrapati Shivaji Maharaj. Every creation is more than a product - it is a tribute to history, crafted to inspire generations.
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
                Marathi Legacy
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">स्वराज्याच्या गौरवशाली वारशातून जन्मलेली एक प्रेरणा</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                हिंदवी स्वराज्याच्या इतिहासाबद्दल असलेल्या गाढ आदरातून आणि मराठा पराक्रमाच्या अभिमानातून शिवराय आर्ट अँड हँडकाफ्टची सुरुवात झाली. हरवत चाललेल्या पारंपरिक शस्त्रकला निर्मिती आणि ऐतिहासिक कलाकुसरीला नवसंजीवनी देण्याच्या उद्देशाने आम्ही हा प्रवास सुरू केला.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                पारंपरिक कारागिरी, ऐतिहासिक अचूकता आणि आधुनिक गुणवत्तेचा संगम घडवत, प्रत्येक कलाकृतीतून आम्ही स्वराज्याचा अभिमान, शौर्य आणि वैभव पुन्हा जिवंत करण्याचा प्रयत्न करतो.
              </p>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                <History className="h-3.5 w-3.5" />
                Popular Categories
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">Heritage Collections Our Customers Love</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                From display-ready icons of Swarajya to collectible books and wearable pride, our collection is built to keep history close in everyday life.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {popularCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-[#d8c0a5] bg-[#f7f1e7] px-4 py-2 text-sm font-semibold text-primary"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
              >
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-heritage-pattern py-16 md:py-24">
        <div className="w-full px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">Our Mission</h2>
            <div className="mx-auto mt-3 h-1 w-24 bg-gold" />
            <p className="mx-auto mt-5 max-w-4xl leading-relaxed text-muted-foreground">
              At Shivray Art &amp; Handcraft, our mission is to preserve and celebrate the glorious legacy of Swarajya, Maratha valor, and traditional craftsmanship. Through exceptional artistry, historical authenticity, and uncompromising quality, we create masterpieces that serve as enduring symbols of courage, heritage, and cultural pride.
            </p>
            <p className="mx-auto mt-4 max-w-4xl leading-relaxed text-muted-foreground">
              Every creation we craft is designed not merely as a decorative piece, but as a tribute to the spirit of Chhatrapati Shivaji Maharaj and the timeless legacy of the Maratha Empire - ensuring that the pride of Hindavi Swarajya continues to inspire future generations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {missionPillars.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-background p-6 text-center shadow-heritage"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-heading text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-border bg-background p-6 shadow-heritage md:p-8">
            <h3 className="font-heading text-2xl font-bold text-foreground">आमचे ध्येय</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              शिवराय आर्ट अँड हँडकाफ्टचे ध्येय म्हणजे स्वराज्याचा गौरवशाली इतिहास, मराठा पराक्रम आणि पारंपरिक शस्त्रकलेचा अमूल्य वारसा जतन करून तो पुढील पिढ्यांपर्यंत पोहोचवणे. उत्कृष्ट कारागिरी, ऐतिहासिक अचूकता आणि कलात्मक वैभव यांच्या माध्यमातून आम्ही अशा कलाकृती निर्माण करतो ज्या केवळ सजावटी वस्तू नसून प्रेरणा, अभिमान आणि सांस्कृतिक ओळखीचे प्रतीक आहेत.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              आमचा प्रत्येक हस्तकला नमुना हिंदवी स्वराज्याच्या शौर्यगाथेची आठवण करून देतो आणि मराठा इतिहासाविषयीचा अभिमान जागृत ठेवतो.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-heading text-3xl font-bold">Explore Our Collections</h2>
          <p className="mt-4 text-sm opacity-90 md:text-base">
            Discover statues, weapons, books, broaches, and heritage pieces created to keep the spirit of Swarajya alive.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-gold px-8 py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-gold-foreground"
          >
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
