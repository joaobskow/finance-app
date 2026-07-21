import React, { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import AlternadorTema from "./AlternadorTema.jsx";
import { updateUserProfile } from "../services/servicoFirestore.js";

const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function Cabecalho({ userName = "Alex", user, profile }) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(Boolean(profile?.notificationsEnabled));
  const [message, setMessage] = useState("");

  useEffect(() => setEnabled(Boolean(profile?.notificationsEnabled)), [profile?.notificationsEnabled]);

  useEffect(() => {
    if (!user || !profile?.notificationsEnabled || Notification.permission !== "granted") return;
    const last = profile.lastWeeklyReminder ? new Date(profile.lastWeeklyReminder).getTime() : 0;
    if (Date.now() - last < WEEK) return;
    const show = async () => {
      const registration = await navigator.serviceWorker?.ready;
      if (registration) {
        registration.showNotification("Registre seus gastos", {
          body: "Reserve um momento para anotar os gastos desta semana.",
          icon: "/icons/icon-192.png",
        });
      } else {
        new Notification("Registre seus gastos", { body: "Reserve um momento para anotar os gastos desta semana." });
      }
      await updateUserProfile(user.uid, { lastWeeklyReminder: new Date().toISOString() });
    };
    show().catch(() => { });
  }, [user, profile?.notificationsEnabled, profile?.lastWeeklyReminder]);

  async function toggleNotifications() {
    if (!user) return;
    if (!enabled && !("Notification" in window)) {
      setMessage("Este navegador não oferece notificações.");
      return;
    }
    if (!enabled && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permita as notificações do navegador para ativá-las.");
        return;
      }
    }
    const next = !enabled;
    setEnabled(next);
    setMessage(next ? "Lembretes semanais ativados." : "Lembretes desativados.");
    await updateUserProfile(user.uid, { notificationsEnabled: next });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 12px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", background: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
          {profile?.photoUrl ? <img src={profile.photoUrl} alt="Foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userName.charAt(0)}
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--accent-ink)" }}>Olá, {userName}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AlternadorTema />
        <button aria-label="Configurar notificações" onClick={() => setOpen((value) => !value)} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(16,22,31,0.08)", cursor: "pointer", position: "relative" }}>
          {enabled ? <Bell size={18} color="var(--accent-ink)" strokeWidth={2} /> : <BellOff size={18} color="var(--text-secondary)" strokeWidth={2} />}
          {enabled && <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#46a36f" }} />}
        </button>
      </div>
      {open && <div style={{ position: "absolute", zIndex: 20, right: 20, top: 66, width: 245, background: "var(--bg-card)", borderRadius: 14, padding: 14, boxShadow: "0 8px 28px rgba(16,22,31,0.18)" }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Lembrete semanal</div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "5px 0 12px" }}>Lembra você de registrar os gastos da semana.</p>
        <button onClick={toggleNotifications} style={{ width: "100%", border: "none", borderRadius: 10, padding: "10px", background: enabled ? "var(--border-color-soft)" : "var(--accent-ink)", color: enabled ? "var(--text-primary)" : "#fff", fontWeight: 700, cursor: "pointer" }}>{enabled ? "Desativar notificações" : "Ativar notificações"}</button>
        {message && <p style={{ margin: "9px 0 0", fontSize: 11.5, color: "var(--text-secondary)" }}>{message}</p>}
      </div>}
    </div>
  );
}
