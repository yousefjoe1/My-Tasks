import {  startOfWeek, addDays, isSameWeek } from "date-fns";

export function getWeekDates(date: Date = new Date()) {
  const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

export function getWeekDays() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export function shouldResetWeek(lastUpdated: Date): boolean {
  const now = new Date();
  return !isSameWeek(lastUpdated, now, { weekStartsOn: 1 });
}