import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initStorageSync } from "./utils/useStorageSync";

// Punto 3: sincronización de localStorage entre pestañas
initStorageSync();

// Punto 7 (PWA): registrar service worker si el browser lo soporta
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {/* silencioso en dev */});
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
