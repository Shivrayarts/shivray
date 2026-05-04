import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { isAdminAuthenticated, setAdminAuthenticated } from "@/lib/admin-auth";
import { verifyAdminLoginServer } from "@/lib/server/admin.functions";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "Admin Login - Shivray" },
      { name: "description", content: "Secure admin login for Shivray dashboard access." },
    ],
  }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const verifyAdminLogin = useServerFn(verifyAdminLoginServer);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await verifyAdminLogin({
      data: { email: email.trim().toLowerCase(), password },
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setAdminAuthenticated(true);
    setError("");
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-heritage-pattern py-12 md:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="rounded-2xl border border-border bg-card/95 p-6 md:p-8 shadow-heritage">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
              <LockKeyhole className="w-6 h-6 text-gold" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Authorized access only for dashboard management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="admin-email" className="text-sm font-medium text-foreground">
                Admin Email
              </label>
              <div className="mt-1.5 relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shivray.local"
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1.5 relative">
                <LockKeyhole className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  required
                />
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <button
              type="submit"
              className="w-full rounded-md bg-primary text-primary-foreground py-2.5 text-sm font-semibold  tracking-wide hover:bg-primary/90 transition-colors"
            >
              Login as Admin
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-gold/40 bg-gold/5 p-3">
            <p className="text-xs text-muted-foreground">
              Login is now checked against MySQL `users` table.
            </p>
            <p className="text-sm font-medium mt-1">Seed Admin: admin@shivray.local</p>
            <p className="text-sm font-medium">Seed Password: Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
