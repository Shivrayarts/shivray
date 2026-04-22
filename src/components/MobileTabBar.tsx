import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShoppingBag, BookOpen, Phone, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/products", label: "Products", icon: ShoppingBag },
  { to: "/blog", label: "Blog", icon: BookOpen },
  { to: "/contact", label: "Contact", icon: Phone },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
] as const;

export default function MobileTabBar() {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`relative flex flex-col items-center justify-center rounded-lg py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="relative">
                <Icon className="mb-1 h-4 w-4" />
                {tab.to === "/cart" && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
