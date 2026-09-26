const CAIRO = "Africa/Cairo";

export function getCairoDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAIRO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function monthKeyFromDate(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function monthRange(monthKey: string): { start: string; endExclusive: string } | null {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return null;
  const [year, month] = monthKey.split("-").map(Number);
  if (month < 1 || month > 12) return null;
  const start = `${monthKey}-01`;
  const endExclusive =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  return { start, endExclusive };
}

function parseClock(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

function cairoOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CAIRO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  const wallAsUtc = Date.UTC(
    pick("year"),
    pick("month") - 1,
    pick("day"),
    pick("hour"),
    pick("minute"),
    pick("second")
  );

  return wallAsUtc - instant.getTime();
}

/** Wall-clock time in Cairo as an ISO timestamp. */
export function cairoWallTimeToIso(dateKey: string, timeHHmm: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const clock = parseClock(timeHHmm);
  if (!clock) {
    throw new Error("Invalid time");
  }

  const utcGuess = new Date(Date.UTC(year, month - 1, day, clock.hours, clock.minutes, 0));
  return new Date(utcGuess.getTime() - cairoOffsetMs(utcGuess)).toISOString();
}

export function formatCairoTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAIRO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const normalizedHour = hour === "24" ? "00" : hour;
  return `${normalizedHour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

export function formatArabicDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatArabicMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1, 12));
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} د`;
  if (mins === 0) return `${hours} س`;
  return `${hours} س ${mins} د`;
}

export type SleepTimestampResult =
  | {
      ok: true;
      bedtime: string;
      wakeTime: string;
      bedDate: string;
      durationMinutes: number;
    }
  | { ok: false; error: string };

/**
 * sleepDate is the wake-up day. If the bedtime clock is later than the wake
 * clock, bedtime belongs to the previous calendar day.
 */
export function buildSleepTimestamps(
  sleepDate: string,
  bedTime: string,
  wakeClock: string
): SleepTimestampResult {
  if (!isDateKey(sleepDate)) {
    return { ok: false, error: "التاريخ غير صالح" };
  }

  const bed = parseClock(bedTime);
  const wake = parseClock(wakeClock);
  if (!bed || !wake) {
    return { ok: false, error: "أدخل وقت النوم ووقت الاستيقاظ" };
  }

  const bedMinutes = bed.hours * 60 + bed.minutes;
  const wakeMinutes = wake.hours * 60 + wake.minutes;
  const bedDate = bedMinutes >= wakeMinutes ? addDaysToDateKey(sleepDate, -1) : sleepDate;

  const bedtime = cairoWallTimeToIso(bedDate, bedTime);
  const wakeTime = cairoWallTimeToIso(sleepDate, wakeClock);
  const durationMinutes = Math.round(
    (new Date(wakeTime).getTime() - new Date(bedtime).getTime()) / 60000
  );

  if (durationMinutes <= 0) {
    return { ok: false, error: "وقت الاستيقاظ لازم يكون بعد وقت النوم" };
  }

  if (durationMinutes > 24 * 60) {
    return { ok: false, error: "مدة النوم لا يمكن أن تزيد عن 24 ساعة" };
  }

  return { ok: true, bedtime, wakeTime, bedDate, durationMinutes };
}
