"use server";

import { db } from "@/lib/db";
import { events, photos } from "@/lib/db/schema";
import { createEventSchema, updateEventSchema } from "@/lib/validators/events";
import { auth } from "@/lib/auth";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  if (!session.user.coupleId) throw new Error("Casal não vinculado");
  return { userId: session.user.id, coupleId: session.user.coupleId };
}

// ── Create Event ──────────────────────────────────────────────────────────────
export async function createEventAction(formData: FormData) {
  const { userId, coupleId } = await getAuthenticatedUser();

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    eventDate: formData.get("eventDate") as string,
    eventTime: formData.get("eventTime") as string || undefined,
    category: formData.get("category") as string,
    moodEmoji: formData.get("moodEmoji") as string || undefined,
    isFavorite: formData.get("isFavorite") === "true",
    tags: (formData.get("tags") as string || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    location: formData.get("location") as string || undefined,
    color: formData.get("color") as string || undefined,
    isRecurring: formData.get("isRecurring") === "true",
    recurrenceType: formData.get("recurrenceType") as string || undefined,
  };

  const parsed = createEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const [event] = await db
    .insert(events)
    .values({
      ...parsed.data,
      coupleId,
      createdById: userId,
    })
    .returning({ id: events.id });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");

  return { success: true, eventId: event.id };
}

// ── Update Event ──────────────────────────────────────────────────────────────
export async function updateEventAction(id: string, formData: FormData) {
  const { coupleId } = await getAuthenticatedUser();

  // Verify event belongs to this couple
  const [existing] = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, id), eq(events.coupleId, coupleId)))
    .limit(1);

  if (!existing) return { error: "Evento não encontrado." };

  const raw = {
    id,
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    eventDate: formData.get("eventDate") as string,
    eventTime: formData.get("eventTime") as string || undefined,
    category: formData.get("category") as string,
    moodEmoji: formData.get("moodEmoji") as string || undefined,
    isFavorite: formData.get("isFavorite") === "true",
    tags: (formData.get("tags") as string || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    location: formData.get("location") as string || undefined,
    color: formData.get("color") as string || undefined,
    isRecurring: formData.get("isRecurring") === "true",
    recurrenceType: formData.get("recurrenceType") as string || undefined,
  };

  const parsed = updateEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { id: _, ...updates } = parsed.data;

  await db
    .update(events)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(events.id, id));

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath(`/events/${id}`);
  revalidatePath("/timeline");

  return { success: true };
}

// ── Delete Event ──────────────────────────────────────────────────────────────
export async function deleteEventAction(id: string) {
  const { coupleId } = await getAuthenticatedUser();

  const [existing] = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, id), eq(events.coupleId, coupleId)))
    .limit(1);

  if (!existing) return { error: "Evento não encontrado." };

  await db.delete(events).where(eq(events.id, id));

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");

  return { success: true };
}

// ── Toggle Favorite ───────────────────────────────────────────────────────────
export async function toggleFavoriteAction(id: string, isFavorite: boolean) {
  const { coupleId } = await getAuthenticatedUser();

  await db
    .update(events)
    .set({ isFavorite, updatedAt: new Date() })
    .where(and(eq(events.id, id), eq(events.coupleId, coupleId)));

  revalidatePath("/dashboard");
  revalidatePath(`/events/${id}`);

  return { success: true };
}

// ── Query: Events for month ───────────────────────────────────────────────────
export async function getEventsForMonth(year: number, month: number) {
  const { coupleId } = await getAuthenticatedUser();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.coupleId, coupleId),
        gte(events.eventDate, startDate),
        lte(events.eventDate, endDate)
      )
    )
    .orderBy(asc(events.eventDate));
}

// ── Query: Upcoming events (next 30 days) ─────────────────────────────────────
export async function getUpcomingEvents(limit = 5) {
  const { coupleId } = await getAuthenticatedUser();

  const today = new Date().toISOString().split("T")[0];

  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.coupleId, coupleId),
        gte(events.eventDate, today)
      )
    )
    .orderBy(asc(events.eventDate))
    .limit(limit);
}

// ── Query: Today in history ───────────────────────────────────────────────────
export async function getTodayInHistory() {
  const { coupleId } = await getAuthenticatedUser();

  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Get all events and filter in memory for month-day match (past years)
  const allEvents = await db
    .select()
    .from(events)
    .where(eq(events.coupleId, coupleId))
    .orderBy(desc(events.eventDate));

  const todayStr = today.toISOString().split("T")[0];

  return allEvents.filter((e) => {
    const dateStr = e.eventDate as string;
    return dateStr.substring(5) === monthDay && dateStr !== todayStr;
  });
}

// ── Query: Favorite events ────────────────────────────────────────────────────
export async function getFavoriteEvents(limit = 10) {
  const { coupleId } = await getAuthenticatedUser();

  return db
    .select()
    .from(events)
    .where(and(eq(events.coupleId, coupleId), eq(events.isFavorite, true)))
    .orderBy(desc(events.eventDate))
    .limit(limit);
}

// ── Query: All events (timeline) ──────────────────────────────────────────────
export async function getAllEvents() {
  const { coupleId } = await getAuthenticatedUser();

  return db
    .select()
    .from(events)
    .where(eq(events.coupleId, coupleId))
    .orderBy(desc(events.eventDate));
}

// ── Query: Single event with photos ──────────────────────────────────────────
export async function getEventWithPhotos(id: string) {
  const { coupleId } = await getAuthenticatedUser();

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.coupleId, coupleId)))
    .limit(1);

  if (!event) return null;

  const eventPhotos = await db
    .select()
    .from(photos)
    .where(eq(photos.eventId, id))
    .orderBy(asc(photos.createdAt));

  return { ...event, photos: eventPhotos };
}
