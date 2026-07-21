import React from "react";
import { ShoppingCart, Car, Wallet, Tv, Tag, Trash2 } from "lucide-react";
import { formatarMoeda } from "../utils/formatacao.js";

const iconMap = {
  ShoppingCart,
  Car,
  Wallet,
  Tv,
  Tag,
};

export default function ListaTransacoes({ transactions, onViewAll, onDelete }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 24,
          marginBottom: 12,
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
          Transações Recentes
        </h3>
        <span
          onClick={onViewAll}
          style={{ color: "var(--accent-ink)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          Ver tudo
        </span>
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 20,
          boxShadow: "0 4px 20px rgba(16,22,31,0.06)",
          overflow: "hidden",
        }}
      >
        {transactions.map((tx, i) => {
          const Icon = iconMap[tx.icon] || ShoppingCart;
          return (
            <div
              key={tx.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 18px",
                borderBottom:
                  i !== transactions.length - 1 ? "1px solid var(--border-color-soft)" : "none",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: tx.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={19} color={tx.iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>
                  {tx.title}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {tx.subtitle}
                </div>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: tx.amount < 0 ? "var(--text-primary)" : "var(--accent-income)",
                  flexShrink: 0,
                }}
              >
                {formatarMoeda(tx.amount)}
              </div>
              {tx.amount < 0 && onDelete && (
                <button aria-label={`Excluir gasto ${tx.title}`} onClick={() => onDelete(tx)} style={{ border: "none", background: "transparent", color: "var(--accent-expense)", padding: 3, cursor: "pointer", display: "flex" }}>
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
