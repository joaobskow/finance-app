import React, { useEffect, useState } from "react";
import Cabecalho from "../components/Cabecalho.jsx";
import BarraNavegacao from "../components/BarraNavegacao.jsx";
import GraficoCategorias from "../components/GraficoCategorias.jsx";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";
import { listenToTransactions, listenToUserProfile } from "../services/servicoFirestore.js";
import { formatarMoeda } from "../utils/formatacao.js";
import { OPCOES_PERIODO } from "../utils/periodo.js";
import { CATEGORY_META } from "../services/servicoFirestore.js";
import { formatarData } from "../utils/formatacao.js";

export default function TelaEstatisticas() {
  const { user } = usarAutenticacao();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState({ period: "month", totals: [] });
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = listenToUserProfile(user.uid, setProfile);
    const unsubTx = listenToTransactions(user.uid, setTransactions);
    return () => {
      unsubProfile();
      unsubTx();
    };
  }, [user]);

  const periodLabel =
    OPCOES_PERIODO.find((p) => p.key === chartData.period)?.label || "";
  const totalSpent = chartData.totals.reduce((sum, t) => sum + t.total, 0);
  const topCategory = [...chartData.totals].sort((a, b) => b.total - a.total)[0];

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
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 16px" }}>Estatísticas</h2>

        {/* Resumo do período selecionado no gráfico abaixo */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <SummaryCard
            label={`Total gasto (${periodLabel.toLowerCase()})`}
            value={formatarMoeda(-totalSpent).replace("- ", "")}
          />
          <SummaryCard
            label="Maior categoria"
            value={topCategory && topCategory.total > 0 ? topCategory.label : "—"}
            accent={topCategory?.color}
          />
        </div>

        <GraficoCategorias transactions={transactions} onDataChange={setChartData} onFilteredTransactionsChange={setFilteredTransactions} />
        <TransactionsByPeriod transactions={filteredTransactions} />
      </div>

      <BarraNavegacao />
    </div>
  );
}

function TransactionsByPeriod({ transactions }) {
  return (
    <section style={{ background: "var(--bg-card)", borderRadius: 20, padding: "20px 18px", marginTop: 20, boxShadow: "0 4px 20px rgba(16,22,31,0.06)" }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px" }}>Transações do período</h3>
      {transactions.length === 0 ? <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>Nenhum gasto no período selecionado.</p> : transactions.map((tx, index) => {
        const meta = CATEGORY_META[tx.category] || CATEGORY_META.other;
        const category = tx.category === "other" && tx.customCategory ? tx.customCategory : meta.label;
        return <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "12px 0", borderTop: index ? "1px solid var(--border-color-soft)" : "none" }}>
          <div><div style={{ fontSize: 14, fontWeight: 700 }}>{tx.title}</div><div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{formatarData(tx.createdAt)} · {category}</div></div>
          <strong style={{ fontSize: 13.5, whiteSpace: "nowrap" }}>{formatarMoeda(tx.amount)}</strong>
        </div>;
      })}
    </section>
  );
}

function SummaryCard({ label, value, accent }) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--bg-card)",
        borderRadius: 16,
        padding: "16px 14px",
        boxShadow: "0 4px 20px rgba(16,22,31,0.06)",
      }}
    >
      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: accent || "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}
