import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export function toIsoDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseIsoDate(value: string | null | undefined) {
  if (!value) return null;
  const d = parseISO(value);
  if (!isValid(d)) return null;
  return d;
}

export function diffDaysInclusive(start: Date, end: Date) {
  const days = differenceInCalendarDays(end, start) + 1;
  return Math.max(1, days);
}
