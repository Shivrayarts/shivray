import { lazy, Suspense, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/language";
import { RouterProvider, useLocation } from "@/lib/spa-router";
import { useAdminAuthState } from "@/lib/admin-auth";
import HomePage from "@/pages/HomePage";

const Footer = lazy(() => import("@/components/Footer"));
const MobileTabBar = lazy(() => import("@/components/MobileTabBar"));
const FloatingActions = lazy(() => import("@/components/FloatingActions"));
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
  const { authenticated: isAdminAuthed, resolved: adminAuthResolved } = useAdminAuthState();
  const isAdminRoute = location.pathname === "/admin";
  const hideFooter = isAdminRoute;

  const page = useMemo(() => {
    if (location.pathname === "/") {
      return { title: "Shivrayart", node: <HomePage /> };
    }
    if (location.pathname === "/products") {
      return { title: "Products - Shivrayart", node: <ProductsPage /> };
    }
    if (location.pathname.startsWith("/products/")) {
      const productId = decodeURIComponent(location.pathname.replace("/products/", ""));
      return { title: "Product Details - Shivrayart", node: <ProductDetailPage productId={productId} /> };
    }
    if (location.pathname === "/required-catalogue") {
      return { title: "Required Catalogue - Shivrayart", node: <RequiredCataloguePage /> };
    }
    if (location.pathname === "/contact") {
      return { title: "Contact - Shivrayart", node: <ContactPage /> };
    }
    if (location.pathname === "/cart") {
      return { title: "Cart - Shivrayart", node: <CartPage /> };
    }
    if (location.pathname === "/wishlist") {
      return { title: "Wishlist - Shivrayart", node: <WishlistPage /> };
    }
    if (location.pathname === "/login") {
      return { title: "Login - Shivrayart", node: <LoginPage /> };
    }
    if (location.pathname === "/about") {
      return { title: "About Us - Shivrayart", node: <AboutPage /> };
    }
    if (location.pathname === "/blog") {
      return { title: "Blog - Shivrayart", node: <BlogPage /> };
    }
    if (location.pathname.startsWith("/blog/")) {
      const blogId = decodeURIComponent(location.pathname.replace("/blog/", ""));
      return { title: "Blog - Shivrayart", node: <BlogDetailPage blogId={blogId} /> };
    }
    if (location.pathname === "/our-team") {
      return { title: "Our Team - Shivrayart", node: <OurTeamPage /> };
    }
    if (location.pathname === "/wall-of-fame") {
      return { title: "Wall of Fame - Shivrayart", node: <WallOfFamePage /> };
    }
    if (location.pathname === "/admin") {
      if (!adminAuthResolved) {
        return {
          title: "Checking Admin Session - Shivrayart",
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
        return { title: "Admin Login - Shivrayart", node: <AdminLoginPage /> };
      }
      return { title: "Admin - Shivrayart", node: <AdminPage /> };
    }
    return {
      title: "Page Not Found - Shivrayart",
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
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.href]);

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
      <Suspense fallback={null}>
        {hideFooter ? null : <Footer />}
        {isAdminRoute ? null : <MobileTabBar />}
        {isAdminRoute ? null : <FloatingActions />}
      </Suspense>
      <Toaster position="top-center" richColors />
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
