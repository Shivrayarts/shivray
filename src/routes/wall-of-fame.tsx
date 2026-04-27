import { createFileRoute } from "@tanstack/react-router";
import { Award, Star } from "lucide-react";

export const Route = createFileRoute("/wall-of-fame")({
  component: WallOfFamePage,
  head: () => ({
    meta: [
      { title: "Wall of Fame - Shivray" },
      { name: "description", content: "Moments of pride - presentations to India's leaders and recognitions earned by Shivray." },
      { property: "og:title", content: "Wall of Fame - Shivray" },
      { property: "og:description", content: "Recognitions and proud moments of Shivray." },
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
  "Best Traditional Artisan - Pune Chamber of Commerce",
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
        <div className="w-full px-4">
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
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-2xl border border-gold/20 bg-background/90 backdrop-blur-sm shadow-heritage p-6 md:p-10">
            <div className="text-center mb-8 md:mb-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                <Award className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mt-5">Recognitions & Awards</h2>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                Honors that celebrate our dedication to heritage craftsmanship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {awards.map((a) => (
                <div
                  key={a}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 md:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg"
                >
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-sm md:text-base font-medium leading-relaxed text-foreground">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

