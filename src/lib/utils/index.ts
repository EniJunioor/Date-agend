import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  differenceInDays,
  format,
  formatDistance,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";

// ── Tailwind class merging ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Locale mapping ────────────────────────────────────────────────────────────
const localeMap = {
  "pt-BR": ptBR,
  en: enUS,
  es: es,
} as const;

type SupportedLocale = keyof typeof localeMap;

// ── Date utilities ────────────────────────────────────────────────────────────
export function getDaysTogether(startDate: string): number {
  return differenceInDays(new Date(), parseISO(startDate));
}

export function formatEventDate(
  dateStr: string,
  locale: SupportedLocale = "pt-BR"
): string {
  const date = parseISO(dateStr);
  const dateFnsLocale = localeMap[locale];

  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  if (isYesterday(date)) return "Ontem";

  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: dateFnsLocale });
}

export function formatRelativeDate(
  dateStr: string,
  locale: SupportedLocale = "pt-BR"
): string {
  const date = parseISO(dateStr);
  return formatDistance(date, new Date(), {
    locale: localeMap[locale],
    addSuffix: true,
  });
}

export function formatMonthYear(
  date: Date,
  locale: SupportedLocale = "pt-BR"
): string {
  return format(date, "MMMM yyyy", { locale: localeMap[locale] });
}

// ── Invite code ───────────────────────────────────────────────────────────────
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

// ── Token ─────────────────────────────────────────────────────────────────────
export function generateToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

// ── Category colors ───────────────────────────────────────────────────────────
export const categoryColors: Record<string, string> = {
  aniversario: "#db2777",
  viagem: "#2563eb",
  encontro: "#7c3aed",
  conquista: "#d97706",
  especial: "#dc2626",
  rotina: "#059669",
  outro: "#64748b",
};

export const categoryLabels: Record<string, string> = {
  aniversario: "Aniversário",
  viagem: "Viagem",
  encontro: "Encontro",
  conquista: "Conquista",
  especial: "Especial",
  rotina: "Rotina",
  outro: "Outro",
};

// ── Mood emojis ───────────────────────────────────────────────────────────────
export const moodEmojis = ["😊", "🥰", "🎉", "😢", "😌", "🤩", "😍", "💕"];
