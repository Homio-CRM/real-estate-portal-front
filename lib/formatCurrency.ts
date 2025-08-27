export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === "" || value === "Preço sob consulta") {
    return "Preço sob consulta";
  }

  let numberValue: number;
  
  if (typeof value === "number") {
    numberValue = value;
  } else {
    // Remove caracteres não numéricos e converte para número
    const cleaned = value.replace(/[^0-9]/g, "");
    numberValue = Number(cleaned);
  }

  if (!numberValue || isNaN(numberValue)) {
    return "Preço sob consulta";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numberValue);
}
