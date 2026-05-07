import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";

const WHATSAPP_URL = `${siteConfig.whatsappHref}?text=Hi%20Shivray%2C%20I%20want%20to%20know%20more%20about%20your%20products.`;

export default function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { resolvedLocale } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 md:bottom-6 md:right-6">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={resolvedLocale === "mr" ? "व्हॉट्सअॅपवर चॅट करा" : "Chat on WhatsApp"}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:brightness-105"
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="h-6 w-6 fill-current"
        >
          <path d="M13.601 2.326A7.85 7.85 0 0 0 8.004 0C3.58 0 0 3.58 0 8c0 1.386.36 2.74 1.044 3.938L0 16l4.188-1.028A7.96 7.96 0 0 0 8 16h.003c4.422 0 8-3.58 8-8 0-2.136-.832-4.144-2.399-5.674Zm-5.6 12.306a6.63 6.63 0 0 1-3.388-.933l-.244-.145-2.486.61.663-2.426-.159-.249a6.62 6.62 0 0 1-1.015-3.52c.002-3.66 2.98-6.638 6.64-6.638a6.6 6.6 0 0 1 4.69 1.942 6.58 6.58 0 0 1 1.94 4.693c-.002 3.66-2.98 6.638-6.64 6.638Zm3.63-4.957c-.197-.099-1.17-.578-1.352-.644-.181-.066-.313-.099-.446.099-.132.198-.511.643-.627.775-.116.132-.23.149-.428.05-.197-.1-.833-.307-1.588-.98-.588-.524-.985-1.17-1.1-1.368-.116-.198-.012-.305.087-.404.089-.088.198-.23.297-.346.099-.116.132-.198.198-.33.066-.132.033-.248-.017-.347-.05-.099-.445-1.074-.61-1.47-.161-.387-.325-.334-.446-.34a7.22 7.22 0 0 0-.38-.007c-.132 0-.347.05-.528.248-.181.198-.693.677-.693 1.65 0 .974.71 1.915.809 2.048.099.132 1.393 2.128 3.376 2.984.472.204.84.326 1.127.417.474.151.905.13 1.246.079.38-.057 1.17-.478 1.336-.94.165-.462.165-.858.115-.94-.05-.083-.181-.133-.379-.232Z" />
        </svg>
      </a>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label={resolvedLocale === "mr" ? "वर जा" : "Back to top"}
        className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
