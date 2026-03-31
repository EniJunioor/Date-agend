import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { photos, events, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { AppIcon } from "@/components/ui/app-icon";

export const metadata: Metadata = { title: "Galeria" };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

  const params = await searchParams;
  const coupleId = session.user.coupleId;

  const allPhotos = await db
    .select({
      id: photos.id,
      url: photos.url,
      caption: photos.caption,
      isFavorite: photos.isFavorite,
      createdAt: photos.createdAt,
      eventId: photos.eventId,
      eventTitle: events.title,
      eventDate: events.eventDate,
    })
    .from(photos)
    .leftJoin(events, eq(photos.eventId, events.id))
    .where(eq(photos.coupleId, coupleId))
    .orderBy(desc(photos.createdAt));

  const filtered =
    params.filter === "favorites"
      ? allPhotos.filter((p) => p.isFavorite)
      : allPhotos;

  const filterTabs = [
    { label: "All", value: undefined },
    { label: "Favorites", value: "favorites" },
    { label: "Trips", value: "trips" },
    { label: "Dates", value: "dates" },
  ];

  return (
    <div className="gallery2">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="g2-header">
        <div className="g2-header-left">
          <h1 className="g2-title">Captured Moments</h1>
          <p className="g2-sub">
            A curated collection of our shared journey. Every frame holds a story, a feeling, and a promise for tomorrow.
          </p>
        </div>
        <div className="g2-tabs">
          {filterTabs.map((tab) => (
            <a
              key={tab.label}
              href={tab.value ? `/gallery?filter=${tab.value}` : "/gallery"}
              className={`g2-tab ${params.filter === tab.value ? "g2-tab-active" : ""}`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="g2-empty">
          <AppIcon name="camera" size={48} strokeWidth={1.25} />
          <h3>{params.filter === "favorites" ? "Nenhuma foto favorita ainda" : "Sua galeria está vazia"}</h3>
          <p>{params.filter === "favorites" ? "Marque fotos como favoritas nos eventos." : "Adicione fotos aos eventos para criar seu álbum."}</p>
          {!params.filter && (
            <a href="/calendar" className="g2-cta">+ Criar evento e adicionar fotos</a>
          )}
        </div>
      ) : (
        <GalleryGrid photos={filtered} />
      )}

      {/* ── Featured Milestone ───────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="g2-milestone">
          <div className="g2-milestone-left">
            <div className="g2-ms-kicker">FEATURED MILESTONE</div>
            <h3 className="g2-ms-title">Our First Home Together</h3>
            <p className="g2-ms-desc">
              October 15, 2023. The day we got the keys. A new chapter in our story began in this little space filled with big dreams and empty boxes.
            </p>
            <div className="g2-ms-actions">
              <a href="/gallery" className="g2-ms-btn-primary">View Full Album</a>
              <a href="#" className="g2-ms-btn-outline">Share Story</a>
            </div>
          </div>
          <div className="g2-milestone-right">
            <div className="g2-ms-photo">
              <div className="g2-ms-photo-placeholder" />
              <div className="g2-ms-photo-caption">Home sweet home.</div>
            </div>
          </div>
        </div>
      )}

      <style>{galleryStyles}</style>
    </div>
  );
}

const galleryStyles = `
  .gallery2 { display: flex; flex-direction: column; gap: 28px; }

  .g2-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  .g2-title { font-size: clamp(28px, 4vw, 44px); font-weight: 900; color: #111827; letter-spacing: -0.03em; margin: 0 0 8px; }
  .g2-sub { font-size: 14px; color: #6b7280; margin: 0; max-width: 480px; line-height: 1.6; }

  .g2-tabs { display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-start; }
  .g2-tab {
    padding: 6px 16px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    border: 1px solid #e9edf5; background: white;
    color: #6b7280; text-decoration: none; transition: all 0.15s;
  }
  .g2-tab:hover { border-color: #db2777; color: #db2777; }
  .g2-tab-active { background: rgba(176,0,95,0.1); border-color: rgba(176,0,95,0.3); color: #b0005f; font-weight: 700; }

  .g2-empty {
    background: white; border: 1px solid #e9edf5;
    border-radius: 20px; padding: 60px 32px;
    text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
    color: #b0005f;
  }
  .g2-empty h3 { font-size: 20px; font-weight: 800; color: #111827; }
  .g2-empty p { font-size: 14px; color: #6b7280; max-width: 360px; line-height: 1.6; }
  .g2-cta {
    display: inline-flex; padding: 10px 22px;
    background: #db2777; color: white; border-radius: 999px;
    font-size: 14px; font-weight: 700; text-decoration: none; margin-top: 4px;
  }

  .g2-milestone {
    background: linear-gradient(135deg, #eef3ff 0%, #f8e8f5 100%);
    border-radius: 24px; padding: 36px;
    display: grid; grid-template-columns: 1fr 280px; gap: 32px; align-items: center;
    border: 1px solid #e9edf5;
  }
  @media (max-width: 768px) { .g2-milestone { grid-template-columns: 1fr; } }
  .g2-ms-kicker { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; color: #b0005f; margin-bottom: 10px; }
  .g2-ms-title { font-size: 26px; font-weight: 900; color: #111827; margin: 0 0 12px; letter-spacing: -0.02em; }
  .g2-ms-desc { font-size: 14px; color: #374151; line-height: 1.65; margin: 0 0 24px; }
  .g2-ms-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .g2-ms-btn-primary {
    padding: 10px 22px; border-radius: 999px;
    background: #db2777; color: white;
    font-size: 14px; font-weight: 700; text-decoration: none; transition: filter 0.2s;
  }
  .g2-ms-btn-primary:hover { filter: brightness(1.08); }
  .g2-ms-btn-outline {
    padding: 10px 22px; border-radius: 999px;
    border: 1.5px solid #374151; color: #374151;
    font-size: 14px; font-weight: 700; text-decoration: none; background: white; transition: all 0.2s;
  }
  .g2-ms-btn-outline:hover { background: #374151; color: white; }
  .g2-ms-photo {
    background: white; border-radius: 18px; overflow: hidden;
    box-shadow: 0 12px 40px rgba(15,23,42,0.12); transform: rotate(2deg);
  }
  .g2-ms-photo-placeholder { width: 100%; height: 200px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
  .g2-ms-photo-caption { padding: 10px 14px; font-size: 12px; font-weight: 600; color: #6b7280; text-align: center; }
`;
