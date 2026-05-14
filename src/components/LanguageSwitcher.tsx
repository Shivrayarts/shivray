import { useLanguage } from "@/lib/language";

export default function LanguageSwitcher({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[#d8b48b] bg-white/90 p-1 font-semibold ${
        compact ? "min-h-9 text-xs" : "min-h-10 text-xs xl:min-h-11 2xl:min-h-12 2xl:text-sm"
      } ${className}`.trim()}
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1.5 transition xl:px-3.5 xl:py-2 2xl:px-4 ${
          locale === "en" ? "bg-[#34180e] text-white" : "text-[#6c4b33]"
        } ${compact ? "px-2.5 py-1" : ""}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("mr")}
        className={`rounded-full px-3 py-1.5 transition xl:px-3.5 xl:py-2 2xl:px-4 ${
          locale === "mr" ? "bg-[#34180e] text-white" : "text-[#6c4b33]"
        } ${compact ? "px-2.5 py-1" : ""}`}
      >
        मराठी
      </button>
    </div>
  );
}
