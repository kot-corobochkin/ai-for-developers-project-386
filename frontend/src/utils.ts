import { addDays, format, isBefore, parseISO, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";

export function dateInputValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function nextDaysRange() {
  const today = startOfDay(new Date());
  return { from: dateInputValue(today), to: dateInputValue(addDays(today, 13)) };
}

export function formatDateTime(value: string, timezone?: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(parseISO(value));
}

export function formatDate(value: string) {
  return format(parseISO(`${value}T12:00:00`), "EEEE, d MMMM", { locale: ru });
}

export function isPastDate(value: string) {
  return isBefore(parseISO(`${value}T23:59:59`), new Date());
}

export function toRfc3339(date: string, time: string) {
  return `${date}T${time}:00`;
}

export function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Произошла ошибка";
}
