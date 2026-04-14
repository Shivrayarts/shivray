import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Shield, Sword, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import heroBanner1 from "@/assets/hero-banner.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";
import productStatue1 from "@/assets/product-statue-1.jpg";
import productStatue2 from "@/assets/product-statue-2.jpg";
import productWeapon1 from "@/assets/product-weapon-1.jpg";
import productDhoop1 from "@/assets/product-dhoop-1.jpg";
import aboutCraftsman from "@/assets/about-craftsman.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Rudra Arts & Handicrafts — Authentic Maratha Heritage Craftsmanship" },
      { name: "description", content: "India's premier studio for authentic statues, Maratha weapons, and historical replicas. Handcrafted with precision and cultural pride." },
      { property: "og:title", content: "Rudra Arts & Handicrafts — Authentic Maratha Heritage" },
      { property: "og:description", content: "Handcrafted statues, weapons, and historical replicas preserving India's warrior legacy." },
    ],
  }),
});

const heroSlides = [
  { image: heroBanner1, title: "Explore Our Collection", subtitle: "Reliving History Through Every Creation" },
  { image: heroBanner2, title: "Warrior's Legacy", subtitle: "Authentic Maratha Weapons & Artifacts" },
  { image: heroBanner3, title: "Artisan Heritage", subtitle: "Handcrafted Treasures of Timeless Value" },
];

const featuredProducts = [
  { name: "Shastradhari Maharaj", price: "₹5,100", image: productStatue1, category: "Statues" },
  { name: "Ashwarudh Maharaj", price: "₹12,850", image: productStatue2, category: "Statues" },
  { name: "Royal Khanjar", price: "₹8,500", image: productWeapon1, category: "Weapons" },
  { name: "Brass Dhoop Stand", price: "₹2,200", image: productDhoop1, category: "Dhoop" },
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Slider */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
          </div>
        ))}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-xl">
              <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight drop-shadow-lg">
                {heroSlides[currentSlide].title}
              </h2>
              <p className="mt-4 text-lg md:text-xl text-primary-foreground/90 font-display italic drop-shadow">
                {heroSlides[currentSlide].subtitle}
              </p>
              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2 bg-gold text-gold-foreground px-8 py-3.5 rounded-md font-heading text-sm font-semibold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg"
              >
                View Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? "bg-gold scale-110" : "bg-primary-foreground/40"}`}
            />
          ))}
        </div>
        <button onClick={() => setCurrentSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary/40 text-primary-foreground hover:bg-primary/60 transition hidden md:block">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setCurrentSlide((p) => (p + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary/40 text-primary-foreground hover:bg-primary/60 transition hidden md:block">
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-heritage-pattern">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Our Collections</h2>
            <div className="w-24 h-1 bg-gold mx-auto mt-3" />
            <p className="mt-4 text-muted-foreground font-display italic text-lg">Discover handcrafted treasures embodying centuries of tradition</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Crown, title: "Maharaj Statues", desc: "Handcrafted sculptures capturing iconic warriors and legends" },
              { icon: Sword, title: "Warrior Weapons", desc: "Faithful recreations of traditional Maratha arms" },
              { icon: Shield, title: "Shields & Artifacts", desc: "Meticulously crafted replicas from our glorious history" },
            ].map((cat) => (
              <Link
                key={cat.title}
                to="/products"
                className="group bg-card rounded-lg p-8 text-center shadow-heritage hover:shadow-xl transition-all duration-300 border border-border hover:border-gold/40"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <cat.icon className="w-7 h-7 text-primary group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{cat.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{cat.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Featured Products</h2>
            <div className="w-24 h-1 bg-gold mx-auto mt-3" />
            <p className="mt-4 text-muted-foreground font-display italic text-lg">Reliving History Through Every Creation</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.name}
                to="/products"
                className="group bg-background rounded-lg overflow-hidden shadow-heritage hover:shadow-xl transition-all duration-300 border border-border hover:border-gold/30"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-gold">{product.category}</span>
                  <h3 className="font-heading text-sm font-semibold text-foreground mt-1">{product.name}</h3>
                  <p className="text-lg font-bold text-primary mt-2">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-md font-heading text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-heritage-pattern">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">The Story Behind Rudra Arts</h2>
            <div className="w-24 h-1 bg-gold mx-auto mt-3" />
            <p className="mt-4 text-muted-foreground font-display italic text-lg">A Journey Through Time: Building Innovation, Preserving Tradition</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden shadow-heritage">
              <img src={aboutCraftsman} alt="Artisan at work" loading="lazy" width={800} height={600} className="w-full h-80 object-cover" />
            </div>
            <div className="space-y-6">
              {[
                { title: "The Beginning", text: "Rooted in deep cultural passion, Rudra Arts began its journey to revive the legacy of traditional weaponry—fusing timeless craftsmanship with a modern outlook." },
                { title: "The Evolution", text: "With time, our vision expanded. We now craft cultural artifacts and regal creations that reflect both artistic integrity and historical authenticity." },
                { title: "Our Mission", text: "We aim to preserve and promote this cultural heritage globally, offering handcrafted excellence while embracing evolving aesthetics." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gold/20 flex items-center justify-center font-heading text-sm font-bold text-gold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-gold font-medium hover:gap-3 transition-all font-heading text-sm uppercase tracking-wider"
              >
                Read More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Preserve Heritage, Own History</h2>
          <p className="mt-4 font-display italic text-lg opacity-90">
            Each piece reflects the soul of Indian heritage—carefully curated with precision, pride, and timeless skills passed through generations.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground px-8 py-3.5 rounded-md font-heading text-sm font-semibold uppercase tracking-wider hover:brightness-110 transition-all">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground px-8 py-3.5 rounded-md font-heading text-sm font-semibold uppercase tracking-wider hover:bg-primary-foreground/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
