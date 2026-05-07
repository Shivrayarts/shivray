import { Facebook, Instagram, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import { useMemo, useState } from "react";
import { isValidMessage, isValidName, isValidPhone, normalizeDigits } from "@/lib/form-validation";
import { useLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site-config";

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.238 2.635 7.86 6.356 9.318-.088-.792-.167-2.008.035-2.873.183-.783 1.18-4.983 1.18-4.983s-.3-.6-.3-1.487c0-1.393.808-2.433 1.815-2.433.856 0 1.27.643 1.27 1.414 0 .861-.548 2.148-.83 3.342-.236.997.5 1.81 1.482 1.81 1.779 0 3.145-1.876 3.145-4.584 0-2.396-1.722-4.073-4.183-4.073-2.85 0-4.524 2.137-4.524 4.346 0 .861.332 1.786.747 2.288.082.1.094.188.07.289-.076.317-.244.997-.278 1.136-.044.183-.146.222-.337.134-1.255-.584-2.04-2.418-2.04-3.892 0-3.168 2.302-6.077 6.636-6.077 3.484 0 6.194 2.483 6.194 5.8 0 3.46-2.181 6.246-5.21 6.246-1.017 0-1.975-.528-2.301-1.153l-.625 2.381c-.226.87-.837 1.96-1.248 2.626.94.29 1.936.448 2.968.448 5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
    </svg>
  );
}

