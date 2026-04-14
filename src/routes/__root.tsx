import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-heading">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground font-heading">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 font-heading uppercase tracking-wider"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rudra Arts & Handicrafts" },
      { name: "description", content: "India's premier studio for authentic Maratha heritage craftsmanship — statues, weapons, and historical replicas." },
      { name: "author", content: "Rudra Arts & Handicrafts" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Rudra Arts & Handicrafts" },
      { name: "twitter:title", content: "Rudra Arts & Handicrafts" },
      { property: "og:description", content: "India's premier studio for authentic Maratha heritage craftsmanship — statues, weapons, and historical replicas." },
      { name: "twitter:description", content: "India's premier studio for authentic Maratha heritage craftsmanship — statues, weapons, and historical replicas." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
