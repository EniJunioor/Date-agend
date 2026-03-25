import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, users, couples, notifications, cronLogs } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendEventReminderEmail } from "@/lib/utils/email";
import { sendPushToUser } from "@/lib/utils/push";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  let processed = 0;
  let errors = 0;

  try {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const todayStr = format(today, "yyyy-MM-dd");
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

    // Get events happening today or tomorrow with email notifications enabled
    const upcomingEvents = await db
      .select({
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.eventDate,
        coupleId: events.coupleId,
      })
      .from(events)
      .where(
        and(
          gte(events.eventDate, todayStr),
          lte(events.eventDate, tomorrowStr)
        )
      );

    for (const event of upcomingEvents) {
      try {
        // Get couple members
        const members = await db
          .select({ id: users.id, name: users.name, email: users.email })
          .from(users)
          .where(eq(users.coupleId, event.coupleId));

        const daysAhead =
          event.eventDate === todayStr ? 0 : 1;

        const formattedDate = format(
          new Date(event.eventDate as string + "T00:00:00"),
          "dd 'de' MMMM",
          { locale: ptBR }
        );

        for (const member of members) {
          try {
            await sendEventReminderEmail(
              member.email,
              member.name,
              event.eventTitle,
              formattedDate,
              daysAhead
            );

            await sendPushToUser(member.id, {
              title: "Lembrete ❤️",
              body:
                daysAhead === 0
                  ? `Você tem um evento hoje: ${event.eventTitle}`
                  : `Você tem um evento amanhã: ${event.eventTitle}`,
              url: "/calendar",
              tag: "reminder",
            });

            // Log notification
            await db.insert(notifications).values({
              userId: member.id,
              eventId: event.eventId,
              type: daysAhead === 0 ? "evento_hoje" : "evento_amanha",
              title: `${event.eventTitle} é ${daysAhead === 0 ? "hoje" : "amanhã"}`,
              body: `Não esqueça: ${event.eventTitle} em ${formattedDate}`,
              emailSent: true,
              pushSent: true,
              sentAt: new Date(),
            });

            processed++;
          } catch (err) {
            console.error(`Failed to notify user ${member.id}:`, err);
            errors++;
          }
        }
      } catch (err) {
        console.error(`Failed to process event ${event.eventId}:`, err);
        errors++;
      }
    }

    // Log cron execution
    await db.insert(cronLogs).values({
      jobName: "event-reminders",
      status: errors === 0 ? "success" : "partial",
      message: `Processed ${processed} notifications, ${errors} errors`,
      processedCount: processed,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      success: true,
      processed,
      errors,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    await db.insert(cronLogs).values({
      jobName: "event-reminders",
      status: "error",
      message: errorMessage,
      processedCount: processed,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
