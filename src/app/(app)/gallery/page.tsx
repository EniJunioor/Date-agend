import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { photos, events, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = { title: "Galeria" };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.coupleId) redirect("/invite");

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
    searchParams.filter === "favorites"
      ? allPhotos.filter((p) => p.isFavorite)
      : allPhotos;

  return (
    <div className="gallery-page">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="gallery-header">
        <div>
          <h2 className="gallery-title">Nossa Galeria 🖼️</h2>
          <p className="gallery-sub">
            {allPhotos.length}{" "}
            {allPhotos.length === 1 ? "foto" : "fotos"} · {
              allPhotos.filter((p) => p.isFavorite).length
            } favoritas
          </p>
        </div>
        <div className="gallery-filters">
          <a
            href="/gallery"
            className={`filter-btn ${!searchParams.filter ? "filter-btn-active" : ""}`}
          >
            Todas
          </a>
          <a
            href="/gallery?filter=favorites"
            className={`filter-btn ${searchParams.filter === "favorites" ? "filter-btn-active" : ""}`}
          >
            ⭐ Favoritas
          </a>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="gallery-empty">
          <div className="gallery-empty-icon">📷</div>
          <h3>
            {searchParams.filter === "favorites"
              ? "Nenhuma foto favorita ainda"
              : "Sua galeria está vazia"}
          </h3>
          <p>
            {searchParams.filter === "favorites"
              ? "Marque fotos como favoritas nos eventos para vê-las aqui."
              : "Adicione fotos aos eventos para criar seu álbum de memórias."}
          </p>
          {!searchParams.filter && (
            <a href="/calendar" className="btn-add-photos">
              + Criar evento e adicionar fotos
            </a>
          )}
        </div>
      ) : (
        <GalleryGrid photos={filtered} />
      )}

      <style>{`
        .gallery-page { display: flex; flex-direction: column; gap: 24px; }

        .gallery-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .gallery-title {
          font-family: var(--font-display);
          font-size: 26px; font-weight: 800; color: var(--foreground);
        }
        .gallery-sub { font-size: 14px; color: var(--foreground-muted); margin-top: 2px; }

        .gallery-filters { display: flex; gap: 8px; }
        .filter-btn {
          padding: 7px 16px; border-radius: var(--radius-full);
          border: 1px solid var(--border); background: var(--background);
          color: var(--foreground-muted); font-size: 13px; font-weight: 500;
          text-decoration: none; transition: all 0.15s;
        }
        .filter-btn:hover { border-color: var(--primary-light); color: var(--primary); }
        .filter-btn-active {
          background: var(--primary-surface); border-color: var(--primary);
          color: var(--primary); font-weight: 700;
        }

        .gallery-empty {
          background: var(--background); border: 1px solid var(--border);
          border-radius: var(--radius-xl); padding: 60px 40px;
          text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 12px;
        }
        .gallery-empty-icon { font-size: 52px; }
        .gallery-empty h3 {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: var(--foreground);
        }
        .gallery-empty p { font-size: 14px; color: var(--foreground-muted); max-width: 360px; line-height: 1.6; }
        .btn-add-photos {
          display: inline-flex; padding: 10px 20px; margin-top: 4px;
          background: var(--primary); color: white;
          border-radius: var(--radius-md); font-size: 14px; font-weight: 600;
          text-decoration: none; transition: all 0.2s;
        }
        .btn-add-photos:hover { filter: brightness(1.08); }
      `}</style>
    </div>
  );
}
