import { Link, useNavigate } from "@/lib/spa-router";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, ShoppingBag, Smartphone, UserRound } from "lucide-react";
import { useState } from "react";
import { isValidEmail, isValidName } from "@/lib/form-validation";
import { useLanguage } from "@/lib/language";
import { loginCustomer } from "@/lib/customer-orders";

type AuthMode = "login" | "create";

const CUSTOMER_ACCOUNTS_KEY = "shivray_customer_accounts_v1";

type CustomerAccount = {
  name: string;
  email: string;
  password: string;
};

function getCustomerAccounts() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CUSTOMER_ACCOUNTS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as CustomerAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomerAccount(account: CustomerAccount) {
  if (typeof window === "undefined") return;
  const normalizedEmail = account.email.trim().toLowerCase();
  const accounts = getCustomerAccounts().filter((item) => item.email.toLowerCase() !== normalizedEmail);
  window.localStorage.setItem(
    CUSTOMER_ACCOUNTS_KEY,
    JSON.stringify([{ ...account, email: normalizedEmail }, ...accounts]),
  );
}

export default function LoginPage() {
  const { resolvedLocale } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const isCreateMode = mode === "create";

    if (
      !isValidEmail(normalizedEmail) ||
      password.trim().length < 6 ||
      (isCreateMode && !isValidName(trimmedName))
    ) {
      setTouched({ name: isCreateMode, email: true, password: true });
      setMessage(
        resolvedLocale === "mr"
          ? "कृपया वैध माहिती भरा. पासवर्ड किमान ६ अक्षरांचा असावा."
          : "Please enter valid details. Password must be at least 6 characters.",
      );
      return;
    }

    try {
      const accounts = getCustomerAccounts();
      const existingAccount = accounts.find((account) => account.email.toLowerCase() === normalizedEmail);

      if (isCreateMode) {
        saveCustomerAccount({
          name: trimmedName,
          email: normalizedEmail,
          password,
        });
      } else if (!existingAccount || existingAccount.password !== password) {
        setMessage(
          resolvedLocale === "mr"
            ? "खाते सापडले नाही किंवा पासवर्ड चुकीचा आहे. आधी खाते तयार करा."
            : "Account not found or password is incorrect. Please create an account first.",
        );
        return;
      }

      await loginCustomer({
        name: isCreateMode ? trimmedName : existingAccount?.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
      });

      setMessage(resolvedLocale === "mr" ? "लॉगिन यशस्वी झाले." : "Login successful.");
      navigate({ to: "/" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (resolvedLocale === "mr" ? "ग्राहक लॉगिन पूर्ण करता आले नाही." : "Unable to complete customer login."));
    }
  }

  async function handleGoogleContinue() {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim() || normalizedEmail.split("@")[0];

    if (!isValidEmail(normalizedEmail)) {
      setTouched((value) => ({ ...value, email: true }));
      setMessage(
        resolvedLocale === "mr"
          ? "Google पर्यायासाठी तुमचा Gmail पत्ता टाका."
          : "Enter your Google email address to continue.",
      );
      return;
    }

    try {
      saveCustomerAccount({
        name: trimmedName,
        email: normalizedEmail,
        password: "google",
      });
      await loginCustomer({
        name: trimmedName,
        email: normalizedEmail,
      });
      navigate({ to: "/" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue with Google.");
    }
  }

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      {/* <section className="bg-[#2b130c] px-4 pb-8 pt-6 text-white md:px-6 md:pb-12 md:pt-10"><div className="layout-shell"><span className="inline-flex rounded-full border border-[#f2bb64]/30 bg-[#f2bb64]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd68d]">{resolvedLocale === "mr" ? "लॉगिन पृष्ठ" : "Login Page"}</span><h1 className="mt-4 font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">{resolvedLocale === "mr" ? "मोबाइल ग्राहकांसाठी स्वच्छ लॉगिन स्क्रीन." : "A cleaner login screen for mobile customers."}</h1></div></section> */}
      <section className="px-4 pt-6 md:px-6">
        <div className="layout-shell grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">{resolvedLocale === "mr" ? "फायदे" : "Benefits"}</p>
            <div className="mt-5 space-y-4">
              <Link to="/products" className="flex items-center justify-between rounded-[24px] border border-[#eadbc8] bg-[#fff9f2] p-4"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]"><ShoppingBag className="h-5 w-5" /></div><div><p className="font-semibold text-[#34180e]">{resolvedLocale === "mr" ? "खरेदी सुरू ठेवा" : "Continue shopping"}</p><p className="mt-1 text-sm text-[#7e624b]">{resolvedLocale === "mr" ? "स्टोअरफ्रंटमधील उत्पादने सहज पाहा." : "Browse products like the reference storefront."}</p></div></div><ArrowRight className="h-4 w-4 text-[#b17024]" /></Link>
              {[{ icon: Smartphone, title: "Thumb-friendly layout", text: "Large fields, rounded actions, and no clutter for phone users." }, { icon: ShieldCheck, title: "Trust-focused design", text: "A calmer and more premium visual style that feels safer to use." }, { icon: LockKeyhole, title: "Static-host ready", text: "This version stores login state locally so it works smoothly on static hosting." }].map((item) => (
                <div key={item.title} className="rounded-[24px] bg-[#fcf7f0] p-4"><div className="flex gap-3"><item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#b17024]" /><div><p className="font-semibold text-[#34180e]">{item.title}</p><p className="mt-2 text-sm leading-6 text-[#7e624b]">{item.text}</p></div></div></div>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <div className="mx-auto max-w-md">
              <div className="flex items-center gap-3"><div className="rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]"><LockKeyhole className="h-5 w-5" /></div><div><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">{mode === "create" ? (resolvedLocale === "mr" ? "खाते तयार करा" : "Create Account") : (resolvedLocale === "mr" ? "साइन इन" : "Sign In")}</p><h2 className="mt-1 font-heading text-3xl text-[#34180e]">{mode === "create" ? (resolvedLocale === "mr" ? "नवीन खाते" : "Create your account") : (resolvedLocale === "mr" ? "पुन्हा स्वागत आहे" : "Welcome back")}</h2></div></div>
              <div className="mt-5 grid grid-cols-2 rounded-full bg-[#fcf8f2] p-1 text-sm font-semibold text-[#6c4b33]">
                <button type="button" onClick={() => setMode("login")} className={`rounded-full px-4 py-2 ${mode === "login" ? "bg-[#34180e] text-white" : ""}`}>{resolvedLocale === "mr" ? "लॉगिन" : "Login"}</button>
                <button type="button" onClick={() => setMode("create")} className={`rounded-full px-4 py-2 ${mode === "create" ? "bg-[#34180e] text-white" : ""}`}>{resolvedLocale === "mr" ? "खाते तयार करा" : "Create account"}</button>
              </div>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {mode === "create" ? (
                  <div><label htmlFor="login-name" className="text-sm font-medium text-[#34180e]">{resolvedLocale === "mr" ? "नाव" : "Name"}</label><div className="relative mt-2"><UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" /><input id="login-name" type="text" value={name} onBlur={() => setTouched((value) => ({ ...value, name: true }))} onChange={(event) => setName(event.target.value)} placeholder={resolvedLocale === "mr" ? "तुमचे नाव" : "Your name"} className={`w-full rounded-2xl border bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] ${touched.name && !isValidName(name) ? "border-[#b42318]" : "border-[#eadbc8]"}`} /></div>{touched.name && !isValidName(name) ? <p className="mt-2 text-sm text-[#b42318]">{resolvedLocale === "mr" ? "कृपया तुमचे नाव टाका." : "Please enter your name."}</p> : null}</div>
                ) : null}
                <div><label htmlFor="login-email" className="text-sm font-medium text-[#34180e]">{resolvedLocale === "mr" ? "ईमेल" : "Email"}</label><div className="relative mt-2"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" /><input id="login-email" type="email" value={email} onBlur={() => setTouched((value) => ({ ...value, email: true }))} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" className={`w-full rounded-2xl border bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] ${touched.email && !isValidEmail(email) ? "border-[#b42318]" : "border-[#eadbc8]"}`} /></div>{touched.email && !isValidEmail(email) ? <p className="mt-2 text-sm text-[#b42318]">{resolvedLocale === "mr" ? "कृपया वैध ईमेल पत्ता टाका." : "Please enter a valid email address."}</p> : null}</div>
                <div><label htmlFor="login-password" className="text-sm font-medium text-[#34180e]">{resolvedLocale === "mr" ? "पासवर्ड" : "Password"}</label><div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" /><input id="login-password" type="password" value={password} onBlur={() => setTouched((value) => ({ ...value, password: true }))} onChange={(event) => setPassword(event.target.value)} placeholder={resolvedLocale === "mr" ? "पासवर्ड टाका" : "Enter password"} className={`w-full rounded-2xl border bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] ${touched.password && password.trim().length < 6 ? "border-[#b42318]" : "border-[#eadbc8]"}`} /></div>{touched.password && password.trim().length < 6 ? <p className="mt-2 text-sm text-[#b42318]">{resolvedLocale === "mr" ? "पासवर्ड किमान ६ अक्षरांचा असावा." : "Password must be at least 6 characters."}</p> : null}</div>
                <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">{mode === "create" ? (resolvedLocale === "mr" ? "खाते तयार करा" : "Create Account") : (resolvedLocale === "mr" ? "लॉगिन" : "Login")}</button>
              </form>
              <button type="button" onClick={handleGoogleContinue} className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#d8b48b] bg-white px-5 py-3 text-sm font-semibold text-[#34180e]">
                {resolvedLocale === "mr" ? "Google ईमेलने पुढे जा" : "Continue with Google email"}
              </button>
              {message ? <p className="mt-3 text-sm font-medium text-[#7a4d20]">{message}</p> : null}
              <div className="mt-5 flex flex-col gap-3 text-center text-sm text-[#7e624b]">
                <Link to="/contact" className="transition hover:text-[#34180e]">{resolvedLocale === "mr" ? "तुमच्या खात्यासाठी मदत हवी आहे?" : "Need help with your account?"}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
