import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getEventWithPhotos } from "@/app/actions/events";
import { formatEventDate, categoryColors, categoryLabels } from "@/lib/utils";
import { EventDetailClient } from "@/components/calendar/EventDetailClient";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return { title: "Detalhe do Evento" };
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const event = await getEventWithPhotos(params.id);
  if (!event) notFound();

  return (
    <EventDetailClient
      event={event}
      userId={session.user.id}
    />
  );
}
