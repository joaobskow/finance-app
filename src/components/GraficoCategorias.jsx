import React, { useEffect, useState } from "react";
import { OPCOES_PERIODO, filtrarGastosPorPeriodo } from "../utils/periodo.js";
import { CATEGORY_META } from "../services/servicoFirestore.js";
import { formatarMoeda } from "../utils/formatacao.js";

// categorias de gasto que aparecem no gráfico (não inclui "income")
const CHART_CATEGORIES = ["food", "transport", "leisure", "other"];

export default function GraficoCategorias({
  transactions,
  title = "Gastos por Categoria",
  onDataChange,
  onFilteredTransactionsChange,
}) {
  const [period, setPeriod] = useState("month");

  const filtered = filtrarGastosPorPeriodo(transactions, period);
  const filteredSignature = filtered.map((tx) => tx.id).join(",");

  const totals = CHART_CATEGORIES.map((catKey) => {
    const meta = CATEGORY_META[catKey];
    const total = filtered
      .filter((tx) => tx.category === catKey)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { key: catKey, label: meta.label, color: meta.iconColor, total };
  });

  const maxTotal = Math.max(...totals.map((t) => t.total), 1);

  useEffect(() => {
    if (onDataChange) onDataChange({ period, totals });
    if (onFilteredTransactionsChange) onFilteredTransactionsChange(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, JSON.stringify(totals), filteredSignature]);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 20,
        padding: "20px 22px",
        marginTop: 20,
        boxShadow: "0 4px 20px rgba(16,22,31,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          gap: 12,
        }}
      >
        <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
          {title}
        </h3>

        {/* Seletor de período (combobox) */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            border: "1px solid var(--border-color)",
            background: "var(--bg-card)",
            color: "var(--accent-ink)",
            fontWeight: 600,
            fontSize: 12.5,
            borderRadius: 10,
            padding: "8px 10px",
            cursor: "pointer",
            outline: "none",
            flexShrink: 0,
          }}
        >
          {OPCOES_PERIODO.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gráfico de coluna */}
      {totals.every((t) => t.total === 0) ? (
        <div
          style={{
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            fontSize: 13,
          }}
        >
          Sem gastos nesse período.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: 150,
            gap: 12,
          }}
        >
          {totals.map((t) => (
            <div
              key={t.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: t.color, marginBottom: 6, whiteSpace: "nowrap" }}>
                {t.total > 0 ? formatarMoeda(-t.total).replace("- ", "") : "R$ 0"}
              </span>
              <div
                style={{
                  width: "60%",
                  minHeight: 4,
                  height: `${Math.max((t.total / maxTotal) * 100, 3)}%`,
                  borderRadius: "8px 8px 4px 4px",
                  background: t.color,
                  transition: "height 0.3s ease",
                }}
              />
              <span style={{ marginTop: 8, minHeight: 28, textAlign: "center", fontSize: 10.5, lineHeight: 1.2, color: "var(--text-secondary)" }}>{t.label}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
