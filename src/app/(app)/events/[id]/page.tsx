import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getEventWithPhotos } from "@/app/actions/events";
import { EventDetailClient } from "@/components/calendar/EventDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return { title: "Detalhe do Evento" };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const { id } = await params;
  const event = await getEventWithPhotos(id);
  if (!event) notFound();

  const normalizedEvent = {
    ...event,
    isFavorite: !!event.isFavorite,
    isRecurring: !!event.isRecurring,
    photos: event.photos?.map((p) => ({ ...p, isFavorite: !!p.isFavorite })) ?? [],
  };

  return (
    <EventDetailClient
      event={normalizedEvent}
      userId={session.user.id}
    />
  );
}
