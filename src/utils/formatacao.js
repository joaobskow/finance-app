export function formatarMoeda(value) {
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "- " : "+ "}R$ ${abs}`;
}

export function formatarData(isoString, options) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString(
    "pt-BR",
    options || { day: "2-digit", month: "short" }
  );
}
