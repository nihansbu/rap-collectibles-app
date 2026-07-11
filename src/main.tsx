import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import { IconInspectProvider } from "./ui/IconInspect";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IconInspectProvider>
      <App />
    </IconInspectProvider>
  </StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Offline support could not be registered.", error);
    });
  });
}
