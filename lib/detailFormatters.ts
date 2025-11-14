"use client";

export function translatePeriod(period: string | null | undefined): string {
    if (!period) return "";

    const periodMap: Record<string, string> = {
        monthly: "Mensal",
        month: "Mensal",
        mensal: "Mensal",
        yearly: "Anual",
        year: "Anual",
        anual: "Anual",
        annual: "Anual",
        daily: "Diário",
        day: "Diário",
        diário: "Diário",
        diario: "Diário",
        weekly: "Semanal",
        week: "Semanal",
        semanal: "Semanal",
    };

    const normalizedPeriod = String(period).toLowerCase().trim();
    return periodMap[normalizedPeriod] || String(period);
}

export function formatPrice(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function toSentenceCase(text: string): string {
    if (!text) return text;
    const prepositions = ["do", "da", "de", "dos", "das", "e"];
    return text
        .split(/\s+/)
        .map((word, index) => {
            const lowerWord = word.toLowerCase();
            if (index === 0 || !prepositions.includes(lowerWord)) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return lowerWord;
        })
        .join(" ");
}


