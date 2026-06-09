declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: Window["fbq"];
  }
}

const DEFAULT_GOOGLE_TAG_ID = "G-DZM6VCZXB6";
let activeGoogleTagId = "";

function appendScript(src: string) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[src="${src}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (typeof window === "undefined") return;

  const googleTagId = import.meta.env.VITE_GOOGLE_TAG_ID || DEFAULT_GOOGLE_TAG_ID;
  activeGoogleTagId = googleTagId;
  if (googleTagId) {
    appendScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleTagId)}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
    window.gtag("js", new Date());
    window.gtag("config", googleTagId, { send_page_view: false });
  }

  const facebookPixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;
  if (facebookPixelId && !window.fbq) {
    ((f, b, e, v) => {
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) {
          fbq.callMethod(...args);
        } else {
          fbq.queue?.push(args);
        }
      } as Window["fbq"];

      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      f.fbq = fbq;
      if (!f._fbq) f._fbq = fbq;

      appendScript(v);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq?.("init", facebookPixelId);
    window.fbq?.("track", "PageView");
  }
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined") return;
  if (!activeGoogleTagId || typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
    send_to: activeGoogleTagId,
  });
}

export function scheduleAnalyticsInit() {
  if (typeof window === "undefined") return;

  let initialized = false;

  const run = () => {
    if (initialized) return;
    initialized = true;
    initAnalytics();
  };

  const schedule = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 4000 });
      return;
    }

    window.setTimeout(run, 1800);
  };

  if (document.readyState === "complete") {
    schedule();
    return;
  }

  window.addEventListener("load", schedule, { once: true });
}
