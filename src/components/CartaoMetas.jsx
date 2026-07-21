import React, { useState } from "react";
import { ChevronDown, ShoppingCart, Car, Tv, Tag } from "lucide-react";
import { formatarMoeda, formatarData } from "../utils/formatacao.js";

const GOAL_ICONS = { food: ShoppingCart, transport: Car, leisure: Tv, other: Tag };

export default function CartaoMetas({ goals, transactions, onEditGoals }) {
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  function handleGoalClick(goalId) {
    setExpandedGoalId((current) => (current === goalId ? null : goalId));
  }

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
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
          Metas Mensais
        </h3>
        <button
          onClick={onEditGoals}
          style={{
            border: "1px solid var(--border-color)",
            background: "var(--bg-card)",
            color: "var(--accent-ink)",
            fontWeight: 600,
            fontSize: 12.5,
            borderRadius: 10,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Editar metas
        </button>
      </div>

      {goals.map((goal) => {
        const pct = Math.round((goal.spent / goal.total) * 100);
        const isExpanded = expandedGoalId === goal.id;
        const Icon = GOAL_ICONS[goal.id] || ShoppingCart;
        const goalTransactions = (transactions || []).filter(
          (tx) => tx.category === goal.id
        );

        return (
          <div key={goal.id} style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{goal.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, color: goal.color }}>{pct}%</span>
                <button
                  onClick={() => handleGoalClick(goal.id)}
                  aria-label={`Ver detalhes de ${goal.label}`}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 4,
                    display: "flex",
                    cursor: "pointer",
                  }}
                >
                  <ChevronDown
                    size={16}
                    color="var(--text-secondary)"
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
              </div>
            </div>

            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: "var(--border-color-soft)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: goal.color,
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
              R$ {goal.spent.toLocaleString("pt-BR")} de R$ {goal.total.toLocaleString("pt-BR")}
            </div>

            {isExpanded && (
              <div
                style={{
                  marginTop: 12,
                  background: "var(--bg-page)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {goalTransactions.length === 0 ? (
                  <div style={{ padding: "14px 14px", fontSize: 12.5, color: "var(--text-secondary)" }}>
                    Nenhum gasto lançado em {goal.label} ainda.
                  </div>
                ) : (
                  goalTransactions.map((tx, i) => (
                    <div
                      key={tx.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderBottom:
                          i !== goalTransactions.length - 1
                            ? "1px solid var(--border-color-soft)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 9,
                          background: "var(--bg-card)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={14} color={goal.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                          {tx.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
                          {formatarData(tx.createdAt)}
                          {tx.customCategory ? ` • ${tx.customCategory}` : ""}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                        {formatarMoeda(tx.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
