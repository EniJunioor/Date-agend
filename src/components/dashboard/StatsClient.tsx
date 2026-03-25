"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { categoryLabels, categoryColors } from "@/lib/utils";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface StatsClientProps {
  stats: {
    totalEvents: number;
    totalPhotos: number;
    totalFavorites: number;
    byCategory: { category: string; count: number }[];
    byMonth: { month: string; count: number }[];
    byDayOfWeek: { dayOfWeek: string; count: number }[];
  };
}

export function StatsClient({ stats }: StatsClientProps) {
  // Prepare monthly chart data (last 12 months)
  const now = new Date();
  const monthData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = stats.byMonth.find((m) => m.month === key);
    return {
      label: MONTH_LABELS[d.getMonth()],
      count: found ? Number(found.count) : 0,
    };
  });

  // Prepare category pie data
  const pieData = stats.byCategory.map((c) => ({
    name: categoryLabels[c.category] ?? c.category,
    value: Number(c.count),
    color: categoryColors[c.category] ?? "#64748b",
  }));

  // Day of week data
  const dayData = DAY_LABELS.map((label, i) => {
    const found = stats.byDayOfWeek.find((d) => d.dayOfWeek === String(i + 1));
    return { label, count: found ? Number(found.count) : 0 };
  });

  return (
    <div className="stats-page">
      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div className="stats-summary">
        <StatCard icon="calendar" value={stats.totalEvents} label="Eventos registrados" color="var(--primary)" />
        <StatCard icon="images" value={stats.totalPhotos} label="Fotos na galeria" color="#2563eb" />
        <StatCard icon="star" value={stats.totalFavorites} label="Momentos favoritos" color="#d97706" />
        <StatCard icon="bar-chart-3" value={stats.byCategory.length} label="Categorias usadas" color="#059669" />
      </div>

      {/* ── Monthly chart ─────────────────────────────────────────────────── */}
      <div className="stats-card">
        <h2 className="stats-chart-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AppIcon name="line-chart" size={18} /> Eventos por mês (últimos 12 meses)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--foreground-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--foreground-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "var(--background)", border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 13,
              }}
              cursor={{ fill: "var(--primary-surface)" }}
            />
            <Bar dataKey="count" name="Eventos" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-row-2">
        {/* ── Category pie ────────────────────────────────────────────────── */}
        <div className="stats-card">
          <h2 className="stats-chart-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AppIcon name="tag" size={18} /> Por categoria
          </h2>
          {pieData.length === 0 ? (
            <div className="stats-empty">Nenhum evento registrado ainda.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--background)", border: "1px solid var(--border)",
                    borderRadius: 8, fontSize: 13,
                  }}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Day of week ──────────────────────────────────────────────────── */}
        <div className="stats-card">
          <h2 className="stats-chart-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AppIcon name="calendar-days" size={18} /> Dia da semana favorito
          </h2>
          <div className="day-bars">
            {dayData.map((d) => {
              const max = Math.max(...dayData.map((x) => x.count), 1);
              const pct = (d.count / max) * 100;
              return (
                <div key={d.label} className="day-bar-item">
                  <div className="day-bar-label">{d.label}</div>
                  <div className="day-bar-track">
                    <div
                      className="day-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="day-bar-count">{d.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Heatmap calendar ──────────────────────────────────────────────── */}
      <div className="stats-card">
        <h2 className="stats-chart-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AppIcon name="calendar" size={18} /> Mapa de calor — atividade do ano
        </h2>
        <HeatmapCalendar byMonth={stats.byMonth} />
      </div>

      <style>{statsStyles}</style>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: AppIconName; value: number; label: string; color: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ color, display: "flex", justifyContent: "center" }}>
        <AppIcon name={icon} size={28} />
      </div>
      <div className="stat-card-value" style={{ color }}>{value.toLocaleString("pt-BR")}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

function HeatmapCalendar({ byMonth }: { byMonth: { month: string; count: number }[] }) {
  // Build simple 52-week grid using month aggregates as proxy
  const monthMap = new Map(byMonth.map((m) => [m.month, Number(m.count)]));
  const now = new Date();
  const max = Math.max(...byMonth.map((m) => Number(m.count)), 1);

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), i, 1);
    const key = `${d.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
    return { label: MONTH_LABELS[i], count: monthMap.get(key) ?? 0 };
  });

  return (
    <div className="heatmap">
      {months.map((m) => {
        const intensity = m.count / max;
        const opacity = m.count === 0 ? 0.07 : 0.2 + intensity * 0.8;
        return (
          <div key={m.label} className="heatmap-cell" title={`${m.label}: ${m.count} eventos`}>
            <div
              className="heatmap-block"
              style={{ background: `var(--primary)`, opacity }}
            />
            <span className="heatmap-label">{m.label}</span>
            {m.count > 0 && <span className="heatmap-count">{m.count}</span>}
          </div>
        );
      })}
    </div>
  );
}

const statsStyles = `
  .stats-page { display: flex; flex-direction: column; gap: 20px; }

  .stats-summary {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px;
  }
  .stat-card {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px; text-align: center;
  }
  .stat-card-icon { margin-bottom: 8px; }
  .stat-card-value {
    font-family: var(--font-display); font-size: 32px; font-weight: 900;
    line-height: 1; margin-bottom: 4px;
  }
  .stat-card-label { font-size: 12px; color: var(--foreground-muted); }

  .stats-card {
    background: var(--background); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 22px;
  }
  .stats-chart-title {
    font-size: 15px; font-weight: 700; color: var(--foreground); margin-bottom: 16px;
  }
  .stats-empty { color: var(--foreground-muted); font-size: 14px; text-align: center; padding: 32px 0; }

  .stats-row-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }
  @media (max-width: 768px) { .stats-row-2 { grid-template-columns: 1fr; } }

  /* Day bars */
  .day-bars { display: flex; flex-direction: column; gap: 10px; }
  .day-bar-item { display: flex; align-items: center; gap: 10px; }
  .day-bar-label { font-size: 12px; font-weight: 600; color: var(--foreground-muted); width: 30px; flex-shrink: 0; }
  .day-bar-track { flex: 1; height: 10px; background: var(--card); border-radius: var(--radius-full); overflow: hidden; }
  .day-bar-fill { height: 100%; background: var(--primary); border-radius: var(--radius-full); transition: width 0.6s ease; }
  .day-bar-count { font-size: 12px; color: var(--foreground-muted); width: 20px; text-align: right; }

  /* Heatmap */
  .heatmap {
    display: grid; grid-template-columns: repeat(12, 1fr); gap: 8px;
  }
  @media (max-width: 640px) { .heatmap { grid-template-columns: repeat(6, 1fr); } }
  .heatmap-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .heatmap-block { width: 100%; aspect-ratio: 1; border-radius: var(--radius-sm); }
  .heatmap-label { font-size: 10px; color: var(--foreground-muted); font-weight: 600; }
  .heatmap-count { font-size: 10px; color: var(--primary); font-weight: 700; }
`;
