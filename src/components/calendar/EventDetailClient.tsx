"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { deleteEventAction, toggleFavoriteAction } from "@/app/actions/events";
import { formatEventDate, categoryColors, categoryLabels } from "@/lib/utils";
import { EventModal } from "@/components/calendar/EventModal";
import { AppIcon, reactionIconOptions, resolveMoodIconKey } from "@/components/ui/app-icon";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  isFavorite: boolean | null;
  createdAt: Date;
};

type Event = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  category: string;
  moodEmoji: string | null;
  isFavorite: boolean | null;
  tags: string[] | null;
  location: string | null;
  color: string | null;
  isRecurring: boolean;
  recurrenceType: string | null;
  photos: Photo[];
};

interface EventDetailClientProps {
  event: Event;
  userId: string;
}

export function EventDetailClient({ event, userId }: EventDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isFavorite, setIsFavorite] = useState(event.isFavorite);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>(event.photos);

  const accentColor = event.color ?? categoryColors[event.category];

  const handleDelete = () => {
    startTransition(async () => {
      await deleteEventAction(event.id);
      router.push("/calendar");
    });
  };

  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    startTransition(async () => {
      await toggleFavoriteAction(event.id, next);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", event.id);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.photo) {
          setPhotos((prev) => [...prev, { ...data.photo, isFavorite: false, createdAt: new Date(), caption: null }]);
        } else {
          setUploadError(data.error ?? "Erro ao fazer upload.");
        }
      } catch {
        setUploadError("Erro ao fazer upload. Verifique sua conexão.");
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openLightbox = (photo: Photo, idx: number) => {
    setLightboxPhoto(photo);
    setLightboxIdx(idx);
  };

  const navLightbox = (dir: 1 | -1) => {
    const newIdx = (lightboxIdx + dir + photos.length) % photos.length;
    setLightboxPhoto(photos[newIdx]);
    setLightboxIdx(newIdx);
  };

  return (
    <div className="event-detail">
      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="event-hero" style={{ background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})` }}>
        <div className="event-hero-overlay" />
        <div className="event-hero-content">
          <div className="event-breadcrumb">
            <Link href="/calendar" className="breadcrumb-link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <AppIcon name="chevron-left" size={16} /> Calendário
            </Link>
          </div>
          <div className="event-category-badge">
            {categoryLabels[event.category]}
          </div>
          <h1 className="event-title">
            {event.moodEmoji && (
              <span className="event-mood-large">
                <AppIcon name={resolveMoodIconKey(event.moodEmoji)} size={32} strokeWidth={1.5} />
              </span>
            )}
            {event.title}
          </h1>
          <div className="event-meta-row">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <AppIcon name="calendar" size={16} /> {formatEventDate(event.eventDate)}
            </span>
            {event.eventTime && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AppIcon name="clock" size={16} /> {event.eventTime.substring(0, 5)}
              </span>
            )}
            {event.location && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AppIcon name="map-pin" size={16} /> {event.location}
              </span>
            )}
            {event.isRecurring && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AppIcon name="rotate-cw" size={16} /> {event.recurrenceType}
              </span>
            )}
          </div>
        </div>
        <div className="event-hero-actions">
          <button
            className={`hero-action-btn ${isFavorite ? "hero-action-active" : ""}`}
            onClick={handleToggleFavorite}
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-label="Favorito"
          >
            <AppIcon name="star" size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button className="hero-action-btn" onClick={() => setShowEdit(true)} title="Editar" aria-label="Editar evento">
            <AppIcon name="pencil" size={18} />
          </button>
          <button className="hero-action-btn hero-action-danger" onClick={() => setShowDelete(true)} title="Excluir" aria-label="Excluir evento">
            <AppIcon name="trash" size={18} />
          </button>
        </div>
      </div>

      <div className="event-body">
        {/* ── Left column ────────────────────────────────────────────────── */}
        <div className="event-main">
          {/* Description */}
          {event.description && (
            <div className="event-section">
              <h2 className="section-heading" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AppIcon name="book-open" size={18} /> Descrição
              </h2>
              <p className="event-description">{event.description}</p>
            </div>
          )}

          {/* Tags */}
          {(event.tags as string[] | null)?.length ? (
            <div className="event-section">
              <h2 className="section-heading" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AppIcon name="tag" size={18} /> Tags
              </h2>
              <div className="event-tags">
                {(event.tags as string[]).map((tag) => (
                  <span key={tag} className="event-tag">#{tag}</span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Reactions */}
          <div className="event-section">
            <h2 className="section-heading" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AppIcon name="message-square" size={18} /> Reações
            </h2>
            <div className="reactions-row">
              {reactionIconOptions.map((id) => (
                <button key={id} type="button" className="reaction-btn" title="Reagir" aria-label={`Reagir com ${id}`}>
                  <AppIcon name={id} size={22} />
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="event-section">
            <div className="section-header-row">
              <h2 className="section-heading" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AppIcon name="images" size={18} /> Fotos ({photos.length})
              </h2>
              <button
                className="btn-upload"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Enviando..." : "+ Adicionar fotos"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </div>

            {uploadError && (
              <div className="upload-error">{uploadError}</div>
            )}

            {photos.length === 0 ? (
              <div className="photos-empty">
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, color: "var(--foreground-muted)" }}>
                  <AppIcon name="camera" size={40} strokeWidth={1.25} />
                </div>
                <p>Nenhuma foto ainda. Adicione fotos para guardar este momento!</p>
              </div>
            ) : (
              <div className="photos-grid">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="photo-thumb"
                    onClick={() => openLightbox(photo, idx)}
                    role="button"
                    tabIndex={0}
                    aria-label={photo.caption ?? "Foto do evento"}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption ?? "Foto do evento"}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      className="photo-img"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────────── */}
        <aside className="event-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-row">
              <span className="sidebar-icon"><AppIcon name="calendar" size={18} /></span>
              <div>
                <div className="sidebar-label">Data</div>
                <div className="sidebar-value">{formatEventDate(event.eventDate)}</div>
              </div>
            </div>
            {event.eventTime && (
              <div className="sidebar-row">
                <span className="sidebar-icon"><AppIcon name="clock" size={18} /></span>
                <div>
                  <div className="sidebar-label">Horário</div>
                  <div className="sidebar-value">{event.eventTime.substring(0, 5)}</div>
                </div>
              </div>
            )}
            {event.location && (
              <div className="sidebar-row">
                <span className="sidebar-icon"><AppIcon name="map-pin" size={18} /></span>
                <div>
                  <div className="sidebar-label">Local</div>
                  <div className="sidebar-value">{event.location}</div>
                </div>
              </div>
            )}
            <div className="sidebar-row">
              <span className="sidebar-icon"><AppIcon name="tag" size={18} /></span>
              <div>
                <div className="sidebar-label">Categoria</div>
                <div className="sidebar-value" style={{ color: accentColor }}>
                  {categoryLabels[event.category]}
                </div>
              </div>
            </div>
            {event.moodEmoji && (
              <div className="sidebar-row">
                <span className="sidebar-icon">
                  <AppIcon name={resolveMoodIconKey(event.moodEmoji)} size={18} />
                </span>
                <div>
                  <div className="sidebar-label">Humor</div>
                  <div className="sidebar-value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <AppIcon name={resolveMoodIconKey(event.moodEmoji)} size={20} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="btn-share"
            onClick={() => {
              navigator.share?.({
                title: event.title,
                text: `${event.title} — ${formatEventDate(event.eventDate)}`,
                url: window.location.href,
              });
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <AppIcon name="share-2" size={18} /> Compartilhar memória
            </span>
          </button>
        </aside>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxPhoto && (
        <div
          className="lightbox"
          onClick={() => setLightboxPhoto(null)}
          role="dialog"
          aria-modal
        >
          <button type="button" className="lb-close" onClick={() => setLightboxPhoto(null)} aria-label="Fechar">
            <AppIcon name="x" size={20} />
          </button>
          <button type="button" className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); navLightbox(-1); }} aria-label="Anterior">
            <AppIcon name="chevron-left" size={28} />
          </button>
          <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()}>
            <Image src={lightboxPhoto.url} alt={lightboxPhoto.caption ?? "Foto"} fill sizes="90vw" style={{ objectFit: "contain" }} priority />
          </div>
          <button type="button" className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); navLightbox(1); }} aria-label="Próxima">
            <AppIcon name="chevron-right" size={28} />
          </button>
          <div className="lb-counter">{lightboxIdx + 1} / {photos.length}</div>
        </div>
      )}

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      {showEdit && (
        <EventModal
          event={event}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); router.refresh(); }}
        />
      )}

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
      {showDelete && (
        <div className="confirm-backdrop" onClick={() => setShowDelete(false)}>
          <div className="confirm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <AppIcon name="trash" size={40} strokeWidth={1.25} />
            </div>
            <h3 className="confirm-title">Excluir evento?</h3>
            <p className="confirm-desc">
              Tem certeza que deseja excluir <strong>&ldquo;{event.title}&rdquo;</strong>?<br />
              Esta ação não pode ser desfeita.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel-confirm" onClick={() => setShowDelete(false)}>Cancelar</button>
              <button className="btn-confirm-delete" onClick={handleDelete} disabled={isPending}>
                {isPending ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{eventDetailStyles}</style>
    </div>
  );
}

const eventDetailStyles = `
  .event-detail { display: flex; flex-direction: column; gap: 24px; }

  /* Hero */
  .event-hero {
    position: relative; border-radius: var(--radius-xl); overflow: hidden;
    padding: 36px 32px 28px; color: white; min-height: 200px;
  }
  .event-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(160deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%);
  }
  .event-hero-content { position: relative; z-index: 1; flex: 1; }
  .event-hero-actions {
    position: absolute; top: 20px; right: 20px; z-index: 2;
    display: flex; gap: 8px;
  }
  .hero-action-btn {
    width: 38px; height: 38px; border-radius: var(--radius-md);
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
    color: white; font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; backdrop-filter: blur(4px);
  }
  .hero-action-btn:hover { background: rgba(255,255,255,0.25); }
  .hero-action-active { background: rgba(255,215,0,0.3) !important; }
  .hero-action-danger:hover { background: rgba(239,68,68,0.35) !important; }

  .breadcrumb-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 13px; font-weight: 500; }
  .breadcrumb-link:hover { color: white; }
  .event-category-badge {
    display: inline-block; margin: 10px 0 8px;
    background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
    padding: 3px 12px; border-radius: var(--radius-full);
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .event-title {
    font-family: var(--font-display);
    font-size: clamp(24px, 4vw, 36px); font-weight: 900;
    line-height: 1.15; margin-bottom: 12px;
    display: flex; align-items: center; gap: 10px;
  }
  .event-mood-large { display: flex; align-items: center; }
  .event-meta-row {
    display: flex; flex-wrap: wrap; gap: 12px;
    font-size: 14px; opacity: 0.85;
  }

  /* Body layout */
  .event-body {
    display: grid; grid-template-columns: 1fr 260px; gap: 20px;
  }
  @media (max-width: 768px) { .event-body { grid-template-columns: 1fr; } }

  /* Sections */
  .event-main { display: flex; flex-direction: column; gap: 20px; }
  .event-section {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px;
  }
  .section-heading {
    font-size: 14px; font-weight: 700; color: var(--foreground); margin-bottom: 12px;
  }
  .section-header-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
  }
  .section-header-row .section-heading { margin-bottom: 0; flex: 1; }

  .event-description { font-size: 15px; color: var(--foreground-muted); line-height: 1.7; }

  .event-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .event-tag {
    background: var(--primary-surface); color: var(--primary);
    padding: 4px 12px; border-radius: var(--radius-full);
    font-size: 13px; font-weight: 600;
  }

  /* Reactions */
  .reactions-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .reaction-btn {
    display: flex; align-items: center; justify-content: center;
    padding: 6px 10px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--card);
    cursor: pointer; transition: all 0.15s;
  }
  .reaction-btn:hover { transform: scale(1.25); border-color: var(--primary-light); background: var(--primary-surface); }

  /* Photos */
  .btn-upload {
    padding: 7px 14px; border-radius: var(--radius-md);
    background: var(--primary); color: white;
    border: none; font-size: 13px; font-weight: 600;
    cursor: pointer; white-space: nowrap; transition: all 0.2s;
  }
  .btn-upload:hover { filter: brightness(1.08); }
  .btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }
  .upload-error {
    padding: 10px 14px; border-radius: var(--radius-md);
    background: #fee2e2; color: #991b1b;
    border: 1px solid #fecaca; font-size: 13px; margin-bottom: 12px;
  }
  .photos-empty {
    text-align: center; padding: 32px;
    color: var(--foreground-muted); font-size: 14px;
  }
  .photos-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px;
  }
  .photo-thumb {
    position: relative; padding-top: 100%;
    border-radius: var(--radius-md); overflow: hidden;
    cursor: pointer; background: var(--card);
  }
  .photo-img { object-fit: cover; transition: transform 0.3s; }
  .photo-thumb:hover .photo-img { transform: scale(1.05); }

  /* Sidebar */
  .event-sidebar { display: flex; flex-direction: column; gap: 14px; }
  .sidebar-card {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .sidebar-row { display: flex; gap: 12px; align-items: flex-start; }
  .sidebar-icon { width: 24px; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
  .sidebar-label { font-size: 11px; color: var(--foreground-subtle); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .sidebar-value { font-size: 14px; font-weight: 600; color: var(--foreground); margin-top: 2px; }

  .btn-share {
    width: 100%; padding: 11px; border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-share:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-surface); }

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
    color: white; font-size: 18px; cursor: pointer; z-index: 1;
    display: flex; align-items: center; justify-content: center;
  }
  .lb-nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255,255,255,0.12); border: none;
    color: white; font-size: 28px; cursor: pointer; z-index: 1;
    display: flex; align-items: center; justify-content: center;
  }
  .lb-prev { left: 20px; }
  .lb-next { right: 20px; }
  .lb-img-wrap { position: relative; width: min(90vw, 900px); height: min(80vh, 700px); }
  .lb-counter { position: absolute; bottom: 20px; color: rgba(255,255,255,0.5); font-size: 13px; }

  /* Confirm dialog */
  .confirm-backdrop {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .confirm-panel {
    background: var(--background); border-radius: var(--radius-xl);
    padding: 32px; max-width: 400px; width: 100%;
    box-shadow: var(--shadow-lg); text-align: center;
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .confirm-icon { display: flex; justify-content: center; margin-bottom: 12px; color: #dc2626; }
  .confirm-title { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--foreground); margin-bottom: 8px; }
  .confirm-desc { font-size: 14px; color: var(--foreground-muted); line-height: 1.6; margin-bottom: 24px; }
  .confirm-actions { display: flex; gap: 10px; justify-content: center; }
  .btn-cancel-confirm {
    padding: 10px 22px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px; font-weight: 600; cursor: pointer;
  }
  .btn-confirm-delete {
    padding: 10px 22px; border-radius: var(--radius-md);
    background: #dc2626; color: white;
    border: none; font-size: 14px; font-weight: 700; cursor: pointer;
  }
  .btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
`;
