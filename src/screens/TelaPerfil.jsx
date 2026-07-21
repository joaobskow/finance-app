import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, KeyRound, LogOut, Mail, Pencil, User as UserIcon } from "lucide-react";
import BarraNavegacao from "../components/BarraNavegacao.jsx";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";
import { listenToUserProfile, updateUserProfile } from "../services/servicoFirestore.js";

export default function TelaPerfil() {
  const { user, logout } = usarAutenticacao();
  const [profile, setProfile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [photoStatus, setPhotoStatus] = useState("");
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    return listenToUserProfile(user.uid, setProfile);
  }, [user]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return setPhotoStatus("Selecione um arquivo de imagem.");
    try {
      const photoUrl = await resizeImage(file);
      await updateUserProfile(user.uid, { photoUrl });
      setPhotoStatus("Foto atualizada.");
    } catch { setPhotoStatus("Não foi possível salvar essa foto."); }
  }

  async function removePhoto() {
    if (!user) return;
    await updateUserProfile(user.uid, { photoUrl: null });
    setPhotoMenuOpen(false);
    setPhotoStatus("Foto removida.");
  }

  return (
    <div className="tela-app"
      style={{
        maxWidth: 480,
        width: "100%",
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        paddingBottom: 90,
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ padding: "32px 20px 0", textAlign: "center" }}>
        <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 16px" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 32, overflow: "hidden" }}>
            {profile?.photoUrl ? <img src={profile.photoUrl} alt="Foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (profile?.name || "?").charAt(0)}
          </div>
          <button aria-label="Opções da foto de perfil" onClick={() => setPhotoMenuOpen((open) => !open)} style={{ position: "absolute", right: -3, bottom: -3, width: 31, height: 31, borderRadius: "50%", border: "2px solid var(--bg-page)", background: "var(--accent-brass)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Pencil size={15} /></button>
          {photoMenuOpen && <div style={{ position: "absolute", zIndex: 10, top: 93, left: "50%", transform: "translateX(-50%)", width: 156, background: "var(--bg-card)", borderRadius: 12, padding: 6, boxShadow: "0 6px 18px rgba(16,22,31,.18)", textAlign: "left" }}>
            <button onClick={() => { setPhotoMenuOpen(false); inputRef.current?.click(); }} style={photoMenuButton}><Camera size={15} /> {profile?.photoUrl ? "Alterar foto" : "Adicionar foto"}</button>
            {profile?.photoUrl && <button onClick={removePhoto} style={{ ...photoMenuButton, color: "var(--accent-expense)" }}>Remover foto</button>}
          </div>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        {photoStatus && <p style={{ margin: "-6px 0 10px", fontSize: 12, color: "var(--text-secondary)" }}>{photoStatus}</p>}
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
          {profile?.name || "..."}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{profile?.email}</p>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(16,22,31,0.06)",
            overflow: "hidden",
          }}
        >
          <InfoRow icon={UserIcon} label="Nome" value={profile?.name || "-"} />
          <InfoRow icon={Mail} label="E-mail" value={profile?.email || "-"} last />
        </div>

        <button onClick={() => setShowPassword(true)} style={{ width: "100%", marginTop: 16, background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: "15px 18px", color: "var(--text-primary)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}><KeyRound size={18} color="var(--accent-ink)" /> Trocar senha</button>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            marginTop: 20,
            background: "var(--bg-card)",
            border: "1px solid #FDE2E2",
            borderRadius: 16,
            padding: "15px 0",
            color: "var(--accent-expense)",
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <LogOut size={18} /> Sair da conta
        </button>
      </div>

      <BarraNavegacao />
      {showPassword && <PasswordModal email={user?.email} isGoogleAccount={user?.providerData?.some((provider) => provider.providerId === "google.com") && !user?.providerData?.some((provider) => provider.providerId === "password")} onClose={() => setShowPassword(false)} />}
    </div>
  );
}

function PasswordModal({ email, isGoogleAccount, onClose }) {
  const { changePassword, createPasswordForGoogleAccount, resetPassword } = usarAutenticacao();
  const [current, setCurrent] = useState(""); const [next, setNext] = useState(""); const [confirm, setConfirm] = useState(""); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(e) { e.preventDefault(); setMessage(""); if (next !== confirm) return setMessage("A confirmação da nova senha não confere."); if (next.length < 6) return setMessage("A nova senha precisa ter pelo menos 6 caracteres."); setSaving(true); try { if (isGoogleAccount) await createPasswordForGoogleAccount(next); else await changePassword(current, next); onClose(); } catch (error) { setMessage(error.message.includes("wrong-password") || error.message.includes("invalid-credential") ? "Senha atual incorreta." : error.message.replace("Firebase: ", "")); } finally { setSaving(false); } }
  async function forgot() { try { await resetPassword(email); setMessage("Enviamos um e-mail para redefinir sua senha."); } catch { setMessage("Não foi possível enviar o e-mail agora."); } }
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(16,22,31,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><form onSubmit={submit} onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, background: "var(--bg-card)", borderRadius: 20, padding: 22 }}><h3 style={{ margin: "0 0 8px" }}>{isGoogleAccount ? "Criar senha" : "Trocar senha"}</h3>{isGoogleAccount && <p style={{ margin: "0 0 18px", fontSize: 12, color: "var(--text-secondary)" }}>Você continuará podendo entrar com Google e também poderá usar e-mail e senha.</p>}{!isGoogleAccount && <PasswordInput label="Senha atual" value={current} onChange={setCurrent} />}<PasswordInput label={isGoogleAccount ? "Criar senha" : "Nova senha"} value={next} onChange={setNext} /><PasswordInput label="Confirmar nova senha" value={confirm} onChange={setConfirm} />{message && <p style={{ color: "var(--accent-expense)", fontSize: 12 }}>{message}</p>} {!isGoogleAccount && <button type="button" onClick={forgot} style={{ border: 0, padding: 0, background: "transparent", color: "var(--accent-ink)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Esqueci minha senha</button>}<div style={{ display: "flex", gap: 10, marginTop: 20 }}><button type="button" onClick={onClose} style={modalButton("var(--border-color-soft)", "var(--text-primary)")}>Cancelar</button><button disabled={saving} style={modalButton("var(--accent-ink)", "#fff")}>{saving ? "Salvando..." : isGoogleAccount ? "Criar senha" : "Salvar senha"}</button></div></form></div>;
}
function PasswordInput({ label, value, onChange }) { return <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{label}<input required type="password" value={value} onChange={(e) => onChange(e.target.value)} style={{ display: "block", boxSizing: "border-box", width: "100%", marginTop: 6, padding: 11, border: "1px solid var(--border-color)", borderRadius: 10, background: "transparent", color: "var(--text-primary)" }} /></label>; }
function modalButton(background, color) { return { flex: 1, border: "none", borderRadius: 10, padding: 11, background, color, fontWeight: 700, cursor: "pointer" }; }
const photoMenuButton = { width: "100%", border: "none", borderRadius: 8, padding: "9px 10px", background: "transparent", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, cursor: "pointer", textAlign: "left" };
function resizeImage(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = reject; reader.onload = () => { const image = new Image(); image.onerror = reject; image.onload = () => { const max = 240; const scale = Math.min(1, max / Math.max(image.width, image.height)); const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", .78)); }; image.src = reader.result; }; reader.readAsDataURL(file); }); }

function InfoRow({ icon: Icon, label, value, last }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 18px",
        borderBottom: last ? "none" : "1px solid var(--border-color-soft)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "var(--accent-ink-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={17} color="var(--accent-ink)" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}
