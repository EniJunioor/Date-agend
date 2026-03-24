import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getUpcomingEvents,
  getTodayInHistory,
  getFavoriteEvents,
} from "@/app/actions/events";
import { db } from "@/lib/db";
import { users, couples } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDaysTogether, formatEventDate, categoryColors } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Início" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db
    .select({ name: users.name, coupleId: users.coupleId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.coupleId) {
    redirect("/invite");
  }

  const [couple] = await db
    .select()
    .from(couples)
    .where(eq(couples.id, user.coupleId))
    .limit(1);

  const [upcomingEvents, todayInHistory, favoriteEvents] = await Promise.all([
    getUpcomingEvents(5),
    getTodayInHistory(),
    getFavoriteEvents(6),
  ]);

  const daysTogether = getDaysTogether(couple.startDate as string);

  return (
    <div className="dashboard">
      {/* ── Days Together Hero ──────────────────────────────────────────── */}
      <section className="days-hero">
        <div className="days-hero-bg" />
        <div className="days-hero-content">
          <div className="days-counter">
            <div className="days-number">{daysTogether.toLocaleString("pt-BR")}</div>
            <div className="days-label">dias juntos ❤️</div>
          </div>
          <div className="days-sub">
            Desde {formatEventDate(couple.startDate as string)}
          </div>
        </div>
        <div className="days-hero-emoji">💑</div>
      </section>

      <div className="dashboard-grid">
        {/* ── Today in History ──────────────────────────────────────────── */}
        <section className="dash-card">
          <h2 className="dash-card-title">
            <span>🕰️</span> Hoje na história
          </h2>
          {todayInHistory.length === 0 ? (
            <p className="dash-empty">Nenhuma memória especial nesta data... ainda! 😊</p>
          ) : (
            <div className="event-list">
              {todayInHistory.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="event-item">
                  <div
                    className="event-dot"
                    style={{ background: event.color ?? categoryColors[event.category] }}
                  />
                  <div>
                    <div className="event-title">{event.title}</div>
                    <div className="event-date">
                      {new Date(event.eventDate as string).getFullYear()} ·{" "}
                      {event.category}
                    </div>
                  </div>
                  {event.moodEmoji && (
                    <span className="event-mood">{event.moodEmoji}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Upcoming Events ───────────────────────────────────────────── */}
        <section className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              <span>📅</span> Próximos eventos
            </h2>
            <Link href="/calendar" className="dash-card-link">Ver calendário →</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="dash-empty-cta">
              <p className="dash-empty">Nenhum evento próximo.</p>
              <Link href="/calendar" className="btn-create">+ Criar evento</Link>
            </div>
          ) : (
            <div className="event-list">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="event-item">
                  <div
                    className="event-dot"
                    style={{ background: event.color ?? categoryColors[event.category] }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="event-title">{event.title}</div>
                    <div className="event-date">
                      {formatEventDate(event.eventDate as string)}
                      {event.eventTime ? ` · ${event.eventTime.substring(0, 5)}` : ""}
                    </div>
                  </div>
                  {event.isFavorite && <span title="Favorito">⭐</span>}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Favorites ─────────────────────────────────────────────────── */}
        <section className="dash-card dash-card-wide">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              <span>⭐</span> Favoritos
            </h2>
            <Link href="/timeline" className="dash-card-link">Ver linha do tempo →</Link>
          </div>
          {favoriteEvents.length === 0 ? (
            <p className="dash-empty">
              Marque eventos como favoritos para vê-los aqui.
            </p>
          ) : (
            <div className="favorites-grid">
              {favoriteEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="fav-card">
                  <div
                    className="fav-card-stripe"
                    style={{ background: event.color ?? categoryColors[event.category] }}
                  />
                  <div className="fav-card-body">
                    {event.moodEmoji && (
                      <span className="fav-emoji">{event.moodEmoji}</span>
                    )}
                    <div className="fav-title">{event.title}</div>
                    <div className="fav-date">
                      {formatEventDate(event.eventDate as string)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{dashboardStyles}</style>
    </div>
  );
}

const dashboardStyles = `
  .dashboard { display: flex; flex-direction: column; gap: 24px; }

  /* Days hero */
  .days-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary), var(--primary-light));
    border-radius: var(--radius-xl);
    padding: 40px 36px;
    display: flex; align-items: center; gap: 24px;
    color: white;
  }
  .days-hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 60%);
  }
  .days-hero-content { position: relative; z-index: 1; flex: 1; }
  .days-counter { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
  .days-number {
    font-family: var(--font-display);
    font-size: clamp(52px, 8vw, 80px);
    font-weight: 900; line-height: 1;
    text-shadow: 0 2px 20px rgba(0,0,0,0.15);
  }
  .days-label { font-size: 18px; font-weight: 600; opacity: 0.9; }
  .days-sub { font-size: 14px; opacity: 0.7; }
  .days-hero-emoji { font-size: 80px; opacity: 0.3; position: absolute; right: 36px; top: 50%; transform: translateY(-50%); }

  /* Grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } }

  /* Cards */
  .dash-card {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px;
  }
  .dash-card-wide { grid-column: 1 / -1; }
  .dash-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .dash-card-title {
    font-size: 15px; font-weight: 700; color: var(--foreground);
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 16px;
  }
  .dash-card-header .dash-card-title { margin-bottom: 0; }
  .dash-card-link { font-size: 12px; color: var(--primary); text-decoration: none; font-weight: 600; }
  .dash-card-link:hover { text-decoration: underline; }

  .dash-empty { font-size: 14px; color: var(--foreground-muted); }
  .dash-empty-cta { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
  .btn-create {
    display: inline-flex; padding: 8px 16px;
    background: var(--primary); color: white;
    border-radius: var(--radius-md); font-size: 13px; font-weight: 600;
    text-decoration: none; transition: all 0.2s;
  }
  .btn-create:hover { filter: brightness(1.08); }

  /* Event list */
  .event-list { display: flex; flex-direction: column; gap: 8px; }
  .event-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: var(--radius-md);
    text-decoration: none; color: inherit;
    border: 1px solid transparent;
    transition: all 0.15s;
  }
  .event-item:hover { background: var(--primary-surface); border-color: var(--primary-surface-strong); }
  .event-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .event-title { font-size: 14px; font-weight: 600; color: var(--foreground); }
  .event-date { font-size: 12px; color: var(--foreground-muted); margin-top: 1px; }
  .event-mood { font-size: 16px; flex-shrink: 0; }

  /* Favorites grid */
  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .fav-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden; text-decoration: none; color: inherit;
    transition: all 0.2s;
    display: flex; flex-direction: column;
  }
  .fav-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .fav-card-stripe { height: 5px; }
  .fav-card-body { padding: 14px; }
  .fav-emoji { font-size: 20px; display: block; margin-bottom: 6px; }
  .fav-title { font-size: 13px; font-weight: 700; color: var(--foreground); margin-bottom: 4px; line-height: 1.3; }
  .fav-date { font-size: 11px; color: var(--foreground-muted); }
`;
