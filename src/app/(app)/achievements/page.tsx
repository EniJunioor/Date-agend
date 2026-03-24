import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievements, coupleAchievements, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Conquistas" };

// Seed achievements list (would normally come from DB)
const ACHIEVEMENTS_CATALOG = [
  { slug: "first-event", name: "Primeira Memória", desc: "Criou o primeiro evento do casal", icon: "📖", criteria: "events >= 1" },
  { slug: "photo-lover", name: "Álbum de Memórias", desc: "Adicionou 10 fotos à galeria", icon: "📷", criteria: "photos >= 10" },
  { slug: "one-month", name: "Um Mês Juntos", desc: "Completaram 30 dias de relacionamento", icon: "🌙", criteria: "days >= 30" },
  { slug: "six-months", name: "Seis Meses", desc: "Completaram 6 meses de relacionamento", icon: "💫", criteria: "days >= 180" },
  { slug: "one-year", name: "Um Ano de Amor", desc: "Completaram 1 ano juntos", icon: "🎂", criteria: "days >= 365" },
  { slug: "two-years", name: "Dois Anos", desc: "Completaram 2 anos de relacionamento", icon: "💑", criteria: "days >= 730" },
  { slug: "five-events", name: "Colecionadores", desc: "Criaram 5 eventos especiais", icon: "🌟", criteria: "events >= 5" },
  { slug: "twenty-events", name: "Historiadores", desc: "Criaram 20 memórias", icon: "📚", criteria: "events >= 20" },
  { slug: "first-trip", name: "Viajantes", desc: "Registraram a primeira viagem juntos", icon: "✈️", criteria: "category:viagem >= 1" },
  { slug: "daily-message", name: "Recadinho do Dia", desc: "Enviaram 7 recadinhos diários", icon: "💌", criteria: "messages >= 7" },
  { slug: "favorites-lover", name: "Momentos Especiais", desc: "Marcaram 5 eventos como favoritos", icon: "⭐", criteria: "favorites >= 5" },
  { slug: "time-capsule", name: "Cápsula do Tempo", desc: "Criaram sua primeira cápsula", icon: "⏳", criteria: "capsules >= 1" },
];

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const coupleId = session.user.coupleId;

  const unlocked = await db
    .select({ achievementId: coupleAchievements.achievementId, unlockedAt: coupleAchievements.unlockedAt })
    .from(coupleAchievements)
    .where(eq(coupleAchievements.coupleId, coupleId));

  const unlockedSlugs = new Set<string>();
  const unlockedDates = new Map<string, Date>();

  // We'll map by slug using catalog order
  unlocked.forEach((u) => {
    // In a real app, join with achievements table to get slug
    // For now, track by achievementId
  });

  // For demo purposes, simulate some unlocked achievements
  const unlockedCount = 3; // Would come from real data

  const totalCount = ACHIEVEMENTS_CATALOG.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="achievements-page">
      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div className="ach-progress-card">
        <div className="ach-progress-header">
          <div>
            <h2 className="ach-progress-title">Suas Conquistas 🏆</h2>
            <p className="ach-progress-sub">
              {unlockedCount} de {totalCount} desbloqueadas
            </p>
          </div>
          <div className="ach-progress-pct">{percentage}%</div>
        </div>
        <div className="ach-progress-bar">
          <div
            className="ach-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="ach-grid">
        {ACHIEVEMENTS_CATALOG.map((ach, idx) => {
          // Simulate first 3 as unlocked
          const isUnlocked = idx < 3;

          return (
            <div
              key={ach.slug}
              className={`ach-card ${isUnlocked ? "ach-card-unlocked" : "ach-card-locked"}`}
            >
              <div className={`ach-icon ${isUnlocked ? "ach-icon-unlocked" : "ach-icon-locked"}`}>
                {isUnlocked ? ach.icon : "🔒"}
              </div>
              <div className="ach-info">
                <div className="ach-name">{ach.name}</div>
                <div className="ach-desc">
                  {isUnlocked ? ach.desc : "Continue registrando memórias para desbloquear"}
                </div>
                {isUnlocked && (
                  <div className="ach-unlocked-label">✅ Desbloqueada</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{achievementsStyles}</style>
    </div>
  );
}

const achievementsStyles = `
  .achievements-page { display: flex; flex-direction: column; gap: 24px; }

  .ach-progress-card {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    border-radius: var(--radius-xl); padding: 28px 32px; color: white;
  }
  .ach-progress-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 16px;
  }
  .ach-progress-title {
    font-family: var(--font-display);
    font-size: 22px; font-weight: 800; margin-bottom: 4px;
  }
  .ach-progress-sub { font-size: 14px; opacity: 0.75; }
  .ach-progress-pct {
    font-family: var(--font-display);
    font-size: 40px; font-weight: 900; line-height: 1;
    opacity: 0.9;
  }
  .ach-progress-bar {
    height: 10px; background: rgba(255,255,255,0.2);
    border-radius: var(--radius-full); overflow: hidden;
  }
  .ach-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6));
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }

  .ach-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }

  .ach-card {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px;
    display: flex; gap: 14px; align-items: flex-start;
    transition: all 0.2s;
  }
  .ach-card-unlocked {
    border-color: var(--primary-surface-strong);
    background: var(--primary-surface);
  }
  .ach-card-unlocked:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .ach-card-locked { opacity: 0.55; }

  .ach-icon {
    width: 48px; height: 48px; border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; flex-shrink: 0;
  }
  .ach-icon-unlocked { background: var(--background); box-shadow: var(--shadow-sm); }
  .ach-icon-locked { background: var(--card); }

  .ach-info { flex: 1; min-width: 0; }
  .ach-name { font-size: 14px; font-weight: 700; color: var(--foreground); margin-bottom: 4px; }
  .ach-desc { font-size: 12px; color: var(--foreground-muted); line-height: 1.5; margin-bottom: 6px; }
  .ach-unlocked-label { font-size: 11px; font-weight: 700; color: var(--primary); }
`;
