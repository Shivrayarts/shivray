import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog - Shivray" },
      { name: "description", content: "Read stories about Maratha heritage, traditional craftsmanship, and the artisans behind Shivray." },
      { property: "og:title", content: "Blog - Shivray" },
      { property: "og:description", content: "Stories of heritage, craft, and cultural preservation." },
    ],
  }),
});

const articles = [
  {
    title: "A Slice of Inspiring History",
    excerpt: "The great Marathas fought many battles - some of which they won and others they did not. However, the courage and valor they displayed continues to inspire generations...",
    image: "https://res.cloudinary.com/dxpf6dhn1/image/upload/v1752514959/Rudra-artss/walhtwc7v2de5qr627mw.png",
    tag: "Latest",
  },
  {
    title: "Sharpened Respect of Heritage",
    excerpt: "Satyajeet Vaidya is doing more than just designing and making swords. He is preserving centuries of martial tradition through meticulous craftsmanship and historical research...",
    image: "https://res.cloudinary.com/dxpf6dhn1/image/upload/v1752515275/Rudra-artss/k8jss6bqidc2koiseyno.jpg",
    tag: "Latest",
  },
  {
    title: "A Podcast with Gatha Yashyachi",
    excerpt: "A tale of toil, a tale of simplicity. India - a living legend born out of the sacred flames of tradition and innovation...",
    image: "https://res.cloudinary.com/dquyimnmd/image/upload/v1753468714/Rudra-artss/kiuo1hcileihnnycpwo1.jpg",
    tag: "Video",
  },
];

const videos = [
  { title: "Shivkalin Shastranche Aajche Shilpakar", desc: "Satyajit Arun Vaidya shares his journey from passion to profession in historical weapon crafting.", url: "https://youtu.be/xh-ibz0qxaA" },
  { title: "Bhetarupi Aitihasik Shastra Banavnare Satyajeet Vaidya", desc: "Historic weapons as gifts - Satyajeet Vaidya from Pune revives the art of traditional weaponry.", url: "https://youtu.be/2alkiZgDxMI" },
  { title: "Puratan Shastrancha Itihas Jopasanara Kalakar Mavala", desc: "A young artisan keeps alive the martial heritage of Chhatrapati Shivaji Maharaj's era.", url: "https://youtu.be/WpBQTatwZhs" },
];

function BlogPage() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground py-16 md:py-20 text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold">News & Stories</h1>
        <div className="w-24 h-1 bg-gold mx-auto mt-3" />
        <p className="mt-4 font-display italic text-lg opacity-90">Discover the rich heritage behind handcrafted art</p>
      </section>

      {/* Articles */}
      <section className="py-16 md:py-24">
        <div className="w-full px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">Latest Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.title} className="bg-card rounded-lg overflow-hidden shadow-heritage border border-border group">
                <div className="aspect-video overflow-hidden">
                  <img src={article.image} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium uppercase tracking-wider text-gold bg-gold/10 px-2 py-1 rounded">{article.tag}</span>
                  <h3 className="font-heading text-lg font-semibold mt-3">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{article.excerpt}</p>
                  <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="py-16 md:py-24 bg-card bg-heritage-pattern">
        <div className="w-full px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.title} className="bg-background rounded-lg p-6 shadow-heritage border border-border">
                <div className="flex items-start gap-3 mb-3">
                  <PlayCircle className="w-6 h-6 text-gold shrink-0 mt-0.5" />
                  <h3 className="font-heading text-base font-semibold leading-snug">{video.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{video.desc}</p>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold hover:gap-2 transition-all"
                >
                  Watch Now <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

