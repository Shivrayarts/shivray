import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, ShoppingBag, Smartphone, UserRound } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { loginCustomer } from "@/lib/customer-orders";
import { isValidEmail, isValidName } from "@/lib/form-validation";
import { useLanguage } from "@/lib/language";
import { Link, useLocation, useNavigate } from "@/lib/spa-router";
import { toast } from "sonner";

type AuthMode = "login" | "create";

const CUSTOMER_ACCOUNTS_KEY = "shivray_customer_accounts_v1";
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
  const isMarathi = resolvedLocale === "mr";
  const marathiUiClass = isMarathi ? "font-brand-marathi tracking-normal" : "";
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";

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
        isMarathi
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
          isMarathi
            ? "खाते सापडले नाही किंवा पासवर्ड चुकीचा आहे. आधी खाते तयार करा."
            : "Account not found or password is incorrect. Please create an account first.",
        );
        return;
      }

      await loginCustomer({
        name: isCreateMode ? trimmedName : existingAccount?.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
      });

      setMessage(isMarathi ? "लॉगिन यशस्वी झाले." : "Login successful.");
      toast.success(isMarathi ? "तुम्ही लॉगिन झाला आहात." : "You are now logged in.");
      navigate({ to: redirectTo });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : isMarathi
            ? "ग्राहक लॉगिन पूर्ण करता आले नाही."
            : "Unable to complete customer login.",
      );
    }
  }

  async function handleGoogleContinue(credential: string) {
    try {
      const response = await apiRequest<{ customer: { name: string; email: string } }>("/api/customers/google-login", {
        method: "POST",
        body: { credential },
      });

      saveCustomerAccount({
        name: response.customer.name,
        email: response.customer.email,
        password: "google",
      });

      await loginCustomer({
        name: response.customer.name,
        email: response.customer.email,
      });

      setMessage(isMarathi ? "Google लॉगिन यशस्वी झाले." : "Google login successful.");
      toast.success(
        isMarathi
          ? `${response.customer.name} लॉगिन झाला आहे.`
          : `${response.customer.name} is logged in.`,
      );
      navigate({ to: redirectTo });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue with Google.");
    }
  }

  return (
    <div className={`bg-[#f7f1e7] pb-8 md:pb-12 ${marathiUiClass}`.trim()}>
      <section className="px-4 pt-6 md:px-6">
        <div className="layout-shell grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
              {isMarathi ? "फायदे" : "Benefits"}
            </p>
            <div className="mt-5 space-y-4">
              <Link
                to="/products"
                className="flex items-center justify-between rounded-[24px] border border-[#eadbc8] bg-[#fff9f2] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#34180e]">
                      {isMarathi ? "खरेदी सुरू ठेवा" : "Continue shopping"}
                    </p>
                    <p className="mt-1 text-sm text-[#7e624b]">
                      {isMarathi ? "स्टोअरफ्रंटमधील उत्पादने सहज पाहा." : "Browse products like the reference storefront."}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#b17024]" />
              </Link>
              {[
                {
                  icon: Smartphone,
                  title: "Thumb-friendly layout",
                  text: "Large fields, rounded actions, and no clutter for phone users.",
                },
                {
                  icon: ShieldCheck,
                  title: "Trust-focused design",
                  text: "A calmer and more premium visual style that feels safer to use.",
                },
                {
                  icon: LockKeyhole,
                  title: "Static-host ready",
                  text: "This version stores login state locally so it works smoothly on static hosting.",
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
            <div className="mx-auto max-w-md">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">
                    {mode === "create"
                      ? isMarathi
                        ? "खाते तयार करा"
                        : "Create Account"
                      : isMarathi
                        ? "साइन इन"
                        : "Sign In"}
                  </p>
                  <h2 className="mt-1 font-heading text-3xl text-[#34180e]">
                    {mode === "create"
                      ? isMarathi
                        ? "नवीन खाते"
                        : "Create your account"
                      : isMarathi
                        ? "पुन्हा स्वागत आहे"
                        : "Welcome back"}
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 rounded-full bg-[#fcf8f2] p-1 text-sm font-semibold text-[#6c4b33]">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-full px-4 py-2 ${mode === "login" ? "bg-[#34180e] text-white" : ""}`}
                >
                  {isMarathi ? "लॉगिन" : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className={`rounded-full px-4 py-2 ${mode === "create" ? "bg-[#34180e] text-white" : ""}`}
                >
                  {isMarathi ? "खाते तयार करा" : "Create account"}
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} autoComplete="off">
                {mode === "create" ? (
                  <div>
                    <label htmlFor="login-name" className="text-sm font-medium text-[#34180e]">
                      {isMarathi ? "नाव" : "Name"}
                    </label>
                    <div className="relative mt-2">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" />
                      <input
                        id="login-name"
                        name="customer-name"
                        type="text"
                        value={name}
                        onBlur={() => setTouched((value) => ({ ...value, name: true }))}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="section-customer name"
                        placeholder={isMarathi ? "तुमचे नाव" : "Your name"}
                        className={`w-full rounded-2xl border bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] ${touched.name && !isValidName(name) ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                      />
                    </div>
                    {touched.name && !isValidName(name) ? (
                      <p className="mt-2 text-sm text-[#b42318]">
                        {isMarathi ? "कृपया तुमचे नाव टाका." : "Please enter your name."}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="login-email" className="text-sm font-medium text-[#34180e]">
                    {isMarathi ? "ईमेल" : "Email"}
                  </label>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" />
                    <input
                      id="login-email"
                      name="customer-email"
                      type="email"
                      value={email}
                      onBlur={() => setTouched((value) => ({ ...value, email: true }))}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="section-customer email"
                      placeholder="your@email.com"
                      className={`w-full rounded-2xl border bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] ${touched.email && !isValidEmail(email) ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                    />
                  </div>
                  {touched.email && !isValidEmail(email) ? (
                    <p className="mt-2 text-sm text-[#b42318]">
                      {isMarathi ? "कृपया वैध ईमेल पत्ता टाका." : "Please enter a valid email address."}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="login-password" className="text-sm font-medium text-[#34180e]">
                    {isMarathi ? "पासवर्ड" : "Password"}
                  </label>
                  <div className="relative mt-2">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" />
                    <input
                      id="login-password"
                      name={mode === "create" ? "customer-new-password" : "customer-password"}
                      type="password"
                      value={password}
                      onBlur={() => setTouched((value) => ({ ...value, password: true }))}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={mode === "create" ? "section-customer new-password" : "section-customer current-password"}
                      placeholder={isMarathi ? "पासवर्ड टाका" : "Enter password"}
                      className={`w-full rounded-2xl border bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e] ${touched.password && password.trim().length < 6 ? "border-[#b42318]" : "border-[#eadbc8]"}`}
                    />
                  </div>
                  {touched.password && password.trim().length < 6 ? (
                    <p className="mt-2 text-sm text-[#b42318]">
                      {isMarathi ? "पासवर्ड किमान ६ अक्षरांचा असावा." : "Password must be at least 6 characters."}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                >
                  {mode === "create" ? (isMarathi ? "खाते तयार करा" : "Create Account") : isMarathi ? "लॉगिन" : "Login"}
                </button>
              </form>

              {googleClientId ? (
                <div className="mt-3 flex justify-center rounded-[24px] border border-[#d8b48b] bg-white px-4 py-3">
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        if (!credentialResponse.credential) {
                          setMessage(isMarathi ? "Google लॉगिन पूर्ण झाले नाही." : "Google login did not complete.");
                          return;
                        }

                        void handleGoogleContinue(credentialResponse.credential);
                      }}
                      onError={() => {
                        setMessage(isMarathi ? "Google लॉगिन अयशस्वी झाले." : "Google login failed.");
                      }}
                      theme="outline"
                      size="large"
                      text={mode === "create" ? "signup_with" : "signin_with"}
                      shape="pill"
                    />
                  </GoogleOAuthProvider>
                </div>
              ) : (
                <p className="mt-3 rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] px-4 py-3 text-sm text-[#7e624b]">
                  {isMarathi
                    ? "Google लॉगिन सुरू करण्यासाठी `VITE_GOOGLE_CLIENT_ID` सेट करा."
                    : "Set `VITE_GOOGLE_CLIENT_ID` to enable Google login."}
                </p>
              )}

              {message ? <p className="mt-3 text-sm font-medium text-[#7a4d20]">{message}</p> : null}

              <div className="mt-5 flex flex-col gap-3 text-center text-sm text-[#7e624b]">
                <Link to="/contact" className="transition hover:text-[#34180e]">
                  {isMarathi ? "तुमच्या खात्यासाठी मदत हवी आहे?" : "Need help with your account?"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
