import React, { useState } from "react";
import Cabecalho from "../components/Cabecalho.jsx";
import BarraNavegacao from "../components/BarraNavegacao.jsx";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";
import { usarDados } from "../context/ContextoDados.jsx";
import { CATEGORY_META, deleteTransaction } from "../services/servicoFirestore.js";
import { baixarPlanilhaXlsx } from "../services/servicoExportacaoXlsx.js";
import { formatarMoeda, formatarData } from "../utils/formatacao.js";
import { ShoppingCart, Car, Wallet, Tv, Tag, Trash2, Download } from "lucide-react";

const iconMap = { ShoppingCart, Car, Wallet, Tv, Tag };
const OPCOES_DATA_HORA = { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" };

export default function TelaTransacoes() {
  const { user } = usarAutenticacao();
  const { profile, transactions } = usarDados();
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFields, setExportFields] = useState(["date", "amount", "description", "category"]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const fields = [
    { id: "date", label: "Data", value: (tx) => formatarData(tx.createdAt, { day: "2-digit", month: "2-digit", year: "numeric" }) },
    { id: "amount", label: "Valor", value: (tx) => tx.amount },
    { id: "description", label: "Descrição", value: (tx) => tx.title },
    { id: "category", label: "Categoria", value: (tx) => tx.category === "other" && tx.customCategory ? tx.customCategory : (CATEGORY_META[tx.category] || CATEGORY_META.food).label },
  ];

  async function confirmDeleteExpense() {
    if (!user || !expenseToDelete) return;
    setDeletingExpense(true);
    try { await deleteTransaction(user.uid, expenseToDelete.id); setExpenseToDelete(null); }
    finally { setDeletingExpense(false); }
  }

  function toggleExportField(id) {
    setExportFields((current) => current.includes(id) ? current.filter((field) => field !== id) : [...current, id]);
  }

  async function exportData() {
    if (!exportFields.length) { setExportError("Selecione ao menos uma informação para exportar."); return; }
    setExporting(true); setExportError("");
    try {
      const selectedFields = fields.filter((field) => exportFields.includes(field.id));
      baixarPlanilhaXlsx({
        columns: selectedFields.map((field) => field.label),
        rows: transactions.map((tx) => selectedFields.map((field) => field.value(tx))),
      });
      setExportOpen(false);
    } catch (error) { setExportError(error.message || "Não foi possível exportar os dados."); }
    finally { setExporting(false); }
  }

  return <div className="tela-app" style={{ maxWidth: 480, width: "100%", minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", paddingBottom: 90, fontFamily: "var(--font-sans)" }}>
    <Cabecalho userName={profile?.name?.split(" ")[0] || "..."} user={user} profile={profile} />
    <div style={{ padding: "8px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "8px 0 16px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Todas as Transações</h2>
        <button onClick={() => { setExportError(""); setExportOpen(true); }} style={exportButtonStyle}><Download size={15} /> Exportar dados</button>
      </div>
      {transactions.length === 0 ? <EmptyState /> : <TransactionsList transactions={transactions} onDelete={setExpenseToDelete} />}
    </div>
    <BarraNavegacao />
    {expenseToDelete && <DeleteModal transaction={expenseToDelete} loading={deletingExpense} onClose={() => !deletingExpense && setExpenseToDelete(null)} onConfirm={confirmDeleteExpense} />}
    {exportOpen && <ExportModal fields={fields} selected={exportFields} exporting={exporting} error={exportError} onClose={() => !exporting && setExportOpen(false)} onToggle={toggleExportField} onExport={exportData} />}
  </div>;
}

function TransactionsList({ transactions, onDelete }) {
  return <div style={{ background: "var(--bg-card)", borderRadius: 20, boxShadow: "0 4px 20px rgba(16,22,31,0.06)", overflow: "hidden" }}>
    {transactions.map((tx, i) => {
      const meta = CATEGORY_META[tx.category] || CATEGORY_META.food;
      const categoryLabel = tx.category === "other" && tx.customCategory ? tx.customCategory : meta.label;
      const Icon = iconMap[meta.icon] || ShoppingCart;
      return <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: i !== transactions.length - 1 ? "1px solid var(--border-color-soft)" : "none" }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={19} color={meta.iconColor} /></div>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14.5 }}>{tx.title}</div><div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{formatarData(tx.createdAt, OPCOES_DATA_HORA)} • {categoryLabel}</div></div>
        <div style={{ fontWeight: 700, fontSize: 14, color: tx.amount < 0 ? "var(--text-primary)" : "var(--accent-income)", flexShrink: 0 }}>{formatarMoeda(tx.amount)}</div>
        {tx.amount < 0 && <button aria-label={`Excluir gasto ${tx.title}`} onClick={() => onDelete(tx)} style={iconButtonStyle}><Trash2 size={17} /></button>}
      </div>;
    })}
  </div>;
}

function EmptyState() { return <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>Você ainda não tem transações. Toque em "Adicionar Gasto" na tela Início para lançar a primeira.</div>; }

function DeleteModal({ transaction, loading, onClose, onConfirm }) { return <Modal onClose={onClose}><h3 style={modalTitle}>Excluir gasto</h3><p style={modalText}>Deseja excluir “{transaction.title}”? O saldo e a meta serão atualizados.</p><div style={modalActions}><button disabled={loading} onClick={onClose} style={modalButton("var(--border-color-soft)", "var(--text-primary)")}>Cancelar</button><button disabled={loading} onClick={onConfirm} style={modalButton("var(--accent-expense)", "#fff")}>{loading ? "Excluindo..." : "Excluir gasto"}</button></div></Modal>; }

function ExportModal({ fields, selected, exporting, error, onClose, onToggle, onExport }) { return <Modal onClose={onClose}><h3 style={modalTitle}>Exportar para planilhas</h3><p style={modalText}>Selecione quais informações deseja incluir na planilha.</p><div style={{ display: "grid", gap: 8, marginBottom: 18 }}>{fields.map((field) => <label key={field.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={selected.includes(field.id)} onChange={() => onToggle(field.id)} style={{ accentColor: "var(--accent-ink)", width: 17, height: 17 }} />{field.label}</label>)}</div>{error && <p style={{ margin: "0 0 12px", color: "var(--accent-expense)", fontSize: 12.5 }}>{error}</p>}<div style={modalActions}><button disabled={exporting} onClick={onClose} style={modalButton("var(--border-color-soft)", "var(--text-primary)")}>Cancelar</button><button disabled={exporting} onClick={onExport} style={modalButton("var(--accent-ink)", "#fff")}>{exporting ? "Exportando..." : "Baixar planilha"}</button></div></Modal>; }

function Modal({ children, onClose }) { return <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(16,22,31,.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 350, background: "var(--bg-card)", borderRadius: 20, padding: 22, fontFamily: "var(--font-sans)" }}>{children}</div></div>; }

const exportButtonStyle = { border: "none", borderRadius: 10, padding: "9px 11px", background: "var(--accent-ink)", color: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
const iconButtonStyle = { border: "none", background: "transparent", color: "var(--accent-expense)", padding: 3, cursor: "pointer", display: "flex" };
const modalTitle = { margin: "0 0 8px", fontSize: 18 };
const modalText = { margin: "0 0 20px", color: "var(--text-secondary)", fontSize: 13.5 };
const modalActions = { display: "flex", gap: 10 };
function modalButton(background, color) { return { flex: 1, border: "none", borderRadius: 11, padding: "11px 8px", background, color, fontWeight: 700, cursor: "pointer" }; }
