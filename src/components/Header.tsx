import { Link, useLocation, useNavigate } from "@/lib/spa-router";
import { FormEvent, useState } from "react";
import { Heart, LogIn, Menu, Phone, Search, X } from "lucide-react";
import logoImg from "@/assets/logo-dark.jpg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useWishlist } from "@/hooks/use-wishlist";
import { useLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { resolvedLocale } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;
  const navLinks = [
    { to: "/", label: resolvedLocale === "mr" ? "à¤®à¥à¤–à¥à¤¯à¤ªà¥ƒà¤·à¥à¤ " : "Home" },
    { to: "/products", label: resolvedLocale === "mr" ? "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨à¥‡" : "Products" },
    { to: "/required-catalogue", label: resolvedLocale === "mr" ? "à¤•à¥…à¤Ÿà¤²à¥‰à¤—" : "Catalogue" },
    { to: "/contact", label: resolvedLocale === "mr" ? "à¤¸à¤‚à¤ªà¤°à¥à¤•" : "Contact" },
    { to: "/login", label: resolvedLocale === "mr" ? "à¤²à¥‰à¤—à¤¿à¤¨" : "Login" },
  ] as const;
  const desktopNavLinks = navLinks.filter((link) => link.to !== "/login");

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();

    navigate({
      to: "/products",
      search: query ? { q: query } : {},
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#eadbc8] bg-[#fffaf4]/95 backdrop-blur-md">
      <div className="hidden border-b border-[#f2e4d4] bg-[#2b130c] px-4 py-2 text-[#f8e8cf] md:block lg:hidden md:px-6">
        <div className="layout-shell flex items-center justify-between gap-3 text-[11px]">
          <span className="truncate">
            {resolvedLocale === "mr" ? "à¤®à¥‹à¤¬à¤¾à¤ˆà¤²à¤¸à¤¾à¤ à¥€ à¤¤à¤¯à¤¾à¤° à¤•à¥…à¤Ÿà¤²à¥‰à¤— à¤†à¤£à¤¿ à¤šà¥Œà¤•à¤¶à¥€ à¤…à¤¨à¥à¤­à¤µ" : "Mobile-first catalogue and enquiry experience"}
          </span>
          <a
            href={`tel:${siteConfig.phoneHref}`}
            className="hidden items-center gap-2 font-semibold text-[#ffd68d] md:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" />
            {siteConfig.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="w-full md:px-6">
        <div className="layout-shell lg:hidden">
          <div className="flex items-center justify-between gap-3 bg-[#34180e] px-4 py-3 text-[#f7e7cf] shadow-[0_16px_40px_-28px_rgba(52,24,14,0.9)]">
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#8b6c52] bg-white/5 text-[#f7e7cf] transition hover:bg-white/10"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 text-center">
              <img
                src={logoImg}
                alt="Shivray Arts"
                className="h-12 w-12 rounded-full border border-[#cfae84] object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-heading text-lg leading-none text-[#f8ecd9]">
                  Shivray Arts
                </p>
                <p className="mt-1 truncate text-[10px] font-semibold text-[#d8b48b]">
                  {siteConfig.brandTagline[resolvedLocale]}
                </p>
              </div>
            </Link>

            <div className="flex items-center justify-end gap-2">
              <LanguageSwitcher compact className="bg-white/5" />
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="flex w-full items-center gap-4 bg-[#fffaf4] px-6 py-5 text-[#34180e]">
            <Link to="/" className="flex min-w-0 items-center gap-4 pr-4 xl:pr-6">
              <img
                src={logoImg}
                alt="Shivray Arts"
                className="h-16 w-16 rounded-full border border-[#e3c7a5] bg-white p-1 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-heading text-3xl leading-none text-[#34180e]">
                  Shivray Arts
                </p>
                <p className="mt-2 truncate text-[11px] font-semibold text-[#9b7757]">
                  {siteConfig.brandTagline[resolvedLocale]}
                </p>
              </div>
            </Link>

            <nav className="flex flex-1 items-center justify-center gap-1 xl:gap-1.5">
              {desktopNavLinks.map((link) => {
                const active = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-full px-3 py-3 text-sm font-semibold transition xl:px-4 ${
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

            <div className="flex items-center gap-3 pl-4">
              <LanguageSwitcher />
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="flex min-w-[14rem] items-center gap-2 rounded-2xl border border-[#eadbc8] bg-white px-4 py-2.5 focus-within:border-[#d6a35c] focus-within:bg-[#fffdf9] xl:min-w-[16rem]">
                  <Search className="h-4 w-4 text-[#7a4d27]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={resolvedLocale === "mr" ? "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨à¥‡ à¤¶à¥‹à¤§à¤¾" : "Search products"}
                    className="w-full bg-transparent text-sm font-medium text-[#34180e] outline-none placeholder:text-[#9b7757]"
                    aria-label={resolvedLocale === "mr" ? "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨à¥‡ à¤•à¤¿à¤‚à¤µà¤¾ à¤¶à¥à¤°à¥‡à¤£à¥€ à¤¶à¥‹à¤§à¤¾" : "Search products or categories"}
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[#34180e] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#221008]"
                  >
                    {resolvedLocale === "mr" ? "à¤œà¤¾" : "Go"}
                  </button>
                </div>
              </form>
              <Link
                to="/login"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#7a4d27] transition hover:bg-[#f7efe5]"
                aria-label={resolvedLocale === "mr" ? "à¤–à¤¾à¤¤à¥‡ à¤‰à¤˜à¤¡à¤¾" : "Open account"}
              >
                <LogIn className="h-5 w-5" />
              </Link>
              <Link
                to="/wishlist"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[#7a4d27] transition hover:bg-[#f7efe5]"
                aria-label={resolvedLocale === "mr" ? "à¤†à¤µà¤¡à¥€à¤šà¥€ à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨à¥‡ à¤‰à¤˜à¤¡à¤¾" : "Open liked products"}
              >
                <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "fill-current" : ""}`} />
                {wishlistCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#34180e] px-1 text-[10px] font-bold text-white">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#eadbc8] bg-[#fffaf4] lg:hidden">
          <nav className="layout-shell grid gap-2 px-4 py-4 md:px-6">
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-2xl border border-[#eadbc8] bg-white px-4 py-3 text-sm font-semibold text-[#5f402b] transition hover:bg-[#f7efe5]"
            >
              <Search className="h-4 w-4" />
              {resolvedLocale === "mr" ? "à¤¶à¥‹à¤§à¤¾" : "Search"}
            </Link>
            {navLinks.map((link) => {
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
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
