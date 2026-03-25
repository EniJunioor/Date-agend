"use server";

import { db } from "@/lib/db";
import {
  events,
  photos,
  achievements,
  coupleAchievements,
  dailyMessages,
  timeCapsules,
} from "@/lib/db/schema";
import { eq, count, and } from "drizzle-orm";
import { getDaysTogether } from "@/lib/utils";

interface AchievementCheck {
  coupleId: string;
  startDate: string;
}

const ACHIEVEMENT_CRITERIA: {
  slug: string;
  check: (data: Record<string, number>) => boolean;
}[] = [
  { slug: "first-event", check: (d) => d.events >= 1 },
  { slug: "five-events", check: (d) => d.events >= 5 },
  { slug: "twenty-events", check: (d) => d.events >= 20 },
  { slug: "photo-lover", check: (d) => d.photos >= 10 },
  { slug: "one-month", check: (d) => d.days >= 30 },
  { slug: "six-months", check: (d) => d.days >= 180 },
  { slug: "one-year", check: (d) => d.days >= 365 },
  { slug: "two-years", check: (d) => d.days >= 730 },
  { slug: "first-trip", check: (d) => d.tripEvents >= 1 },
  { slug: "daily-message", check: (d) => d.messages >= 7 },
  { slug: "favorites-lover", check: (d) => d.favorites >= 5 },
  { slug: "time-capsule", check: (d) => d.capsules >= 1 },
];

/**
 * Checks all achievement criteria for a couple and unlocks any newly earned ones.
 * Call this after significant actions (create event, upload photo, etc.)
 */
export async function checkAndUnlockAchievements({ coupleId, startDate }: AchievementCheck) {
  // Gather all stats in parallel
  const [
    [eventCount],
    [tripCount],
    [favoriteCount],
    [photoCount],
    [messageCount],
    [capsuleCount],
    existingAchievements,
    allAchievements,
  ] = await Promise.all([
    db.select({ count: count() }).from(events).where(eq(events.coupleId, coupleId)),
    db.select({ count: count() }).from(events).where(
      and(eq(events.coupleId, coupleId), eq(events.category, "viagem"))
    ),
    db.select({ count: count() }).from(events).where(
      and(eq(events.coupleId, coupleId), eq(events.isFavorite, true))
    ),
    db.select({ count: count() }).from(photos).where(eq(photos.coupleId, coupleId)),
    db.select({ count: count() }).from(dailyMessages).where(eq(dailyMessages.coupleId, coupleId)),
    db.select({ count: count() }).from(timeCapsules).where(eq(timeCapsules.coupleId, coupleId)),
    db.select({ achievementId: coupleAchievements.achievementId })
      .from(coupleAchievements)
      .where(eq(coupleAchievements.coupleId, coupleId)),
    db.select().from(achievements),
  ]);

  const data = {
    events: Number(eventCount.count),
    tripEvents: Number(tripCount.count),
    favorites: Number(favoriteCount.count),
    photos: Number(photoCount.count),
    messages: Number(messageCount.count),
    capsules: Number(capsuleCount.count),
    days: getDaysTogether(startDate),
  };

  const existingIds = new Set(existingAchievements.map((a) => a.achievementId));
  const achievementMap = new Map(allAchievements.map((a) => [a.slug, a.id]));

  const newlyUnlocked: string[] = [];

  for (const criteria of ACHIEVEMENT_CRITERIA) {
    const achievementId = achievementMap.get(criteria.slug);
    if (!achievementId) continue;
    if (existingIds.has(achievementId)) continue;

    if (criteria.check(data)) {
      await db.insert(coupleAchievements).values({
        coupleId,
        achievementId,
      }).onConflictDoNothing();

      newlyUnlocked.push(criteria.slug);
    }
  }

  return { newlyUnlocked };
}

/**
 * Seeds the achievements catalog to the DB (run once on setup)
 */
export async function seedAchievements() {
  const catalog = [
    { slug: "first-event", name: "Primeira Memória", description: "Criou o primeiro evento do casal", icon: "book-open", criteria: "events >= 1" },
    { slug: "photo-lover", name: "Álbum de Memórias", description: "Adicionou 10 fotos à galeria", icon: "camera", criteria: "photos >= 10" },
    { slug: "one-month", name: "Um Mês Juntos", description: "Completaram 30 dias de relacionamento", icon: "moon", criteria: "days >= 30" },
    { slug: "six-months", name: "Seis Meses", description: "Completaram 6 meses de relacionamento", icon: "sparkles", criteria: "days >= 180" },
    { slug: "one-year", name: "Um Ano de Amor", description: "Completaram 1 ano juntos", icon: "cake", criteria: "days >= 365" },
    { slug: "two-years", name: "Dois Anos", description: "Completaram 2 anos de relacionamento", icon: "users", criteria: "days >= 730" },
    { slug: "five-events", name: "Colecionadores", description: "Criaram 5 eventos especiais", icon: "star", criteria: "events >= 5" },
    { slug: "twenty-events", name: "Historiadores", description: "Criaram 20 memórias", icon: "book", criteria: "events >= 20" },
    { slug: "first-trip", name: "Viajantes", description: "Registraram a primeira viagem juntos", icon: "plane", criteria: "category:viagem >= 1" },
    { slug: "daily-message", name: "Recadinho do Dia", description: "Enviaram 7 recadinhos diários", icon: "mail", criteria: "messages >= 7" },
    { slug: "favorites-lover", name: "Momentos Especiais", description: "Marcaram 5 eventos como favoritos", icon: "star", criteria: "favorites >= 5" },
    { slug: "time-capsule", name: "Cápsula do Tempo", description: "Criaram sua primeira cápsula", icon: "hourglass", criteria: "capsules >= 1" },
  ];

  for (const ach of catalog) {
    await db.insert(achievements).values(ach).onConflictDoNothing();
  }

  return { seeded: catalog.length };
}
