import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, LogIn, Menu, Phone, Search, ShoppingCart, X } from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { siteConfig } from "@/lib/site-config";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Product" },
  { to: "/required-catalogue", label: "Required Catalogue" },
  { to: "/contact", label: "Contact" },
  { to: "/login", label: "Login" },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { wishlist } = useWishlist();
  const cartCount = getTotalItems();
  const wishlistCount = wishlist.length;

  return (
    <header className="sticky top-0 z-50 border-b border-[#eadbc8] bg-[#fffaf4]/95 backdrop-blur-md">
      <div className="border-b border-[#f2e4d4] bg-[#2b130c] px-4 py-2 text-[#f8e8cf] md:px-6">
        <div className="layout-shell flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em]">
          <span className="truncate">Mobile first catalogue and enquiry experience</span>
          <a
            href={`tel:${siteConfig.phoneHref}`}
            className="hidden items-center gap-2 font-semibold text-[#ffd68d] md:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" />
            {siteConfig.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="w-full px-4 md:px-6">
        <div className="layout-shell flex items-center justify-between gap-3 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex rounded-full border border-[#eadbc8] p-2 text-[#34180e] transition hover:bg-[#f5ecdf]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex min-w-0 flex-1 items-center justify-center gap-3 px-2">
            <img
              src={logoImg}
              alt="Shivray"
              className="h-11 w-11 rounded-full border border-[#e3c7a5] object-cover"
            />
            <div className="min-w-0 text-center">
              <p className="truncate font-heading text-xl leading-none text-[#34180e]">
                Shivray
              </p>
              <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.26em] text-[#9b7757]">
                Heritage for mobile shoppers
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/wishlist"
              className="relative inline-flex rounded-full border border-[#eadbc8] p-2 text-[#7a4d27] transition hover:bg-[#f7efe5]"
              aria-label="Open liked products"
            >
              <Heart className={`h-4 w-4 ${wishlistCount > 0 ? "fill-current" : ""}`} />
              {wishlistCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#34180e] px-1 text-[10px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link
              to="/cart"
              className="relative inline-flex rounded-full border border-[#eadbc8] p-2 text-[#7a4d27] transition hover:bg-[#f7efe5]"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#34180e] px-1 text-[10px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </Link>
            <Link
              to="/login"
              className="inline-flex rounded-full border border-[#eadbc8] p-2 text-[#7a4d27] transition hover:bg-[#f7efe5]"
              aria-label="Open account"
            >
              <LogIn className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="layout-shell hidden h-18 items-center justify-between gap-3 py-3 lg:flex">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logoImg}
              alt="Shivray"
              className="h-12 w-12 rounded-full border border-[#e3c7a5] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-heading text-xl leading-none text-[#34180e]">
                Shivray
              </p>
              <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.26em] text-[#9b7757]">
                Heritage for mobile shoppers
              </p>
            </div>
          </Link>

          <nav className="items-center gap-2 lg:flex">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    active
                      ? "bg-[#34180e] text-white"
                      : "text-[#5f402b] hover:bg-[#f5ecdf] hover:text-[#34180e]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#eadbc8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5f402b] transition hover:bg-[#f7efe5]"
            >
              <LogIn className="h-4 w-4" />
              Account
            </Link>
            <Link
              to="/wishlist"
              className="relative inline-flex rounded-full border border-[#eadbc8] p-2 text-[#7a4d27] transition hover:bg-[#f7efe5]"
              aria-label="Open liked products"
            >
              <Heart className={`h-4 w-4 ${wishlistCount > 0 ? "fill-current" : ""}`} />
              {wishlistCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#34180e] px-1 text-[10px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link
              to="/cart"
              className="relative inline-flex rounded-full border border-[#eadbc8] p-2 text-[#7a4d27] transition hover:bg-[#f7efe5]"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#34180e] px-1 text-[10px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </Link>
            <Link
              to="/products"
              className="inline-flex rounded-full border border-[#eadbc8] p-2 text-[#7a4d27] transition hover:bg-[#f7efe5]"
              aria-label="Browse products"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#eadbc8] bg-[#fffaf4] lg:hidden">
          <nav className="layout-shell grid gap-2 px-4 py-4 md:px-6">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#34180e]"
            >
              <LogIn className="h-4 w-4" />
              My Account
            </Link>
            {navLinks.map((link) => {
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition ${
                    active
                      ? "bg-[#34180e] text-white"
                      : "border border-[#eadbc8] bg-white text-[#5f402b] hover:bg-[#f7efe5]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
