import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { siteConfig } from "@/lib/site-config";

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Product" },
  { to: "/required-catalogue", label: "Required Catalogue" },
  { to: "/contact", label: "Contact" },
  { to: "/login", label: "Login" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-[#e8d7c1] bg-[#2b130c] text-[#f8ead7]">
      <div className="layout-shell grid gap-8 px-4 py-10 md:grid-cols-[1fr_0.8fr_1fr] md:px-6">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Shivray"
              className="h-12 w-12 rounded-full border border-[#d6a35c]/40 object-cover"
            />
            <div>
              <p className="font-heading text-2xl text-[#ffd68d]">Shivray</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d1b08b]">
                Mobile first public pages
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#e7d6c2]">
            Crafted to feel fast, premium, and easy to browse on phones, with direct paths
            to products, catalogue requests, contact, and login.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={siteConfig.socialLinks.facebook}
              aria-label="Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d6a35c]/40 text-[#ffd68d] transition hover:bg-[#3a1b10]"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.socialLinks.instagram}
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d6a35c]/40 text-[#ffd68d] transition hover:bg-[#3a1b10]"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.socialLinks.youtube}
              aria-label="YouTube"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d6a35c]/40 text-[#ffd68d] transition hover:bg-[#3a1b10]"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd68d]">
            Quick Links
          </p>
          <div className="mt-4 grid gap-2">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-[#f4e7d8] transition hover:text-[#ffd68d]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd68d]">
            Contact
          </p>
          <div className="mt-4 grid gap-4 text-sm text-[#f4e7d8]">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd68d]" />
              <span>{siteConfig.address}</span>
            </div>
            <a
              href={`tel:${siteConfig.phoneHref}`}
              className="flex gap-3 transition hover:text-[#ffd68d]"
            >
              <Phone className="h-4 w-4 shrink-0 text-[#ffd68d]" />
              <span>{siteConfig.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex gap-3 transition hover:text-[#ffd68d]"
            >
              <Mail className="h-4 w-4 shrink-0 text-[#ffd68d]" />
              <span>{siteConfig.email}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
