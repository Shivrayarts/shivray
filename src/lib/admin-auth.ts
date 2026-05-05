import { useEffect, useState } from "react";

const ADMIN_AUTH_KEY = "shivray_admin_authenticated";
const ADMIN_AUTH_EVENT = "shivray-admin-auth-changed";

export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function setAdminAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
    return;
  }
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
}

export function useAdminAuthStatus() {
  const [authenticated, setAuthenticated] = useState(() => isAdminAuthenticated());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => setAuthenticated(isAdminAuthenticated());

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(ADMIN_AUTH_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ADMIN_AUTH_EVENT, sync);
    };
  }, []);

  return authenticated;
}
