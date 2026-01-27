import { startOfWeek, addDays, isSameWeek } from "date-fns";

export function getWeekDates(date: Date = new Date()) {
  const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

export function getWeekDays() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export function shouldResetWeek(dateString: string | Date): boolean {
  const lastDate = new Date(dateString);
  const now = new Date();
  // نستخدم weekStartsOn: 1 لتبدأ من يوم الاثنين (أو 0 للأحد حسب نظامك)
  return !isSameWeek(lastDate, now, { weekStartsOn: 1 });
}