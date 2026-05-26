import { MessageCircle, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { isValidMessage, isValidName, isValidPhone, normalizeDigits } from "@/lib/form-validation";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";
import { useStoredCatalogueTypes, useStoredProducts } from "@/lib/content-store";

export default function RequiredCataloguePage() {
  const { resolvedLocale } = useLanguage();
  const catalogueTypes = useStoredCatalogueTypes();
  const products = useStoredProducts();
  const activeCatalogues = useMemo(
    () => catalogueTypes.filter((catalogue) => catalogue.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [catalogueTypes],
  );
  const catalogueCounts = useMemo(() => {
    const countByCatalogueId: Record<string, number> = {
      "statues-catalogue": products.filter((product) => product.category === "Statues").length,
      "weapons-catalogue": products.filter((product) => product.category === "Weapons").length,
      "shield-catalogue": products.filter((product) => product.category === "Shields").length,
      "dhoop-catalogue": products.filter((product) => product.category === "Dhoop").length,
      "full-catalogue": products.length,
    };
    return countByCatalogueId;
  }, [products]);
  const defaultCatalogueId = activeCatalogues[activeCatalogues.length - 1]?.id ?? catalogueTypes[0]?.id ?? "";
  const [selectedCatalogueId, setSelectedCatalogueId] = useState(defaultCatalogueId);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [touched, setTouched] = useState({ name: false, phone: false, address: false, note: false });

  const selectedCatalogue =
    activeCatalogues.find((catalogue) => catalogue.id === selectedCatalogueId) ?? activeCatalogues[0];
  const selectedCatalogueTitle = selectedCatalogue
    ? resolveLocalizedText(selectedCatalogue.title, resolvedLocale)
    : resolvedLocale === "mr"
      ? "\u092a\u0942\u0930\u094d\u0923 \u0915\u0945\u091f\u0932\u0949\u0917"
      : "Full Catalogue";

  const isNameValid = isValidName(form.name);
  const isPhoneValid = isValidPhone(form.phone);
  const isAddressValid = form.address.trim().length >= 10;
  const isNoteValid = form.note.trim().length === 0 || isValidMessage(form.note, 5);
  const isFormValid = isNameValid && isPhoneValid && isAddressValid && isNoteValid && Boolean(selectedCatalogueTitle);

  const messageText = useMemo(
    () =>
      [
        `Hi Shivrayart, I want the ${selectedCatalogueTitle}.`,
        `Name: ${form.name || "-"}`,
        `Phone: ${form.phone || "-"}`,
        `Address: ${form.address || "-"}`,
        form.note ? `Note: ${form.note}` : "Please share details and pricing.",
      ].join("\n"),
    [form, selectedCatalogueTitle],
  );

  const whatsappLink = useMemo(
    () => `${siteConfig.whatsappHref}?text=${encodeURIComponent(messageText)}`,
    [messageText],
  );

  const markAllTouched = () => {
    setTouched({ name: true, phone: true, address: true, note: true });
  };

  const guardSubmit = (event: React.MouseEvent<HTMLAnchorElement>) => {
    markAllTouched();
    if (!isFormValid) {
      event.preventDefault();
    }
  };

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      <section className="px-4 pt-6 md:px-6 md:pt-10">
        <div className="layout-shell grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.3)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
              {resolvedLocale === "mr" ? "का मागवावे" : "Why request it"}
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] bg-[#f7f1e7] p-5">
                <p className="text-[1.4rem] font-semibold text-[#34180e]">{resolvedLocale === "mr" ? "अनेक कॅटलॉग प्रकार" : "Multiple catalogue types"}</p>
                <p className="mt-2 text-sm leading-7 text-[#6c4b33]">
                  {resolvedLocale === "mr" ? "मूर्ती, शस्त्र, ढाल, डेकोर आणि पूर्ण कॅटलॉगमधून निवड करा." : "Customers can directly choose statue, weapon, shield, decor, or full-range catalogue requests."}
                </p>
              </div>
              <div className="rounded-[24px] bg-[#f7f1e7] p-5">
                <p className="text-[1.4rem] font-semibold text-[#34180e]">{resolvedLocale === "mr" ? "योग्य शिफारसी" : "Filtered recommendations"}</p>
                <p className="mt-2 text-sm leading-7 text-[#6c4b33]">
                  {resolvedLocale === "mr" ? "तुमच्या निवडीप्रमाणे अधिक संबंधित पर्याय मिळतात." : "Each request can point to the exact catalogue type and help us send more relevant options."}
                </p>
              </div>
              <div className="rounded-[24px] bg-[#f7f1e7] p-5">
                <p className="text-[1.4rem] font-semibold text-[#34180e]">{resolvedLocale === "mr" ? "झटपट फॉलो-अप" : "Fast follow-up"}</p>
                <p className="mt-2 text-sm leading-7 text-[#6c4b33]">
                  {resolvedLocale === "mr" ? "फोन किंवा WhatsApp वरून थेट संपर्क." : "Phone-first users can move directly from request to call or WhatsApp support."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.3)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
              {resolvedLocale === "mr" ? "विनंती फॉर्म" : "Request Form"}
            </p>
            <h2 className="mt-3 font-heading text-[1.8rem] leading-tight text-[#34180e] md:text-[2.2rem]">
              {resolvedLocale === "mr" ? "कॅटलॉग मिळवण्यासाठी तपशील भरा" : "Fill in your details to get the catalogue"}
            </h2>
            <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
              <div>
                <label htmlFor="catalogue-name" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "\u0928\u093e\u0935" : "Name"}
                </label>
                <input
                  id="catalogue-name"
                  type="text"
                  value={form.name}
                  onBlur={() => setTouched((value) => ({ ...value, name: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "\u0924\u0941\u092e\u091a\u0947 \u0928\u093e\u0935" : "Your name"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.name && !isNameValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.name && !isNameValid ? <p className="mt-2 text-sm text-[#b42318]">Please enter your full name.</p> : null}
              </div>

              <div>
                <label htmlFor="catalogue-phone" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "\u0928\u0902\u092c\u0930" : "Phone Number"}
                </label>
                <input
                  id="catalogue-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.phone}
                  onBlur={() => setTouched((value) => ({ ...value, phone: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, phone: normalizeDigits(event.target.value, 10) }))}
                  placeholder={resolvedLocale === "mr" ? "10 अंकी नंबर टाका" : "Enter 10-digit phone number"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.phone && !isPhoneValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.phone && !isPhoneValid ? <p className="mt-2 text-sm text-[#b42318]">Please enter a valid 10-digit phone number.</p> : null}
              </div>

              <div>
                <label htmlFor="catalogue-category" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "कॅटलॉग प्रकार" : "Catalogue Category"}
                </label>
                <select
                  id="catalogue-category"
                  value={selectedCatalogueId}
                  onChange={(event) => setSelectedCatalogueId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e]"
                >
                  {activeCatalogues.map((catalogue) => {
                    const title = resolveLocalizedText(catalogue.title, resolvedLocale);
                    const dynamicCount = catalogueCounts[catalogue.id];
                    const itemCount =
                      typeof dynamicCount === "number"
                        ? `${dynamicCount} ${resolvedLocale === "mr" ? "\u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947" : "products"}`
                        : resolveLocalizedText(catalogue.itemCountLabel, resolvedLocale);
                    return (
                      <option key={catalogue.id} value={catalogue.id}>
                        {title} {itemCount ? `(${itemCount})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="catalogue-address" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "पत्ता" : "Address"}
                </label>
                <textarea
                  id="catalogue-address"
                  rows={5}
                  value={form.address}
                  onBlur={() => setTouched((value) => ({ ...value, address: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, address: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "तुमचा पूर्ण पत्ता टाका" : "Enter your full address"}
                  className={`mt-2 w-full resize-none rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.address && !isAddressValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.address && !isAddressValid ? <p className="mt-2 text-sm text-[#b42318]">Please enter complete address (minimum 10 characters).</p> : null}
              </div>

              <div>
                <label htmlFor="catalogue-note" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u092e\u093e\u0939\u093f\u0924\u0940" : "Requirement (optional)"}
                </label>
                <textarea
                  id="catalogue-note"
                  rows={3}
                  value={form.note}
                  onBlur={() => setTouched((value) => ({ ...value, note: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, note: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "\u092c\u091c\u0947\u091f, \u0938\u093e\u0907\u091c \u0915\u093f\u0902\u0935\u093e \u0921\u093f\u0932\u093f\u0935\u094d\u0939\u0930\u0940 \u0936\u0939\u0930" : "Budget, size, quantity, or delivery city"}
                  className={`mt-2 w-full resize-none rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.note && !isNoteValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.note && !isNoteValid ? <p className="mt-2 text-sm text-[#b42318]">Please add at least 5 characters or leave it blank.</p> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappLink}
                  onClick={guardSubmit}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  {resolvedLocale === "mr" ? "\u0915\u0945\u091f\u0932\u0949\u0917 \u092e\u093f\u0933\u0935\u093e" : "Download Catalogue"}
                </a>
                <a
                  href={`tel:${siteConfig.alternatePhoneHref}`}
                  onClick={guardSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e]"
                >
                  <Phone className="h-4 w-4" />
                  {resolvedLocale === "mr" ? "\u0906\u0924\u093e \u0915\u0949\u0932 \u0915\u0930\u093e" : "Call now"}
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
