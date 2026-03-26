"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createEventAction, updateEventAction } from "@/app/actions/events";
import { categoryColors, categoryLabels } from "@/lib/utils";
import {
  AppIcon,
  moodIconOptions,
  resolveMoodIconKey,
} from "@/components/ui/app-icon";
import { format } from "date-fns";

type Event = {
  id?: string;
  title?: string;
  description?: string | null;
  eventDate?: string;
  eventTime?: string | null;
  category?: string;
  moodEmoji?: string | null;
  isFavorite?: boolean | null;
  tags?: string[] | null;
  location?: string | null;
  color?: string | null;
  isRecurring?: boolean;
  recurrenceType?: string | null;
};

interface EventModalProps {
  defaultDate?: Date | null;
  event?: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  "aniversario","viagem","encontro","conquista","especial","rotina","outro",
] as const;

const themeColors = [
  "#db2777","#2563eb","#059669","#7c3aed","#ea580c",
  "#0891b2","#dc2626","#d97706","#65a30d","#64748b",
];

export function EventModal({ defaultDate, event, onClose, onSuccess }: EventModalProps) {
  const isEdit = !!event?.id;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(event?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(event?.color ?? "#db2777");
  const [selectedMood, setSelectedMood] = useState<string>(() =>
    event?.moodEmoji ? resolveMoodIconKey(event.moodEmoji) : ""
  );
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const defaultDateStr = defaultDate
    ? format(defaultDate, "yyyy-MM-dd")
    : event?.eventDate ?? format(new Date(), "yyyy-MM-dd");

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("tags", tags.join(","));
    formData.set("color", selectedColor);
    formData.set("moodEmoji", selectedMood);

    startTransition(async () => {
      const result = isEdit
        ? await updateEventAction(event!.id!, formData)
        : await createEventAction(formData);

      if (result?.error) setError(result.error);
      else onSuccess();
    });
  }

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Editar evento" : "Criar evento"}
    >
      <div className="modal-panel">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isEdit ? <AppIcon name="sparkles" size={22} className="text-primary" /> : null}
            {isEdit ? "Editar evento" : "Novo evento"}
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <AppIcon name="x" size={18} />
          </button>
        </div>

        <form action={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error" role="alert">{error}</div>
          )}

          {/* Title */}
          <div className="form-row">
            <label className="form-label" htmlFor="title">Título *</label>
            <input
              id="title" name="title" type="text" required
              defaultValue={event?.title ?? ""}
              placeholder="Ex: Aniversário de namoro"
              className="form-input"
            />
          </div>

          {/* Date + Time */}
          <div className="form-grid-2">
            <div className="form-row">
              <label className="form-label" htmlFor="eventDate">Data *</label>
              <input
                id="eventDate" name="eventDate" type="date" required
                defaultValue={defaultDateStr}
                className="form-input"
              />
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor="eventTime">Horário</label>
              <input
                id="eventTime" name="eventTime" type="time"
                defaultValue={event?.eventTime?.substring(0, 5) ?? ""}
                className="form-input"
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-row">
            <label className="form-label">Categoria *</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <label key={cat} className="category-option">
                  <input
                    type="radio" name="category" value={cat} required
                    defaultChecked={event?.category === cat || (!event && cat === "especial")}
                    style={{ display: "none" }}
                  />
                  <span
                    className="category-chip"
                    style={{
                      borderColor: categoryColors[cat],
                    }}
                  >
                    {categoryLabels[cat]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="form-row">
            <label className="form-label">Cor do evento</label>
            <div className="color-picker">
              {themeColors.map((c) => (
                <button
                  key={c} type="button"
                  className={`color-swatch ${selectedColor === c ? "color-swatch-active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setSelectedColor(c)}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="form-row">
            <label className="form-label">Humor</label>
            <div className="mood-picker">
              {moodIconOptions.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`mood-btn ${selectedMood === id ? "mood-btn-active" : ""}`}
                  onClick={() => setSelectedMood(selectedMood === id ? "" : id)}
                  aria-label={`Humor: ${label}`}
                  title={label}
                >
                  <AppIcon name={id} size={22} />
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-row">
            <label className="form-label">Tags</label>
            <div className="tags-area">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="tag-remove" aria-label={`Remover tag ${tag}`}>
                    <AppIcon name="x" size={14} />
                  </button>
                </span>
              ))}
              <input
                type="text" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="+ tag (Enter)"
                className="tag-input"
                maxLength={30}
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-row">
            <label className="form-label" htmlFor="location">Local</label>
            <input
              id="location" name="location" type="text"
              defaultValue={event?.location ?? ""}
              placeholder="Ex: São Paulo, SP"
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-row">
            <label className="form-label" htmlFor="description">Descrição</label>
            <textarea
              id="description" name="description" rows={3}
              defaultValue={event?.description ?? ""}
              placeholder="Conte como foi esse momento especial..."
              className="form-input form-textarea"
            />
          </div>

          {/* Favorite + Recurring */}
          <div className="form-grid-2">
            <label className="form-toggle">
              <input type="checkbox" name="isFavorite" value="true" defaultChecked={event?.isFavorite ?? false} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AppIcon name="star" size={16} /> Favorito
              </span>
            </label>
            <label className="form-toggle">
              <input type="checkbox" name="isRecurring" value="true" defaultChecked={event?.isRecurring} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AppIcon name="rotate-cw" size={16} /> Recorrente
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save" disabled={isPending}>
              {isPending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar evento"}
            </button>
          </div>
        </form>
      </div>

      <style>{modalStyles}</style>
    </div>
  );
}

const modalStyles = `
  .modal-backdrop {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .modal-panel {
    background: var(--background);
    border-radius: var(--radius-xl);
    width: 100%; max-width: 560px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-lg);
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--background); z-index: 1;
  }
  .modal-title {
    font-family: var(--font-display);
    font-size: 20px; font-weight: 800; color: var(--foreground);
  }
  .modal-close {
    width: 32px; height: 32px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--card);
    color: var(--foreground-muted); font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .modal-close:hover { background: var(--primary-surface); color: var(--primary); }

  .modal-form { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
  .modal-error {
    padding: 12px 16px; border-radius: var(--radius-md);
    background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; font-size: 14px;
  }

  .form-row { display: flex; flex-direction: column; gap: 6px; }
  .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-label { font-size: 13px; font-weight: 600; color: var(--foreground); }
  .form-input {
    padding: 10px 12px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px; width: 100%;
    font-family: var(--font-body);
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .form-input:focus {
    outline: none; border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-surface);
  }
  .form-textarea { resize: vertical; min-height: 80px; }

  /* Category */
  .category-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .category-option { cursor: pointer; }
  .category-chip {
    display: inline-block; padding: 6px 12px;
    border-radius: var(--radius-full); border: 2px solid;
    font-size: 12px; font-weight: 600;
    color: var(--foreground); background: var(--background);
    transition: all 0.15s; cursor: pointer;
  }
  input[type="radio"]:checked + .category-chip {
    background: var(--primary-surface);
    color: var(--primary); border-color: var(--primary);
  }

  /* Color picker */
  .color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
  .color-swatch {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid transparent; cursor: pointer;
    transition: all 0.15s; outline: none;
  }
  .color-swatch:hover { transform: scale(1.15); }
  .color-swatch-active { border-color: var(--foreground) !important; transform: scale(1.15); }

  /* Mood picker */
  .mood-picker { display: flex; gap: 6px; flex-wrap: wrap; }
  .mood-btn {
    font-size: 22px; padding: 4px; border-radius: var(--radius-md);
    border: 2px solid transparent; background: var(--card);
    cursor: pointer; transition: all 0.15s;
  }
  .mood-btn:hover { transform: scale(1.2); border-color: var(--border); }
  .mood-btn-active { border-color: var(--primary); background: var(--primary-surface); }

  /* Tags */
  .tags-area {
    display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
    padding: 8px 10px; border: 1px solid var(--border);
    border-radius: var(--radius-md); min-height: 42px;
    background: var(--background);
  }
  .tag-chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: var(--primary-surface); color: var(--primary);
    padding: 3px 8px; border-radius: var(--radius-full);
    font-size: 12px; font-weight: 600;
  }
  .tag-remove { background: none; border: none; cursor: pointer; color: var(--primary); font-size: 10px; padding: 0; }
  .tag-input { border: none; outline: none; background: transparent; font-size: 13px; color: var(--foreground); min-width: 80px; flex: 1; }
  .tag-input::placeholder { color: var(--foreground-subtle); }

  /* Toggle */
  .form-toggle {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--card);
    cursor: pointer; font-size: 13px; font-weight: 500; color: var(--foreground);
  }
  .form-toggle input[type="checkbox"] { accent-color: var(--primary); }

  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
  .btn-cancel {
    padding: 10px 20px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-cancel:hover { background: var(--card); }
  .btn-save {
    padding: 10px 24px; border-radius: var(--radius-md);
    background: var(--primary); color: white;
    border: none; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    box-shadow: var(--shadow-primary);
  }
  .btn-save:hover { filter: brightness(1.08); }
  .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
`;
