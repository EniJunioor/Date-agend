import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllEvents } from "@/app/actions/events";
import { db } from "@/lib/db";
import { users, couples } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDaysTogether, formatEventDate, categoryColors, categoryLabels } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Linha do Tempo" };

export default async function TimelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const [user] = await db
    .select({ coupleId: users.coupleId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const [couple] = await db
    .select({ startDate: couples.startDate, theme: couples.theme })
    .from(couples)
    .where(eq(couples.id, user!.coupleId!))
    .limit(1);

  const events = await getAllEvents();
  const daysTogether = getDaysTogether(couple.startDate as string);

  // Group events by year
  const byYear = events.reduce<Record<string, typeof events>>((acc, event) => {
    const year = (event.eventDate as string).split("-")[0];
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="timeline-page">
      {/* ── Counter hero ────────────────────────────────────────────────── */}
      <div className="timeline-hero">
        <div className="tl-hero-bg" />
        <div className="tl-hero-content">
          <p className="tl-hero-label">Nossa história</p>
          <div className="tl-hero-counter">
            <span className="tl-counter-num">{daysTogether.toLocaleString("pt-BR")}</span>
            <span className="tl-counter-unit">dias</span>
          </div>
          <p className="tl-hero-sub">
            Desde {formatEventDate(couple.startDate as string)} ·{" "}
            {events.length} {events.length === 1 ? "memória" : "memórias"} registradas
          </p>
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      {events.length === 0 ? (
        <div className="tl-empty">
          <div className="tl-empty-icon">📖</div>
          <h3>Sua história começa aqui</h3>
          <p>Crie o primeiro evento para ver a linha do tempo do relacionamento.</p>
          <Link href="/calendar" className="btn-primary">+ Criar primeiro evento</Link>
        </div>
      ) : (
        <div className="timeline">
          <div className="timeline-line" />

          {years.map((year) => (
            <div key={year} className="tl-year-group">
              <div className="tl-year-badge">{year}</div>

              {byYear[year].map((event, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <div
                    key={event.id}
                    className={`tl-item ${isLeft ? "tl-item-left" : "tl-item-right"}`}
                  >
                    <Link href={`/events/${event.id}`} className="tl-card">
                      <div
                        className="tl-card-accent"
                        style={{
                          background: event.color ?? categoryColors[event.category],
                        }}
                      />
                      <div className="tl-card-body">
                        <div className="tl-card-meta">
                          <span
                            className="tl-category"
                            style={{ color: event.color ?? categoryColors[event.category] }}
                          >
                            {categoryLabels[event.category]}
                          </span>
                          {event.isFavorite && <span title="Favorito">⭐</span>}
                        </div>
                        <h3 className="tl-card-title">
                          {event.moodEmoji && <span>{event.moodEmoji} </span>}
                          {event.title}
                        </h3>
                        <p className="tl-card-date">
                          {formatEventDate(event.eventDate as string)}
                        </p>
                        {event.description && (
                          <p className="tl-card-desc">{event.description}</p>
                        )}
                        {(event.tags as string[] | null)?.length ? (
                          <div className="tl-tags">
                            {(event.tags as string[]).map((tag) => (
                              <span key={tag} className="tl-tag">#{tag}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </Link>

                    {/* Timeline dot */}
                    <div
                      className="tl-dot"
                      style={{
                        background: event.color ?? categoryColors[event.category],
                      }}
                    >
                      {event.moodEmoji ? (
                        <span className="tl-dot-emoji">{event.moodEmoji}</span>
                      ) : (
                        <span className="tl-dot-icon">❤️</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Start of story */}
          <div className="tl-start">
            <div className="tl-start-dot">💑</div>
            <p className="tl-start-label">
              Início do relacionamento<br />
              <strong>{formatEventDate(couple.startDate as string)}</strong>
            </p>
          </div>
        </div>
      )}

      <style>{timelineStyles}</style>
    </div>
  );
}

const timelineStyles = `
  .timeline-page { display: flex; flex-direction: column; gap: 28px; }

  /* Hero */
  .timeline-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #1a0533, var(--primary-dark), var(--primary));
    border-radius: var(--radius-xl); padding: 48px 36px;
    color: white; text-align: center;
  }
  .tl-hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(244,114,182,0.2) 0%, transparent 70%);
  }
  .tl-hero-content { position: relative; z-index: 1; }
  .tl-hero-label { font-size: 14px; font-weight: 600; opacity: 0.7; margin-bottom: 8px; letter-spacing: 1px; text-transform: uppercase; }
  .tl-hero-counter { display: flex; align-items: baseline; gap: 12px; justify-content: center; margin-bottom: 10px; }
  .tl-counter-num {
    font-family: var(--font-display);
    font-size: clamp(60px, 10vw, 100px);
    font-weight: 900; line-height: 1;
  }
  .tl-counter-unit { font-size: 28px; font-weight: 600; opacity: 0.7; }
  .tl-hero-sub { font-size: 14px; opacity: 0.65; }

  /* Empty */
  .tl-empty {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 60px 40px;
    text-align: center; display: flex; flex-direction: column;
    align-items: center; gap: 12px;
  }
  .tl-empty-icon { font-size: 52px; margin-bottom: 4px; }
  .tl-empty h3 { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--foreground); }
  .tl-empty p { font-size: 14px; color: var(--foreground-muted); max-width: 340px; line-height: 1.6; }
  .btn-primary {
    display: inline-flex; padding: 11px 22px;
    background: var(--primary); color: white;
    border-radius: var(--radius-md); font-size: 14px; font-weight: 700;
    text-decoration: none; margin-top: 4px;
    box-shadow: var(--shadow-primary); transition: all 0.2s;
  }
  .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }

  /* Timeline */
  .timeline {
    position: relative;
    display: flex; flex-direction: column; gap: 0;
    padding-bottom: 40px;
  }
  .timeline-line {
    position: absolute; left: 50%; top: 0; bottom: 0;
    width: 2px; background: linear-gradient(to bottom, var(--primary), var(--primary-light), transparent);
    transform: translateX(-50%);
  }
  @media (max-width: 768px) {
    .timeline-line { left: 24px; }
  }

  /* Year group */
  .tl-year-group { display: flex; flex-direction: column; gap: 0; }
  .tl-year-badge {
    position: relative; z-index: 2;
    align-self: center; margin: 24px 0 8px;
    background: var(--primary); color: white;
    padding: 6px 20px; border-radius: var(--radius-full);
    font-family: var(--font-display); font-size: 16px; font-weight: 800;
    box-shadow: var(--shadow-primary);
  }

  /* Timeline item */
  .tl-item {
    position: relative;
    display: flex; align-items: flex-start;
    padding: 16px 0;
  }
  .tl-item-left { flex-direction: row; padding-right: calc(50% + 32px); }
  .tl-item-right { flex-direction: row-reverse; padding-left: calc(50% + 32px); }

  @media (max-width: 768px) {
    .tl-item { flex-direction: row !important; padding: 12px 0 12px 60px !important; }
  }

  /* Card */
  .tl-card {
    flex: 1;
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden;
    text-decoration: none; color: inherit;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s; display: flex;
  }
  .tl-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .tl-card-accent { width: 4px; flex-shrink: 0; }
  .tl-card-body { padding: 16px; flex: 1; }
  .tl-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .tl-category { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .tl-card-title {
    font-family: var(--font-display);
    font-size: 16px; font-weight: 700; color: var(--foreground); margin-bottom: 4px;
  }
  .tl-card-date { font-size: 12px; color: var(--foreground-muted); margin-bottom: 8px; }
  .tl-card-desc { font-size: 13px; color: var(--foreground-muted); line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .tl-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tl-tag { background: var(--primary-surface); color: var(--primary); padding: 2px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600; }

  /* Dot */
  .tl-dot {
    position: absolute; left: 50%; transform: translateX(-50%);
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 3px solid var(--background); box-shadow: var(--shadow-md);
    z-index: 2; flex-shrink: 0;
  }
  @media (max-width: 768px) {
    .tl-dot { left: 24px; }
  }
  .tl-dot-emoji { font-size: 16px; }
  .tl-dot-icon { font-size: 14px; }

  /* Start of story */
  .tl-start {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    position: relative; z-index: 2; margin-top: 24px;
  }
  .tl-start-dot {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; box-shadow: var(--shadow-primary);
  }
  .tl-start-label { text-align: center; font-size: 13px; color: var(--foreground-muted); line-height: 1.5; }
  .tl-start-label strong { color: var(--foreground); }
`;
