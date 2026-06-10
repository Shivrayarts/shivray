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

export async function changeAdminPassword(email: string, currentPassword: string, newPassword: string) {
  await apiRequest("/api/admin/change-password", {
    method: "POST",
    body: { email, currentPassword, newPassword },
  });
}

export async function changeAdminUsername(currentPassword: string, newUsername: string) {
  await apiRequest("/api/admin/change-username", {
    method: "POST",
    body: { currentPassword, newUsername },
  });
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

export function useAdminAuthState(enabled = true) {
  const [authenticated, setAuthenticated] = useState(() => isAdminAuthenticated());
  const [resolved, setResolved] = useState(!enabled);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) {
      setResolved(true);
      return;
    }

    const sync = () => setAuthenticated(isAdminAuthenticated());

    setResolved(false);
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
  }, [enabled]);

  return { authenticated, resolved };
}
