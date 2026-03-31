import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getUpcomingEvents,
  getTodayInHistory,
} from "@/app/actions/events";
import { db } from "@/lib/db";
import { users, couples } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDaysTogether, formatEventDate, categoryColors } from "@/lib/utils";
import Link from "next/link";
import { AppIcon, resolveMoodIconKey } from "@/components/ui/app-icon";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  const [upcomingEvents, todayInHistory] = await Promise.all([
    getUpcomingEvents(4),
    getTodayInHistory(),
  ]);

  const daysTogether = getDaysTogether(couple.startDate as string);

  // Days to 1000 milestone
  const daysToMilestone = 1000 - daysTogether;
  const progressPct = Math.min(100, Math.round((daysTogether / 1000) * 100));

  return (
    <div className="dash2">
      {/* ── Row 1: Journey Together + Heart Note ────────────────────────── */}
      <div className="dash2-row1">
        {/* Journey Together card */}
        <section className="d2-journey-card">
          <p className="d2-journey-label">Our Journey Together</p>
          <div className="d2-journey-counter">
            <span className="d2-counter-num">{daysTogether.toLocaleString("pt-BR")}</span>
            <span className="d2-counter-unit">days</span>
          </div>
          <p className="d2-journey-sub">
            Every second has been a treasure. From our first coffee at the corner shop to our last weekend getaway.
          </p>
          <div className="d2-journey-footer">
            <div className="d2-avatars">
              <div className="d2-avatar d2-avatar-1"><AppIcon name="user" size={14} /></div>
              <div className="d2-avatar d2-avatar-2"><AppIcon name="user" size={14} /></div>
            </div>
            {daysToMilestone > 0 && (
              <div className="d2-milestone-badge">
                Milestone: 1000 days in {daysToMilestone} days
              </div>
            )}
          </div>
          <div className="d2-heart-bg" aria-hidden="true">♥</div>
        </section>

        {/* Heart Note card */}
        <section className="d2-heart-note">
          <div className="d2-hn-header">
            <span className="d2-hn-ic">♥</span>
            <span className="d2-hn-kicker">HEART NOTE</span>
          </div>
          <blockquote className="d2-hn-quote">
            "Just saw the most beautiful sunset and thought of you. Can't wait for our trip next month. I love you to the moon and back! 🧡"
          </blockquote>
          <div className="d2-hn-author">
            — {user.name?.split(" ")[0] ?? "You"}
            <span className="d2-hn-time"> · Posted 2 hours ago</span>
          </div>
        </section>
      </div>

      {/* ── Row 2: Today in History + Upcoming Highlights ───────────────── */}
      <div className="dash2-row2">
        {/* Today in History */}
        <section className="d2-history-card">
          <h2 className="d2-section-title">Today in History</h2>
          {todayInHistory.length === 0 ? (
            <div className="d2-history-empty">
              <div className="d2-history-photo-placeholder" />
              <div className="d2-history-info">
                <div className="d2-history-kicker" style={{ color: "#b0005f" }}>
                  <AppIcon name="history" size={13} /> NENHUMA MEMÓRIA HOJE
                </div>
                <p className="d2-history-subtitle">
                  Que tal criar uma nova memória para este dia?
                </p>
                <Link href="/calendar" className="d2-history-link">
                  Criar memória <AppIcon name="arrow-right" size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="d2-history-item">
              <div className="d2-history-photo-placeholder" />
              <div className="d2-history-info">
                <div className="d2-history-kicker">
                  <AppIcon name="history" size={13} /> {new Date().getFullYear() - new Date(todayInHistory[0].eventDate as string).getFullYear()} YEARS AGO TODAY
                </div>
                <h3 className="d2-history-event-title">{todayInHistory[0].title}</h3>
                <p className="d2-history-subtitle">{todayInHistory[0].description}</p>
                <Link href={`/events/${todayInHistory[0].id}`} className="d2-history-link">
                  View all memories from this day <AppIcon name="arrow-right" size={14} />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Upcoming Highlights */}
        <section className="d2-upcoming-card">
          <div className="d2-upcoming-header">
            <h2 className="d2-section-title">Upcoming Highlights</h2>
            <Link href="/calendar" className="d2-view-cal">View Calendar</Link>
          </div>
          <div className="d2-upcoming-list">
            {upcomingEvents.length === 0 ? (
              <div className="d2-empty-state">
                <p>Nenhum evento próximo.</p>
                <Link href="/calendar" className="d2-cta-btn">+ Adicionar evento</Link>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const daysLeft = Math.max(0, Math.ceil(
                  (new Date(event.eventDate as string).getTime() - Date.now()) / 86400000
                ));
                return (
                  <Link key={event.id} href={`/events/${event.id}`} className="d2-upcoming-item">
                    <div className="d2-ui-left">
                      <div className="d2-ui-kicker" style={{ color: event.color ?? categoryColors[event.category] }}>
                        <AppIcon name={resolveMoodIconKey(event.moodEmoji ?? "")} size={12} />
                        {event.category}
                      </div>
                      <div className="d2-ui-title">{event.title}</div>
                      <div className="d2-ui-meta">
                        {formatEventDate(event.eventDate as string)}
                        {event.eventTime ? ` · ${event.eventTime.substring(0, 5)}` : ""}
                        <span className="d2-ui-days"> · {daysLeft} days left</span>
                      </div>
                    </div>
                    <div className="d2-ui-icon">
                      <AppIcon name="calendar" size={18} style={{ color: event.color ?? categoryColors[event.category] }} />
                    </div>
                  </Link>
                );
              })
            )}
            {/* TOMORROW label */}
            {upcomingEvents.some(e => {
              const d = Math.ceil((new Date(e.eventDate as string).getTime() - Date.now()) / 86400000);
              return d === 1;
            }) && (
              <div className="d2-tomorrow-label">TOMORROW</div>
            )}
          </div>
        </section>
      </div>

      {/* ── Row 3: Journey Progress ──────────────────────────────────────── */}
      <section className="d2-progress-card">
        <div className="d2-progress-header">
          <span className="d2-progress-title">Journey Progress</span>
          <span className="d2-progress-pct">{progressPct}% to next major milestone</span>
        </div>
        <div className="d2-progress-bar-wrap">
          <div className="d2-progress-bar">
            <div className="d2-progress-fill" style={{ width: `${progressPct}%` }}>
              <div className="d2-progress-heart">♥</div>
            </div>
          </div>
          <div className="d2-progress-labels">
            <span>DAY 0</span>
            <span>FIRST 1000 DAYS</span>
            <span>DAY 2000</span>
          </div>
        </div>
      </section>

      <style>{dashStyles}</style>
    </div>
  );
}

