import {
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/configuracao.js";

export const COLECOES = { usuarios: "usuarios", metas: "metas", transacoes: "transacoes" };
export const CATEGORIA_PARA_BANCO = { food: "alimentacao", transport: "transporte", leisure: "lazer", other: "outros", income: "receita" };
const CATEGORIA_DO_BANCO = Object.fromEntries(Object.entries(CATEGORIA_PARA_BANCO).map(([key, value]) => [value, key]));
const META_PARA_BANCO = { food: "alimentacao", transport: "transporte", leisure: "lazer", other: "outros" };
const META_DO_BANCO = Object.fromEntries(Object.entries(META_PARA_BANCO).map(([key, value]) => [value, key]));

// Metas padrão criadas para todo usuário novo
export const DEFAULT_GOALS = [
  { id: "food", label: "Alimentação", spent: 0, total: 1000, color: "#b08d3e" },
  { id: "transport", label: "Transporte", spent: 0, total: 500, color: "#3f6e74" },
  { id: "leisure", label: "Lazer", spent: 0, total: 500, color: "#7b4b5c" },
  { id: "other", label: "Outros", spent: 0, total: 300, color: "#636e72" },
];

// Mapeia categoria -> ícone/cores usados na lista de transações
export const CATEGORY_META = {
  food: { label: "Alimentação", icon: "ShoppingCart", iconBg: "#efe3c8", iconColor: "#b08d3e" },
  transport: { label: "Transporte", icon: "Car", iconBg: "#dbe8e9", iconColor: "#3f6e74" },
  leisure: { label: "Lazer", icon: "Tv", iconBg: "#ecdde1", iconColor: "#7b4b5c" },
  other: { label: "Outros", icon: "Tag", iconBg: "#e3e5e8", iconColor: "#636e72" },
  income: { label: "Depósito", icon: "Wallet", iconBg: "var(--accent-ink-soft)", iconColor: "var(--accent-ink)" },
};

// Categorias que têm meta mensal correspondente
const GOAL_CATEGORIES = ["food", "transport", "leisure", "other"];

/** Escuta o documento do usuário (saldo, nome, email) em tempo real */
export function listenToUserProfile(uid, callback) {
  return onSnapshot(doc(db, COLECOES.usuarios, uid), (snap) => {
    if (!snap.exists()) return callback(null);
    const data = snap.data();
    callback({ name: data.nome, email: data.email, balance: data.saldo, photoUrl: data.fotoPerfil, notificationsEnabled: data.notificacoesAtivadas, lastWeeklyReminder: data.ultimoLembreteSemanal });
  });
}

/** Atualiza preferências e dados do perfil do usuário. */
export async function updateUserProfile(uid, data) {
  const campos = { photoUrl: "fotoPerfil", notificationsEnabled: "notificacoesAtivadas", lastWeeklyReminder: "ultimoLembreteSemanal" };
  const dadosBanco = Object.fromEntries(Object.entries(data).map(([key, value]) => [campos[key] || key, value]));
  await updateDoc(doc(db, COLECOES.usuarios, uid), dadosBanco);
}

/** Escuta as metas do usuário em tempo real */
export function listenToGoals(uid, callback) {
  const goalsRef = collection(db, COLECOES.usuarios, uid, COLECOES.metas);
  return onSnapshot(goalsRef, (snap) => {
    const goals = snap.docs.map((d) => {
      const data = d.data();
      return { id: META_DO_BANCO[d.id] || d.id, label: data.rotulo, spent: data.gasto, total: data.limite, color: data.cor };
    });
    callback(goals);
  });
}

/** Escuta as transações do usuário em tempo real, mais recentes primeiro */
export function listenToTransactions(uid, callback) {
  const txRef = collection(db, COLECOES.usuarios, uid, COLECOES.transacoes);
  const q = query(txRef, orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => {
    const transactions = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, title: data.descricao, category: CATEGORIA_DO_BANCO[data.categoria] || data.categoria, amount: data.valor, createdAt: data.criadoEm, customCategory: data.categoriaPersonalizada };
    });
    callback(transactions);
  });
}

/**
 * Adiciona um gasto: cria a transação, desconta do saldo e soma na meta da categoria.
 * category deve ser uma chave existente em CATEGORY_META (ex: "food", "transport", "leisure", "other").
 * Quando category === "other", customCategory guarda o texto digitado pelo usuário.
 */
export async function addExpense(uid, { title, category, amount, customCategory, date }) {
  const txRef = doc(collection(db, COLECOES.usuarios, uid, COLECOES.transacoes));
  const userRef = doc(db, COLECOES.usuarios, uid);

  const batch = writeBatch(db);
  batch.set(txRef, {
    descricao: title || "Gasto sem descrição",
    categoria: CATEGORIA_PARA_BANCO[category],
    ...(category === "other" && customCategory ? { categoriaPersonalizada: customCategory } : {}),
    valor: -Math.abs(amount),
    // Meio-dia evita que a data selecionada seja deslocada por fuso horário ao ser exibida.
    criadoEm: date ? new Date(`${date}T12:00:00`).toISOString() : new Date().toISOString(),
  });
  batch.update(userRef, { saldo: increment(-Math.abs(amount)) });
  await batch.commit();

  // Só categorias com meta mensal correspondente afetam o "spent".
  // Se a meta ainda não existir (ex: contas criadas antes da categoria "Outros"
  // existir), cria automaticamente com os valores padrão.
  if (GOAL_CATEGORIES.includes(category)) {
    const goalRef = doc(db, COLECOES.usuarios, uid, COLECOES.metas, META_PARA_BANCO[category]);
    try {
      await updateDoc(goalRef, { gasto: increment(Math.abs(amount)) });
    } catch (err) {
      const defaults = DEFAULT_GOALS.find((g) => g.id === category);
      await setDoc(goalRef, {
        rotulo: defaults?.label || category,
        limite: defaults?.total || 100,
        cor: defaults?.color || "#636E72",
        gasto: Math.abs(amount),
      });
    }
  }
}

