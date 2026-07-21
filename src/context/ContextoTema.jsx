import React, { createContext, useContext, useEffect, useState } from "react";

const ContextoTema = createContext(null);
const STORAGE_KEY = "finance-app-theme"; // valores: "light" | "dark" | "system"

function getSystemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ProvedorTema({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark());

  // Observa mudança de preferência do sistema em tempo real
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemPrefersDark(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  function changeMode(newMode) {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }

  return (
    <ContextoTema.Provider value={{ mode, resolvedTheme, setMode: changeMode }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function usarTema() {
  const ctx = useContext(ContextoTema);
  if (!ctx) throw new Error("usarTema precisa estar dentro de um ProvedorTema");
  return ctx;
}
