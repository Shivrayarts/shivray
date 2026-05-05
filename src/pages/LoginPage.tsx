import { Link, useNavigate } from "@/lib/spa-router";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, ShoppingBag, Smartphone } from "lucide-react";
import { useState } from "react";
import { loginCustomer } from "@/lib/customer-orders";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage("Enter both email and password.");
      return;
    }

    loginCustomer({
      name: email.split("@")[0],
      email,
    });

    setMessage("Customer login saved on this device and visible in admin customers.");
    navigate({ to: "/" });
  }

  return (
    <div className="bg-[#f7f1e7] pb-8 md:pb-12">
      <section className="bg-[#2b130c] px-4 pb-8 pt-6 text-white md:px-6 md:pb-12 md:pt-10"><div className="layout-shell"><span className="inline-flex rounded-full border border-[#f2bb64]/30 bg-[#f2bb64]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd68d]">Login Page</span><h1 className="mt-4 font-heading text-4xl leading-none text-[#fff5e6] md:text-6xl">A cleaner login screen for mobile customers.</h1></div></section>
      <section className="px-4 pt-6 md:px-6">
        <div className="layout-shell grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">Benefits</p>
            <div className="mt-5 space-y-4">
              <Link to="/products" className="flex items-center justify-between rounded-[24px] border border-[#eadbc8] bg-[#fff9f2] p-4"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]"><ShoppingBag className="h-5 w-5" /></div><div><p className="font-semibold text-[#34180e]">Continue shopping</p><p className="mt-1 text-sm text-[#7e624b]">Browse products like the reference storefront.</p></div></div><ArrowRight className="h-4 w-4 text-[#b17024]" /></Link>
              {[{ icon: Smartphone, title: "Thumb-friendly layout", text: "Large fields, rounded actions, and no clutter for phone users." }, { icon: ShieldCheck, title: "Trust-focused design", text: "A calmer and more premium visual style that feels safer to use." }, { icon: LockKeyhole, title: "Static-host ready", text: "This version stores login state locally so it works without TanStack Start server actions." }].map((item) => (
                <div key={item.title} className="rounded-[24px] bg-[#fcf7f0] p-4"><div className="flex gap-3"><item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#b17024]" /><div><p className="font-semibold text-[#34180e]">{item.title}</p><p className="mt-2 text-sm leading-6 text-[#7e624b]">{item.text}</p></div></div></div>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-[#eadbc8] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-7">
            <div className="mx-auto max-w-md">
              <div className="flex items-center gap-3"><div className="rounded-2xl bg-[#fff1d9] p-3 text-[#b17024]"><LockKeyhole className="h-5 w-5" /></div><div><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a86c2b]">Sign In</p><h2 className="mt-1 font-heading text-3xl text-[#34180e]">Welcome back</h2></div></div>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div><label htmlFor="login-email" className="text-sm font-medium text-[#34180e]">Email</label><div className="relative mt-2"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" /><input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e]" /></div></div>
                <div><label htmlFor="login-password" className="text-sm font-medium text-[#34180e]">Password</label><div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" /><input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" className="w-full rounded-2xl border border-[#eadbc8] bg-[#fcf8f2] py-3 pl-11 pr-4 text-sm text-[#34180e]" /></div></div>
                <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-[#34180e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">Login</button>
              </form>
              {message ? <p className="mt-3 text-sm font-medium text-[#7a4d20]">{message}</p> : null}
              <div className="mt-5 flex flex-col gap-3 text-center text-sm text-[#7e624b]">
                <Link to="/contact" className="transition hover:text-[#34180e]">Need help with your account?</Link>
                <Link to="/admin-login" className="transition hover:text-[#34180e]">Admin login</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
