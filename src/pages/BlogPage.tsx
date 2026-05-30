import { Link } from "@/lib/spa-router";
import { ExternalLink, PlayCircle } from "lucide-react";
import { useStoredHomeContent } from "@/lib/content-store";
import { resolveLocalizedText, useLanguage } from "@/lib/language";

export default function BlogPage() {
  const { resolvedLocale } = useLanguage();
  const { blogPosts, videos } = useStoredHomeContent();

  return (
    <div>
      <section className="bg-primary py-16 text-center text-primary-foreground md:py-20">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">
          {resolvedLocale === "mr" ? "बातम्या आणि कथा" : "News & Stories"}
        </h1>
        <div className="mx-auto mt-3 h-1 w-24 bg-gold" />
      </section>

      {blogPosts.length > 0 ? (
        <section className="py-16 md:py-24">
          <div className="w-full px-4">
            <h2 className="mb-10 text-center font-heading text-2xl font-bold md:text-3xl">
              {resolvedLocale === "mr" ? "ताज्या कथा" : "Latest Stories"}
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {blogPosts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-heritage">
                  <div className="aspect-video overflow-hidden bg-muted">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={resolveLocalizedText(post.title, resolvedLocale)}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <span className="rounded bg-gold/10 px-2 py-1 text-xs font-medium uppercase tracking-wider text-gold">
                      {resolveLocalizedText(post.tag, resolvedLocale) || "Latest"}
                    </span>
                    <h3 className="mt-3 font-heading text-lg font-semibold">
                      {resolveLocalizedText(post.title, resolvedLocale)}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {resolveLocalizedText(post.excerpt, resolvedLocale)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <Link to={`/blog/${encodeURIComponent(post.id)}`} className="inline-flex items-center gap-1 text-sm font-medium text-gold">
                        {resolvedLocale === "mr" ? "अधिक वाचा" : "Read More"}
                      </Link>
                      {post.href ? (
                        <a
                          href={post.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-gold/80"
                        >
                          {resolvedLocale === "mr" ? "मूळ लिंक" : "Source Link"}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-card bg-heritage-pattern py-16 md:py-24">
        <div className="w-full px-4">
          <h2 className="mb-10 text-center font-heading text-2xl font-bold md:text-3xl">
            {resolvedLocale === "mr" ? "फीचर्ड व्हिडिओ" : "Featured Videos"}
          </h2>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {videos.map((video) => (
                <div key={video.id} className="rounded-lg border border-border bg-background p-6 shadow-heritage">
                  <div className="mb-3 flex items-start gap-3">
                    <PlayCircle className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
                    <h3 className="font-heading text-base font-semibold leading-snug">
                      {resolveLocalizedText(video.title, resolvedLocale)}
                    </h3>
                  </div>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {resolveLocalizedText(video.description, resolvedLocale)}
                  </p>
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold"
                  >
                    {resolvedLocale === "mr" ? "आता पाहा" : "Watch Now"}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-background p-6 text-center text-muted-foreground shadow-heritage">
              {resolvedLocale === "mr"
                ? "सध्या कोणतेही व्हिडिओ प्रकाशित केलेले नाहीत."
                : "No videos are published right now."}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
