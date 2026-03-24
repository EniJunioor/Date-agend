import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/CalendarView";
import { getEventsForMonth } from "@/app/actions/events";

export const metadata: Metadata = { title: "Calendário" };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string; view?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const now = new Date();
  const year = parseInt(searchParams.year ?? String(now.getFullYear()));
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1));

  const events = await getEventsForMonth(year, month);

  return (
    <CalendarView
      initialEvents={events}
      year={year}
      month={month}
      view={(searchParams.view as "monthly" | "weekly" | "agenda") ?? "monthly"}
    />
  );
}
