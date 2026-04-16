const ADMIN_AUTH_KEY = "shivray_admin_authenticated";

export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function setAdminAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
    return;
  }
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}
