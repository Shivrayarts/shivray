import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "en" | "mr";

export type LocalizedText = {
  en: string;
  mr: string;
};

type TranslatableText = string | LocalizedText;

type LanguageContextValue = {
  locale: Locale;
  resolvedLocale: Locale;
  hasChosenLanguage: boolean;
  setLocale: (locale: Locale) => void;
  chooseLanguage: (locale: Locale) => void;
};

const LANGUAGE_KEY = "shivray-language";
const LANGUAGE_SEEN_KEY = "shivray-language-seen";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const value = window.localStorage.getItem(LANGUAGE_KEY);
  return value === "mr" ? "mr" : "en";
}

function getHasChosenLanguage() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(LANGUAGE_SEEN_KEY) === "true";
}

export function resolveLocalizedText(value: TranslatableText, locale: Locale) {
  if (typeof value === "string") return value;
  return value[locale] || value.en || value.mr;
}

export function getSearchableText(value: TranslatableText) {
  if (typeof value === "string") return value;
  return `${value.en} ${value.mr}`;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());
  const [hasChosenLanguage, setHasChosenLanguage] = useState(() => getHasChosenLanguage());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANGUAGE_KEY, locale);
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_KEY, nextLocale);
    }
  };

  const chooseLanguage = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setHasChosenLanguage(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_SEEN_KEY, "true");
    }
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      resolvedLocale: locale ?? "en",
      hasChosenLanguage,
      setLocale,
      chooseLanguage,
    }),
    [hasChosenLanguage, locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("LanguageProvider is required");
  }

  return context;
}

