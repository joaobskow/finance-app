import React from "react";
import { Plus, ScanLine, TrendingUp } from "lucide-react";

export default function BotoesAcao({ onAddExpense, onAddBalance, onScanReceipt }) {
  return (
    <>
      <button
        onClick={onAddExpense}
        style={{
          width: "100%",
          marginTop: 16,
          background: "var(--accent-ink)",
          border: "none",
          borderRadius: 10,
          padding: "15px 0",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <Plus size={18} strokeWidth={2.5} /> Adicionar Gasto
      </button>

      <button
        onClick={onAddBalance}
        style={{
          width: "100%",
          marginTop: 10,
          background: "var(--accent-income)",
          border: "none",
          borderRadius: 10,
          padding: "14px 0",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <TrendingUp size={18} strokeWidth={2.5} /> Adicionar Saldo
      </button>

      <button
        onClick={onScanReceipt}
        style={{
          width: "100%",
          marginTop: 10,
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 10,
          padding: "14px 0",
          color: "var(--accent-ink)",
          fontWeight: 600,
          fontSize: 14.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <ScanLine size={18} strokeWidth={2} /> Escanear Nota
      </button>
    </>
  );
}
