import React, { useState } from "react";
import { X } from "lucide-react";
import { updateGoalTotal } from "../services/servicoFirestore.js";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";

export default function ModalEditarMetas({ goals, onClose }) {
  const { user } = usarAutenticacao();
  const [values, setValues] = useState(
    Object.fromEntries(goals.map((g) => [g.id, String(g.total)]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(goalId, value) {
    setValues((prev) => ({ ...prev, [goalId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const parsed = {};
    for (const goal of goals) {
      const num = parseFloat(String(values[goal.id]).replace(",", "."));
      if (!num || num <= 0) {
        setError(`Informe um valor válido para "${goal.label}".`);
        return;
      }
      parsed[goal.id] = num;
    }

    setSubmitting(true);
    try {
      await Promise.all(
        goals.map((goal) => updateGoalTotal(user.uid, goal.id, parsed[goal.id]))
      );
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
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Editar Metas</h3>
          <X size={20} color="var(--text-secondary)" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {goals.map((goal) => (
            <div key={goal.id}>
              <label style={labelStyle}>{goal.label} — valor da meta</label>
              <input
                value={values[goal.id]}
                onChange={(e) => handleChange(goal.id, e.target.value)}
                placeholder="Ex: 1000"
                inputMode="decimal"
                style={inputStyle}
              />
            </div>
          ))}

          {error && <div style={{ color: "var(--accent-expense)", fontSize: 13, fontWeight: 600 }}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 6,
              background: "var(--accent-ink)",
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
            {submitting ? "Salvando..." : "Salvar Metas"}
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
