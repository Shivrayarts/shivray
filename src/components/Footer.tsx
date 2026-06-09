import { Link } from "@/lib/spa-router";
import { useState } from "react";
import { isValidEmail } from "@/lib/form-validation";
import { useLanguage } from "@/lib/language";
import {
  ChevronDown,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Plus,
  Youtube,
} from "lucide-react";
import logoImg from "@/assets/logo-dark-small.jpg";
import { siteConfig } from "@/lib/site-config";

type SectionKey = "shopping" | "information" | "newsletter";

const footerBrandName = "Shivray Art And Handcraft";

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.238 2.635 7.86 6.356 9.318-.088-.792-.167-2.008.035-2.873.183-.783 1.18-4.983 1.18-4.983s-.3-.6-.3-1.487c0-1.393.808-2.433 1.815-2.433.856 0 1.27.643 1.27 1.414 0 .861-.548 2.148-.83 3.342-.236.997.5 1.81 1.482 1.81 1.779 0 3.145-1.876 3.145-4.584 0-2.396-1.722-4.073-4.183-4.073-2.85 0-4.524 2.137-4.524 4.346 0 .861.332 1.786.747 2.288.082.1.094.188.07.289-.076.317-.244.997-.278 1.136-.044.183-.146.222-.337.134-1.255-.584-2.04-2.418-2.04-3.892 0-3.168 2.302-6.077 6.636-6.077 3.484 0 6.194 2.483 6.194 5.8 0 3.46-2.181 6.246-5.21 6.246-1.017 0-1.975-.528-2.301-1.153l-.625 2.381c-.226.87-.837 1.96-1.248 2.626.94.29 1.936.448 2.968.448 5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
    </svg>
  );
}

