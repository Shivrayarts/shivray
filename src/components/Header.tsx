import { Link, useLocation, useNavigate } from "@/lib/spa-router";
import { FormEvent, useState } from "react";
import { Heart, LogIn, Menu, Phone, Search, ShoppingCart, X } from "lucide-react";
import logoImg from "@/assets/logo-dark.jpg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useStoredHomeContent } from "@/lib/content-store";
import { useLanguage } from "@/lib/language";
import { resolveLocalizedText } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { resolvedLocale } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const { getTotalItems } = useCart();
  const { announcementBar } = useStoredHomeContent();
  const wishlistCount = wishlist.length;
  const cartCount = getTotalItems();
  const brandName = siteConfig.brandName[resolvedLocale];
  const brandNameClass =
    resolvedLocale === "mr"
      ? "font-brand-marathi font-bold tracking-normal leading-[1.35]"
      : "font-heading font-bold";
  const brandNameWrapClass = resolvedLocale === "mr" ? "whitespace-nowrap overflow-visible" : "truncate";
  const navLinks = [
    { to: "/", label: resolvedLocale === "mr" ? "मुख्यपृष्ठ" : "Home" },
    { to: "/products", label: resolvedLocale === "mr" ? "उत्पादने" : "Products" },
    { to: "/required-catalogue", label: resolvedLocale === "mr" ? "कॅटलॉग" : "Catalogue" },
    { to: "/contact", label: resolvedLocale === "mr" ? "संपर्क" : "Contact" },
    { to: "/login", label: resolvedLocale === "mr" ? "लॉगिन" : "Login" },
  ] as const;
  const desktopNavLinks = navLinks.filter((link) => link.to !== "/login");
  const announcementText = resolveLocalizedText(announcementBar.text, resolvedLocale).trim();
  const showAnnouncement = announcementBar.enabled && announcementText.length > 0;

  const navigateToSearch = (value: string) => {
    const query = value.trim();
    setMobileOpen(false);
    navigate({
      to: "/products",
      search: query ? { q: query } : {},
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    navigateToSearch(value);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#eadbc8] bg-[#fffaf4]/95 backdrop-blur-md">
      {showAnnouncement ? (
        <div className="border-b border-[#c89b59] bg-[linear-gradient(90deg,#2b0b08_0%,#4a1e10_48%,#2b0b08_100%)] px-4 py-2.5 text-center text-[#f7e8d1] shadow-[0_10px_24px_-20px_rgba(32,12,6,0.9)]">
          <div className="layout-shell text-xs font-medium leading-6 md:text-sm">
            <marquee behavior="scroll" direction="left" scrollAmount={2}>
              {announcementText}
            </marquee>
          </div>
        </div>
      ) : null}
      <div className="hidden border-b border-[#f2e4d4] bg-[#2b130c] px-4 py-2 text-[#f8e8cf] md:block lg:hidden md:px-6">
        <div className="layout-shell flex items-center justify-between gap-3 text-[11px]">
          <span className="truncate">
            {resolvedLocale === "mr"
              ? "मोबाईलसाठी तयार कॅटलॉग आणि चौकशी अनुभव"
              : "Mobile-first catalogue and enquiry experience"}
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

      <div className="w-full">
        <div className="layout-shell xl:hidden">
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
                alt={brandName}
                className="h-12 w-12 rounded-full border border-[#cfae84] object-cover"
              />
              <div className="min-w-0">
                <p className={`${brandNameWrapClass} text-lg text-[#f8ecd9] ${brandNameClass}`}>
                  {brandName}
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
          <form onSubmit={handleSearchSubmit} className="bg-[#fffaf4] px-4 py-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[#eadbc8] bg-white px-3 py-2.5 shadow-[0_14px_34px_-30px_rgba(52,24,14,0.55)] focus-within:border-[#d6a35c]">
              <Search className="h-4 w-4 shrink-0 text-[#7a4d27]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={resolvedLocale === "mr" ? "उत्पादने शोधा" : "Search products"}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#34180e] outline-none placeholder:text-[#9b7757]"
                aria-label={resolvedLocale === "mr" ? "उत्पादने किंवा श्रेणी शोधा" : "Search products or categories"}
              />
            </div>
          </form>
        </div>

        <div className="hidden bg-[#fffaf4] xl:block">
          <div className="flex h-28 w-full min-w-0 items-center gap-4 px-8 text-[#34180e] 2xl:h-[122px] 2xl:px-12">
            <Link to="/" className="flex min-w-0 w-[310px] shrink-0 items-center gap-4 2xl:w-[350px]">
              <img
                src={logoImg}
                alt={brandName}
                className="h-[72px] w-[72px] rounded-full border border-[#e3c7a5] bg-white p-1 object-cover 2xl:h-20 2xl:w-20"
              />
              <div className="min-w-0">
                <p className={`${brandNameWrapClass} text-3xl text-[#34180e] 2xl:text-[34px] ${brandNameClass}`}>
                  {brandName}
                </p>
                <p className="mt-2 truncate text-[11px] font-semibold text-[#9b7757] xl:text-xs 2xl:mt-3 2xl:text-[13px]">
                  {siteConfig.brandTagline[resolvedLocale]}
                </p>
              </div>
            </Link>

            <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 2xl:gap-2">
              {desktopNavLinks.map((link) => {
                const active = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-full px-4 py-3 text-sm font-semibold transition 2xl:px-5 2xl:py-3.5 2xl:text-base ${
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

            <div className="flex shrink-0 items-center gap-2 pl-2 2xl:gap-3 2xl:pl-4">
              <LanguageSwitcher />
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="flex h-12 w-52 items-center gap-2 rounded-[18px] border border-[#eadbc8] bg-white px-4 focus-within:border-[#d6a35c] focus-within:bg-[#fffdf9] 2xl:h-[52px] 2xl:w-72 2xl:gap-3 2xl:px-5">
                  <Search className="h-5 w-5 shrink-0 text-[#7a4d27]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder={resolvedLocale === "mr" ? "उत्पादने शोधा" : "Search products"}
                    className="w-full bg-transparent text-sm font-medium text-[#34180e] outline-none placeholder:text-[#9b7757] 2xl:text-base"
                    aria-label={resolvedLocale === "mr" ? "उत्पादने किंवा श्रेणी शोधा" : "Search products or categories"}
                  />
                </div>
              </form>
              <Link
                to="/login"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#7a4d27] transition hover:bg-[#f7efe5] 2xl:h-12 2xl:w-12"
                aria-label={resolvedLocale === "mr" ? "खाते उघडा" : "Open account"}
              >
                <LogIn className="h-5 w-5 2xl:h-6 2xl:w-6" />
              </Link>
              <Link
                to="/wishlist"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[#7a4d27] transition hover:bg-[#f7efe5] 2xl:h-12 2xl:w-12"
                aria-label={resolvedLocale === "mr" ? "आवडीची उत्पादने उघडा" : "Open liked products"}
              >
                <Heart className={`h-5 w-5 2xl:h-6 2xl:w-6 ${wishlistCount > 0 ? "fill-current" : ""}`} />
                {wishlistCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#34180e] px-1 text-[10px] font-bold text-white">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                ) : null}
              </Link>
              <Link
                to="/cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[#7a4d27] transition hover:bg-[#f7efe5] 2xl:h-12 2xl:w-12"
                aria-label={resolvedLocale === "mr" ? "कार्ट उघडा" : "Open cart"}
              >
                <ShoppingCart className="h-5 w-5 2xl:h-6 2xl:w-6" />
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#34180e] px-1 text-[10px] font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#eadbc8] bg-[#fffaf4] xl:hidden">
          <nav className="layout-shell grid gap-2 px-4 py-4 md:px-6">
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
