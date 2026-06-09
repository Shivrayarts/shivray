import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@/lib/spa-router";
import { useStoredHomeContent } from "@/lib/content-store";
import { resolveLocalizedText, useLanguage } from "@/lib/language";

export default function BlogDetailPage({ blogId }: { blogId: string }) {
  const { resolvedLocale } = useLanguage();
  const { blogPosts } = useStoredHomeContent();
  const [showMissingState, setShowMissingState] = useState(false);
  const post = blogPosts.find((item) => item.id === blogId);
  const contentText = post ? resolveLocalizedText(post.content ?? "", resolvedLocale).trim() : "";
  const excerptText = post ? resolveLocalizedText(post.excerpt, resolvedLocale).trim() : "";
  const storyContent = contentText || excerptText;

  useEffect(() => {
    if (post || blogPosts.length > 0) {
      setShowMissingState(false);
      return;
    }

    const timer = window.setTimeout(() => setShowMissingState(true), 3500);
    return () => window.clearTimeout(timer);
  }, [blogPosts.length, post]);

  if (!post) {
    if (blogPosts.length === 0 && !showMissingState) {
      return (
        <section className="bg-[#f7f1e7] px-4 py-16 md:px-6 md:py-24">
          <div className="layout-shell overflow-hidden rounded-[30px] border border-[#eadbc8] bg-white shadow-[0_24px_60px_-40px_rgba(70,36,15,0.3)]">
            <div className="aspect-[16/7] animate-pulse bg-[#efe6d9]" />
            <div className="space-y-5 p-6 md:p-10">
              <div className="h-6 w-32 animate-pulse rounded-full bg-[#f7efe4]" />
              <div className="h-12 w-3/4 animate-pulse rounded-full bg-[#eadfce]" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-[#f2e7d8]" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#f2e7d8]" />
                <div className="h-4 w-4/6 animate-pulse rounded-full bg-[#f2e7d8]" />
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="bg-[#f7f1e7] px-4 py-16 md:px-6 md:py-24">
        <div className="layout-shell rounded-[30px] border border-[#eadbc8] bg-white p-8 text-center shadow-[0_24px_60px_-40px_rgba(70,36,15,0.3)]">
          <h1 className="font-heading text-3xl text-[#34180e]">
            {resolvedLocale === "mr" ? "ब्लॉग सापडला नाही" : "Blog not found"}
          </h1>
          <p className="mt-3 text-[#6c4b33]">
            {resolvedLocale === "mr" ? "ही कथा उपलब्ध नाही." : "This story is not available."}
          </p>
          <Link
            to="/blog"
            className="mt-6 inline-flex rounded-full bg-[#34180e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
          >
            {resolvedLocale === "mr" ? "ब्लॉगकडे परत जा" : "Back to Blog"}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-[#f7f1e7] pb-12 md:pb-16">
      <section className="px-4 pt-8 md:px-6 md:pt-12">
        <div className="layout-shell">
          <Link to="/blog" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b4d1d]">
            {resolvedLocale === "mr" ? "ब्लॉगकडे परत जा" : "Back to Blog"}
          </Link>
          <article className="mt-4 overflow-hidden rounded-[30px] border border-[#eadbc8] bg-white shadow-[0_24px_60px_-40px_rgba(70,36,15,0.3)]">
            {post.image ? (
              <div className="aspect-[16/7] overflow-hidden bg-[#f7f1e7]">
                <img
                  src={post.image}
                  alt={resolveLocalizedText(post.title, resolvedLocale)}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="p-6 md:p-10">
              <span className="inline-flex rounded-full bg-[#f7efe4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b4d1d]">
                {resolveLocalizedText(post.tag, resolvedLocale) || "Latest"}
              </span>
              <h1 className="mt-4 font-heading text-3xl leading-tight text-[#34180e] md:text-5xl">
                {resolveLocalizedText(post.title, resolvedLocale)}
              </h1>
              <div className="mt-6 space-y-4 text-base leading-8 text-[#6c4b33] md:text-lg">
                {storyContent
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={`${post.id}-paragraph-${index}`}>{paragraph}</p>
                  ))}
              </div>
              {post.href ? (
                <a
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e]"
                >
                  {resolvedLocale === "mr" ? "मूळ लिंक उघडा" : "Open Source Link"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