export default function Footer() {
  const { resolvedLocale } = useLanguage();
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterTouched, setNewsletterTouched] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const showAlternatePhone =
    Boolean(siteConfig.alternatePhoneDisplay && siteConfig.alternatePhoneHref) &&
    siteConfig.alternatePhoneHref !== siteConfig.phoneHref;

  const shoppingLinks = [
    { to: "/products", label: resolvedLocale === "mr" ? "शिपिंग आणि डिलिव्हरी" : "Shipping and Delivery" },
    { to: "/required-catalogue", label: resolvedLocale === "mr" ? "कॅटलॉग विनंती" : "Catalogue Request" },
    { to: "/wishlist", label: resolvedLocale === "mr" ? "आवडीचे" : "Wishlist" },
    { to: "/cart", label: resolvedLocale === "mr" ? "कार्ट" : "Cart" },
  ] as const;

  const informationLinks = [
    { to: "/about", label: resolvedLocale === "mr" ? "आमच्याबद्दल" : "About Us" },
    { to: "/contact", label: resolvedLocale === "mr" ? "संपर्क" : "Contact" },
    { to: "/blog", label: resolvedLocale === "mr" ? "बातम्या आणि ब्लॉग" : "News & Blog" },
    { to: "/login", label: resolvedLocale === "mr" ? "माझे खाते" : "My Account" },
  ] as const;

  const toggleSection = (section: SectionKey) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterTouched(true);

    if (!isValidEmail(newsletterEmail)) {
      setNewsletterMessage(resolvedLocale === "mr" ? "कृपया वैध ईमेल पत्ता टाका." : "Please enter a valid email address.");
      return;
    }

    setNewsletterMessage(
      resolvedLocale === "mr"
        ? "धन्यवाद. तुमचा ईमेल न्यूजलेटर नोंदणीसाठी तयार आहे."
        : "Thanks. Your email is ready for newsletter signup.",
    );
    setNewsletterEmail("");
  };

  const mobileSections = [
    { key: "shopping" as const, title: resolvedLocale === "mr" ? "खरेदी" : "Shopping", links: shoppingLinks },
    { key: "information" as const, title: resolvedLocale === "mr" ? "माहिती" : "Information", links: informationLinks },
    { key: "newsletter" as const, title: resolvedLocale === "mr" ? "न्यूजलेटर" : "Newsletter", links: [] },
  ];

  return (
    <footer className="w-full bg-[#4a1f14] text-[#f8ead7]">
      <div className="px-4 pb-28 pt-8 md:px-8 md:py-12 xl:px-14">
        <div className="hidden gap-10 lg:grid lg:grid-cols-[1.2fr_0.75fr_0.75fr_1.1fr]">
          <div>
            <div className="flex items-start gap-4">
              <img src={logoImg} alt={footerBrandName} className="h-20 w-20 rounded-full object-cover" />
              <div className="pt-1">
                <p className="max-w-[16rem] font-heading text-3xl leading-none text-[#ffd68d]">{footerBrandName}</p>
                <p className="mt-3 text-xs font-semibold tracking-[0.08em] text-[#d7b28f]">
                  {siteConfig.brandTagline[resolvedLocale]}
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-6 text-lg leading-9 text-[#edd8c5]">
              <a
                href={siteConfig.addressMapHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 transition hover:text-[#ffd68d]"
              >
                <MapPin className="mt-2 h-5 w-5 shrink-0 text-[#ffd68d]" />
                <p>{siteConfig.address}</p>
              </a>
              <div className="flex items-start gap-4">
                <Phone className="mt-2 h-5 w-5 shrink-0 text-[#ffd68d]" />
                <div className="space-y-0.5">
                  <a href={`tel:${siteConfig.phoneHref}`} className="block transition hover:text-[#ffd68d]">
                    {siteConfig.phoneDisplay}
                  </a>
                  {showAlternatePhone ? (
                    <a href={`tel:${siteConfig.alternatePhoneHref}`} className="block transition hover:text-[#ffd68d]">
                      {siteConfig.alternatePhoneDisplay}
                    </a>
                  ) : null}
                </div>
              </div>
              <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-4 transition hover:text-[#ffd68d]">
                <Mail className="mt-2 h-5 w-5 shrink-0 text-[#ffd68d]" />
                <p>{siteConfig.email}</p>
              </a>
              <a
                href={siteConfig.googleBusinessHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 transition hover:text-[#ffd68d]"
              >
                <MapPin className="mt-2 h-5 w-5 shrink-0 text-[#ffd68d]" />
                <p>{resolvedLocale === "mr" ? "Google Business प्रोफाइल" : "Google Business Profile"}</p>
              </a>
            </div>

            <div className="mt-7 flex items-center gap-5">
              <a href={siteConfig.socialLinks.facebook} aria-label="Facebook" className="transition hover:text-[#ffd68d]">
                <Facebook className="h-6 w-6" />
              </a>
              <a href={siteConfig.socialLinks.instagram} aria-label="Instagram" className="transition hover:text-[#ffd68d]">
                <Instagram className="h-6 w-6" />
              </a>
              <a href={siteConfig.socialLinks.youtube} aria-label="YouTube" className="transition hover:text-[#ffd68d]">
                <Youtube className="h-6 w-6" />
              </a>
              <a href={siteConfig.socialLinks.pinterest} aria-label="Pinterest" className="transition hover:text-[#ffd68d]">
                <PinterestIcon className="h-6 w-6" />
              </a>
              <a
                href={siteConfig.googleBusinessHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Google Business"
                className="transition hover:text-[#ffd68d]"
              >
                <Globe className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[2.1rem] font-semibold text-[#fff7ed]">{resolvedLocale === "mr" ? "खरेदी" : "Shopping"}</h3>
            <div className="mt-7 grid gap-4 text-[1.08rem] text-[#e4c6ae]">
              {shoppingLinks.map((link) => (
                <Link key={link.label} to={link.to} className="transition hover:text-[#ffd68d]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[2.1rem] font-semibold text-[#fff7ed]">{resolvedLocale === "mr" ? "माहिती" : "Information"}</h3>
            <div className="mt-7 grid gap-4 text-[1.08rem] text-[#e4c6ae]">
              {informationLinks.map((link) => (
                <Link key={link.label} to={link.to} className="transition hover:text-[#ffd68d]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[2.1rem] font-semibold text-[#fff7ed]">{resolvedLocale === "mr" ? "न्यूजलेटर" : "Newsletter"}</h3>
            <p className="mt-7 text-[1.08rem] leading-8 text-[#e4c6ae]">
              {resolvedLocale === "mr"
                ? "नवीन उत्पादने, परंपरेच्या कथा आणि खास संग्रह यांची माहिती सर्वात आधी मिळवा."
                : "Become the first to know about new product drops, heritage stories, and featured collections."}
            </p>
            <form className="mt-7 flex gap-3" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onBlur={() => setNewsletterTouched(true)}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder={resolvedLocale === "mr" ? "तुमचा ईमेल टाका" : "Enter your email"}
                className={`min-w-0 flex-1 rounded-full border bg-transparent px-6 py-4 text-base text-[#fff7ed] outline-none placeholder:text-[#cfae92] ${
                  newsletterTouched && !isValidEmail(newsletterEmail) ? "border-[#ffb4ab]" : "border-white/15"
                }`}
              />
              <button type="submit" className="rounded-full bg-[#fff7ed] px-8 py-4 text-base font-semibold text-[#34180e] transition hover:bg-[#f4ddbc]">
                {resolvedLocale === "mr" ? "सदस्य व्हा" : "Subscribe"}
              </button>
            </form>
            {newsletterMessage ? (
              <p className={`mt-3 text-sm ${newsletterMessage.startsWith("Thanks") || newsletterMessage.startsWith("धन्यवाद") ? "text-[#f4ddbc]" : "text-[#ffb4ab]"}`}>
                {newsletterMessage}
              </p>
            ) : null}
            <p className="mt-5 text-sm leading-6 text-[#cfb097]">
              {resolvedLocale === "mr"
                ? "सदस्यत्व घेतल्याने तुम्ही शिवराय आर्ट्सकडून अपडेट्स स्वीकारण्यास सहमती देता."
                : `By subscribing, you agree to receive updates from ${footerBrandName}.`}
            </p>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="flex items-start gap-3">
            <img src={logoImg} alt={footerBrandName} className="h-16 w-16 rounded-full object-cover" />
            <div className="pt-1">
              <p className="max-w-[15rem] font-heading text-2xl leading-none text-[#ffd68d]">{footerBrandName}</p>
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-[#d7b28f]">
                {siteConfig.brandTagline[resolvedLocale]}
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5 text-[15px] leading-7 text-[#f2dfcc]">
            <a
              href={siteConfig.addressMapHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 transition hover:text-[#ffd68d]"
            >
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#ffd68d]" />
              <p>{siteConfig.address}</p>
            </a>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-4 w-4 shrink-0 text-[#ffd68d]" />
              <div className="space-y-0.5">
                <a href={`tel:${siteConfig.phoneHref}`} className="block transition hover:text-[#ffd68d]">
                  {siteConfig.phoneDisplay}
                </a>
                {showAlternatePhone ? (
                  <a href={`tel:${siteConfig.alternatePhoneHref}`} className="block transition hover:text-[#ffd68d]">
                    {siteConfig.alternatePhoneDisplay}
                  </a>
                ) : null}
              </div>
            </div>
            <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-3 transition hover:text-[#ffd68d]">
              <Mail className="mt-1 h-4 w-4 shrink-0 text-[#ffd68d]" />
              <p>{siteConfig.email}</p>
            </a>
            <a
              href={siteConfig.googleBusinessHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 transition hover:text-[#ffd68d]"
            >
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#ffd68d]" />
              <p>{resolvedLocale === "mr" ? "Google Business प्रोफाइल" : "Google Business Profile"}</p>
            </a>
          </div>

          <div className="mt-5 flex items-center gap-4 text-[#fff5e6]">
            <a href={siteConfig.socialLinks.facebook} aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
            <a href={siteConfig.socialLinks.instagram} aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
            <a href={siteConfig.socialLinks.youtube} aria-label="YouTube"><Youtube className="h-5 w-5" /></a>
            <a href={siteConfig.socialLinks.pinterest} aria-label="Pinterest"><PinterestIcon className="h-5 w-5" /></a>
            <a href={siteConfig.googleBusinessHref} target="_blank" rel="noreferrer" aria-label="Google Business"><Globe className="h-5 w-5" /></a>
          </div>

          <div className="mt-8 space-y-1">
            {mobileSections.map((section) => (
              <div key={section.key} className="py-2">
                <button type="button" onClick={() => toggleSection(section.key)} className="flex w-full items-center justify-between py-3 text-left">
                  <span className="text-[1.8rem] font-semibold leading-none text-[#fff7ed]">{section.title}</span>
                  {openSection === section.key ? <ChevronDown className="h-5 w-5 text-[#ffd68d]" /> : <Plus className="h-5 w-5 text-[#ffd68d]" />}
                </button>

                {openSection === section.key ? (
                  section.key === "newsletter" ? (
                    <div className="pb-4 pt-1">
                      <p className="text-sm leading-6 text-[#eedbc7]">
                        {resolvedLocale === "mr"
                          ? "नवीन उत्पादने, परंपरेच्या कथा आणि कॅटलॉग अपडेट्ससाठी शिवराय आर्ट्सशी जोडलेले राहा."
                          : `Stay connected for new product drops, heritage stories, and catalogue updates from ${footerBrandName}.`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2 pb-4 text-sm text-[#eedbc7]">
                      {section.links.map((link) => (
                        <Link key={link.label} to={link.to} className="py-1 transition hover:text-[#ffd68d]">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-[#cfb097] lg:mt-14 lg:flex lg:items-center lg:justify-between">
          <Link to="/contact" className="text-lg font-semibold text-[#f2dfcc] transition hover:text-[#ffd68d]">
            {resolvedLocale === "mr" ? "मदत आणि प्रश्नोत्तरे" : "Help & FAQs"}
          </Link>
          <p className="mt-4 text-sm leading-6 lg:mt-0">
            {resolvedLocale === "mr"
              ? "© 2026 शिवराय आर्ट अँड हँडक्राफ्ट. सर्व हक्क राखीव. सर्व रंग कोड, डिझाइन्स आणि प्रतिमा या शिवराय आर्ट अँड हँडक्राफ्ट यांची बौद्धिक मालमत्ता आहेत आणि कॉपीराइट कायद्यांनी संरक्षित आहेत. अनधिकृत वापर, पुनरुत्पादन किंवा वितरण कडक मनाई आहे."
              : `© 2026 ${footerBrandName}. All rights reserved. All colour codes, designs, and images are the intellectual property of ${footerBrandName} and are protected by copyright laws. Unauthorized use, reproduction, or distribution is strictly prohibited.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
