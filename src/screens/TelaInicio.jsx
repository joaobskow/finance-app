import React, { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho.jsx";
import CartaoSaldo from "../components/CartaoSaldo.jsx";
import BotoesAcao from "../components/BotoesAcao.jsx";
import CartaoMetas from "../components/CartaoMetas.jsx";
import GraficoCategorias from "../components/GraficoCategorias.jsx";
import ListaTransacoes from "../components/ListaTransacoes.jsx";
import BarraNavegacao from "../components/BarraNavegacao.jsx";
import ModalAdicionarGasto from "../components/ModalAdicionarGasto.jsx";
import ModalAdicionarSaldo from "../components/ModalAdicionarSaldo.jsx";
import ModalEditarMetas from "../components/ModalEditarMetas.jsx";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";
import {
  listenToGoals,
  listenToTransactions,
  listenToUserProfile,
  CATEGORY_META,
  deleteTransaction,
} from "../services/servicoFirestore.js";
import { formatarData } from "../utils/formatacao.js";

const GOAL_ORDER = ["food", "transport", "leisure", "other"];

export default function TelaInicio() {
  const { user } = usarAutenticacao();
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [showScanInfo, setShowScanInfo] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = listenToUserProfile(user.uid, setProfile);
    const unsubGoals = listenToGoals(user.uid, setGoals);
    const unsubTx = listenToTransactions(user.uid, setTransactions);
    return () => {
      unsubProfile();
      unsubGoals();
      unsubTx();
    };
  }, [user]);

  const sortedGoals = [...goals].sort(
    (a, b) => GOAL_ORDER.indexOf(a.id) - GOAL_ORDER.indexOf(b.id)
  );

  const enrichedTransactions = transactions.slice(0, 6).map((tx) => {
    const meta = CATEGORY_META[tx.category] || CATEGORY_META.food;
    const categoryLabel = tx.category === "other" && tx.customCategory ? tx.customCategory : meta.label;
    return {
      ...tx,
      icon: meta.icon,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      subtitle: `${formatarData(tx.createdAt)} • ${categoryLabel}`,
    };
  });

  const trend = buildWeeklyTrend(transactions);

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
        position: "relative",
      }}
    >
      <Cabecalho userName={profile?.name?.split(" ")[0] || "..."} user={user} profile={profile} />

      <div style={{ padding: "8px 20px 0" }}>
        <CartaoSaldo balance={profile?.balance ?? 0} changePercent={12.5} trend={trend} />

        <BotoesAcao
          onAddExpense={() => setShowAddExpense(true)}
          onAddBalance={() => setShowAddBalance(true)}
          onScanReceipt={() => setShowScanInfo(true)}
        />

        <CartaoMetas
          goals={sortedGoals}
          transactions={transactions}
          onEditGoals={() => setShowEditGoals(true)}
        />

        <GraficoCategorias transactions={transactions} />

        <ListaTransacoes transactions={enrichedTransactions} onViewAll={() => {}} onDelete={setExpenseToDelete} />
      </div>

      <BarraNavegacao />

      {showAddExpense && <ModalAdicionarGasto onClose={() => setShowAddExpense(false)} />}
      {showAddBalance && <ModalAdicionarSaldo onClose={() => setShowAddBalance(false)} />}
      {showEditGoals && (
        <ModalEditarMetas goals={sortedGoals} onClose={() => setShowEditGoals(false)} />
      )}

      {showScanInfo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(31,27,46,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setShowScanInfo(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              borderRadius: 20,
              padding: 24,
              maxWidth: 300,
              textAlign: "center",
              fontFamily: "var(--font-sans)",
            }}
          >
            <p style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>
              A leitura automática de notas fiscais (OCR) ainda não está implementada.
              Por enquanto, use "Adicionar Gasto" para lançar manualmente.
            </p>
            <button
              onClick={() => setShowScanInfo(false)}
              style={{
                background: "var(--accent-ink)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}

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

function buildWeeklyTrend(transactions) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const totals = days.map((day) => {
    const dayTotal = transactions
      .filter((tx) => tx.createdAt?.slice(0, 10) === day && tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return dayTotal;
  });

  const allZero = totals.every((v) => v === 0);
  return allZero ? [10, 10, 10, 10, 10, 10, 10] : totals.map((v) => v + 5);
}
