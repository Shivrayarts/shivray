import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { scheduleAnalyticsInit } from "@/lib/analytics";
import logoImg from "@/assets/logo-dark-small.jpg";
import "@/styles.css";

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
    <App />
  </React.StrictMode>,
);

scheduleAnalyticsInit();
