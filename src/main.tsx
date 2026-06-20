import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "@/App";
import { scheduleAnalyticsInit } from "@/lib/analytics";
import logoImg from "@/assets/logo-dark-small.jpg";
import "@/styles.css";

const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
const existingLogoPreloadLink = document.head.querySelector<HTMLLinkElement>('link[data-shivray-logo-preload="true"]');

if (!existingLogoPreloadLink) {
  const logoPreloadLink = document.createElement("link");
  logoPreloadLink.rel = "preload";
  logoPreloadLink.as = "image";
  logoPreloadLink.href = logoImg;
  logoPreloadLink.fetchPriority = "high";
  logoPreloadLink.dataset.shivrayLogoPreload = "true";
  document.head.appendChild(logoPreloadLink);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);

scheduleAnalyticsInit();
