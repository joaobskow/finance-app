import * as XLSX from "xlsx";

export function baixarPlanilhaXlsx({ columns, rows }) {
  const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  worksheet["!cols"] = columns.map((column, index) => ({
    wch: Math.max(column.length + 2, ...rows.map((row) => String(row[index] ?? "").length + 2), 12),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transações");
  XLSX.writeFile(workbook, `transacoes-${new Date().toISOString().slice(0, 10)}.xlsx`, {
    bookType: "xlsx",
    compression: true,
  });
}
