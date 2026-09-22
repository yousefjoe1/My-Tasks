const CAIRO = "Africa/Cairo";

/** Calendar date in Cairo as YYYY-MM-DD (for grouping daily totals). */
export function getCairoDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAIRO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getCairoDateKeyFromIso(iso: string): string {
  return getCairoDateKey(new Date(iso));
}
