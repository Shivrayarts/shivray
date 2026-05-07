import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

const ADMIN_AUTH_KEY = "shivray_admin_authenticated";
const ADMIN_AUTH_EVENT = "shivray-admin-auth-changed";

function dispatchAdminAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
}

export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function setAdminAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
  } else {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
  }

  dispatchAdminAuthChanged();
}

export async function loginAdmin(email: string, password: string) {
  await apiRequest("/api/admin/login", {
    method: "POST",
    body: { email, password },
  });

  setAdminAuthenticated(true);
}

export async function refreshAdminAuthStatus() {
  try {
    const response = await apiRequest<{ authenticated: boolean }>("/api/admin/session");
    setAdminAuthenticated(response.authenticated);
    return response.authenticated;
  } catch {
    setAdminAuthenticated(false);
    return false;
  }
}

export async function logoutAdmin() {
  try {
    await apiRequest("/api/admin/logout", { method: "POST" });
  } finally {
    setAdminAuthenticated(false);
  }
}

export function useAdminAuthStatus() {
  const [authenticated, setAuthenticated] = useState(() => isAdminAuthenticated());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => setAuthenticated(isAdminAuthenticated());

    sync();
    void refreshAdminAuthStatus().then(sync).catch(() => undefined);
    window.addEventListener("storage", sync);
    window.addEventListener(ADMIN_AUTH_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ADMIN_AUTH_EVENT, sync);
    };
  }, []);

  return authenticated;
}

export function useAdminAuthState() {
  const [authenticated, setAuthenticated] = useState(() => isAdminAuthenticated());
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => setAuthenticated(isAdminAuthenticated());

    sync();
    void refreshAdminAuthStatus()
      .then(sync)
      .finally(() => setResolved(true));
    window.addEventListener("storage", sync);
    window.addEventListener(ADMIN_AUTH_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ADMIN_AUTH_EVENT, sync);
    };
  }, []);

  return { authenticated, resolved };
}
