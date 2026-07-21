import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const STORAGE_KEY = "finance-app-install-dismissed-at";
const DIAS_ATE_PERGUNTAR_DE_NOVO = 7;

export default function PromptInstalacao() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();

      // Se o usuário já dispensou o convite recentemente, não insiste
      const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
      const diasDesdeDispensa = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (dismissedAt && diasDesdeDispensa < DIAS_ATE_PERGUNTAR_DE_NOVO) return;

      setDeferredPrompt(event);
      // Pequeno atraso pra não interromper o usuário assim que a página abre
      setTimeout(() => setVisible(true), 2000);
    }

    function handleAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(16,22,31,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 70,
      }}
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--bg-card)",
          borderRadius: "20px 20px 0 0",
          padding: "22px 22px 28px",
          fontFamily: "var(--font-sans)",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "var(--accent-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-brass)",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          R$
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            Instalar o Finance App
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: 1.4 }}>
            Adicione o app à tela inicial pra abrir direto, sem precisar do navegador.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleInstall}
              style={{
                flex: 1,
                background: "var(--accent-ink)",
                border: "none",
                borderRadius: 10,
                padding: "10px 0",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Download size={15} /> Instalar
            </button>
            <button
              onClick={handleDismiss}
              style={{
                background: "transparent",
                border: "1px solid var(--border-color)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "var(--text-secondary)",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              Agora não
            </button>
          </div>
        </div>

        <X
          size={18}
          color="var(--text-secondary)"
          style={{ cursor: "pointer", flexShrink: 0 }}
          onClick={handleDismiss}
        />
      </div>
    </div>
  );
}
