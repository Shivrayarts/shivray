import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { LanguageProvider } from "@/lib/language";
import { RouterProvider, useLocation } from "@/lib/spa-router";
import { useAdminAuthState } from "@/lib/admin-auth";
import { applySeoMeta } from "@/lib/seo";
import HomePage from "@/pages/HomePage";

const Footer = lazy(() => import("@/components/Footer"));
const MobileTabBar = lazy(() => import("@/components/MobileTabBar"));
const FloatingActions = lazy(() => import("@/components/FloatingActions"));
const Toaster = lazy(() => import("@/components/ui/sonner").then((module) => ({ default: module.Toaster })));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const RequiredCataloguePage = lazy(() => import("@/pages/RequiredCataloguePage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const OurTeamPage = lazy(() => import("@/pages/OurTeamPage"));
const WallOfFamePage = lazy(() => import("@/pages/WallOfFamePage"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin";
  const { authenticated: isAdminAuthed, resolved: adminAuthResolved } = useAdminAuthState(isAdminRoute);
  const hideFooter = isAdminRoute;
  const [showPeripheralUi, setShowPeripheralUi] = useState(false);
  const [showToaster, setShowToaster] = useState(false);

  const page = useMemo(() => {
    if (location.pathname === "/") {
      return {
        title: "Shivray Art | Maratha Heritage Statues, Weapons, and Replicas",
        description:
          "Explore Shivray Art's handcrafted Maratha heritage statues, weapons, shields, and historical replicas from Pune.",
        canonicalPath: "/",
        node: <HomePage />,
      };
    }
    if (location.pathname === "/products") {
      return {
        title: "Products | Shivray Art",
        description: "Browse handcrafted statues, weapons, shields, and heritage pieces by Shivray Art.",
        canonicalPath: "/products",
        node: <ProductsPage />,
      };
    }
    if (location.pathname.startsWith("/products/")) {
      const productId = decodeURIComponent(location.pathname.replace("/products/", ""));
      return {
        title: "Product Details | Shivray Art",
        description: "View product details, craftsmanship notes, and enquiry options for Shivray Art heritage pieces.",
        canonicalPath: `/products/${encodeURIComponent(productId)}`,
        node: <ProductDetailPage productId={productId} />,
      };
    }
    if (location.pathname === "/required-catalogue") {
      return {
        title: "Required Catalogue | Shivray Art",
        description: "Request and review Shivray Art catalogues for statues, weapons, and heritage collections.",
        canonicalPath: "/required-catalogue",
        node: <RequiredCataloguePage />,
      };
    }
    if (location.pathname === "/contact") {
      return {
        title: "Contact | Shivray Art",
        description: "Contact Shivray Art in Pune for orders, custom requirements, and heritage craft enquiries.",
        canonicalPath: "/contact",
        node: <ContactPage />,
      };
    }
    if (location.pathname === "/cart") {
      return {
        title: "Cart | Shivray Art",
        description: "Review selected Shivray Art products before placing your order.",
        canonicalPath: "/cart",
        robots: "noindex,nofollow",
        node: <CartPage />,
      };
    }
    if (location.pathname === "/wishlist") {
      return {
        title: "Wishlist | Shivray Art",
        description: "Save Shivray Art products you want to revisit later.",
        canonicalPath: "/wishlist",
        robots: "noindex,nofollow",
        node: <WishlistPage />,
      };
    }
    if (location.pathname === "/login") {
      return {
        title: "Login | Shivray Art",
        description: "Log in to Shivray Art.",
        canonicalPath: "/login",
        robots: "noindex,nofollow",
        node: <LoginPage />,
      };
    }
    if (location.pathname === "/about") {
      return {
        title: "About Us | Shivray Art",
        description: "Learn about Shivray Art, our Pune studio, and our Maratha heritage craftsmanship.",
        canonicalPath: "/about",
        node: <AboutPage />,
      };
    }
    if (location.pathname === "/blog") {
      return {
        title: "Blog | Shivray Art",
        description: "Read Shivray Art news, customer stories, and updates from our heritage craft studio.",
        canonicalPath: "/blog",
        node: <BlogPage />,
      };
    }
    if (location.pathname.startsWith("/blog/")) {
      const blogId = decodeURIComponent(location.pathname.replace("/blog/", ""));
      return {
        title: "Story | Shivray Art",
        description: "Read a detailed story and heritage update from Shivray Art.",
        canonicalPath: `/blog/${encodeURIComponent(blogId)}`,
        node: <BlogDetailPage blogId={blogId} />,
      };
    }
    if (location.pathname === "/our-team") {
      return {
        title: "Our Team | Shivray Art",
        description: "Meet the Shivray Art team behind our handcrafted Maratha heritage creations.",
        canonicalPath: "/our-team",
        node: <OurTeamPage />,
      };
    }
    if (location.pathname === "/wall-of-fame") {
      return {
        title: "Wall of Fame | Shivray Art",
        description: "See featured recognitions, customer appreciation, and memorable Shivray Art work.",
        canonicalPath: "/wall-of-fame",
        node: <WallOfFamePage />,
      };
    }
    if (location.pathname === "/admin") {
      if (!adminAuthResolved) {
        return {
          title: "Checking Admin Session | Shivray Art",
          description: "Checking admin session.",
          canonicalPath: "/admin",
          robots: "noindex,nofollow",
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
        return {
          title: "Admin Login | Shivray Art",
          description: "Admin login for Shivray Art.",
          canonicalPath: "/admin",
          robots: "noindex,nofollow",
          node: <AdminLoginPage />,
        };
      }
      return {
        title: "Admin | Shivray Art",
        description: "Admin dashboard for Shivray Art.",
        canonicalPath: "/admin",
        robots: "noindex,nofollow",
        node: <AdminPage />,
      };
    }
    return {
      title: "Page Not Found | Shivray Art",
      description: "The requested page could not be found.",
      canonicalPath: location.pathname,
      robots: "noindex,nofollow",
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
    applySeoMeta({
      title: page.title,
      description: page.description,
      canonicalPath: page.canonicalPath,
      robots: page.robots,
    });
  }, [page.canonicalPath, page.description, page.robots, page.title]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.href]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void import("@/lib/analytics").then(({ trackPageView }) => {
        trackPageView(location.pathname + location.search + location.hash, page.title);
      });
    }, 8000);

    return () => window.clearTimeout(timerId);
  }, [location.hash, location.pathname, location.search, page.title]);

  useEffect(() => {
    if (isAdminRoute) {
      setShowPeripheralUi(false);
      return;
    }

    setShowPeripheralUi(false);
    const timerId = window.setTimeout(() => setShowPeripheralUi(true), 4000);
    return () => window.clearTimeout(timerId);
  }, [isAdminRoute, location.pathname]);

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowToaster(true), 8000);
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {isAdminRoute ? null : <Header />}
      <main className="mobile-webapp-main flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center px-4 py-10">
              <p className="text-sm text-[#6c4b33]">Loading page...</p>
            </div>
          }
        >
          {page.node}
        </Suspense>
      </main>
      {showPeripheralUi ? (
        <Suspense fallback={null}>
          {hideFooter ? null : <Footer />}
          {isAdminRoute ? null : <MobileTabBar />}
          {isAdminRoute ? null : <FloatingActions />}
        </Suspense>
      ) : null}
      {showToaster ? (
        <Suspense fallback={null}>
          <Toaster position="top-center" richColors />
        </Suspense>
      ) : null}
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
