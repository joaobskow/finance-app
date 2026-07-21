import React from "react";
import ReactDOM from "react-dom/client";
import Aplicativo from "./Aplicativo.jsx";
import "./estilos.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Aplicativo />
  </React.StrictMode>
);

// Registra o service worker (necessário pro navegador oferecer "instalar app")
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Se falhar (ex: ambiente sem HTTPS), o app continua funcionando normalmente
    });
  });
}
