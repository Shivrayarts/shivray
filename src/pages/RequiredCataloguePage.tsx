import { BookOpenText, FileCheck2, MessageCircle, Phone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { defaultCatalogueTypes, getCatalogueTypeById } from "@/lib/catalogue-types";
import { useStoredCatalogueTypes } from "@/lib/content-store";
import { isValidName, isValidPhone, normalizeDigits } from "@/lib/form-validation";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";

export default function RequiredCataloguePage() {
  const { resolvedLocale } = useLanguage();
  const activeCatalogueTypes = useStoredCatalogueTypes().filter((item) => item.isActive);
  const catalogueTypes = activeCatalogueTypes.length ? activeCatalogueTypes : defaultCatalogueTypes;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    catalogueType: catalogueTypes[0].id,
    notes: "",
  });
  const [touched, setTouched] = useState<{ name: boolean; phone: boolean }>({
    name: false,
    phone: false,
  });
  const [categorySlide, setCategorySlide] = useState(0);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const categoryCards = catalogueTypes.slice(0, 4);
  const selectedCatalogue = getCatalogueTypeById(form.catalogueType, catalogueTypes);
  const isNameValid = isValidName(form.name);
  const isPhoneValid = isValidPhone(form.phone);
  const shouldShowNameError = touched.name && !isNameValid;
  const shouldShowPhoneError = touched.phone && !isPhoneValid;

  useEffect(() => {
    if (!catalogueTypes.some((item) => item.id === form.catalogueType)) {
      setForm((value) => ({ ...value, catalogueType: catalogueTypes[0].id }));
    }
  }, [catalogueTypes, form.catalogueType]);

  const whatsappLink = useMemo(() => {
    const text = encodeURIComponent(`Hi Shivray, please share your latest catalogue.\nName: ${form.name || "-"}\nPhone: ${form.phone || "-"}\nCatalogue Type: ${resolveLocalizedText(selectedCatalogue.title, resolvedLocale)}\nNotes: ${form.notes || "-"}`);
    return `${siteConfig.whatsappHref}?text=${text}`;
  }, [form, resolvedLocale, selectedCatalogue.title]);

  const handleCategoriesScroll = () => {
    const node = categoriesRef.current;
    if (!node || window.innerWidth >= 768) return;
    const firstCard = node.querySelector<HTMLElement>("[data-catalogue-card]");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 16;
    const nextSlide = Math.round(node.scrollLeft / cardWidth);
    setCategorySlide(Math.max(0, Math.min(nextSlide, categoryCards.length - 1)));
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = normalizeDigits(value, 10);
    setForm((current) => ({ ...current, phone: digitsOnly }));
  };

  const handleWhatsappClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setTouched({ name: true, phone: true });
    if (!isNameValid || !isPhoneValid) {
      event.preventDefault();
    }
  };

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      <section className="bg-[#2b130c] px-4 pb-8 pt-6 text-white md:px-6 md:pb-12 md:pt-10">
        <div className="layout-shell">
          <span className="inline-flex rounded-full border border-[#f2bb64]/30 bg-[#f2bb64]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd68d]">{resolvedLocale === "mr" ? "आवश्यक कॅटलॉग" : "Required Catalogue"}</span>
          <h1 className="mt-4 font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">{resolvedLocale === "mr" ? "योग्य कॅटलॉग प्रकार एका झटक्यात मागवा." : "Ask for the right catalogue type in one quick step."}</h1>
        </div>
      </section>
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="layout-shell rounded-[34px] bg-[#fffdf8] px-4 py-6 md:px-8 md:py-8">
          <div className="text-center"><h2 className="font-body text-3xl font-semibold text-[#1d150f] md:text-4xl">{resolvedLocale === "mr" ? "लोकप्रिय श्रेणी" : "Popular Categories"}</h2></div>
          <div ref={categoriesRef} onScroll={handleCategoriesScroll} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-x-6 md:overflow-visible md:pb-0">
            {categoryCards.map((card) => (
              <button key={card.id} type="button" data-catalogue-card onClick={() => setForm((value) => ({ ...value, catalogueType: card.id }))} className="group min-w-[78%] snap-center text-center sm:min-w-[calc(50%-0.5rem)] md:min-w-0">
                <div className="relative overflow-hidden rounded-[30px] bg-[#b65a73] shadow-[0_18px_45px_-30px_rgba(89,34,49,0.65)]">
                  <img src={card.image} alt={resolveLocalizedText(card.title, resolvedLocale)} className="aspect-square w-full object-cover opacity-90 saturate-[0.7] transition duration-500 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 font-body text-xl font-semibold text-[#1c140f] md:text-2xl">{resolveLocalizedText(card.shortLabel, resolvedLocale)}</h3>
                <p className="mt-1 text-base text-[#7d766f]">{resolveLocalizedText(card.itemCountLabel, resolvedLocale)}</p>
              </button>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-center gap-3">
            {categoryCards.map((card, index) => <span key={card.id} className={`rounded-full ${index === categorySlide ? "h-4 w-4 border border-[#1d150f] bg-white shadow-[inset_0_0_0_4px_#1d150f]" : "h-2.5 w-2.5 bg-[#a9a29c]"}`} />)}
          </div>
        </div>
      </section>
      <section className="px-4 pt-6 md:px-6">
        <div className="layout-shell grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">{resolvedLocale === "mr" ? "का मागवावे" : "Why request it"}</p>
            <div className="mt-5 space-y-4">
              {[{ icon: BookOpenText, title: "Multiple catalogue types", text: "Customers can directly choose statue, weapon, shield, decor, or full-range catalogue requests." }, { icon: FileCheck2, title: "Filtered recommendations", text: "Each request can point to the exact catalogue type and help us send more relevant options." }, { icon: Phone, title: "Fast follow-up", text: "Phone-first users can move directly from request to call or WhatsApp support." }].map((item) => (
                <div key={item.title} className="rounded-[24px] bg-[#fcf7f0] p-4"><div className="flex gap-3"><item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#b17024]" /><div><p className="font-semibold text-[#34180e]">{item.title}</p><p className="mt-2 text-sm leading-6 text-[#7e624b]">{item.text}</p></div></div></div>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">{resolvedLocale === "mr" ? "विनंती फॉर्म" : "Request Form"}</p>
            <h2 className="mt-2 font-heading text-3xl text-[#34180e]">{resolvedLocale === "mr" ? "तुम्हाला हवा असलेला कॅटलॉग निवडा" : "Choose the catalogue type you need"}</h2>
            <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
              <div>
                <label className="text-sm font-medium text-[#34180e]">{resolvedLocale === "mr" ? "कॅटलॉग प्रकार" : "Catalogue type"}</label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {catalogueTypes.map((type) => {
                    const active = form.catalogueType === type.id;
                    return (
                      <button key={type.id} type="button" onClick={() => setForm((value) => ({ ...value, catalogueType: type.id }))} className={`rounded-[22px] border px-4 py-4 text-left ${active ? "border-[#34180e] bg-[#34180e] text-white" : "border-[#eadbc8] bg-[#fcf8f2] text-[#34180e]"}`}>
                        <p className="text-sm font-semibold">{resolveLocalizedText(type.title, resolvedLocale)}</p>
                        <p className={`mt-2 text-xs leading-5 ${active ? "text-white/75" : "text-[#7e624b]"}`}>{resolveLocalizedText(type.description, resolvedLocale)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label htmlFor="catalogue-name" className="text-sm font-medium text-[#34180e]">{resolvedLocale === "mr" ? "नाव" : "Name"}</label>
                <input
                  id="catalogue-name"
                  type="text"
                  value={form.name}
                  onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "तुमचे नाव" : "Your name"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${
                    shouldShowNameError ? "border-[#b42318]" : "border-[#eadbc8]"
                  }`}
                />
                {shouldShowNameError ? (
                  <p className="mt-2 text-sm text-[#b42318]">{resolvedLocale === "mr" ? "कृपया तुमचे पूर्ण नाव टाका." : "Please enter your full name."}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="catalogue-phone" className="text-sm font-medium text-[#34180e]">{resolvedLocale === "mr" ? "फोन नंबर" : "Phone Number"}</label>
                <input
                  id="catalogue-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.phone}
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  placeholder={resolvedLocale === "mr" ? "१० अंकी फोन नंबर टाका" : "Enter 10-digit phone number"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${
                    shouldShowPhoneError ? "border-[#b42318]" : "border-[#eadbc8]"
                  }`}
                />
                {shouldShowPhoneError ? (
                  <p className="mt-2 text-sm text-[#b42318]">{resolvedLocale === "mr" ? "कृपया वैध १० अंकी फोन नंबर टाका." : "Please enter a valid 10-digit phone number."}</p>
                ) : null}
              </div>
              <div><div className="rounded-[24px] border border-[#eadbc8] bg-[#fcf8f2] px-4 py-4"><p className="text-sm font-medium text-[#34180e]">{resolvedLocale === "mr" ? "निवडलेला कॅटलॉग" : "Selected catalogue"}</p><p className="mt-2 font-semibold text-[#34180e]">{resolveLocalizedText(selectedCatalogue.title, resolvedLocale)}</p><p className="mt-2 text-sm leading-6 text-[#7e624b]">{resolveLocalizedText(selectedCatalogue.description, resolvedLocale)}</p></div></div>
              <div><label htmlFor="catalogue-notes" className="text-sm font-medium text-[#34180e]">{resolvedLocale === "mr" ? "टीप" : "Notes"}</label><textarea id="catalogue-notes" rows={4} value={form.notes} onChange={(event) => setForm((value) => ({ ...value, notes: event.target.value }))} placeholder={resolvedLocale === "mr" ? "बजेट, प्रमाण किंवा विशेष गरज" : "Budget, quantity, or special requirement"} className="mt-2 w-full resize-none rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e]" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <a href={whatsappLink} onClick={handleWhatsappClick} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"><MessageCircle className="h-4 w-4" />{resolvedLocale === "mr" ? "कॅटलॉग डाउनलोड" : "Download Catalogue"}</a>
                <a href={`tel:${siteConfig.phoneHref}`} className="inline-flex items-center justify-center rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e]">{resolvedLocale === "mr" ? "आता कॉल करा" : "Call Now"}</a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