const dashStyles = `
  .dash2 { display: flex; flex-direction: column; gap: 20px; }

  /* Row 1 */
  .dash2-row1 {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 20px;
  }
  @media (max-width: 1024px) { .dash2-row1 { grid-template-columns: 1fr; } }

  /* Journey card */
  .d2-journey-card {
    background: white;
    border: 1px solid #e9edf5;
    border-radius: 20px;
    padding: 32px 36px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(15,23,42,0.05);
  }
  .d2-journey-label {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 6px;
  }
  .d2-journey-counter {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 12px;
  }
  .d2-counter-num {
    font-size: clamp(52px, 7vw, 76px);
    font-weight: 900;
    color: #db2777;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .d2-counter-unit {
    font-size: 22px;
    font-weight: 700;
    color: #374151;
  }
  .d2-journey-sub {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 0 20px;
  }
  .d2-journey-footer {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .d2-avatars { display: flex; }
  .d2-avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 2px solid white;
    background: rgba(219,39,119,0.12);
    color: #b0005f;
    display: flex; align-items: center; justify-content: center;
  }
  .d2-avatar-2 { margin-left: -10px; }
  .d2-milestone-badge {
    display: inline-flex;
    padding: 6px 14px;
    background: rgba(219,39,119,0.1);
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    color: #b0005f;
  }
  .d2-heart-bg {
    position: absolute;
    right: 32px; top: 50%;
    transform: translateY(-50%);
    font-size: 100px;
    color: rgba(219,39,119,0.07);
    pointer-events: none;
  }

  /* Heart note card */
  .d2-heart-note {
    background: linear-gradient(145deg, #db2777 0%, #b0005f 100%);
    border-radius: 20px;
    padding: 28px 26px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 12px 40px rgba(176,0,95,0.22);
  }
  .d2-hn-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .d2-hn-ic {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    color: white;
    font-size: 14px;
  }
  .d2-hn-kicker {
    font-size: 11px;
    letter-spacing: 0.14em;
    font-weight: 800;
    color: rgba(255,255,255,0.75);
  }
  .d2-hn-quote {
    font-size: 15px;
    line-height: 1.65;
    color: white;
    margin: 0;
    font-style: normal;
    flex: 1;
  }
  .d2-hn-author {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
  }
  .d2-hn-time {
    font-weight: 400;
    opacity: 0.7;
  }

  /* Row 2 */
  .dash2-row2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 900px) { .dash2-row2 { grid-template-columns: 1fr; } }

  .d2-section-title {
    font-size: 17px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 16px;
    letter-spacing: -0.01em;
  }

  /* History card */
  .d2-history-card {
    background: white;
    border: 1px solid #e9edf5;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(15,23,42,0.04);
  }
  .d2-history-item, .d2-history-empty {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .d2-history-photo-placeholder {
    width: 100%;
    height: 180px;
    border-radius: 14px;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    overflow: hidden;
    background-image: radial-gradient(circle at 30% 50%, rgba(176,0,95,0.08) 0%, transparent 60%);
  }
  .d2-history-info { display: flex; flex-direction: column; gap: 6px; }
  .d2-history-kicker {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    color: #b0005f;
  }
  .d2-history-event-title {
    font-size: 17px; font-weight: 800; color: #111827; margin: 0;
    letter-spacing: -0.01em;
  }
  .d2-history-subtitle {
    font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5;
  }
  .d2-history-link {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 13px; font-weight: 700; color: #b0005f;
    text-decoration: none; margin-top: 6px;
  }
  .d2-history-link:hover { text-decoration: underline; }

  /* Upcoming card */
  .d2-upcoming-card {
    background: white;
    border: 1px solid #e9edf5;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(15,23,42,0.04);
  }
  .d2-upcoming-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .d2-upcoming-header .d2-section-title { margin: 0; }
  .d2-view-cal { font-size: 12px; font-weight: 700; color: #b0005f; text-decoration: none; }
  .d2-view-cal:hover { text-decoration: underline; }
  .d2-upcoming-list { display: flex; flex-direction: column; gap: 10px; }
  .d2-upcoming-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px;
    background: #f8faff;
    border-radius: 14px;
    border: 1px solid #eef1f8;
    text-decoration: none;
    color: inherit;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .d2-upcoming-item:hover { box-shadow: 0 4px 16px rgba(176,0,95,0.1); transform: translateY(-1px); }
  .d2-ui-kicker {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  .d2-ui-title { font-size: 14px; font-weight: 800; color: #111827; }
  .d2-ui-meta { font-size: 12px; color: #9ca3af; margin-top: 2px; }
  .d2-ui-days { color: #b0005f; font-weight: 600; }
  .d2-ui-icon { flex-shrink: 0; opacity: 0.6; }
  .d2-tomorrow-label {
    font-size: 22px; font-weight: 900; letter-spacing: 0.12em;
    color: rgba(148,163,184,0.35);
    text-align: right;
    padding: 6px 0;
  }
  .d2-empty-state { display: flex; flex-direction: column; gap: 10px; }
  .d2-empty-state p { color: #9ca3af; font-size: 14px; }
  .d2-cta-btn {
    display: inline-flex; padding: 8px 16px;
    background: #db2777; color: white;
    border-radius: 999px; font-size: 13px; font-weight: 700;
    text-decoration: none;
  }

  /* Progress card */
  .d2-progress-card {
    background: white;
    border: 1px solid #e9edf5;
    border-radius: 20px;
    padding: 24px 28px;
    box-shadow: 0 2px 12px rgba(15,23,42,0.04);
  }
  .d2-progress-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .d2-progress-title { font-size: 16px; font-weight: 800; color: #111827; }
  .d2-progress-pct { font-size: 12px; color: #6b7280; }
  .d2-progress-bar-wrap { display: flex; flex-direction: column; gap: 10px; }
  .d2-progress-bar {
    height: 12px;
    background: #e9edf5;
    border-radius: 999px;
    overflow: visible;
    position: relative;
  }
  .d2-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #b0005f, #db2777, #f472b6);
    border-radius: 999px;
    position: relative;
    transition: width 0.8s cubic-bezier(.22,.8,.28,1);
  }
  .d2-progress-heart {
    position: absolute;
    right: -12px; top: 50%;
    transform: translateY(-50%);
    width: 24px; height: 24px;
    background: white;
    border: 2px solid #db2777;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #db2777;
  }
  .d2-progress-labels {
    display: flex; justify-content: space-between;
    font-size: 11px; font-weight: 600; color: #9ca3af;
  }
`;
