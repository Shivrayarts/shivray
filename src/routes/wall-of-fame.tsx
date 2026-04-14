import { createFileRoute } from "@tanstack/react-router";
import { Award, Star } from "lucide-react";

export const Route = createFileRoute("/wall-of-fame")({
  component: WallOfFamePage,
  head: () => ({
    meta: [
      { title: "Wall of Fame — Rudra Arts & Handicrafts" },
      { name: "description", content: "Moments of pride — presentations to India's leaders and recognitions earned by Rudra Arts & Handicrafts." },
      { property: "og:title", content: "Wall of Fame — Rudra Arts & Handicrafts" },
      { property: "og:description", content: "Recognitions and proud moments of Rudra Arts." },
    ],
  }),
});

const moments = [
  {
    title: "Hon. President of India",
    desc: "We were privileged to present our handcrafted talwar to the Honorable President of India, a moment of great pride for our artisans and tradition.",
    image: "https://www.rudraartsandhandicrafts.in/images/IMG-20250617-WA0022.jpg",
  },
  {
    title: "Hon. Prime Minister Shri Narendra Modi",
    desc: "A special moment where legacy and leadership come together, showing mutual respect and a shared vision for preserving cultural heritage.",
    image: "https://www.rudraartsandhandicrafts.in/images/IMG-20250617-WA0007.jpg",
  },
  {
    title: "Hon. NCP Party Chief Shri Sharad Pawar",
    desc: "Presenting our handcrafted artifacts to one of India's most respected political leaders.",
    image: "https://www.rudraartsandhandicrafts.in/images/IMG-20250617-WA0012.jpg",
  },
];

const awards = [
  "National Handicraft Excellence Award",
  "Maharashtra Cultural Heritage Recognition",
  "Best Traditional Artisan — Pune Chamber of Commerce",
  "Featured in Pune Mirror & Maharashtra Times",
];

function WallOfFamePage() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground py-16 md:py-20 text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Wall of Fame</h1>
        <div className="w-24 h-1 bg-gold mx-auto mt-3" />
        <p className="mt-4 font-display italic text-lg opacity-90">Where Legacy Meets Leadership</p>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-12">Moments of Pride</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {moments.map((m) => (
              <div key={m.title} className="bg-card rounded-lg overflow-hidden shadow-heritage border border-border group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={m.image} alt={m.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-semibold">{m.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card bg-heritage-pattern">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Award className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">Recognitions & Awards</h2>
          <div className="space-y-4">
            {awards.map((a) => (
              <div key={a} className="flex items-center gap-3 bg-background rounded-lg p-4 shadow-heritage border border-border">
                <Star className="w-5 h-5 text-gold shrink-0" />
                <span className="text-sm font-medium">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
