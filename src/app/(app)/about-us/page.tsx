import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, couples } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDaysTogether, formatEventDate } from "@/lib/utils";
import Image from "next/image";
import { AppIcon } from "@/components/ui/app-icon";

export const metadata: Metadata = { title: "Sobre Nós" };

export default async function AboutUsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const coupleId = session.user.coupleId;

  // Get both members of the couple
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      nickname: users.nickname,
    })
    .from(users)
    .where(eq(users.coupleId, coupleId));

  const [couple] = await db
    .select()
    .from(couples)
    .where(eq(couples.id, coupleId))
    .limit(1);

  const daysTogether = getDaysTogether(couple.startDate as string);
  const partner = members.find((m) => m.id !== session.user.id);
  const me = members.find((m) => m.id === session.user.id);

  return (
    <div className="about-page">
      {/* ── Cover photo ──────────────────────────────────────────────────── */}
      <div className="about-cover">
        {couple.coverPhotoUrl ? (
          <Image
            src={couple.coverPhotoUrl}
            alt="Foto do casal"
            fill
            className="cover-photo"
            priority
          />
        ) : (
          <div className="cover-placeholder">
            <span className="cover-emoji">
              <AppIcon name="users" size={64} strokeWidth={1.25} color="rgba(255,255,255,0.4)" />
            </span>
            <span className="cover-hint">Adicione uma foto do casal nas configurações</span>
          </div>
        )}
        <div className="cover-overlay" />
        <div className="cover-content">
          <div className="cover-counter">
            <span className="cover-days">{daysTogether.toLocaleString("pt-BR")}</span>
            <span className="cover-days-label">dias juntos</span>
          </div>
          {couple.phrase && (
            <p className="cover-phrase">&ldquo;{couple.phrase}&rdquo;</p>
          )}
        </div>
      </div>

      {/* ── Partners ─────────────────────────────────────────────────────── */}
      <div className="about-partners">
        {[me, partner].filter(Boolean).map((member) => (
          <div key={member!.id} className="partner-card">
            <div className="partner-avatar">
              {member!.image ? (
                <Image
                  src={member!.image}
                  alt={member!.name}
                  fill
                  className="partner-img"
                />
              ) : (
                <span className="partner-initial">
                  {member!.name[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="partner-info">
              <div className="partner-name">{member!.name}</div>
              {member!.nickname && (
                <div className="partner-nick">&ldquo;{member!.nickname}&rdquo;</div>
              )}
              <div className="partner-role">
                {member!.id === session.user.id ? "Você" : "Seu/sua parceiro(a)"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Since + Bio ───────────────────────────────────────────────────── */}
      <div className="about-details">
        <div className="detail-card">
          <div className="detail-icon">
            <AppIcon name="calendar" size={24} />
          </div>
          <div>
            <div className="detail-label">Juntos desde</div>
            <div className="detail-value">{formatEventDate(couple.startDate as string)}</div>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-icon">
            <AppIcon name="heart" size={24} />
          </div>
          <div>
            <div className="detail-label">Dias juntos</div>
            <div className="detail-value">{daysTogether.toLocaleString("pt-BR")} dias</div>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-icon">
            <AppIcon name="palette" size={24} />
          </div>
          <div>
            <div className="detail-label">Tema do casal</div>
            <div className="detail-value" style={{ textTransform: "capitalize" }}>
              {couple.theme ?? "Rosa"}
            </div>
          </div>
        </div>
      </div>

      {couple.bio && (
        <div className="about-bio">
          <h3 className="bio-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AppIcon name="pencil" size={20} /> Nossa história
          </h3>
          <p className="bio-text">{couple.bio}</p>
        </div>
      )}

      <a href="/settings" className="btn-edit-profile">
        <AppIcon name="pencil" size={18} /> Editar perfil do casal
      </a>

      <style>{aboutStyles}</style>
    </div>
  );
}

const aboutStyles = `
  .about-page { display: flex; flex-direction: column; gap: 20px; }

  /* Cover */
  .about-cover {
    position: relative; border-radius: var(--radius-xl); overflow: hidden;
    height: 300px; background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    display: flex; align-items: flex-end;
  }
  .cover-photo { object-fit: cover; }
  .cover-placeholder {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; color: rgba(255,255,255,0.6);
  }
  .cover-emoji { display: flex; justify-content: center; }
  .cover-hint { font-size: 13px; }
  .cover-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%);
  }
  .cover-content {
    position: relative; z-index: 1; padding: 24px 28px; color: white; width: 100%;
  }
  .cover-counter { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
  .cover-days { font-family: var(--font-display); font-size: 52px; font-weight: 900; line-height: 1; }
  .cover-days-label { font-size: 16px; opacity: 0.8; }
  .cover-phrase { font-size: 15px; font-style: italic; opacity: 0.85; max-width: 500px; }

  /* Partners */
  .about-partners {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  }
  @media (max-width: 480px) { .about-partners { grid-template-columns: 1fr; } }

  .partner-card {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px;
    display: flex; align-items: center; gap: 14px;
  }
  .partner-avatar {
    width: 60px; height: 60px; border-radius: 50%;
    position: relative; flex-shrink: 0;
    background: var(--primary-surface);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    border: 3px solid var(--primary-surface-strong);
  }
  .partner-img { object-fit: cover; }
  .partner-initial { font-size: 22px; font-weight: 800; color: var(--primary); }
  .partner-name { font-size: 17px; font-weight: 700; color: var(--foreground); }
  .partner-nick { font-size: 13px; font-style: italic; color: var(--foreground-muted); margin: 2px 0; }
  .partner-role { font-size: 12px; font-weight: 600; color: var(--primary); }

  /* Details */
  .about-details {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;
  }
  .detail-card {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .detail-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--primary); }
  .detail-label { font-size: 11px; color: var(--foreground-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .detail-value { font-size: 15px; font-weight: 700; color: var(--foreground); }

  /* Bio */
  .about-bio {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 24px;
  }
  .bio-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--foreground); margin-bottom: 12px; }
  .bio-text { font-size: 15px; color: var(--foreground-muted); line-height: 1.7; }

  .btn-edit-profile {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px; font-weight: 600;
    text-decoration: none; align-self: flex-start; transition: all 0.15s;
  }
  .btn-edit-profile:hover { border-color: var(--primary); color: var(--primary); }
`;
