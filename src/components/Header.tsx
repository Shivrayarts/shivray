import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingCart, Phone } from "lucide-react";
import logoImg from "@/assets/logo.jpg";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/blog", label: "Blog" },
  { to: "/wall-of-fame", label: "Wall of Fame" },
  { to: "/our-team", label: "Our Team" },
  { to: "/contact", label: "Contact" },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="font-display italic text-sm opacity-90">Reliving History Through Every Creation</span>
          <div className="flex items-center gap-4">
            <a href="tel:+917028996666" className="flex items-center gap-1 hover:text-gold transition-colors">
              <Phone className="w-3 h-3" />
              +91 7028996666
            </a>
            <a href="mailto:rudra.arts30@gmail.com" className="hover:text-gold transition-colors">
              rudra.arts30@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logoImg} alt="Rudra Arts & Handicrafts" className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover" />
            <div className="hidden sm:block">
              <h1 className="font-heading text-lg md:text-xl font-bold text-primary leading-tight">
                Rudra Arts
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground tracking-widest uppercase">& Handicrafts</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium tracking-wide uppercase transition-colors rounded-md ${
                  location.pathname === link.to
                    ? "text-accent-foreground bg-accent/30 font-semibold"
                    : "text-foreground/80 hover:text-primary hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/products" className="p-2 rounded-full hover:bg-muted transition-colors text-primary">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors text-primary"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-md text-sm font-medium tracking-wide uppercase transition-colors ${
                  location.pathname === link.to
                    ? "text-primary-foreground bg-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
