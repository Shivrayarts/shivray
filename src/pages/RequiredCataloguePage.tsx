import { MessageCircle, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { isValidMessage, isValidName, isValidPhone, normalizeDigits } from "@/lib/form-validation";
import { resolveLocalizedText, useLanguage } from "@/lib/language";
import { submitCatalogueRequest } from "@/lib/customer-orders";
import { siteConfig } from "@/lib/site-config";
import { useStoredCatalogueTypes, useStoredProducts } from "@/lib/content-store";

const DEFAULT_CATALOGUE_DOWNLOAD_URL =
  "https://drive.google.com/file/d/1bb7BCzLHReNhlxYsIwefT19R-c2CVd6q/view?usp=drive_link";

function toDownloadUrl(rawUrl: string) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";

  const driveMatch = value.match(/\/d\/([a-zA-Z0-9_-]+)/) || value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  return value;
}

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
  const [selectedCatalogueId] = useState("full-catalogue");
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [touched, setTouched] = useState({ name: false, phone: false, address: false, note: false });
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const selectedCatalogue =
    activeCatalogues.find((catalogue) => catalogue.id === "full-catalogue") ??
    catalogueTypes.find((catalogue) => catalogue.id === "full-catalogue");
  const selectedCatalogueTitle = selectedCatalogue
    ? resolveLocalizedText(selectedCatalogue.title, resolvedLocale)
    : resolvedLocale === "mr"
      ? "पूर्ण कॅटलॉग"
      : "Full Catalogue";

  const isNameValid = isValidName(form.name);
  const isPhoneValid = isValidPhone(form.phone);
  const isAddressValid = form.address.trim().length >= 10;
  const isNoteValid = form.note.trim().length === 0 || isValidMessage(form.note, 5);
  const isFormValid = isNameValid && isPhoneValid && isAddressValid && isNoteValid && Boolean(selectedCatalogueTitle);
  const selectedDownloadUrl = toDownloadUrl(selectedCatalogue?.downloadUrl || DEFAULT_CATALOGUE_DOWNLOAD_URL);

  const markAllTouched = () => {
    setTouched({ name: true, phone: true, address: true, note: true });
  };

  const guardCall = (event: React.MouseEvent<HTMLAnchorElement>) => {
    markAllTouched();
    if (!isFormValid) {
      event.preventDefault();
    }
  };

  const handleDownload = async () => {
    markAllTouched();
    if (!isFormValid || !selectedCatalogue) return;

    setSubmitState("submitting");
    setSubmitMessage("");
    const pendingWindow =
      typeof window !== "undefined" && selectedDownloadUrl
        ? window.open("", "_blank", "noopener,noreferrer")
        : null;

    try {
      await submitCatalogueRequest({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
        catalogueId: selectedCatalogue.id,
        catalogueTitle: selectedCatalogueTitle,
      });

      if (pendingWindow && selectedDownloadUrl) {
        pendingWindow.location.href = selectedDownloadUrl;
      } else if (typeof window !== "undefined" && selectedDownloadUrl) {
        window.location.href = selectedDownloadUrl;
      }

      setSubmitState("done");
      setSubmitMessage("Catalogue download started successfully.");
    } catch (error) {
      console.error("Unable to save catalogue request.", error);
      if (pendingWindow && !pendingWindow.closed) {
        pendingWindow.close();
      }
      setSubmitState("idle");
      setSubmitMessage("We could not save your request right now. Please try again.");
    }
  };

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      <section className="px-4 pt-6 md:px-6 md:pt-10">
        <div className="layout-shell">
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
                  {resolvedLocale === "mr" ? "नाव" : "Name"}
                </label>
                <input
                  id="catalogue-name"
                  type="text"
                  value={form.name}
                  onBlur={() => setTouched((value) => ({ ...value, name: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "तुमचे नाव" : "Your name"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.name && !isNameValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.name && !isNameValid ? <p className="mt-2 text-sm text-[#b42318]">Please enter your full name.</p> : null}
              </div>

              <div>
                <label htmlFor="catalogue-phone" className="text-sm font-semibold text-[#34180e]">
                  {resolvedLocale === "mr" ? "नंबर" : "Phone Number"}
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
                  onChange={() => undefined}
                  className="mt-2 w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e]"
                >
                  <option value="full-catalogue">
                    Full Catalogue ({catalogueCounts["full-catalogue"] ?? products.length} products)
                  </option>
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
                  {resolvedLocale === "mr" ? "अतिरिक्त माहिती" : "Requirement (optional)"}
                </label>
                <textarea
                  id="catalogue-note"
                  rows={3}
                  value={form.note}
                  onBlur={() => setTouched((value) => ({ ...value, note: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, note: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "बजेट, साइज किंवा डिलिव्हरी शहर" : "Budget, size, quantity, or delivery city"}
                  className={`mt-2 w-full resize-none rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.note && !isNoteValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.note && !isNoteValid ? <p className="mt-2 text-sm text-[#b42318]">Please add at least 5 characters or leave it blank.</p> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={submitState === "submitting"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  {submitState === "submitting"
                    ? resolvedLocale === "mr"
                      ? "सेव होत आहे..."
                      : "Saving..."
                    : resolvedLocale === "mr"
                      ? "कॅटलॉग मिळवा"
                      : "Download Catalogue"}
                </button>
                <a
                  href={`tel:${siteConfig.phoneHref}`}
                  onClick={guardCall}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e]"
                >
                  <Phone className="h-4 w-4" />
                  {resolvedLocale === "mr" ? "आता कॉल करा" : "Call now"}
                </a>
              </div>
              {submitMessage ? (
                <p className={`text-sm ${submitState === "done" ? "text-[#166534]" : "text-[#b42318]"}`}>{submitMessage}</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

