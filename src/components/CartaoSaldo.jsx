import React from "react";

const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CartaoSaldo({ balance, changePercent, trend }) {
  const maxTrend = Math.max(...trend);
  const monthLabel = MONTHS[new Date().getMonth()];

  const formattedBalance = balance.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      style={{
        position: "relative",
        background: "var(--bg-card)",
        borderRadius: 14,
        padding: "20px 22px 16px",
        border: "1px solid var(--border-color)",
        boxShadow: "0 4px 16px rgba(16,22,31,0.06)",
      }}
    >
      {/* Selo do mês — elemento de assinatura visual */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1.5px solid var(--accent-brass)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(-8deg)",
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: 0.5,
          color: "var(--accent-brass)",
        }}
      >
        {monthLabel}
      </div>

      <div
        style={{
          fontSize: 11.5,
          color: "var(--text-secondary)",
          fontWeight: 600,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        Saldo Total
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 36,
          fontWeight: 600,
          color: "var(--accent-brass)",
          margin: "6px 0 6px",
          letterSpacing: -0.5,
        }}
      >
        R$ {formattedBalance}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12.5,
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          color: "var(--accent-income)",
          marginBottom: 18,
        }}
      >
        <span>↗</span> +{changePercent}% este mês
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60 }}>
        {trend.map((val, i) => {
          const isLast = i === trend.length - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${(val / maxTrend) * 100}%`,
                borderRadius: 3,
                background: isLast ? "var(--accent-brass)" : "var(--border-color)",
                transition: "height 0.3s ease",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 7 }} aria-label="Datas do gráfico">
        {trend.map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (trend.length - 1 - i));
          return (
            <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "var(--text-secondary)" }}>
              {WEEKDAYS[date.getDay()]} {date.getDate()}
            </span>
          );
        })}
      </div>
    </div>
  );
}
