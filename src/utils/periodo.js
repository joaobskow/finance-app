export const OPCOES_PERIODO = [
  { key: "week", label: "Última semana" },
  { key: "month", label: "Último mês" },
  { key: "6months", label: "Últimos seis meses" },
  { key: "year", label: "Último ano" },
];

/** Retorna a data de início do período, relativa a hoje */
export function obterDataInicioPeriodo(periodKey) {
  const now = new Date();
  const start = new Date(now);

  switch (periodKey) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "6months":
      start.setMonth(now.getMonth() - 6);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return start;
}

/** Filtra transações de gasto (valor negativo) dentro do período informado */
export function filtrarGastosPorPeriodo(transactions, periodKey) {
  const start = obterDataInicioPeriodo(periodKey);
  return transactions.filter((tx) => tx.amount < 0 && new Date(tx.createdAt) >= start);
}
