import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Target, Flame, History, Award } from "lucide-react";
import aboutCraftsman from "@/assets/about-craftsman.jpg";
import logoImg from "@/assets/logo.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — Rudra Arts & Handicrafts" },
      { name: "description", content: "Learn about India's premier studio for authentic Maratha heritage craftsmanship, our mission, and the artisans behind every creation." },
      { property: "og:title", content: "About Us — Rudra Arts & Handicrafts" },
      { property: "og:description", content: "Discover the story behind Rudra Arts & Handicrafts." },
    ],
  }),
});

function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28 text-center bg-heritage-pattern">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold">
            Chhatrapati's Legacy in Every Creation
          </h1>
          <div className="w-24 h-1 bg-gold mx-auto mt-4" />
          <p className="mt-6 text-lg font-display italic opacity-90">
            India's premier studio for authentic statues of Chhatrapati Shivaji Maharaj and Maratha weapons. Specializing in miniatures, statues, and historical replicas.
          </p>
        </div>
      </section>

      {/* MD Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden shadow-heritage">
              <img src={aboutCraftsman} alt="Artisan at work" loading="lazy" width={800} height={600} className="w-full h-96 object-cover" />
            </div>
            <div>
              <span className="text-gold font-heading text-sm uppercase tracking-widest">Managing Director</span>
              <h2 className="font-heading text-3xl font-bold text-foreground mt-2">Satyajeet Arun Vaidya</h2>
              <div className="w-16 h-1 bg-gold mt-3" />
              <p className="mt-6 text-muted-foreground leading-relaxed">
                With a deep-rooted passion for preserving India's martial heritage, Satyajeet Vaidya founded Rudra Arts & Handicrafts to bridge the gap between history and modern craftsmanship. His vision has transformed traditional art forms into contemporary collectibles, earning recognition at the national level.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Under his leadership, Rudra Arts has presented handcrafted replicas to some of India's most distinguished leaders, cementing the studio's reputation as a custodian of warrior tradition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 bg-card bg-heritage-pattern">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Our Mission</h2>
            <div className="w-24 h-1 bg-gold mx-auto mt-3" />
            <p className="mt-4 text-muted-foreground font-display italic text-lg">
              To preserve the warrior ethos through historically accurate recreations
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Historical Precision", desc: "Every detail follows documented accounts of Maratha warriors' equipment." },
              { icon: Flame, title: "Warrior's Spirit", desc: "Infusing each creation with the dedication of our ancestors." },
              { icon: History, title: "Cultural Continuity", desc: "Connecting modern generations with martial traditions." },
              { icon: Award, title: "Artisanal Excellence", desc: "Employing traditional techniques passed down through generations." },
            ].map((item) => (
              <div key={item.title} className="bg-background rounded-lg p-6 text-center shadow-heritage border border-border">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-heading text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Authentic Craftsmanship</h2>
          <div className="w-24 h-1 bg-gold mx-auto mt-3" />
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Our artisans employ traditional techniques passed down through generations, ensuring each piece carries the weight of history and the warmth of human touch.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {["Hand-Forged Metals", "Traditional Joinery", "Historical Accuracy", "Artisanal Detailing"].map((item) => (
              <div key={item} className="bg-card rounded-lg p-6 shadow-heritage border border-border">
                <div className="w-3 h-3 rounded-full bg-gold mx-auto mb-3" />
                <p className="font-heading text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold">Explore Our Collections</h2>
          <p className="mt-4 font-display italic opacity-90">Discover pieces that speak of valor, legacy, and artistry</p>
          <Link to="/products" className="mt-8 inline-flex items-center gap-2 bg-gold text-gold-foreground px-8 py-3.5 rounded-md font-heading text-sm font-semibold uppercase tracking-wider hover:brightness-110 transition-all">
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
