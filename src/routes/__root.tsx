import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import FloatingActions from "@/components/FloatingActions";
import logoImg from "@/assets/logo-dark.jpg";
import { siteConfig } from "@/lib/site-config";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-heading">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground font-heading">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 font-heading uppercase tracking-wider"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { title: "Shivray" },
      { name: "description", content: "India's premier studio for authentic Maratha heritage craftsmanship - statues, weapons, and historical replicas." },
      { name: "author", content: "Shivray" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Shivray" },
      { name: "twitter:title", content: "Shivray" },
      { property: "og:description", content: "India's premier studio for authentic Maratha heritage craftsmanship - statues, weapons, and historical replicas." },
      { name: "twitter:description", content: "India's premier studio for authentic Maratha heritage craftsmanship - statues, weapons, and historical replicas." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/placeholder.svg",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [preloaderPhase, setPreloaderPhase] = useState<"show" | "exit" | "hidden">("show");
  const location = useLocation();
  const hideFooter = location.pathname.startsWith("/admin");

  useEffect(() => {
    let hasStartedExit = false;
    let exitTimer: number | undefined;
    let hiddenTimer: number | undefined;

    const hideLoader = () => {
      if (hasStartedExit) return;
      hasStartedExit = true;

      exitTimer = window.setTimeout(() => {
        setPreloaderPhase("exit");
        hiddenTimer = window.setTimeout(() => {
          setPreloaderPhase("hidden");
        }, 750);
      }, 350);
    };

    // Never let the app stay blocked behind the preloader if the browser
    // keeps waiting on late resources or emits noisy console warnings.
    const failSafeTimer = window.setTimeout(hideLoader, 1400);

    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader, { once: true });
    }

    return () => {
      window.clearTimeout(failSafeTimer);
      if (exitTimer) window.clearTimeout(exitTimer);
      if (hiddenTimer) window.clearTimeout(hiddenTimer);
      window.removeEventListener("load", hideLoader);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className={`fixed inset-0 z-[120] flex items-center justify-center transition-opacity duration-500 ${
          preloaderPhase === "hidden" ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        }`}
        aria-hidden={preloaderPhase === "hidden"}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(159,26,52,0.58)_0%,rgba(50,0,16,0.92)_58%,rgba(24,0,10,0.98)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_15%,rgba(255,218,128,0.08)_50%,transparent_85%)] animate-[pulse_2.8s_ease-in-out_infinite]" />

        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 w-1/2 bg-[#230009] transition-transform duration-700 ease-in-out ${
              preloaderPhase === "exit" ? "-translate-x-full" : "translate-x-0"
            }`}
          />
          <div
            className={`absolute inset-y-0 right-0 w-1/2 bg-[#230009] transition-transform duration-700 ease-in-out ${
              preloaderPhase === "exit" ? "translate-x-full" : "translate-x-0"
            }`}
          />
        </div>

        <div
          className={`relative z-10 flex flex-col items-center transition-all duration-500 ${
            preloaderPhase === "exit" ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}
        >
          <div className="relative flex h-36 w-36 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-gold/30 border-t-gold animate-[spin_3.8s_linear_infinite]" />
            <span className="absolute inset-4 rounded-full border border-gold/25 animate-pulse" />
            <img
              src={logoImg}
              alt="Shivray"
              className="h-24 w-24 rounded-full object-cover ring-2 ring-gold/50 md:h-28 md:w-28"
            />
          </div>
          <p className="mt-5 font-heading text-sm tracking-[0.28em] text-gold/95">
            Shivray
          </p>
          <p className="mt-2 max-w-[16rem] text-center text-[11px] font-semibold tracking-[0.08em] text-[#f8deae]">
            {siteConfig.brandTagline}
          </p>
        </div>
      </div>
      <Header />
      <main className="mobile-webapp-main flex-1">
        <Outlet />
      </main>
      {hideFooter ? null : <Footer />}
      <MobileTabBar />
      <FloatingActions />
    </div>
  );
}
