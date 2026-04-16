import { createFileRoute, Link } from "@tanstack/react-router";
import { LockKeyhole, Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "User Login - Shivray" },
      {
        name: "description",
        content:
          "Login to your Shivray account to track orders and manage your profile.",
      },
    ],
  }),
});

function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-heritage-pattern py-12 md:py-20">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-heritage md:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/15">
              <LockKeyhole className="h-6 w-6 text-gold" />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">
              User Login
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Login to continue your Shivray journey.
            </p>
          </div>

          <form className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <button type="button" className="text-xs text-gold hover:underline">
                  Forgot Password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="accent-primary" />
              Remember me
            </label>

            <button
              type="submit"
              className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Login
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/contact" className="font-medium text-gold hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
