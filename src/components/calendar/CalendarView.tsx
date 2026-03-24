"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { categoryColors, categoryLabels } from "@/lib/utils";
import { EventModal } from "./EventModal";

type CalendarEvent = {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string | null;
  category: string;
  color: string | null;
  moodEmoji: string | null;
  isFavorite: boolean;
};

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
  year: number;
  month: number;
  view: "monthly" | "weekly" | "agenda";
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarView({ initialEvents, year, month, view: initialView }: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1));
  const [view, setView] = useState<"monthly" | "weekly" | "agenda">(initialView);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events = initialEvents;

  const getEventsForDay = useCallback(
    (date: Date) =>
      events.filter((e) => isSameDay(new Date(e.eventDate + "T00:00:00"), date)),
    [events]
  );

  const navigateMonth = (dir: 1 | -1) => {
    const next = dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    setCurrentDate(next);
    router.push(`/calendar?year=${next.getFullYear()}&month=${next.getMonth() + 1}&view=${view}`);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(startOfMonth(now));
    router.push(`/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}&view=${view}`);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    router.push(`/events/${event.id}`);
  };

  // ── Monthly grid ──────────────────────────────────────────────────────────
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="cal-container">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="cal-toolbar">
        <div className="cal-toolbar-left">
          <button className="cal-btn" onClick={() => navigateMonth(-1)} aria-label="Mês anterior">‹</button>
          <h2 className="cal-month-title">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button className="cal-btn" onClick={() => navigateMonth(1)} aria-label="Próximo mês">›</button>
          <button className="cal-btn-today" onClick={goToToday}>Hoje</button>
        </div>

        <div className="cal-view-switcher">
          {(["monthly", "weekly", "agenda"] as const).map((v) => (
            <button
              key={v}
              className={`cal-view-btn ${view === v ? "cal-view-btn-active" : ""}`}
              onClick={() => setView(v)}
            >
              {v === "monthly" ? "Mensal" : v === "weekly" ? "Semanal" : "Agenda"}
            </button>
          ))}
        </div>

        <button className="cal-create-btn" onClick={() => { setSelectedDate(new Date()); setSelectedEvent(null); setShowModal(true); }}>
          + Novo evento
        </button>
      </div>

      {/* ── Monthly View ─────────────────────────────────────────────────── */}
      {view === "monthly" && (
        <div className="cal-monthly">
          {/* Weekday headers */}
          <div className="cal-weekdays">
            {WEEKDAYS.map((d) => (
              <div key={d} className="cal-weekday">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="cal-grid">
            {calDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const todayFlag = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`cal-day ${!isCurrentMonth ? "cal-day-outside" : ""} ${todayFlag ? "cal-day-today" : ""}`}
                  onClick={() => handleDayClick(day)}
                  role="button"
                  tabIndex={0}
                  aria-label={format(day, "d 'de' MMMM", { locale: ptBR })}
                >
                  <div className="cal-day-number">
                    {format(day, "d")}
                  </div>
                  <div className="cal-day-events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        className="cal-event"
                        style={{
                          background: event.color ?? categoryColors[event.category],
                        }}
                        onClick={(e) => handleEventClick(e, event)}
                        title={event.title}
                      >
                        {event.moodEmoji && <span>{event.moodEmoji}</span>}
                        {event.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="cal-event-more">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Agenda View ──────────────────────────────────────────────────── */}
      {view === "agenda" && (
        <div className="cal-agenda">
          {events.length === 0 ? (
            <div className="cal-empty">
              <p>Nenhum evento neste mês.</p>
              <button className="cal-create-btn" onClick={() => { setSelectedDate(new Date()); setShowModal(true); }}>
                + Criar primeiro evento
              </button>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="agenda-item"
                onClick={() => router.push(`/events/${event.id}`)}
                role="button"
                tabIndex={0}
              >
                <div
                  className="agenda-stripe"
                  style={{ background: event.color ?? categoryColors[event.category] }}
                />
                <div className="agenda-date">
                  <div className="agenda-day">
                    {format(new Date(event.eventDate + "T00:00:00"), "dd", { locale: ptBR })}
                  </div>
                  <div className="agenda-month">
                    {format(new Date(event.eventDate + "T00:00:00"), "MMM", { locale: ptBR })}
                  </div>
                </div>
                <div className="agenda-body">
                  <div className="agenda-title">
                    {event.moodEmoji && <span>{event.moodEmoji} </span>}
                    {event.title}
                    {event.isFavorite && <span title="Favorito"> ⭐</span>}
                  </div>
                  <div className="agenda-meta">
                    <span>{categoryLabels[event.category]}</span>
                    {event.eventTime && <span>· {event.eventTime.substring(0, 5)}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Event Modal ───────────────────────────────────────────────────── */}
      {showModal && (
        <EventModal
          defaultDate={selectedDate}
          event={selectedEvent}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}

      <style>{calStyles}</style>
    </div>
  );
}

const calStyles = `
  .cal-container { display: flex; flex-direction: column; gap: 16px; }

  /* Toolbar */
  .cal-toolbar {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 14px 18px;
  }
  .cal-toolbar-left { display: flex; align-items: center; gap: 8px; flex: 1; }
  .cal-month-title {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700;
    color: var(--foreground); min-width: 180px; text-align: center;
    text-transform: capitalize;
  }
  .cal-btn {
    width: 32px; height: 32px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 18px; font-weight: 300;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .cal-btn:hover { border-color: var(--primary); color: var(--primary); }
  .cal-btn-today {
    padding: 6px 12px; border-radius: var(--radius-md);
    border: 1px solid var(--border); background: var(--background);
    color: var(--foreground); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .cal-btn-today:hover { border-color: var(--primary); color: var(--primary); }

  .cal-view-switcher { display: flex; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
  .cal-view-btn {
    padding: 7px 14px; background: var(--background); border: none;
    color: var(--foreground-muted); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .cal-view-btn:hover { background: var(--card); color: var(--foreground); }
  .cal-view-btn-active { background: var(--primary-surface) !important; color: var(--primary) !important; font-weight: 700; }

  .cal-create-btn {
    padding: 8px 16px; border-radius: var(--radius-md);
    background: var(--primary); color: white;
    border: none; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .cal-create-btn:hover { filter: brightness(1.08); }

  /* Monthly grid */
  .cal-monthly {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden;
  }
  .cal-weekdays {
    display: grid; grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid var(--border);
    background: var(--card);
  }
  .cal-weekday {
    padding: 10px; text-align: center;
    font-size: 12px; font-weight: 700;
    color: var(--foreground-muted); text-transform: uppercase; letter-spacing: 0.5px;
  }
  .cal-grid {
    display: grid; grid-template-columns: repeat(7, 1fr);
  }
  .cal-day {
    min-height: 100px; padding: 8px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.15s;
  }
  .cal-day:nth-child(7n) { border-right: none; }
  .cal-day:hover { background: var(--card); }
  .cal-day-outside { opacity: 0.35; }
  .cal-day-today .cal-day-number {
    background: var(--primary); color: white;
    border-radius: 50%; width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
  }
  .cal-day-number {
    font-size: 13px; font-weight: 600; color: var(--foreground);
    margin-bottom: 4px; width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
  }
  .cal-day-events { display: flex; flex-direction: column; gap: 2px; }
  .cal-event {
    width: 100%; padding: 2px 6px; border-radius: 4px;
    color: white; font-size: 11px; font-weight: 500;
    border: none; cursor: pointer; text-align: left;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: filter 0.15s;
  }
  .cal-event:hover { filter: brightness(1.15); }
  .cal-event-more { font-size: 11px; color: var(--foreground-muted); padding: 0 4px; }

  /* Agenda */
  .cal-agenda { display: flex; flex-direction: column; gap: 8px; }
  .cal-empty {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 40px;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    color: var(--foreground-muted); text-align: center;
  }
  .agenda-item {
    display: flex; align-items: center; gap: 0;
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden;
    cursor: pointer; transition: all 0.15s;
  }
  .agenda-item:hover { box-shadow: var(--shadow-md); transform: translateX(2px); }
  .agenda-stripe { width: 5px; align-self: stretch; flex-shrink: 0; }
  .agenda-date {
    padding: 16px 20px; text-align: center;
    border-right: 1px solid var(--border);
    min-width: 64px;
  }
  .agenda-day { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--primary); line-height: 1; }
  .agenda-month { font-size: 11px; color: var(--foreground-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .agenda-body { padding: 14px 16px; flex: 1; }
  .agenda-title { font-size: 15px; font-weight: 600; color: var(--foreground); margin-bottom: 4px; }
  .agenda-meta { font-size: 12px; color: var(--foreground-muted); display: flex; gap: 6px; }

  @media (max-width: 640px) {
    .cal-day { min-height: 60px; }
    .cal-event { display: none; }
    .cal-day-events::after {
      content: attr(data-count);
      font-size: 10px; color: var(--primary);
    }
    .cal-month-title { min-width: 140px; font-size: 15px; }
  }
`;
