import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SearchValue = Record<string, string | number | boolean | undefined>;

type RouterLocation = {
  href: string;
  pathname: string;
  search: string;
};

type NavigateOptions = {
  to: string;
  params?: Record<string, string>;
  search?: SearchValue;
};

type RouterContextValue = {
  location: RouterLocation;
  navigate: (options: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

function normalizePath(pathname: string, search = "") {
  return {
    href: `${pathname}${search}`,
    pathname,
    search,
  };
}

function normalizeBrowserPath() {
  if (typeof window === "undefined") {
    return normalizePath("/");
  }

  if (window.location.hash.startsWith("#/")) {
    const hash = window.location.hash.slice(1);
    const [pathnamePart, searchPart = ""] = hash.split("?");
    const pathname = pathnamePart.startsWith("/") ? pathnamePart : `/${pathnamePart}`;
    const search = searchPart ? `?${searchPart}` : "";
    const nextHref = `${pathname}${search}`;

    window.history.replaceState({}, "", nextHref);
    return normalizePath(pathname, search);
  }

  return normalizePath(window.location.pathname || "/", window.location.search || "");
}

function buildPath(to: string, params?: Record<string, string>, search?: SearchValue) {
  let pathname = to;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      pathname = pathname.replace(`$${key}`, encodeURIComponent(value));
    }
  }

  const query = new URLSearchParams();
  if (search) {
    for (const [key, value] of Object.entries(search)) {
      if (value === undefined || value === "") continue;
      query.set(key, String(value));
    }
  }

  const qs = query.toString();
  return `${pathname}${qs ? `?${qs}` : ""}`;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<RouterLocation>(() => normalizeBrowserPath());

  useEffect(() => {
    const sync = () => setLocation(normalizeBrowserPath());
    sync();
    window.addEventListener("popstate", sync);

    return () => window.removeEventListener("popstate", sync);
  }, []);

  const navigate = useCallback(({ to, params, search }: NavigateOptions) => {
    const next = buildPath(to, params, search);
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.pushState({}, "", next);
      setLocation(normalizeBrowserPath());
    } else {
      setLocation(normalizeBrowserPath());
    }
  }, []);

  const value = useMemo<RouterContextValue>(
    () => ({
      location,
      navigate,
    }),
    [location, navigate],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function useRouterContext() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("RouterProvider is required");
  }

  return context;
}

export function useLocation() {
  return useRouterContext().location;
}

export function useNavigate() {
  return useRouterContext().navigate;
}

type LinkProps = {
  to: string;
  params?: Record<string, string>;
  search?: SearchValue;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  [key: string]: unknown;
};

export function Link({ to, params, search, onClick, ...props }: LinkProps) {
  const navigate = useNavigate();
  const href = buildPath(to, params, search);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    onClick?.();
    navigate({ to, params, search });
  };

  return <a {...props} href={href} onClick={handleClick} />;
}
