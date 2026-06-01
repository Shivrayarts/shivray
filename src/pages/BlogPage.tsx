import { ExternalLink, MessageCircle, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "@/lib/spa-router";
import { apiRequest } from "@/lib/api";
import { useStoredHomeContent } from "@/lib/content-store";
import { isValidMessage, isValidName, isValidPhone, normalizeDigits } from "@/lib/form-validation";
import { resolveLocalizedText, useLanguage } from "@/lib/language";

export default function BlogPage() {
  const { resolvedLocale } = useLanguage();
  const { blogPosts, videos } = useStoredHomeContent();
  const [form, setForm] = useState({ name: "", phone: "", title: "", story: "" });
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false, title: false, story: false });
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const isNameValid = isValidName(form.name);
  const isPhoneValid = isValidPhone(form.phone);
  const isTitleValid = form.title.trim().length >= 5;
  const isStoryValid = isValidMessage(form.story, 20);
  const isFormValid = isNameValid && isPhoneValid && isTitleValid && isStoryValid;

  const markAllTouched = () => {
    setTouched({ name: true, phone: true, title: true, story: true });
  };

  const handleSubmitForReview = async () => {
    markAllTouched();
    if (!isFormValid) return;

    setSubmitState("submitting");
    setSubmitMessage("");

    try {
      await apiRequest("/api/blog-submissions", {
        method: "POST",
        body: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          title: form.title.trim(),
          story: form.story.trim(),
          image: imageDataUrl,
        },
      });
      setSubmitState("done");
      setSubmitMessage("Blog submitted for admin review.");
      setForm({ name: "", phone: "", title: "", story: "" });
      setImageDataUrl("");
      setTouched({ name: false, phone: false, title: false, story: false });
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "Unable to submit blog right now.");
    }
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSubmitState("error");
      setSubmitMessage("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result ?? ""));
      setSubmitMessage("");
      setSubmitState("idle");
    };
    reader.onerror = () => {
      setSubmitState("error");
      setSubmitMessage("Unable to read selected image.");
    };
    reader.readAsDataURL(file);
  };

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

      <section className="bg-[#f7f1e7] px-4 py-16 md:px-6 md:py-24">
        <div className="layout-shell">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.3)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
              {resolvedLocale === "mr" ? "तुमची कथा" : "Write Your Blog"}
            </p>
            <h2 className="mt-3 font-heading text-[1.8rem] leading-tight text-[#34180e] md:text-[2.2rem]">
              {resolvedLocale === "mr" ? "तुमची ब्लॉग कथा आमच्यासोबत शेअर करा" : "Share your blog story with us"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6c4b33]">
              {resolvedLocale === "mr"
                ? "तुमचा अनुभव, प्रेरणा किंवा कथा लिहा. आम्ही ती पाहून प्रकाशित करण्यासाठी तुमच्याशी संपर्क करू."
                : "Write your experience, idea, or story. We will review it and contact you before publishing."}
            </p>

            <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="blog-name" className="text-sm font-semibold text-[#34180e]">
                    {resolvedLocale === "mr" ? "नाव" : "Name"}
                  </label>
                  <input
                    id="blog-name"
                    type="text"
                    value={form.name}
                    onBlur={() => setTouched((value) => ({ ...value, name: true }))}
                    onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                    placeholder={resolvedLocale === "mr" ? "तुमचे नाव" : "Your name"}
                    className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.name && !isNameValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                  />
                  {touched.name && !isNameValid ? <p className="mt-2 text-sm text-[#b42318]">Please enter your full name.</p> : null}
                </div>

                <div>
                  <label htmlFor="blog-phone" className="text-sm font-semibold text-[#34180e]">
                    {resolvedLocale === "mr" ? "फोन नंबर" : "Phone Number"}
                  </label>
                  <input
                    id="blog-phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={form.phone}
                    onBlur={() => setTouched((value) => ({ ...value, phone: true }))}
                    onChange={(event) => setForm((value) => ({ ...value, phone: normalizeDigits(event.target.value, 10) }))}
                    placeholder={resolvedLocale === "mr" ? "10 अंकी नंबर" : "Enter 10-digit phone number"}
                    className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.phone && !isPhoneValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                  />
                  {touched.phone && !isPhoneValid ? <p className="mt-2 text-sm text-[#b42318]">Please enter a valid 10-digit phone number.</p> : null}
                </div>
              </div>

              <div>
                <label htmlFor="blog-title" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "ब्लॉग शीर्षक" : "Blog Title"}
                </label>
                <input
                  id="blog-title"
                  type="text"
                  value={form.title}
                  onBlur={() => setTouched((value) => ({ ...value, title: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "तुमच्या कथेचे शीर्षक" : "Title of your story"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.title && !isTitleValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.title && !isTitleValid ? <p className="mt-2 text-sm text-[#b42318]">Please enter at least 5 characters for the title.</p> : null}
              </div>

              <div>
                <label htmlFor="blog-image" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "ब्लॉग प्रतिमा (पर्यायी)" : "Blog Image (optional)"}
                </label>
                <input
                  id="blog-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="mt-2 block w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e]"
                />
                {imageDataUrl ? (
                  <div className="mt-3 rounded-xl border border-[#eadbc8] bg-white p-2">
                    <img src={imageDataUrl} alt="Blog upload preview" className="h-36 w-full rounded-lg object-cover" />
                  </div>
                ) : null}
              </div>

              <div>
                <label htmlFor="blog-story" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "तुमची कथा" : "Your Story"}
                </label>
                <textarea
                  id="blog-story"
                  rows={7}
                  value={form.story}
                  onBlur={() => setTouched((value) => ({ ...value, story: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, story: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "येथे तुमचा ब्लॉग लिहा" : "Write your blog here"}
                  className={`mt-2 w-full resize-none rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.story && !isStoryValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.story && !isStoryValid ? <p className="mt-2 text-sm text-[#b42318]">Please write at least 20 characters.</p> : null}
              </div>

              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={submitState === "submitting"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
              >
                <MessageCircle className="h-4 w-4" />
                {submitState === "submitting" ? "Submitting..." : "Send for Review"}
              </button>
              {submitMessage ? (
                <p className={`text-sm ${submitState === "done" ? "text-[#166534]" : "text-[#b42318]"}`}>{submitMessage}</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>

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