export default function ContactPage() {
  const { resolvedLocale } = useLanguage();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [touched, setTouched] = useState({ name: false, phone: false, message: false });

  const isNameValid = isValidName(form.name);
  const isPhoneValid = isValidPhone(form.phone);
  const isMessageValid = isValidMessage(form.message);
  const isFormValid = isNameValid && isPhoneValid && isMessageValid;

  const whatsappLink = useMemo(() => {
    const query = encodeURIComponent(
      `Hi Shivray Arts, I am ${form.name || "interested in your products"}. ${form.phone ? `My number is ${form.phone}. ` : ""}${form.message || "Please contact me back."}`,
    );
    return `${siteConfig.whatsappHref}?text=${query}`;
  }, [form]);

  const emailLink = useMemo(() => {
    const subject = encodeURIComponent(`New enquiry from ${form.name || "website visitor"}`);
    const body = encodeURIComponent(
      [
        "Hello Shivray Arts,",
        "",
        `Name: ${form.name || "-"}`,
        `Phone: ${form.phone || "-"}`,
        "",
        "Message:",
        form.message || "Please contact me back.",
      ].join("\n"),
    );

    return `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  }, [form]);

  const markAllTouched = () => {
    setTouched({ name: true, phone: true, message: true });
  };

  const handleWhatsappClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    markAllTouched();
    if (!isFormValid) {
      event.preventDefault();
    }
  };

  const handleEmailClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    markAllTouched();
    if (!isFormValid) {
      event.preventDefault();
    }
  };

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      {/* <section className="bg-[#2b130c] px-4 pb-8 pt-6 text-white md:px-6 md:pb-12 md:pt-10">
        <div className="layout-shell">
          <span className="inline-flex rounded-full border border-[#f2bb64]/30 bg-[#f2bb64]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd68d]">
            {resolvedLocale === "mr" ? "संपर्क पृष्ठ" : "Contact Page"}
          </span>
          <h1 className="mt-4 font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">
            {resolvedLocale === "mr" ? "मोबाइल वापरकर्त्यांसाठी सोपे संपर्क पर्याय." : "Simple contact options for mobile users."}
          </h1>
        </div>
      </section> */}

      <section className="px-4 pt-6 md:px-6">
        <div className="layout-shell grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
              {resolvedLocale === "mr" ? "थेट सहाय्य" : "Direct Support"}
            </p>

            <div className="mt-5 space-y-5">
              <div className="rounded-[24px] bg-[#fcf7f0] p-4">
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#b17024]" />
                  <div>
                    <p className="font-semibold text-[#34180e]">{resolvedLocale === "mr" ? "आम्हाला कॉल करा" : "Call us"}</p>
                    <a href={`tel:${siteConfig.phoneHref}`} className="mt-1 inline-block text-sm text-[#7e624b]">
                      {siteConfig.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#fcf7f0] p-4">
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#b17024]" />
                  <div>
                    <p className="font-semibold text-[#34180e]">{resolvedLocale === "mr" ? "आम्हाला ईमेल करा" : "Email us"}</p>
                    <a href={`mailto:${siteConfig.email}`} className="mt-1 inline-block text-sm text-[#7e624b]">
                      {siteConfig.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#fcf7f0] p-4">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#b17024]" />
                  <div>
                    <p className="font-semibold text-[#34180e]">{resolvedLocale === "mr" ? "आमच्या स्टुडिओला भेट द्या" : "Visit our studio"}</p>
                    <p className="mt-1 text-sm leading-6 text-[#7e624b]">{siteConfig.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <a href={siteConfig.socialLinks.facebook} aria-label="Facebook" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbc8] bg-white text-[#34180e]">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={siteConfig.socialLinks.instagram} aria-label="Instagram" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbc8] bg-white text-[#34180e]">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={siteConfig.socialLinks.youtube} aria-label="YouTube" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbc8] bg-white text-[#34180e]">
                <Youtube className="h-4 w-4" />
              </a>
              <a href={siteConfig.socialLinks.pinterest} aria-label="Pinterest" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbc8] bg-white text-[#34180e]">
                <PinterestIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
              {resolvedLocale === "mr" ? "जलद चौकशी" : "Quick Enquiry"}
            </p>
            <h2 className="mt-2 font-heading text-3xl text-[#34180e]">
              {resolvedLocale === "mr" ? "तुमच्या फोनवरून छोटा संदेश पाठवा" : "Send a short message from your phone"}
            </h2>

            <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
              <div>
                <label htmlFor="contact-name" className="text-sm font-medium text-[#34180e]">
                  {resolvedLocale === "mr" ? "नाव" : "Name"}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={form.name}
                  onBlur={() => setTouched((value) => ({ ...value, name: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "तुमचे नाव" : "Your name"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.name && !isNameValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.name && !isNameValid ? (
                  <p className="mt-2 text-sm text-[#b42318]">{resolvedLocale === "mr" ? "कृपया तुमचे पूर्ण नाव टाका." : "Please enter your full name."}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contact-phone" className="text-sm font-medium text-[#34180e]">
                  {resolvedLocale === "mr" ? "फोन नंबर" : "Phone number"}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.phone}
                  onBlur={() => setTouched((value) => ({ ...value, phone: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, phone: normalizeDigits(event.target.value, 10) }))}
                  placeholder={resolvedLocale === "mr" ? "१० अंकी फोन नंबर टाका" : "Enter 10-digit phone number"}
                  className={`mt-2 w-full rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.phone && !isPhoneValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.phone && !isPhoneValid ? (
                  <p className="mt-2 text-sm text-[#b42318]">
                    {resolvedLocale === "mr" ? "कृपया वैध १० अंकी फोन नंबर टाका." : "Please enter a valid 10-digit phone number."}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contact-message" className="text-sm font-medium text-[#34180e]">
                  {resolvedLocale === "mr" ? "संदेश" : "Message"}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onBlur={() => setTouched((value) => ({ ...value, message: true }))}
                  onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))}
                  placeholder={resolvedLocale === "mr" ? "तुम्हाला काय खरेदी करायचे आहे किंवा काय विचारायचे आहे ते लिहा" : "Tell us what you want to buy or ask for"}
                  className={`mt-2 w-full resize-none rounded-2xl border bg-[#fcf8f2] px-4 py-3 text-sm text-[#34180e] ${touched.message && !isMessageValid ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                />
                {touched.message && !isMessageValid ? (
                  <p className="mt-2 text-sm text-[#b42318]">{resolvedLocale === "mr" ? "कृपया किमान १० अक्षरांचा संदेश टाका." : "Please enter at least 10 characters in your message."}</p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappLink}
                  onClick={handleWhatsappClick}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                >
                  <Send className="h-4 w-4" />
                  {resolvedLocale === "mr" ? "व्हॉट्सअॅपवर पाठवा" : "Send on WhatsApp"}
                </a>
                <a
                  href={emailLink}
                  onClick={handleEmailClick}
                  className="inline-flex items-center justify-center rounded-full border border-[#d8b48b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#34180e]"
                >
                  {resolvedLocale === "mr" ? "ईमेल पाठवा" : "Send Email"}
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
