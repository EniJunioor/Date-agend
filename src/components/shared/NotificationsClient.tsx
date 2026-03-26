"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { AppIcon, NOTIFICATION_TYPE_ICONS } from "@/components/ui/app-icon";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean | null;
  emailSent: boolean | null;
  createdAt: Date;
  eventId: string | null;
};

type NotifSettings = {
  emailEnabled: boolean | null;
  pushEnabled: boolean | null;
  remindDaysBefore: number | null;
} | null;

interface NotificationsClientProps {
  notifications: Notification[];
  settings: NotifSettings;
  userId: string;
}

export function NotificationsClient({ notifications, settings, userId }: NotificationsClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [notifs, setNotifs] = useState(notifications);
  const [isPending, startTransition] = useTransition();
  const [emailEnabled, setEmailEnabled] = useState(settings?.emailEnabled ?? true);
  const [pushEnabled, setPushEnabled] = useState(settings?.pushEnabled ?? true);
  const [remindDays, setRemindDays] = useState(settings?.remindDaysBefore ?? 1);

  const displayed = tab === "unread" ? notifs.filter((n) => !n.read) : notifs;
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  };

  const markAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications/read-all", { method: "PATCH" });
  };

  return (
    <div className="notif-page">
      <div className="notif-layout">
        {/* ── Notification list ──────────────────────────────────────────── */}
        <div className="notif-main">
          <div className="notif-header">
            <h2 className="notif-title">Notificações</h2>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button className="btn-mark-all" onClick={markAllRead}>
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="notif-tabs">
            <button
              className={`notif-tab ${tab === "all" ? "notif-tab-active" : ""}`}
              onClick={() => setTab("all")}
            >
              Todas ({notifs.length})
            </button>
            <button
              className={`notif-tab ${tab === "unread" ? "notif-tab-active" : ""}`}
              onClick={() => setTab("unread")}
            >
              Não lidas {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
          </div>

          {/* List */}
          {displayed.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">
                <AppIcon name="bell" size={40} strokeWidth={1.5} />
              </div>
              <h3>{tab === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação ainda"}</h3>
              <p>Você receberá lembretes de eventos e conquistas aqui.</p>
            </div>
          ) : (
            <div className="notif-list">
              {displayed.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${!notif.read ? "notif-unread" : ""}`}
                  onClick={() => { markRead(notif.id); if (notif.eventId) router.push(`/events/${notif.eventId}`); }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-item-icon">
                    <AppIcon
                      name={NOTIFICATION_TYPE_ICONS[notif.type] ?? "bell"}
                      size={22}
                    />
                  </div>
                  <div className="notif-item-body">
                    <div className="notif-item-title">{notif.title}</div>
                    {notif.body && <div className="notif-item-desc">{notif.body}</div>}
                    <div className="notif-item-time">
                      {formatRelativeDate(notif.createdAt.toISOString())}
                      {notif.emailSent && (
                        <span className="notif-sent-badge" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <AppIcon name="mail" size={12} /> E-mail enviado
                        </span>
                      )}
                    </div>
                  </div>
                  {!notif.read && <div className="notif-dot" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Settings sidebar ───────────────────────────────────────────── */}
        <aside className="notif-settings">
          <div className="notif-settings-card">
            <h3 className="notif-settings-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AppIcon name="settings" size={18} /> Preferências
            </h3>

            <div className="notif-setting-row">
              <div>
                <div className="notif-setting-label">E-mail de lembretes</div>
                <div className="notif-setting-desc">Receber notificações por e-mail</div>
              </div>
              <button
                className={`toggle-btn ${emailEnabled ? "toggle-on" : ""}`}
                onClick={() => setEmailEnabled(!emailEnabled)}
                aria-label="Alternar e-mail"
              >
                <div className="toggle-thumb" />
              </button>
            </div>

            <div className="notif-setting-row">
              <div>
                <div className="notif-setting-label">Push notification</div>
                <div className="notif-setting-desc">Notificação no navegador/app</div>
              </div>
              <button
                className={`toggle-btn ${pushEnabled ? "toggle-on" : ""}`}
                onClick={() => setPushEnabled(!pushEnabled)}
                aria-label="Alternar push"
              >
                <div className="toggle-thumb" />
              </button>
            </div>

            <div className="notif-setting-row notif-setting-col">
              <div className="notif-setting-label">Lembrar com antecedência</div>
              <div className="remind-options">
                {[0, 1, 2, 3, 7].map((d) => (
                  <button
                    key={d}
                    className={`remind-btn ${remindDays === d ? "remind-active" : ""}`}
                    onClick={() => setRemindDays(d)}
                  >
                    {d === 0 ? "No dia" : `${d}d antes`}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-save-notif">Salvar preferências</button>
          </div>
        </aside>
      </div>

      <style>{notifStyles}</style>
    </div>
  );
}

const notifStyles = `
  .notif-page { display: flex; flex-direction: column; }
  .notif-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }
  @media (max-width: 768px) { .notif-layout { grid-template-columns: 1fr; } }

  /* Main */
  .notif-main { display: flex; flex-direction: column; gap: 0; }
  .notif-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .notif-title {
    font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--foreground);
  }
  .btn-mark-all {
    padding: 7px 14px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground-muted); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-mark-all:hover { border-color: var(--primary-light); color: var(--primary); }

  .notif-tabs { display: flex; gap: 0; margin-bottom: 12px; border-bottom: 1px solid var(--border); }
  .notif-tab {
    padding: 10px 16px; border: none; background: transparent;
    color: var(--foreground-muted); font-size: 14px; font-weight: 500;
    cursor: pointer; position: relative; display: flex; align-items: center; gap: 6px;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    transition: all 0.15s;
  }
  .notif-tab:hover { color: var(--foreground); }
  .notif-tab-active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 700; }
  .notif-badge {
    background: var(--primary); color: white;
    font-size: 10px; font-weight: 800; padding: 2px 6px;
    border-radius: var(--radius-full);
  }

  /* Empty */
  .notif-empty {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 48px 32px;
    text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;
    margin-top: 12px;
  }
  .notif-empty-icon { font-size: 44px; }
  .notif-empty h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--foreground); }
  .notif-empty p { font-size: 14px; color: var(--foreground-muted); max-width: 300px; line-height: 1.6; }

  /* List */
  .notif-list {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; margin-top: 12px;
  }
  .notif-item {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.15s; position: relative;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--card); }
  .notif-unread { background: var(--primary-surface); }
  .notif-unread:hover { background: var(--primary-surface-strong); }
  .notif-item-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
  .notif-item-body { flex: 1; min-width: 0; }
  .notif-item-title { font-size: 14px; font-weight: 600; color: var(--foreground); margin-bottom: 3px; }
  .notif-item-desc { font-size: 13px; color: var(--foreground-muted); margin-bottom: 5px; line-height: 1.4; }
  .notif-item-time { font-size: 11px; color: var(--foreground-subtle); display: flex; align-items: center; gap: 8px; }
  .notif-sent-badge { font-size: 11px; }
  .notif-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--primary); flex-shrink: 0; margin-top: 6px;
  }

  /* Settings sidebar */
  .notif-settings-card {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px;
    display: flex; flex-direction: column; gap: 16px;
    position: sticky; top: 80px;
  }
  .notif-settings-title { font-size: 14px; font-weight: 700; color: var(--foreground); }
  .notif-setting-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .notif-setting-col { flex-direction: column; align-items: flex-start; }
  .notif-setting-label { font-size: 13px; font-weight: 600; color: var(--foreground); }
  .notif-setting-desc { font-size: 11px; color: var(--foreground-muted); }

  /* Toggle */
  .toggle-btn {
    width: 44px; height: 24px; border-radius: var(--radius-full);
    background: var(--border); border: none; cursor: pointer;
    position: relative; transition: background 0.2s; flex-shrink: 0;
  }
  .toggle-on { background: var(--primary); }
  .toggle-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 18px; height: 18px; border-radius: 50%;
    background: white; box-shadow: var(--shadow-sm);
    transition: transform 0.2s;
  }
  .toggle-on .toggle-thumb { transform: translateX(20px); }

  /* Remind options */
  .remind-options { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .remind-btn {
    padding: 5px 10px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground-muted); font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .remind-btn:hover { border-color: var(--primary-light); }
  .remind-active { border-color: var(--primary); color: var(--primary); font-weight: 700; background: var(--primary-surface); }

  .btn-save-notif {
    padding: 10px; border-radius: var(--radius-md);
    background: var(--primary); color: white;
    border: none; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-primary);
  }
  .btn-save-notif:hover { filter: brightness(1.08); }
`;
