export function translateTransactionType(
  transactionType: string | undefined,
  constructionStatus?: string | undefined
): "comprar" | "alugar" | "lançamento" {
  if (constructionStatus === "off_plan" || constructionStatus === "under_construction") {
    return "lançamento";
  }
  
  if (transactionType === "rent" || transactionType === "rental") {
    return "alugar";
  }
  
  return "comprar";
}

