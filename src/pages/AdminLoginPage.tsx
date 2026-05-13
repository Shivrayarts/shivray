import { Link, useNavigate } from "@/lib/spa-router";
import { LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { isValidEmail } from "@/lib/form-validation";
import { isAdminAuthenticated, loginAdmin, useAdminAuthState } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { authenticated, resolved } = useAdminAuthState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (resolved && (authenticated || isAdminAuthenticated())) {
      navigate({ to: "/admin" });
    }
  }, [authenticated, navigate, resolved]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email.trim()) || !password.trim()) {
      setTouched({ email: true, password: true });
      setError("Enter a valid admin email and password.");
      return;
    }

    try {
      await loginAdmin(email.trim().toLowerCase(), password);
      setError("");
      navigate({ to: "/admin" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Invalid admin email or password.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f7f1e7] py-12 md:py-20">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-[28px] border border-[#eadbc8] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(70,36,15,0.7)] md:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d8b48b] bg-[#fff1d9]">
              <LockKeyhole className="h-6 w-6 text-[#b17024]" />
            </div>
            <h1 className="mt-4 font-heading text-3xl text-[#34180e]">Admin Login</h1>
            <p className="mt-2 text-sm text-[#7e624b]">
              Enter your admin email and password to manage products, orders, customers, and homepage content.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="admin-email" className="text-sm font-medium text-[#34180e]">
                Admin Email
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@shivray.local"
                  className={`w-full rounded-2xl border bg-[#fcf8f2] py-3 pl-10 pr-4 text-sm text-[#34180e] outline-none ${
                    touched.email && !isValidEmail(email) ? "border-[#b42318]" : "border-[#eadbc8]"
                  }`}
                  required
                />
              </div>
              {touched.email && !isValidEmail(email) ? (
                <p className="mt-2 text-sm text-[#b42318]">Please enter a valid admin email address.</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="admin-password" className="text-sm font-medium text-[#34180e]">
                Password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#927863]" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  className={`w-full rounded-2xl border bg-[#fcf8f2] py-3 pl-10 pr-4 text-sm text-[#34180e] outline-none ${
                    touched.password && !password.trim() ? "border-[#b42318]" : "border-[#eadbc8]"
                  }`}
                  required
                />
              </div>
              {touched.password && !password.trim() ? (
                <p className="mt-2 text-sm text-[#b42318]">Please enter the admin password.</p>
              ) : null}
            </div>

            {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-[#34180e] py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
            >
              Login as Admin
            </button>
          </form>

          <Link
            to="/"
            className="mt-6 inline-flex text-sm font-medium text-[#8b4d1d] transition hover:text-[#34180e]"
          >
            Back to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
