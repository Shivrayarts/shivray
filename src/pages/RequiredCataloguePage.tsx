import { BookOpenText, FileCheck2, MessageCircle, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    address: "",
  });
  const [touched, setTouched] = useState<{ name: boolean; phone: boolean }>({
    name: false,
    phone: false,
  });
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
    const text = encodeURIComponent(
      `Hi Shivray, please share your latest catalogue.\nName: ${form.name || "-"}\nPhone: ${
        form.phone || "-"
      }\nCatalogue Category: ${resolveLocalizedText(
        selectedCatalogue.title,
        resolvedLocale,
      )}\nAddress: ${form.address || "-"}`,
    );

    return `${siteConfig.whatsappHref}?text=${text}`;
  }, [form, resolvedLocale, selectedCatalogue.title]);

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
      <section className="px-4 pt-6 md:px-6">
        <div className="layout-shell grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
              {resolvedLocale === "mr" ? "à¤•à¤¾ à¤®à¤¾à¤—à¤µà¤¾à¤µà¥‡" : "Why request it"}
            </p>
            <div className="mt-5 space-y-4">
              {[
                {
                  icon: BookOpenText,
                  title: "Multiple catalogue types",
                  text: "Customers can directly choose statue, weapon, shield, decor, or full-range catalogue requests.",
                },
                {
                  icon: FileCheck2,
                  title: "Filtered recommendations",
                  text: "Each request can point to the exact catalogue type and help us send more relevant options.",
                },
                {
                  icon: Phone,
                  title: "Fast follow-up",
                  text: "Phone-first users can move directly from request to call or WhatsApp support.",
                },
                {
                  icon: MessageCircle,
                  title: "Easy sharing",
                  text: "Once you submit your interest, catalogue details can be shared quickly for family, friends, or group buying decisions.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] bg-[#fcf7f0] p-4">
                  <div className="flex gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#b17024]" />
                    <div>
                      <p className="font-semibold text-[#34180e]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[#7e624b]">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
              {resolvedLocale === "mr" ? "à¤µà¤¿à¤¨à¤‚à¤¤à¥€ à¤«à¥‰à¤°à¥à¤®" : "Request Form"}
            </p>
            <h2 className="mt-2 font-heading text-3xl text-[#34180e]">
              {resolvedLocale === "mr"
                ? "à¤•à¥…à¤Ÿà¤²à¥‰à¤— à¤®à¤¿à¤³à¤µà¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤¤à¤ªà¤¶à¥€à¤² à¤­à¤°à¤¾"
                : "Fill in your details to get the catalogue"}
            </h2>
            <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
              <div>
                <label htmlFor="catalogue-name" className="text-sm font-medium text-[#34180e]">
                  {resolvedLocale === "mr" ? "à¤¨à¤¾à¤µ" : "Name"}
                </label>
                <input
                  id="catalogue-name"
                  type="text"
                  value={form.name}
                  onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "à¤¤à¥à¤®à¤šà¥‡ à¤¨à¤¾à¤µ" : "Your name"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${
                    shouldShowNameError ? "border-[#b42318]" : "border-[#eadbc8]"
                  }`}
                />
                {shouldShowNameError ? (
                  <p className="mt-2 text-sm text-[#b42318]">
                    {resolvedLocale === "mr"
                      ? "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¤à¥à¤®à¤šà¥‡ à¤ªà¥‚à¤°à¥à¤£ à¤¨à¤¾à¤µ à¤Ÿà¤¾à¤•à¤¾."
                      : "Please enter your full name."}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="catalogue-phone" className="text-sm font-medium text-[#34180e]">
                  {resolvedLocale === "mr" ? "à¤«à¥‹à¤¨ à¤¨à¤‚à¤¬à¤°" : "Phone Number"}
                </label>
                <input
                  id="catalogue-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.phone}
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  placeholder={
                    resolvedLocale === "mr"
                      ? "à¥§à¥¦ à¤…à¤‚à¤•à¥€ à¤«à¥‹à¤¨ à¤¨à¤‚à¤¬à¤° à¤Ÿà¤¾à¤•à¤¾"
                      : "Enter 10-digit phone number"
                  }
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${
                    shouldShowPhoneError ? "border-[#b42318]" : "border-[#eadbc8]"
                  }`}
                />
                {shouldShowPhoneError ? (
                  <p className="mt-2 text-sm text-[#b42318]">
                    {resolvedLocale === "mr"
                      ? "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤µà¥ˆà¤§ à¥§à¥¦ à¤…à¤‚à¤•à¥€ à¤«à¥‹à¤¨ à¤¨à¤‚à¤¬à¤° à¤Ÿà¤¾à¤•à¤¾."
                      : "Please enter a valid 10-digit phone number."}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="catalogue-type" className="text-sm font-medium text-[#34180e]">
                  {resolvedLocale === "mr" ? "à¤•à¥…à¤Ÿà¤²à¥‰à¤— à¤•à¥…à¤Ÿà¥‡à¤—à¤°à¥€" : "Catalogue Category"}
                </label>
                <select
                  id="catalogue-type"
                  value={form.catalogueType}
                  onChange={(event) => setForm((value) => ({ ...value, catalogueType: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] outline-none"
                >
                  {catalogueTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {resolveLocalizedText(type.title, resolvedLocale)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="catalogue-address" className="text-sm font-medium text-[#34180e]">
                  {resolvedLocale === "mr" ? "à¤ªà¤¤à¥à¤¤à¤¾" : "Address"}
                </label>
                <textarea
                  id="catalogue-address"
                  rows={4}
                  value={form.address}
                  onChange={(event) => setForm((value) => ({ ...value, address: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "à¤¤à¥à¤®à¤šà¤¾ à¤ªà¥‚à¤°à¥à¤£ à¤ªà¤¤à¥à¤¤à¤¾" : "Enter your full address"}
                  className="mt-2 w-full resize-none rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappLink}
                  onClick={handleWhatsappClick}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  {resolvedLocale === "mr" ? "à¤•à¥…à¤Ÿà¤²à¥‰à¤— à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡" : "Download Catalogue"}
                </a>
                <a
                  href={`tel:${siteConfig.phoneHref}`}
                  className="inline-flex items-center justify-center rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e]"
                >
                  {resolvedLocale === "mr" ? "à¤†à¤¤à¤¾ à¤•à¥‰à¤² à¤•à¤°à¤¾" : "Call Now"}
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
