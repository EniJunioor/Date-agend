import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { events, photos, users } from "@/lib/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import { StatsClient } from "@/components/dashboard/StatsClient";

export const metadata: Metadata = { title: "Estatísticas" };

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const coupleId = session.user.coupleId;

  // Total counts
  const [eventCount] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.coupleId, coupleId));

  const [photoCount] = await db
    .select({ count: count() })
    .from(photos)
    .where(eq(photos.coupleId, coupleId));

  const [favoriteCount] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.coupleId, coupleId));

  // Events by category
  const byCategory = await db
    .select({
      category: events.category,
      count: count(),
    })
    .from(events)
    .where(eq(events.coupleId, coupleId))
    .groupBy(events.category)
    .orderBy(desc(count()));

  // Events by month (last 12 months)
  const byMonth = await db
    .select({
      month: sql<string>`TO_CHAR(${events.eventDate}::date, 'YYYY-MM')`,
      count: count(),
    })
    .from(events)
    .where(eq(events.coupleId, coupleId))
    .groupBy(sql`TO_CHAR(${events.eventDate}::date, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${events.eventDate}::date, 'YYYY-MM')`);

  // Events by day of week
  const byDayOfWeek = await db
    .select({
      dayOfWeek: sql<string>`TO_CHAR(${events.eventDate}::date, 'D')`,
      count: count(),
    })
    .from(events)
    .where(eq(events.coupleId, coupleId))
    .groupBy(sql`TO_CHAR(${events.eventDate}::date, 'D')`)
    .orderBy(sql`TO_CHAR(${events.eventDate}::date, 'D')`);

  return (
    <StatsClient
      stats={{
        totalEvents: eventCount.count,
        totalPhotos: photoCount.count,
        totalFavorites: favoriteCount.count,
        byCategory,
        byMonth,
        byDayOfWeek,
      }}
    />
  );
}