/** Adiciona uma entrada (receita), ex: salário — grava como transação e soma no saldo */
export async function addIncome(uid, { title, amount, date }) {
  const txRef = doc(collection(db, COLECOES.usuarios, uid, COLECOES.transacoes));
  const userRef = doc(db, COLECOES.usuarios, uid);

  const batch = writeBatch(db);
  batch.set(txRef, {
    descricao: title || "Saldo sem descrição",
    categoria: CATEGORIA_PARA_BANCO.income,
    valor: Math.abs(amount),
    // Meio-dia evita que a data selecionada seja deslocada por fuso horário ao ser exibida.
    criadoEm: date ? new Date(`${date}T12:00:00`).toISOString() : new Date().toISOString(),
  });
  batch.update(userRef, { saldo: increment(Math.abs(amount)) });
  await batch.commit();
}

/** Remove uma transação (não reverte o saldo automaticamente - use com cuidado) */
export async function deleteTransaction(uid, transactionId) {
  const txRef = doc(db, COLECOES.usuarios, uid, COLECOES.transacoes, transactionId);
  const txSnap = await getDoc(txRef);
  if (!txSnap.exists()) return;

  const transaction = txSnap.data();
  const batch = writeBatch(db);
  batch.delete(txRef);

  // Ao apagar um lançamento, desfaz o impacto que ele teve no saldo e na meta.
  if (typeof transaction.valor === "number") {
    batch.update(doc(db, COLECOES.usuarios, uid), { saldo: increment(-transaction.valor) });
  }
  const categoria = CATEGORIA_DO_BANCO[transaction.categoria];
  if (transaction.valor < 0 && GOAL_CATEGORIES.includes(categoria)) {
    batch.update(doc(db, COLECOES.usuarios, uid, COLECOES.metas, META_PARA_BANCO[categoria]), {
      gasto: increment(-Math.abs(transaction.valor)),
    });
  }
  await batch.commit();
}

/** Atualiza o valor total de uma meta */
export async function updateGoalTotal(uid, goalId, newTotal) {
  await updateDoc(doc(db, COLECOES.usuarios, uid, COLECOES.metas, META_PARA_BANCO[goalId]), { limite: newTotal });
}

/**
 * FERRAMENTA DE TESTE: cria um lote de transações com datas retroativas
 * espalhadas pelo último ano, pra testar os filtros de período (Última
 * semana / Último mês / Últimos seis meses / Último ano) sem precisar
 * esperar o tempo passar de verdade. Não altera saldo nem metas — só
 * cria as transações, pra não bagunçar seus números reais.
 */
export async function seedTestTransactions(uid) {
  const testData = [
    { daysAgo: 2, title: "Teste 2 dias atrás", category: "food", amount: 35.9 },
    { daysAgo: 5, title: "Teste 5 dias atrás", category: "transport", amount: 22.5 },
    { daysAgo: 20, title: "Teste 20 dias atrás", category: "leisure", amount: 60 },
    { daysAgo: 45, title: "Teste 45 dias atrás", category: "food", amount: 80 },
    { daysAgo: 90, title: "Teste 90 dias atrás", category: "other", amount: 40, customCategory: "Teste" },
    { daysAgo: 150, title: "Teste 150 dias atrás", category: "transport", amount: 55 },
    { daysAgo: 200, title: "Teste 200 dias atrás", category: "leisure", amount: 120 },
    { daysAgo: 300, title: "Teste 300 dias atrás", category: "food", amount: 95 },
    { daysAgo: 400, title: "Teste 400 dias atrás (fora do ano)", category: "transport", amount: 30 },
  ];

  const batch = writeBatch(db);
  const txCollection = collection(db, COLECOES.usuarios, uid, COLECOES.transacoes);

  testData.forEach((item) => {
    const date = new Date();
    date.setDate(date.getDate() - item.daysAgo);

    const txRef = doc(txCollection);
    batch.set(txRef, {
      descricao: item.title,
      categoria: CATEGORIA_PARA_BANCO[item.category],
      ...(item.customCategory ? { categoriaPersonalizada: item.customCategory } : {}),
      valor: -Math.abs(item.amount),
      criadoEm: date.toISOString(),
    });
  });

  await batch.commit();
  return testData.length;
}

/** FERRAMENTA DE TESTE: apaga todas as transações cujo título comece com "Teste" */
export async function deleteTestTransactions(uid) {
  const txRef = collection(db, COLECOES.usuarios, uid, COLECOES.transacoes);
  const snap = await new Promise((resolve) => {
    const unsub = onSnapshot(txRef, (s) => {
      unsub();
      resolve(s);
    });
  });

  const testDocs = snap.docs.filter((d) => (d.data().descricao || "").startsWith("Teste"));
  const batch = writeBatch(db);
  testDocs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return testDocs.length;
}
