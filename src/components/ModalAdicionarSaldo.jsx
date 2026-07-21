import React, { useState } from "react";
import { X } from "lucide-react";
import { addIncome } from "../services/servicoFirestore.js";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";

export default function ModalAdicionarSaldo({ onClose }) {
  const { user } = usarAutenticacao();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const numericAmount = parseFloat(amount.replace(",", "."));
    if (!title.trim()) return setError("Dê uma descrição para o saldo.");
    if (!numericAmount || numericAmount <= 0) return setError("Informe um valor válido.");

    setSubmitting(true);
    try {
      await addIncome(user.uid, { title: title.trim(), amount: numericAmount, date });
      onClose();
    } catch (err) {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(31,27,46,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--bg-card)",
          borderRadius: "24px 24px 0 0",
          padding: "22px 22px 28px",
          fontFamily: "var(--font-sans)",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Adicionar Saldo</h3>
          <X size={20} color="var(--text-secondary)" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Descrição</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Salário Mensal"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Valor</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 3800,00"
              inputMode="decimal"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && <div style={{ color: "var(--accent-expense)", fontSize: 13, fontWeight: 600 }}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 6,
              background: "var(--accent-income)",
              border: "none",
              borderRadius: 16,
              padding: "15px 0",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Salvando..." : "Salvar Saldo"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  border: "1px solid var(--border-color)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  background: "var(--bg-page)",
  color: "var(--text-primary)",
};
