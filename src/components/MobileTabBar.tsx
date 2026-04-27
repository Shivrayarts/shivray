import { Link, useLocation } from "@tanstack/react-router";
import { Heart, ShoppingCart, Store, UserRound } from "lucide-react";

const tabs = [
  { to: "/products", label: "Shop", icon: Store },
  { to: "/login", label: "Account", icon: UserRound },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
] as const;

export default function MobileTabBar() {
  const location = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ece7df] bg-white shadow-[0_-10px_24px_-20px_rgba(0,0,0,0.3)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="grid w-full grid-cols-4 px-3 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.to ||
            (tab.to === "/products" && location.pathname.startsWith("/products/"));

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center justify-center px-1 py-2 text-[0.9rem] transition ${
                isActive ? "text-[#111111]" : "text-[#1c1c1c]"
              }`}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
