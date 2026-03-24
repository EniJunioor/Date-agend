"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { timeCapsules } from "@/lib/db/schema";

type Capsule = {
  id: string;
  title: string;
  content: string;
  openAt: Date;
  openedAt: Date | null;
  createdAt: Date;
  createdById: string;
};

interface CapsulesClientProps {
  capsules: Capsule[];
  userId: string;
  coupleId: string;
}

async function createCapsuleAction(data: {
  title: string;
  content: string;
  openAt: string;
  coupleId: string;
  userId: string;
}) {
  "use server";
  // This would be a proper server action in a real setup
  // Using inline for simplicity
}

export function CapsulesClient({ capsules, userId, coupleId }: CapsulesClientProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const now = new Date();

  const canOpen = (capsule: Capsule) =>
    !capsule.openedAt && new Date(capsule.openAt) <= now;

  const isLocked = (capsule: Capsule) =>
    !capsule.openedAt && new Date(capsule.openAt) > now;

  const daysUntilOpen = (capsule: Capsule) => {
    const diff = new Date(capsule.openAt).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  async function handleCreate(formData: FormData) {
    setError(null);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const openAt = formData.get("openAt") as string;

    if (!title || !content || !openAt) {
      setError("Preencha todos os campos.");
      return;
    }
    if (new Date(openAt) <= now) {
      setError("A data de abertura deve ser no futuro.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, openAt, coupleId }),
      });
      if (res.ok) {
        setShowCreate(false);
        router.refresh();
      } else {
        setError("Erro ao criar a cápsula. Tente novamente.");
      }
    });
  }

  return (
    <div className="capsules-page">
      {/* Header */}
      <div className="capsules-header">
        <div>
          <h2 className="capsules-title">Cápsulas do Tempo ⏳</h2>
          <p className="capsules-sub">Mensagens para o futuro · {capsules.length} cápsulas criadas</p>
        </div>
        <button className="btn-create-capsule" onClick={() => setShowCreate(true)}>
          + Nova cápsula
        </button>
      </div>

      {/* Empty state */}
      {capsules.length === 0 && (
        <div className="capsules-empty">
          <div className="capsules-empty-icon">⏳</div>
          <h3>Nenhuma cápsula criada ainda</h3>
          <p>
            Crie uma mensagem carinhosa para abrir em uma data especial no futuro —
            um aniversário, uma viagem, ou qualquer data marcante.
          </p>
          <button className="btn-create-capsule" onClick={() => setShowCreate(true)}>
            Criar primeira cápsula
          </button>
        </div>
      )}

      {/* Capsule cards */}
      <div className="capsules-grid">
        {capsules.map((capsule) => {
          const locked = isLocked(capsule);
          const ready = canOpen(capsule);
          const opened = !!capsule.openedAt;

          return (
            <div
              key={capsule.id}
              className={`capsule-card ${locked ? "capsule-locked" : ready ? "capsule-ready" : "capsule-opened"}`}
              onClick={() => !locked && setSelectedCapsule(capsule)}
              role={locked ? "presentation" : "button"}
              tabIndex={locked ? -1 : 0}
            >
              <div className="capsule-glow" />
              <div className="capsule-icon">
                {locked ? "🔒" : ready ? "🎁" : "📖"}
              </div>
              <h3 className="capsule-name">
                {locked ? "Cápsula selada" : capsule.title}
              </h3>
              <div className="capsule-status">
                {locked ? (
                  <>
                    <span className="status-badge status-locked">Abre em {daysUntilOpen(capsule)} dias</span>
                    <p className="capsule-date">
                      {new Date(capsule.openAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </>
                ) : ready ? (
                  <span className="status-badge status-ready">🎁 Pronta para abrir!</span>
                ) : (
                  <span className="status-badge status-opened">
                    Aberta em {new Date(capsule.openedAt!).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View capsule modal */}
      {selectedCapsule && (
        <div className="modal-backdrop" onClick={() => setSelectedCapsule(null)}>
          <div className="capsule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="capsule-modal-header">
              <div className="capsule-modal-icon">
                {canOpen(selectedCapsule) ? "🎁" : "📖"}
              </div>
              <h2 className="capsule-modal-title">{selectedCapsule.title}</h2>
              <button className="modal-close" onClick={() => setSelectedCapsule(null)}>✕</button>
            </div>
            <div className="capsule-modal-body">
              <p className="capsule-content">{selectedCapsule.content}</p>
              <div className="capsule-meta">
                <span>Criada em {new Date(selectedCapsule.createdAt).toLocaleDateString("pt-BR")}</span>
                <span>·</span>
                <span>Aberta em {new Date(selectedCapsule.openAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create capsule modal */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="capsule-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nova Cápsula do Tempo ⏳</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form action={handleCreate} className="capsule-form">
              {error && <div className="form-error">{error}</div>}

              <div className="form-field">
                <label className="form-label">Título da cápsula *</label>
                <input
                  name="title" type="text" required
                  placeholder="Ex: Para nós daqui a 1 ano"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Mensagem *</label>
                <textarea
                  name="content" required rows={6}
                  placeholder="Escreva uma mensagem carinhosa para o futuro... O que vocês estão sentindo agora? O que esperam do futuro?"
                  className="form-input form-textarea"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Data para abrir *</label>
                <input
                  name="openAt" type="datetime-local" required
                  min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                  className="form-input"
                />
                <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
                  A cápsula ficará trancada até esta data.
                </span>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreate(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={isPending}>
                  {isPending ? "Criando..." : "Selar cápsula 🔒"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{capsulesStyles}</style>
    </div>
  );
}

const capsulesStyles = `
  .capsules-page { display: flex; flex-direction: column; gap: 24px; }

  .capsules-header {
    display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px;
  }
  .capsules-title {
    font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--foreground);
  }
  .capsules-sub { font-size: 14px; color: var(--foreground-muted); margin-top: 2px; }

  .btn-create-capsule {
    padding: 10px 20px; border-radius: var(--radius-md);
    background: var(--primary); color: white;
    border: none; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-primary);
  }
  .btn-create-capsule:hover { filter: brightness(1.08); transform: translateY(-1px); }

  .capsules-empty {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 60px 40px;
    text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .capsules-empty-icon { font-size: 60px; }
  .capsules-empty h3 { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--foreground); }
  .capsules-empty p { font-size: 14px; color: var(--foreground-muted); max-width: 360px; line-height: 1.7; }

  .capsules-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;
  }

  .capsule-card {
    position: relative; overflow: hidden;
    border-radius: var(--radius-xl); padding: 28px 22px;
    display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
    border: 1px solid var(--border);
    transition: all 0.2s;
  }
  .capsule-locked { background: var(--card); cursor: default; }
  .capsule-ready {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-color: #f59e0b; cursor: pointer;
  }
  .capsule-ready:hover { box-shadow: 0 8px 30px rgba(245,158,11,0.25); transform: translateY(-3px); }
  .capsule-opened { background: var(--primary-surface); border-color: var(--primary-surface-strong); cursor: pointer; }
  .capsule-opened:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

  .capsule-glow {
    position: absolute; width: 120px; height: 120px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
    top: -30px; right: -30px; pointer-events: none;
  }
  .capsule-icon { font-size: 40px; position: relative; z-index: 1; }
  .capsule-name { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--foreground); }
  .capsule-status { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .status-badge {
    display: inline-block; padding: 4px 12px; border-radius: var(--radius-full);
    font-size: 12px; font-weight: 700;
  }
  .status-locked { background: var(--card); color: var(--foreground-muted); border: 1px solid var(--border); }
  .status-ready { background: #fef3c7; color: #92400e; }
  .status-opened { background: var(--primary-surface); color: var(--primary); }
  .capsule-date { font-size: 12px; color: var(--foreground-subtle); }

  /* View modal */
  .modal-backdrop {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .capsule-modal {
    background: var(--background); border-radius: var(--radius-xl);
    width: 100%; max-width: 480px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .capsule-modal-header {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    padding: 28px 24px; text-align: center; color: white; position: relative;
  }
  .capsule-modal-icon { font-size: 40px; margin-bottom: 8px; }
  .capsule-modal-title { font-family: var(--font-display); font-size: 22px; font-weight: 800; }
  .capsule-modal-body { padding: 24px; }
  .capsule-content { font-size: 16px; line-height: 1.8; color: var(--foreground); white-space: pre-wrap; }
  .capsule-meta { display: flex; gap: 8px; font-size: 12px; color: var(--foreground-subtle); margin-top: 16px; }

  /* Create modal */
  .capsule-create-modal {
    background: var(--background); border-radius: var(--radius-xl);
    width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease;
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--background); z-index: 1;
  }
  .modal-title { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--foreground); }
  .modal-close {
    width: 32px; height: 32px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--card);
    color: var(--foreground-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }

  .capsule-form { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
  .form-error {
    padding: 12px 16px; border-radius: var(--radius-md);
    background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; font-size: 14px;
  }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 13px; font-weight: 600; color: var(--foreground); }
  .form-input {
    padding: 10px 12px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px; font-family: var(--font-body);
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-surface); }
  .form-textarea { resize: vertical; min-height: 120px; }
  .form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
  .btn-cancel {
    padding: 10px 20px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 14px; font-weight: 600; cursor: pointer;
  }
  .btn-save {
    padding: 10px 22px; border-radius: var(--radius-md);
    background: var(--primary); color: white;
    border: none; font-size: 14px; font-weight: 700; cursor: pointer;
    box-shadow: var(--shadow-primary); transition: all 0.2s;
  }
  .btn-save:hover { filter: brightness(1.08); }
  .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
`;
