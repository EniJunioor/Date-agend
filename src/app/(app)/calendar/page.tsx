import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/CalendarView";
import { getEventsForMonth, getUpcomingEvents } from "@/app/actions/events";
import { db } from "@/lib/db";
import { users, couples } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDaysTogether, formatEventDate, categoryColors } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata: Metadata = { title: "Calendário" };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; view?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()));
  const month = parseInt(params.month ?? String(now.getMonth() + 1));

  const [events, upcomingEvents] = await Promise.all([
    getEventsForMonth(year, month),
    getUpcomingEvents(4),
  ]);

  const [user] = await db
    .select({ coupleId: users.coupleId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const [couple] = await db
    .select({ startDate: couples.startDate })
    .from(couples)
    .where(eq(couples.id, user!.coupleId!))
    .limit(1);

  const daysTogether = getDaysTogether(couple.startDate as string);
  const sinceYear = new Date(couple.startDate as string).getFullYear();

  return (
    <div className="cal-page-layout">
      {/* Main calendar */}
      <div className="cal-page-main">
        <CalendarView
          initialEvents={events}
          year={year}
          month={month}
          view={(params.view as "monthly" | "weekly" | "agenda") ?? "monthly"}
        />
      </div>

      {/* Right sidebar */}
      <aside className="cal-page-sidebar">
        {/* Nossa História */}
        <div className="cps-card cps-historia">
          <div className="cps-historia-kicker">NOSSA HISTÓRIA</div>
          <div className="cps-historia-num">{daysTogether.toLocaleString("pt-BR")} <span>dias</span></div>
          <p className="cps-historia-sub">Crescendo juntos desde {sinceYear}</p>
          <div className="cps-historia-avatars">
            <div className="cps-av cps-av-1">❤️</div>
            <div className="cps-av cps-av-2">❤️</div>
          </div>
        </div>

        {/* Próximas Datas */}
        <div className="cps-card">
          <h3 className="cps-card-title">📅 Próximas Datas</h3>
          {upcomingEvents.length === 0 ? (
            <p className="cps-empty">Nenhum evento próximo.</p>
          ) : (
            <div className="cps-dates-list">
              {upcomingEvents.map((ev) => {
                const evDate = new Date(ev.eventDate as string);
                return (
                  <Link key={ev.id} href={`/events/${ev.id}`} className="cps-date-item">
                    <div className="cps-date-badge">
                      <div className="cps-date-month">
                        {format(evDate, "MMM", { locale: ptBR }).toUpperCase()}
                      </div>
                      <div className="cps-date-day">{format(evDate, "dd")}</div>
                    </div>
                    <div className="cps-date-info">
                      <div className="cps-date-title">{ev.title}</div>
                      <div className="cps-date-meta">
                        <span
                          className="cps-date-dot"
                          style={{ background: ev.color ?? categoryColors[ev.category] }}
                        />
                        {ev.category}
                        {ev.eventTime ? ` · ${ev.eventTime.substring(0, 5)}` : ""}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Ideia de Date */}
        <div className="cps-card cps-idea">
          <div className="cps-idea-ic">💡</div>
          <div className="cps-idea-kicker">IDEIA DE DATE</div>
          <p className="cps-idea-text">Piquenique no Pôr do Sol no próximo sábado?</p>
        </div>

        {/* Add moment button */}
        <Link href="/calendar" className="cps-add-btn">
          + Adicionar Momento
        </Link>
      </aside>

      <style>{sidebarStyles}</style>
    </div>
  );
}

const sidebarStyles = `
  .cal-page-layout {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 1024px) {
    .cal-page-layout { grid-template-columns: 1fr; }
    .cal-page-sidebar { display: none; }
  }

  .cal-page-sidebar { display: flex; flex-direction: column; gap: 14px; }

  /* Cards */
  .cps-card {
    background: white;
    border: 1px solid #e9edf5;
    border-radius: 18px;
    padding: 18px 16px;
    box-shadow: 0 2px 10px rgba(15,23,42,0.04);
  }
  .cps-card-title {
    font-size: 13px; font-weight: 800; color: #111827;
    margin: 0 0 12px;
  }

  /* Nossa História */
  .cps-historia {
    background: linear-gradient(145deg, #db2777, #b0005f);
    border: none;
    color: white;
  }
  .cps-historia-kicker {
    font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
    opacity: 0.75; margin-bottom: 6px;
  }
  .cps-historia-num {
    font-size: 38px; font-weight: 900; line-height: 1;
    color: white; letter-spacing: -0.03em;
    margin-bottom: 4px;
  }
  .cps-historia-num span { font-size: 16px; font-weight: 600; opacity: 0.85; }
  .cps-historia-sub { font-size: 12px; opacity: 0.75; margin: 0 0 14px; }
  .cps-historia-avatars { display: flex; gap: 6px; }
  .cps-av {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  /* Dates list */
  .cps-dates-list { display: flex; flex-direction: column; gap: 10px; }
  .cps-date-item {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; color: inherit;
    padding: 8px; border-radius: 10px;
    transition: background 0.15s;
  }
  .cps-date-item:hover { background: #f8faff; }
  .cps-date-badge {
    width: 40px; flex-shrink: 0;
    text-align: center;
    background: #f8faff;
    border-radius: 8px;
    padding: 4px 6px;
  }
  .cps-date-month { font-size: 10px; font-weight: 700; color: #b0005f; }
  .cps-date-day { font-size: 17px; font-weight: 900; color: #111827; line-height: 1.1; }
  .cps-date-info { flex: 1; min-width: 0; }
  .cps-date-title { font-size: 13px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cps-date-meta { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .cps-date-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .cps-empty { font-size: 13px; color: #9ca3af; }

  /* Ideia */
  .cps-idea { background: #fdf2f8; border-color: #fbcfe8; }
  .cps-idea-ic { font-size: 20px; margin-bottom: 4px; }
  .cps-idea-kicker { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; color: #b0005f; margin-bottom: 4px; }
  .cps-idea-text { font-size: 13px; color: #374151; margin: 0; line-height: 1.5; }

  /* Add button */
  .cps-add-btn {
    display: flex; align-items: center; justify-content: center;
    height: 48px; border-radius: 999px;
    background: linear-gradient(90deg, #b0005f, #db2777);
    color: white; font-weight: 800; font-size: 14px;
    text-decoration: none;
    box-shadow: 0 8px 24px rgba(176,0,95,0.22);
    transition: filter 0.2s, transform 0.2s;
  }
  .cps-add-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
`;
