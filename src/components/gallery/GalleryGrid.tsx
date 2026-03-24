"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  isFavorite: boolean;
  createdAt: Date;
  eventId: string;
  eventTitle: string | null;
  eventDate: string | null;
};

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const openLightbox = (photo: Photo, idx: number) => {
    setLightbox(photo);
    setLightboxIdx(idx);
  };

  const closeLightbox = () => setLightbox(null);

  const prev = () => {
    const newIdx = (lightboxIdx - 1 + photos.length) % photos.length;
    setLightbox(photos[newIdx]);
    setLightboxIdx(newIdx);
  };

  const next = () => {
    const newIdx = (lightboxIdx + 1) % photos.length;
    setLightbox(photos[newIdx]);
    setLightboxIdx(newIdx);
  };

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            className="gallery-item"
            onClick={() => openLightbox(photo, idx)}
            role="button"
            tabIndex={0}
            aria-label={photo.caption ?? photo.eventTitle ?? "Foto"}
          >
            <div className="gallery-img-wrap">
              <Image
                src={photo.url}
                alt={photo.caption ?? photo.eventTitle ?? "Memória"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="gallery-img"
                loading="lazy"
              />
              <div className="gallery-overlay">
                {photo.isFavorite && <span className="gallery-fav">⭐</span>}
                {photo.eventTitle && (
                  <span className="gallery-event-title">{photo.eventTitle}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar foto"
        >
          <button className="lb-close" onClick={closeLightbox} aria-label="Fechar">✕</button>
          <button
            className="lb-nav lb-prev"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Anterior"
          >‹</button>

          <div className="lb-content" onClick={(e) => e.stopPropagation()}>
            <div className="lb-img-wrap">
              <Image
                src={lightbox.url}
                alt={lightbox.caption ?? lightbox.eventTitle ?? "Memória"}
                fill
                sizes="90vw"
                className="lb-img"
                priority
              />
            </div>
            {(lightbox.caption || lightbox.eventTitle) && (
              <div className="lb-info">
                {lightbox.caption && <p className="lb-caption">{lightbox.caption}</p>}
                {lightbox.eventTitle && (
                  <Link
                    href={`/events/${lightbox.eventId}`}
                    className="lb-event-link"
                    onClick={closeLightbox}
                  >
                    📅 {lightbox.eventTitle}
                  </Link>
                )}
              </div>
            )}
            <div className="lb-counter">
              {lightboxIdx + 1} / {photos.length}
            </div>
          </div>

          <button
            className="lb-nav lb-next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Próxima"
          >›</button>
        </div>
      )}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
        }
        @media (max-width: 480px) {
          .gallery-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
        }

        .gallery-item { cursor: pointer; border-radius: var(--radius-md); overflow: hidden; }
        .gallery-img-wrap {
          position: relative; padding-top: 100%;
          background: var(--card);
        }
        .gallery-img { object-fit: cover; transition: transform 0.3s ease; }
        .gallery-item:hover .gallery-img { transform: scale(1.05); }

        .gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%);
          opacity: 0; transition: opacity 0.2s;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 10px; gap: 4px;
        }
        .gallery-item:hover .gallery-overlay { opacity: 1; }
        .gallery-fav { font-size: 14px; align-self: flex-end; position: absolute; top: 8px; right: 8px; }
        .gallery-event-title {
          font-size: 12px; font-weight: 600; color: white;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* Lightbox */
        .lightbox {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.95);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .lb-close {
          position: absolute; top: 20px; right: 20px;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.15); border: none;
          color: white; font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s; z-index: 1;
        }
        .lb-close:hover { background: rgba(255,255,255,0.25); }

        .lb-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 48px; height: 48px; border-radius: 50%;
          background: rgba(255,255,255,0.12); border: none;
          color: white; font-size: 28px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s; z-index: 1;
        }
        .lb-nav:hover { background: rgba(255,255,255,0.22); }
        .lb-prev { left: 20px; }
        .lb-next { right: 20px; }

        .lb-content {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; max-width: 90vw;
        }
        .lb-img-wrap {
          position: relative; width: min(80vw, 800px); height: min(70vh, 600px);
        }
        .lb-img { object-fit: contain; }

        .lb-info {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .lb-caption { font-size: 15px; color: rgba(255,255,255,0.9); text-align: center; }
        .lb-event-link {
          font-size: 13px; color: var(--primary-light); text-decoration: none;
          font-weight: 600;
        }
        .lb-event-link:hover { text-decoration: underline; }
        .lb-counter { font-size: 12px; color: rgba(255,255,255,0.4); }
      `}</style>
    </>
  );
}
