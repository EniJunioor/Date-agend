// src/app/actions/stats.ts
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, photos } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, count, desc } from "drizzle-orm";
import {
  startOfYear,
  endOfYear,
  subYears,
  format,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";

function toDateString(d: Date) {
  return format(d, "yyyy-MM-dd");
}

// ─── Heatmap: contagem de eventos por dia (últimos 12 meses) ───────────────
export async function getActivityHeatmap() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coupleId = session.user.coupleId;
  if (!coupleId) return [];

  const from = toDateString(subYears(new Date(), 1));
  const to = toDateString(new Date());

  const rows = await db
    .select({
      day: sql<string>`DATE(${events.eventDate})`.as("day"),
      count: count(),
    })
    .from(events)
    .where(
      and(
        eq(events.coupleId, coupleId),
        gte(events.eventDate, from),
        lte(events.eventDate, to)
      )
    )
    .groupBy(sql`DATE(${events.eventDate})`);

  return rows.map((r) => ({ day: r.day, value: Number(r.count) }));
}

// ─── Eventos por mês (ano atual) ───────────────────────────────────────────
export async function getEventsByMonth(year = new Date().getFullYear()) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coupleId = session.user.coupleId;
  if (!coupleId) return [];

  const from = toDateString(startOfYear(new Date(year, 0, 1)));
  const to = toDateString(endOfYear(new Date(year, 0, 1)));

  const rows = await db
    .select({
      month: sql<number>`EXTRACT(MONTH FROM ${events.eventDate})`.as("month"),
      count: count(),
    })
    .from(events)
    .where(
      and(
        eq(events.coupleId, coupleId),
        gte(events.eventDate, from),
        lte(events.eventDate, to)
      )
    )
    .groupBy(sql`EXTRACT(MONTH FROM ${events.eventDate})`);

  // Preenche meses sem eventos com 0
  const months = eachMonthOfInterval({
    start: new Date(`${from}T00:00:00`),
    end: new Date(`${to}T00:00:00`),
  });
  return months.map((m, i) => {
    const found = rows.find((r) => r.month === i + 1);
    return {
      month: format(m, "MMM", { locale: ptBR }),
      eventos: Number(found?.count ?? 0),
    };
  });
}

// ─── Eventos por categoria ─────────────────────────────────────────────────
export async function getEventsByCategory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coupleId = session.user.coupleId;
  if (!coupleId) return [];

  const rows = await db
    .select({
      category: events.category,
      count: count(),
    })
    .from(events)
    .where(eq(events.coupleId, coupleId))
    .groupBy(events.category)
    .orderBy(desc(count()));

  const COLORS: Record<string, string> = {
    date: "#e8325f",
    travel: "#f59e0b",
    anniversary: "#8b5cf6",
    special: "#10b981",
    food: "#f97316",
    other: "#94a3b8",
  };

  const LABELS: Record<string, string> = {
    date: "Encontros",
    travel: "Viagens",
    anniversary: "Aniversários",
    special: "Datas especiais",
    food: "Jantares",
    other: "Outros",
  };

  return rows.map((r) => ({
    name: LABELS[r.category ?? "other"] ?? r.category ?? "Outros",
    value: Number(r.count),
    color: COLORS[r.category ?? "other"] ?? "#94a3b8",
  }));
}

// ─── Cards de resumo ───────────────────────────────────────────────────────
export async function getStatsSummary() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const coupleId = session.user.coupleId;
  if (!coupleId) return null;

  const monthFrom = toDateString(startOfMonth(new Date()));
  const monthTo = toDateString(endOfMonth(new Date()));

  const [totalEvents, totalPhotos, thisMonthEvents, lastMonthEvents] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(events)
        .where(eq(events.coupleId, coupleId))
        .then((r) => Number(r[0]?.count ?? 0)),

      db
        .select({ count: count() })
        .from(photos)
        .where(eq(photos.coupleId, coupleId))
        .then((r) => Number(r[0]?.count ?? 0)),

      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.coupleId, coupleId),
            gte(events.eventDate, monthFrom),
            lte(events.eventDate, monthTo)
          )
        )
        .then((r) => Number(r[0]?.count ?? 0)),

      db
        .select({ count: count() })
        .from(events)
        .where(
          and(
            eq(events.coupleId, coupleId),
            gte(events.eventDate, monthFrom),
            lte(events.eventDate, monthTo)
          )
        )
        .then((r) => Number(r[0]?.count ?? 0)),
    ]);

  const growth =
    lastMonthEvents > 0
      ? Math.round(((thisMonthEvents - lastMonthEvents) / lastMonthEvents) * 100)
      : thisMonthEvents > 0
      ? 100
      : 0;

  return { totalEvents, totalPhotos, thisMonthEvents, growth };
}
