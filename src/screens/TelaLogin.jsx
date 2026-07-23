import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";
import planejaMaisLogo from "/Planeja+.png";

export default function TelaLogin() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { login, signup, loginWithGoogle } = usarAutenticacao();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) throw new Error("Informe seu nome");
        await signup(name, email, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(translateFirebaseError(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      navigate("/", { replace: true });
    } catch (err) {
      if (!err.message.includes("auth/popup-closed-by-user")) {
        setError(translateFirebaseError(err.message));
      }
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <div className="tela-app"
      style={{
        maxWidth: 480,
        width: "100%",
        minHeight: "100vh",
        background: "var(--bg-page)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "32px 24px",
        fontFamily: "var(--font-sans)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(16,22,31,0.18)",
            overflow: "hidden",
          }}
        >
          <img
            src={planejaMaisLogo}
            alt="Planeja+"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 14,
            }}
          />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>
          {mode === "login" ? "Bem-vindo" : "Crie sua conta"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          {mode === "login"
            ? "Cada centavo, no seu lugar"
            : "Organize seus gastos em minutos"}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mode === "signup" && (
          <InputField
            icon={User}
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={setName}
          />
        )}

        <InputField
          icon={Mail}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={setEmail}
        />

        <InputField
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Senha"
          value={password}
          onChange={setPassword}
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword((s) => !s)}
        />

        {error && (
          <div style={{ color: "var(--accent-expense)", fontSize: 13, fontWeight: 600 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 6,
            background: "var(--accent-ink)",
            border: "none",
            borderRadius: 16,
            padding: "16px 0",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: submitting ? "default" : "pointer",
            opacity: submitting ? 0.7 : 1,
            boxShadow: "0 8px 20px rgba(16,22,31,0.18)",
          }}
        >
          {submitting
            ? "Carregando..."
            : mode === "login"
              ? "Entrar"
              : "Criar conta"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
        <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>ou</span>
        <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleSubmitting}
        style={{
          width: "100%",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 14,
          padding: "13px 0",
          color: "var(--text-primary)",
          fontWeight: 600,
          fontSize: 14.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          cursor: googleSubmitting ? "default" : "pointer",
          opacity: googleSubmitting ? 0.7 : 1,
        }}
      >
        <GoogleIcon size={18} />
        {googleSubmitting ? "Conectando..." : "Continuar com Google"}
      </button>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-secondary)" }}>
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <span
              onClick={() => setError("") || setMode("signup")}
              style={{ color: "var(--accent-ink)", fontWeight: 700, cursor: "pointer" }}
            >
              Cadastre-se
            </span>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <span
              onClick={() => setError("") || setMode("login")}
              style={{ color: "var(--accent-ink)", fontWeight: 700, cursor: "pointer" }}
            >
              Entrar
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function InputField({ icon: Icon, rightIcon: RightIcon, onRightIconClick, ...props }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: 14,
        padding: "13px 16px",
      }}
    >
      <Icon size={18} color="var(--text-secondary)" />
      <input
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
        required
        style={{
          border: "none",
          outline: "none",
          flex: 1,
          fontSize: 14,
          fontFamily: "inherit",
          color: "var(--text-primary)",
          background: "transparent",
        }}
      />
      {RightIcon && (
        <RightIcon
          size={18}
          color="var(--text-secondary)"
          style={{ cursor: "pointer" }}
          onClick={onRightIconClick}
        />
      )}
    </div>
  );
}

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C33.9 5.1 29.2 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C33.9 5.1 29.2 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.1 0 9.8-2 13.3-5.2l-6.2-5.2C29 36.6 26.6 37.4 24 37.4c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 40.6 16.3 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 36.3 44 30.6 44 24c0-1.4-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function translateFirebaseError(message) {
  if (message.includes("auth/email-already-in-use")) return "Este e-mail já está cadastrado.";
  if (message.includes("auth/invalid-email")) return "E-mail inválido.";
  if (message.includes("auth/weak-password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password"))
    return "E-mail ou senha incorretos.";
  if (message.includes("auth/user-not-found")) return "Usuário não encontrado.";
  if (message.includes("auth/popup-blocked"))
    return "O navegador bloqueou a janela do Google. Permita pop-ups e tente de novo.";
  if (message.includes("auth/unauthorized-domain"))
    return "Este domínio não está autorizado no Firebase para login com Google.";
  return message.replace("Firebase: ", "");
}
