// src/components/stats/stats-client.tsx
"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ActivityHeatmap } from "./activity-heatmap";
import { TrendingUp, TrendingDown, Calendar, Camera, Flame, Heart } from "lucide-react";

interface Props {
  summary: { totalEvents: number; totalPhotos: number; thisMonthEvents: number; growth: number } | null;
  eventsByMonth: { month: string; eventos: number }[];
  byCategory: { name: string; value: number; color: string }[];
  heatmap: { day: string; value: number }[];
  daysTogetherCount: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

function StatCard({
  label, value, sub, icon: Icon, trend, i,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; trend?: number; i: number;
}) {
  return (
    <motion.div
      custom={i} variants={fadeUp} initial="hidden" animate="show"
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-pink-100 dark:border-zinc-800 p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center">
          <Icon className="w-4 h-4 text-rose-500" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(trend)}% vs mês passado
        </div>
      )}
    </motion.div>
  );
}

export function StatsClient({ summary, eventsByMonth, byCategory, heatmap, daysTogetherCount }: Props) {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard i={0} label="Dias juntos"    value={daysTogetherCount}          icon={Heart}    sub="desde o início" />
        <StatCard i={1} label="Total de eventos" value={summary?.totalEvents ?? 0} icon={Calendar} trend={summary?.growth} />
        <StatCard i={2} label="Fotos"          value={summary?.totalPhotos ?? 0}   icon={Camera}   sub="na galeria" />
        <StatCard i={3} label="Este mês"       value={summary?.thisMonthEvents ?? 0} icon={Flame}  sub="eventos criados" />
      </div>

      {/* Events by month */}
      <motion.div
        custom={4} variants={fadeUp} initial="hidden" animate="show"
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-pink-100 dark:border-zinc-800 p-5"
      >
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Eventos por mês
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={eventsByMonth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#e8325f" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#e8325f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ec" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #fce7ef", fontSize: 12 }}
              cursor={{ stroke: "#e8325f", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone" dataKey="eventos" stroke="#e8325f" strokeWidth={2}
              fill="url(#grad)" dot={{ r: 3, fill: "#e8325f", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#e8325f" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category pie + bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          custom={5} variants={fadeUp} initial="hidden" animate="show"
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-pink-100 dark:border-zinc-800 p-5"
        >
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Categorias
          </h2>
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={byCategory} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                  paddingAngle={3} dataKey="value"
                >
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #fce7ef", fontSize: 12 }}
                  formatter={(v: number, n: string) => [v, n]}
                />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              Nenhum evento ainda
            </div>
          )}
        </motion.div>

        <motion.div
          custom={6} variants={fadeUp} initial="hidden" animate="show"
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-pink-100 dark:border-zinc-800 p-5"
        >
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Top categorias
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={byCategory.slice(0, 5)}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ec" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #fce7ef", fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Eventos">
                {byCategory.slice(0, 5).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity heatmap */}
      <motion.div
        custom={7} variants={fadeUp} initial="hidden" animate="show"
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-pink-100 dark:border-zinc-800 p-5"
      >
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Atividade — últimos 12 meses
        </h2>
        <ActivityHeatmap data={heatmap} />
      </motion.div>
    </div>
  );
}
