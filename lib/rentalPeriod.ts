export function translateRentalPeriod(period: string | null | undefined): string {
    if (!period) return '';

    const periodMap: Record<string, string> = {
        'monthly': 'mês',
        'month': 'mês',
        'mensal': 'mês',
        'yearly': 'ano',
        'year': 'ano',
        'anual': 'ano',
        'daily': 'dia',
        'day': 'dia',
        'diário': 'dia',
        'weekly': 'semana',
        'week': 'semana',
        'semanal': 'semana',
    };

    const normalizedPeriod = period.toLowerCase().trim();
    return periodMap[normalizedPeriod] || period;
}
