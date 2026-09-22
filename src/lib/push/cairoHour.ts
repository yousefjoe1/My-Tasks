export function getCairoHour(date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return Number(hour);
}
