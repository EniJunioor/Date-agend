// src/app/(app)/stats/page.tsx
import { StatsClient } from "@/components/stats/stats-client";
import {
  getActivityHeatmap,
  getEventsByMonth,
  getEventsByCategory,
  getStatsSummary,
} from "@/app/actions/stats";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { couples } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { differenceInDays } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estatísticas | Casal",
};

async function getDaysTogether(coupleId: string | null): Promise<number> {
  if (!coupleId) return 0;
  const [couple] = await db
    .select({ startDate: couples.startDate })
    .from(couples)
    .where(eq(couples.id, coupleId))
    .limit(1);

  if (!couple?.startDate) return 0;
  return differenceInDays(new Date(), new Date(`${couple.startDate}T00:00:00`));
}

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [summary, eventsByMonth, byCategory, heatmap, daysTogetherCount] =
    await Promise.all([
      getStatsSummary(),
      getEventsByMonth(),
      getEventsByCategory(),
      getActivityHeatmap(),
      getDaysTogether(session.user.coupleId ?? null),
    ]);

  return (
    <StatsClient
      summary={summary}
      eventsByMonth={eventsByMonth}
      byCategory={byCategory}
      heatmap={heatmap}
      daysTogetherCount={daysTogetherCount}
    />
  );
}
