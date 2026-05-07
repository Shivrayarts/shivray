import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import FloatingActions from "@/components/FloatingActions";
import logoImg from "@/assets/logo-dark.jpg";
import { LanguageProvider, useLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";
import { RouterProvider, useLocation } from "@/lib/spa-router";
import { useAdminAuthState } from "@/lib/admin-auth";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import RequiredCataloguePage from "@/pages/RequiredCataloguePage";
import ContactPage from "@/pages/ContactPage";
import CartPage from "@/pages/CartPage";
import WishlistPage from "@/pages/WishlistPage";
import LoginPage from "@/pages/LoginPage";
import AboutPage from "@/pages/AboutPage";
import BlogPage from "@/pages/BlogPage";
import OurTeamPage from "@/pages/OurTeamPage";
import WallOfFamePage from "@/pages/WallOfFamePage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminPage from "@/pages/AdminPage";

function AppShell() {
  const location = useLocation();
  const { chooseLanguage, hasChosenLanguage, resolvedLocale } = useLanguage();
  const { authenticated: isAdminAuthed, resolved: adminAuthResolved } = useAdminAuthState();
  const [preloaderPhase, setPreloaderPhase] = useState<"show" | "exit" | "hidden">("show");
  const isAdminRoute =
    location.pathname === "/admin" || location.pathname === "/admin-login";
  const hideFooter = isAdminRoute;
  const shouldRenderPreloader = !isAdminRoute && preloaderPhase !== "hidden";
  const shouldShowLanguageChooser = !isAdminRoute && preloaderPhase === "hidden" && !hasChosenLanguage;

  const page = useMemo(() => {
    if (location.pathname === "/") {
      return { title: "Shivray Arts", node: <HomePage /> };
    }
    if (location.pathname === "/products") {
      return { title: "Products - Shivray Arts", node: <ProductsPage /> };
    }
    if (location.pathname.startsWith("/products/")) {
      const productId = decodeURIComponent(location.pathname.replace("/products/", ""));
      return { title: "Product Details - Shivray Arts", node: <ProductDetailPage productId={productId} /> };
    }
    if (location.pathname === "/required-catalogue") {
      return { title: "Required Catalogue - Shivray Arts", node: <RequiredCataloguePage /> };
    }
    if (location.pathname === "/contact") {
      return { title: "Contact - Shivray Arts", node: <ContactPage /> };
    }
    if (location.pathname === "/cart") {
      return { title: "Cart - Shivray Arts", node: <CartPage /> };
    }
    if (location.pathname === "/wishlist") {
      return { title: "Wishlist - Shivray Arts", node: <WishlistPage /> };
    }
    if (location.pathname === "/login") {
      return { title: "Login - Shivray Arts", node: <LoginPage /> };
    }
    if (location.pathname === "/about") {
      return { title: "About Us - Shivray Arts", node: <AboutPage /> };
    }
    if (location.pathname === "/blog") {
      return { title: "Blog - Shivray Arts", node: <BlogPage /> };
    }
    if (location.pathname === "/our-team") {
      return { title: "Our Team - Shivray Arts", node: <OurTeamPage /> };
    }
    if (location.pathname === "/wall-of-fame") {
      return { title: "Wall of Fame - Shivray Arts", node: <WallOfFamePage /> };
    }
    if (location.pathname === "/admin") {
      if (!adminAuthResolved) {
        return {
          title: "Checking Admin Session - Shivray Arts",
          node: (
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
              <div className="rounded-[28px] border border-[#eadbc8] bg-white px-8 py-10 text-center shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">Admin</p>
                <h1 className="mt-3 font-heading text-3xl text-[#34180e]">Checking your session</h1>
                <p className="mt-3 text-sm text-[#6c4b33]">Connecting to the admin backend before loading the dashboard.</p>
              </div>
            </div>
          ),
        };
      }
      if (!isAdminAuthed) {
        return { title: "Admin Login - Shivray Arts", node: <AdminLoginPage /> };
      }
      return { title: "Admin - Shivray Arts", node: <AdminPage /> };
    }
    if (location.pathname === "/admin-login") {
      return { title: "Admin Login - Shivray Arts", node: <AdminLoginPage /> };
    }

    return {
      title: "Page Not Found - Shivray Arts",
      node: (
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
          <div className="max-w-md text-center">
            <h1 className="font-heading text-6xl text-[#34180e]">404</h1>
            <p className="mt-4 text-[#6c4b33]">The page you're looking for does not exist.</p>
            <a
              href="/"
              className="mt-6 inline-flex rounded-full bg-[#34180e] px-6 py-3 text-sm font-semibold text-white"
            >
              Go Home
            </a>
          </div>
        </div>
      ),
    };
  }, [adminAuthResolved, isAdminAuthed, location.pathname]);

  useEffect(() => {
    document.title = page.title;
  }, [page.title]);

  useEffect(() => {
    let hasStartedExit = false;
    let exitTimer: number | undefined;
    let hiddenTimer: number | undefined;

    const hideLoader = () => {
      if (hasStartedExit) return;
      hasStartedExit = true;

      exitTimer = window.setTimeout(() => {
        setPreloaderPhase("exit");
        hiddenTimer = window.setTimeout(() => setPreloaderPhase("hidden"), 750);
      }, 350);
    };

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.href]);

  return (
    <div className="min-h-screen flex flex-col">
      {shouldRenderPreloader ? (
        <div
          className={`fixed inset-0 z-[120] flex items-center justify-center transition-opacity duration-500 ${
            preloaderPhase === "exit" ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
          }`}
          aria-hidden={preloaderPhase === "exit"}
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
              preloaderPhase === "exit" ? "scale-90 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <div className="relative flex h-36 w-36 items-center justify-center">
              <span className="absolute inset-0 animate-[spin_3.8s_linear_infinite] rounded-full border-2 border-gold/30 border-t-gold" />
              <span className="absolute inset-4 rounded-full border border-gold/25 animate-pulse" />
              <img src={logoImg} alt="Shivray Arts" className="h-24 w-24 rounded-full object-cover ring-2 ring-gold/50 md:h-28 md:w-28" />
            </div>
            <p className="mt-5 font-heading text-sm tracking-[0.28em] text-gold/95">Shivray Arts</p>
            <p className="mt-2 max-w-[16rem] text-center text-[11px] font-semibold tracking-[0.08em] text-[#f8deae]">
              {siteConfig.brandTagline[resolvedLocale]}
            </p>
          </div>
        </div>
      ) : null}
      {shouldShowLanguageChooser ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(19,6,3,0.88)] px-4 py-8">
          <div className="w-full max-w-xl rounded-[32px] border border-[#d8b48b] bg-[linear-gradient(180deg,#fff8ee_0%,#f8efe1_100%)] p-6 text-center shadow-[0_34px_90px_-45px_rgba(0,0,0,0.9)] md:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d8b48b] bg-white/80">
              <img src={logoImg} alt="Shivray Arts" className="h-16 w-16 rounded-full object-cover" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#a86c2b]">
              Select language
            </p>
            <h1 className="mt-3 font-heading text-4xl text-[#34180e]">Choose your language</h1>
            <p className="mt-3 text-sm leading-6 text-[#6c4b33]">
              English is the default experience. You can also continue in Marathi and change it later from the website header.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseLanguage("en")}
                className="rounded-[26px] border border-[#d8b48b] bg-white px-6 py-5 text-left shadow-[0_16px_40px_-32px_rgba(70,36,15,0.5)] transition hover:-translate-y-0.5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a86c2b]">English</p>
                <h2 className="mt-2 font-heading text-2xl text-[#34180e]">Continue in English</h2>
                <p className="mt-2 text-sm text-[#6c4b33]">Open the full website with English labels, products, and browsing content.</p>
              </button>
              <button
                type="button"
                onClick={() => chooseLanguage("mr")}
                className="rounded-[26px] border border-[#d8b48b] bg-[#34180e] px-6 py-5 text-left text-white shadow-[0_16px_40px_-32px_rgba(70,36,15,0.6)] transition hover:-translate-y-0.5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f4c471]">मराठी</p>
                <h2 className="mt-2 font-heading text-2xl text-[#fff5e6]">मराठीत पुढे जा</h2>
                <p className="mt-2 text-sm text-[#f1ddc1]">वेबसाइट मराठी मजकूरासह उघडा. नंतर हेडरमधून भाषा बदलता येईल.</p>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdminRoute ? null : <Header />}
      <main className="mobile-webapp-main flex-1">{page.node}</main>
      {hideFooter ? null : <Footer />}
      {isAdminRoute ? null : <MobileTabBar />}
      {isAdminRoute ? null : <FloatingActions />}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider>
        <AppShell />
      </RouterProvider>
    </LanguageProvider>
  );
}
