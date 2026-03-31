import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { coupleAchievements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";

export const metadata: Metadata = { title: "Conquistas" };

const ACHIEVEMENTS_CATALOG: {
  slug: string;
  name: string;
  desc: string;
  icon: AppIconName;
  criteria: string;
}[] = [
  { slug: "first-event", name: "Primeira Memória", desc: "Criou o primeiro evento do casal", icon: "book-open", criteria: "events >= 1" },
  { slug: "photo-lover", name: "Álbum de Memórias", desc: "Adicionou 10 fotos à galeria", icon: "camera", criteria: "photos >= 10" },
  { slug: "one-month", name: "Um Mês Juntos", desc: "Completaram 30 dias de relacionamento", icon: "moon", criteria: "days >= 30" },
  { slug: "six-months", name: "Seis Meses", desc: "Completaram 6 meses de relacionamento", icon: "sparkles", criteria: "days >= 180" },
  { slug: "one-year", name: "Um Ano de Amor", desc: "Completaram 1 ano juntos", icon: "cake", criteria: "days >= 365" },
  { slug: "two-years", name: "Dois Anos", desc: "Completaram 2 anos de relacionamento", icon: "users", criteria: "days >= 730" },
  { slug: "five-events", name: "Colecionadores", desc: "Criaram 5 eventos especiais", icon: "star", criteria: "events >= 5" },
  { slug: "twenty-events", name: "Historiadores", desc: "Criaram 20 memórias", icon: "book", criteria: "events >= 20" },
  { slug: "first-trip", name: "Viajantes", desc: "Registraram a primeira viagem juntos", icon: "plane", criteria: "category:viagem >= 1" },
  { slug: "daily-message", name: "Recadinho do Dia", desc: "Enviaram 7 recadinhos diários", icon: "mail", criteria: "messages >= 7" },
  { slug: "favorites-lover", name: "Momentos Especiais", desc: "Marcaram 5 eventos como favoritos", icon: "star", criteria: "favorites >= 5" },
  { slug: "time-capsule", name: "Cápsula do Tempo", desc: "Criaram sua primeira cápsula", icon: "hourglass", criteria: "capsules >= 1" },
];

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const coupleId = session.user.coupleId;

  await db
    .select({ achievementId: coupleAchievements.achievementId, unlockedAt: coupleAchievements.unlockedAt })
    .from(coupleAchievements)
    .where(eq(coupleAchievements.coupleId, coupleId));

  const unlockedCount = 3;
  const totalCount = ACHIEVEMENTS_CATALOG.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  const badgeColors = [
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#3b82f6,#2563eb)",
    "linear-gradient(135deg,#ec4899,#db2777)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f97316,#ea580c)",
    "linear-gradient(135deg,#06b6d4,#0891b2)",
    "linear-gradient(135deg,#84cc16,#65a30d)",
    "linear-gradient(135deg,#f43f5e,#e11d48)",
    "linear-gradient(135deg,#22c55e,#16a34a)",
    "linear-gradient(135deg,#a78bfa,#7c3aed)",
    "linear-gradient(135deg,#fb923c,#f97316)",
  ];

  return (
    <div className="milestones-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="ms-header">
        <div className="ms-header-left">
          <h1 className="ms-title">Our Milestones</h1>
          <p className="ms-sub">Celebrating every small victory together.</p>
        </div>
      </div>

      {/* ── Top row: Featured + Archive Stats ───────────────────────────── */}
      <div className="ms-top-row">
        {/* Featured badge */}
        <div className="ms-featured-card">
          <div className="ms-featured-kicker">UPCOMING GLORY</div>
          <div className="ms-featured-body">
            <div className="ms-featured-badge-circle">
              <AppIcon name="sparkles" size={32} color="white" />
            </div>
            <div>
              <h3 className="ms-featured-name">1 Year Together</h3>
              <p className="ms-featured-desc">
                Almost at the golden mark: 285 days of laughter, 12 trips, and countless shared coffees.
              </p>
            </div>
          </div>
          <div className="ms-featured-progress">
            <div className="ms-fp-label">Progress <span>{percentage}% Complete</span></div>
            <div className="ms-fp-bar">
              <div className="ms-fp-fill" style={{ width: `${percentage}%` }} />
            </div>
            <div className="ms-fp-days">80 days until Jun 14, 2024</div>
          </div>
        </div>

        {/* Archive Stats */}
        <div className="ms-stats-card">
          <h3 className="ms-stats-title">Archive Stats</h3>
          <div className="ms-stats-list">
            <div className="ms-stat">
              <span className="ms-stat-label">Memories Logged</span>
              <span className="ms-stat-val">412</span>
            </div>
            <div className="ms-stat">
              <span className="ms-stat-label">Active Badges</span>
              <span className="ms-stat-val">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="ms-stat">
              <span className="ms-stat-label">Global Rank</span>
              <span className="ms-stat-val ms-stat-pink">Top 5%</span>
            </div>
          </div>
          <div className="ms-stats-recent">
            <div className="ms-stats-recent-title">Recent Unlocked</div>
            <div className="ms-stats-badges">
              {ACHIEVEMENTS_CATALOG.slice(0, 3).map((ach, i) => (
                <div key={ach.slug} className="ms-mini-badge" style={{ background: badgeColors[i] }}>
                  <AppIcon name={ach.icon} size={14} color="white" />
                </div>
              ))}
            </div>
            <p className="ms-stats-streak">You're on a 5-badge streak this month</p>
          </div>
        </div>
      </div>

      {/* ── The Collection ───────────────────────────────────────────────── */}
      <div className="ms-collection">
        <div className="ms-coll-header">
          <div>
            <h2 className="ms-coll-title">The Collection</h2>
            <p className="ms-coll-sub">Every badge tells a chapter of our story.</p>
          </div>
          <div className="ms-coll-tabs">
            <span className="ms-tab ms-tab-active">All</span>
            <span className="ms-tab">Unlocked</span>
            <span className="ms-tab">Locked</span>
          </div>
        </div>

        <div className="ms-badge-grid">
          {ACHIEVEMENTS_CATALOG.map((ach, idx) => {
            const isUnlocked = idx < unlockedCount;
            return (
              <div key={ach.slug} className={`ms-badge-card ${isUnlocked ? "ms-badge-unlocked" : "ms-badge-locked"}`}>
                <div
                  className="ms-badge-circle"
                  style={{ background: isUnlocked ? badgeColors[idx % badgeColors.length] : undefined }}
                >
                  {isUnlocked ? (
                    <AppIcon name={ach.icon} size={28} color="white" />
                  ) : (
                    <AppIcon name="lock" size={20} />
                  )}
                </div>
                <div className="ms-badge-name">{ach.name}</div>
                {isUnlocked ? (
                  <div className="ms-badge-status ms-badge-done">Completed</div>
                ) : (
                  <div className="ms-badge-status ms-badge-lock">
                    <AppIcon name="lock" size={11} /> LOCKED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Secret Missions ─────────────────────────────────────────────── */}
      <div className="ms-mission-card">
        <div className="ms-mission-kicker">SECRET MISSIONS</div>
        <h3 className="ms-mission-title">The Grand Tour Challenge</h3>
        <p className="ms-mission-desc">
          Visit 5 different cities together this year to unlock the ultimate "Jetsetters" badge. You've already explored 3!
        </p>
        <div className="ms-mission-footer">
          <div className="ms-mission-cities">
            {["🗽", "🗼", "🏰"].map((e, i) => (
              <div key={i} className="ms-city-badge">{e}</div>
            ))}
            <div className="ms-city-badge ms-city-plus">+</div>
          </div>
          <a href="#" className="ms-mission-btn">Plan Next Trip</a>
        </div>
      </div>

      <style>{achievementsStyles}</style>
    </div>
  );
}

const achievementsStyles = `
  .milestones-page { display: flex; flex-direction: column; gap: 24px; }

  /* Header */
  .ms-header { display: flex; align-items: flex-start; justify-content: space-between; }
  .ms-title { font-size: clamp(30px, 4vw, 44px); font-weight: 900; color: #111827; letter-spacing: -0.03em; margin: 0 0 6px; }
  .ms-sub { font-size: 14px; color: #6b7280; margin: 0; }

  /* Top row */
  .ms-top-row { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
  @media (max-width: 900px) { .ms-top-row { grid-template-columns: 1fr; } }

  /* Featured card */
  .ms-featured-card {
    background: white; border: 1px solid #e9edf5;
    border-radius: 20px; padding: 28px;
    box-shadow: 0 2px 12px rgba(15,23,42,0.04);
    display: flex; flex-direction: column; gap: 20px;
  }
  .ms-featured-kicker {
    display: inline-block;
    font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
    color: #b0005f; background: rgba(176,0,95,0.08);
    padding: 3px 10px; border-radius: 999px;
  }
  .ms-featured-body { display: flex; align-items: flex-start; gap: 18px; }
  .ms-featured-badge-circle {
    width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #db2777, #b0005f);
    border: 3px solid #db2777;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 6px rgba(219,39,119,0.12);
  }
  .ms-featured-name { font-size: 22px; font-weight: 900; color: #111827; margin: 0 0 6px; }
  .ms-featured-desc { font-size: 13px; color: #6b7280; line-height: 1.55; margin: 0; }
  .ms-fp-label { display: flex; justify-content: space-between; font-size: 12px; color: #374151; margin-bottom: 8px; }
  .ms-fp-label span { font-weight: 700; color: #b0005f; }
  .ms-fp-bar { height: 10px; background: #f3f4f6; border-radius: 999px; overflow: hidden; margin-bottom: 6px; }
  .ms-fp-fill { height: 100%; background: linear-gradient(90deg, #b0005f, #f472b6); border-radius: 999px; }
  .ms-fp-days { font-size: 11px; color: #9ca3af; }

  /* Stats card */
  .ms-stats-card {
    background: #f8faff; border: 1px solid #e9edf5;
    border-radius: 20px; padding: 22px;
  }
  .ms-stats-title { font-size: 14px; font-weight: 800; color: #111827; margin: 0 0 14px; }
  .ms-stats-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
  .ms-stat { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
  .ms-stat-label { color: #6b7280; }
  .ms-stat-val { font-weight: 800; color: #111827; }
  .ms-stat-pink { color: #b0005f; }
  .ms-stats-recent-title { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 8px; }
  .ms-stats-badges { display: flex; gap: 6px; margin-bottom: 8px; }
  .ms-mini-badge {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .ms-stats-streak { font-size: 11px; color: #9ca3af; }

  /* Collection */
  .ms-collection { display: flex; flex-direction: column; gap: 16px; }
  .ms-coll-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .ms-coll-title { font-size: 20px; font-weight: 900; color: #111827; margin: 0 0 4px; }
  .ms-coll-sub { font-size: 13px; color: #6b7280; margin: 0; }
  .ms-coll-tabs { display: flex; gap: 8px; }
  .ms-tab {
    padding: 5px 14px; border-radius: 999px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    background: #f3f4f6; color: #6b7280;
    border: 1px solid transparent;
  }
  .ms-tab-active { background: rgba(176,0,95,0.1); color: #b0005f; border-color: rgba(176,0,95,0.2); }

  .ms-badge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 14px;
  }
  .ms-badge-card {
    background: white; border: 1px solid #e9edf5;
    border-radius: 16px; padding: 18px 12px;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    text-align: center;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .ms-badge-unlocked:hover { box-shadow: 0 8px 28px rgba(15,23,42,0.1); transform: translateY(-2px); }
  .ms-badge-locked { opacity: 0.5; background: #f9fafb; }
  .ms-badge-circle {
    width: 60px; height: 60px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: #e9edf5; color: #9ca3af;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
  .ms-badge-name { font-size: 12px; font-weight: 700; color: #111827; line-height: 1.3; }
  .ms-badge-status { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px; display: inline-flex; align-items: center; gap: 3px; }
  .ms-badge-done { background: #dcfce7; color: #16a34a; }
  .ms-badge-lock { background: #f3f4f6; color: #9ca3af; }

  /* Mission card */
  .ms-mission-card {
    background: linear-gradient(135deg, #f8faff, #fff);
    border: 1px solid #e9edf5;
    border-radius: 20px; padding: 28px;
    position: relative; overflow: hidden;
    box-shadow: 0 2px 12px rgba(15,23,42,0.04);
  }
  .ms-mission-kicker { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; color: #b0005f; margin-bottom: 6px; }
  .ms-mission-title { font-size: 22px; font-weight: 900; color: #111827; margin: 0 0 8px; }
  .ms-mission-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0 0 20px; max-width: 500px; }
  .ms-mission-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .ms-mission-cities { display: flex; gap: 6px; }
  .ms-city-badge {
    width: 38px; height: 38px; border-radius: 50%; border: 2px dashed #e9edf5;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    background: white;
  }
  .ms-city-plus { font-size: 14px; color: #9ca3af; font-weight: 700; }
  .ms-mission-btn {
    padding: 9px 20px; border-radius: 999px;
    border: 1.5px solid #b0005f; color: #b0005f;
    font-size: 13px; font-weight: 700; text-decoration: none;
    transition: all 0.2s;
  }
  .ms-mission-btn:hover { background: #b0005f; color: white; }
`;
