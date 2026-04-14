import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import logoImg from "@/assets/logo.jpg";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImg} alt="Rudra Arts" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h3 className="font-heading text-lg font-bold text-gold">Rudra Arts</h3>
                <p className="text-xs tracking-widest uppercase opacity-70">& Handicrafts</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed font-display italic">
              India's premier studio for authentic statues of Chhatrapati Shivaji Maharaj and Maratha weapons. Specializing in miniatures, statues, and historical replicas.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-gold hover:text-gold-foreground transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-gold hover:text-gold-foreground transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-gold hover:text-gold-foreground transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-gold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/products", label: "Products" },
                { to: "/blog", label: "Blog" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to as "/"} className="text-sm opacity-80 hover:opacity-100 hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-gold mb-4">Categories</h4>
            <ul className="space-y-2">
              {["Maharaj Statues", "Warrior Weapons", "Dhoop Collection", "Shields & Armor", "Historical Replicas", "Gift Items"].map((c) => (
                <li key={c}>
                  <Link to="/products" className="text-sm opacity-80 hover:opacity-100 hover:text-gold transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-gold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="opacity-80">Famous Chowk, Kirti Nagar Ln No. 1, New Sangavi, Pune, Maharashtra 411027</span>
              </li>
              <li>
                <a href="tel:+917028996666" className="flex gap-3 text-sm opacity-80 hover:opacity-100 hover:text-gold transition-colors">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  +91 7028996666
                </a>
              </li>
              <li>
                <a href="mailto:rudra.arts30@gmail.com" className="flex gap-3 text-sm opacity-80 hover:opacity-100 hover:text-gold transition-colors">
                  <Mail className="w-4 h-4 text-gold shrink-0" />
                  rudra.arts30@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs opacity-60">© 2025 Rudra Arts & Handicrafts. All rights reserved.</p>
          <p className="text-xs opacity-60">Crafted with pride in Pune, India</p>
        </div>
      </div>
    </footer>
  );
}
