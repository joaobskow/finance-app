import React, { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho.jsx";
import BarraNavegacao from "../components/BarraNavegacao.jsx";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";
import {
  listenToTransactions,
  listenToUserProfile,
  CATEGORY_META,
} from "../services/servicoFirestore.js";
import { formatarMoeda, formatarData } from "../utils/formatacao.js";
import { ShoppingCart, Car, Wallet, Tv, Tag, Trash2 } from "lucide-react";
import { deleteTransaction } from "../services/servicoFirestore.js";

const iconMap = { ShoppingCart, Car, Wallet, Tv, Tag };

const OPCOES_DATA_HORA = { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" };

export default function TelaTransacoes() {
  const { user } = usarAutenticacao();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = listenToUserProfile(user.uid, setProfile);
    const unsubTx = listenToTransactions(user.uid, setTransactions);
    return () => {
      unsubProfile();
      unsubTx();
    };
  }, [user]);

  async function confirmDeleteExpense() {
    if (!user || !expenseToDelete) return;
    setDeletingExpense(true);
    try {
      await deleteTransaction(user.uid, expenseToDelete.id);
      setExpenseToDelete(null);
    } finally {
      setDeletingExpense(false);
    }
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
      <Cabecalho userName={profile?.name?.split(" ")[0] || "..."} user={user} profile={profile} />

      <div style={{ padding: "8px 20px 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 16px" }}>
          Todas as Transações
        </h2>

        {transactions.length === 0 ? (
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: 20,
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            Você ainda não tem transações. Toque em "Adicionar Gasto" na tela Home
            para lançar a primeira.
          </div>
        ) : (
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: 20,
              boxShadow: "0 4px 20px rgba(16,22,31,0.06)",
              overflow: "hidden",
            }}
          >
            {transactions.map((tx, i) => {
              const meta = CATEGORY_META[tx.category] || CATEGORY_META.food;
              const categoryLabel =
                tx.category === "other" && tx.customCategory ? tx.customCategory : meta.label;
              const Icon = iconMap[meta.icon] || ShoppingCart;
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
                      background: meta.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={19} color={meta.iconColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>
                      {tx.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>
                      {formatarData(tx.createdAt, OPCOES_DATA_HORA)} • {categoryLabel}
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
                  {tx.amount < 0 && (
                    <button aria-label={`Excluir gasto ${tx.title}`} onClick={() => setExpenseToDelete(tx)} style={{ border: "none", background: "transparent", color: "var(--accent-expense)", padding: 3, cursor: "pointer", display: "flex" }}>
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BarraNavegacao />
      {expenseToDelete && (
        <div onClick={() => !deletingExpense && setExpenseToDelete(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(16,22,31,.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(event) => event.stopPropagation()} style={{ width: "100%", maxWidth: 310, background: "var(--bg-card)", borderRadius: 20, padding: 22, fontFamily: "var(--font-sans)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Excluir gasto</h3>
            <p style={{ margin: "0 0 20px", color: "var(--text-secondary)", fontSize: 13.5 }}>Deseja excluir “{expenseToDelete.title}”? O saldo e a meta serão atualizados.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button disabled={deletingExpense} onClick={() => setExpenseToDelete(null)} style={deleteModalButton("var(--border-color-soft)", "var(--text-primary)")}>Cancelar</button>
              <button disabled={deletingExpense} onClick={confirmDeleteExpense} style={deleteModalButton("var(--accent-expense)", "#fff")}>{deletingExpense ? "Excluindo..." : "Excluir gasto"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function deleteModalButton(background, color) {
  return { flex: 1, border: "none", borderRadius: 11, padding: "11px 8px", background, color, fontWeight: 700, cursor: "pointer" };
}
