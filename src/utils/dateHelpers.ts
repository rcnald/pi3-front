export function formatDateToOffset(dateStr: string): string {
  const parts = dateStr.split('-').map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n <= 0)) {
    return dateStr; // fallback
  }
  const tzMinutes = new Date().getTimezoneOffset();
  const offsetTotal = -tzMinutes;
  const sign = offsetTotal >= 0 ? '+' : '-';
  const abs = Math.abs(offsetTotal);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${dateStr}T00:00:00${sign}${hh}:${mm}`;
}

export function formatDateDisplay(dateString: string): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

export function getBaseUnitIdFromHabit(habit: unknown): number | undefined {
  if (!habit || typeof habit !== 'object') return undefined;
  const h = habit as Record<string, unknown>;
  if (typeof h.measurementUnitId === 'number') return h.measurementUnitId;
  if (typeof h.idMeasurementUnit === 'number') return h.idMeasurementUnit;
  return undefined;
}
