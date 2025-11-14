export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === "" || value === "Preço sob consulta") {
    return "Preço sob consulta";
  }

  let numberValue: number;

  if (typeof value === "number") {
    numberValue = value;
  } else {
    const normalized = value.replace(/[^\d.,-]/g, "");
    const hasCommaAsDecimal = /,\d{1,2}$/.test(normalized);
    const sanitized = hasCommaAsDecimal
      ? normalized.replace(/\./g, "").replace(",", ".")
      : normalized.replace(/[^\d-]/g, "");

    numberValue = Number(sanitized);
  }

  if (!Number.isFinite(numberValue) || numberValue === 0) {
    return "Preço sob consulta";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}
