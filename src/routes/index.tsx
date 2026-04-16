import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Shield, Sword, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import heroBanner1 from "@/assets/products-poster.jpg";
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
      { title: "Shivray - Authentic Maratha Heritage Craftsmanship" },
      { name: "description", content: "India's premier studio for authentic statues, Maratha weapons, and historical replicas. Handcrafted with precision and cultural pride." },
      { property: "og:title", content: "Shivray - Authentic Maratha Heritage" },
      { property: "og:description", content: "Handcrafted statues, weapons, and historical replicas preserving India's warrior legacy." },
    ],
  }),
});

const featuredProducts = [
  { id: "shastradhari-maharaj-coloured", name: "Shastradhari Maharaj", price: "Rs 5,100", image: productStatue1, category: "Statues" },
  { id: "ashwarudh-maharaj", name: "Ashwarudh Maharaj", price: "Rs 12,850", image: productStatue2, category: "Statues" },
  { id: "royal-khanjar-with-sheath", name: "Royal Khanjar", price: "Rs 8,500", image: productWeapon1, category: "Weapons" },
  { id: "brass-dhoop-stand", name: "Brass Dhoop Stand", price: "Rs 2,200", image: productDhoop1, category: "Dhoop" },
];

const heroSlides = [
  {
    image: heroBanner1,
    line1: "Crafting Heritage",
    line2: "Into Art",
    subtitle:
      "Sign boards, metal art, LED signage and CNC designs handcrafted with the spirit of Maratha tradition and modern precision.",
  },
  {
    image: heroBanner2,
    line1: "Warrior Legacy",
    line2: "Reimagined",
    subtitle:
      "Authentic Maratha-inspired aesthetics fused with modern craftsmanship for premium spaces and proud collections.",
  },
  {
    image: heroBanner3,
    line1: "Timeless Culture",
    line2: "Modern Vision",
    subtitle:
      "From heritage artifacts to custom statement pieces, each creation carries tradition, precision, and visual impact.",
  },
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const activeSlide = heroSlides[currentSlide];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative isolate min-h-[72vh] overflow-hidden md:min-h-[86vh]">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt="Shivray Arts banner"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            width={1920}
            height={1080}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,8,28,0.58)_0%,rgba(54,0,13,0.84)_60%,rgba(29,0,9,0.95)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b0017]/30 via-transparent to-[#26000f]/70" />

        <div className="pointer-events-none absolute left-0 top-0 h-48 w-48 rounded-br-[110px] border-b border-r border-[#c08b3a]/45 bg-[radial-gradient(circle_at_top_left,rgba(212,162,68,0.32)_0%,rgba(212,162,68,0)_65%)] md:h-72 md:w-72" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-bl-[110px] border-b border-l border-[#c08b3a]/45 bg-[radial-gradient(circle_at_top_right,rgba(212,162,68,0.32)_0%,rgba(212,162,68,0)_65%)] md:h-72 md:w-72" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-tr-[90px] border-r border-t border-[#c08b3a]/35 bg-[radial-gradient(circle_at_bottom_left,rgba(212,162,68,0.24)_0%,rgba(212,162,68,0)_65%)] md:h-56 md:w-56" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-tl-[90px] border-l border-t border-[#c08b3a]/35 bg-[radial-gradient(circle_at_bottom_right,rgba(212,162,68,0.24)_0%,rgba(212,162,68,0)_65%)] md:h-56 md:w-56" />

        <div className="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-6xl items-center justify-center px-4 py-20 text-center md:min-h-[86vh]">
          <div className="max-w-4xl">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.42em] text-[#e0a82d] md:text-sm">
              Premium Craftsmanship Since 2015
            </p>
            <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.95] text-[#f4eee5] md:text-7xl lg:text-8xl">
              {activeSlide.line1}
            </h1>
            <h2 className="mt-2 font-heading text-5xl font-semibold leading-[0.95] text-[#e0a82d] md:text-7xl lg:text-8xl">
              {activeSlide.line2}
            </h2>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-[#efe4d5]/90 md:text-2xl">
              {activeSlide.subtitle}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex min-w-64 items-center justify-center gap-2 rounded-md bg-[#e0a82d] px-8 py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-[#291006] transition-all hover:brightness-110"
              >
                Explore Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-w-64 items-center justify-center rounded-md border border-[#d7a43f] bg-transparent px-8 py-3.5 font-heading text-sm font-semibold uppercase tracking-wider text-[#f6d37d] transition-colors hover:bg-[#d7a43f]/10"
              >
                Get Custom Design
              </Link>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
          }
          className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-[#d7a43f]/40 bg-[#2a0010]/40 p-2 text-[#f6d37d] transition-colors hover:bg-[#2a0010]/70 md:block"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-[#d7a43f]/40 bg-[#2a0010]/40 p-2 text-[#f6d37d] transition-colors hover:bg-[#2a0010]/70 md:block"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-[#e0a82d]" : "w-2.5 bg-[#e7c67a]/45"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
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
                to="/products/$productId"
                params={{ productId: product.id }}
                className="group block h-full overflow-hidden rounded-lg border border-border bg-background shadow-heritage transition-all duration-300 hover:border-gold/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">The Story Behind Shivray</h2>
            <div className="w-24 h-1 bg-gold mx-auto mt-3" />
            <p className="mt-4 text-muted-foreground font-display italic text-lg">A Journey Through Time: Building Innovation, Preserving Tradition</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden shadow-heritage">
              <img src={aboutCraftsman} alt="Artisan at work" loading="lazy" width={800} height={600} className="w-full h-80 object-cover" />
            </div>
            <div className="space-y-6">
              {[
                { title: "The Beginning", text: "Rooted in deep cultural passion, Shivray began its journey to revive the legacy of traditional weaponry - fusing timeless craftsmanship with a modern outlook." },
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
            Each piece reflects the soul of Indian heritage - carefully curated with precision, pride, and timeless skills passed through generations.
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
