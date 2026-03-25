// src/components/stats/activity-heatmap.tsx
"use client";

import { useMemo } from "react";
import { eachDayOfInterval, subYears, format, getDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapDay {
  day: string;   // "YYYY-MM-DD"
  value: number;
}

interface Props {
  data: HeatmapDay[];
}

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DAYS   = ["Dom","","Ter","","Qui","","Sáb"];

function getColor(value: number): string {
  if (value === 0) return "bg-pink-50 dark:bg-zinc-800";
  if (value === 1) return "bg-pink-200 dark:bg-pink-900";
  if (value === 2) return "bg-pink-300 dark:bg-pink-700";
  if (value === 3) return "bg-rose-400 dark:bg-rose-600";
  return "bg-rose-500 dark:bg-rose-500";
}

export function ActivityHeatmap({ data }: Props) {
  const dataMap = useMemo(
    () => new Map(data.map((d) => [d.day, d.value])),
    [data]
  );

  const days = useMemo(() => {
    const end   = new Date();
    const start = subYears(end, 1);
    return eachDayOfInterval({ start, end });
  }, []);

  // Agrupa em semanas (colunas)
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    let week: Date[] = [];
    // Padding inicial para alinhar com domingo
    const firstDay = getDay(days[0]);
    for (let i = 0; i < firstDay; i++) week.push(null as unknown as Date);
    days.forEach((day) => {
      week.push(day);
      if (week.length === 7) { result.push(week); week = []; }
    });
    if (week.length) result.push(week);
    return result;
  }, [days]);

  // Labels de mês
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const validDay = week.find(Boolean);
      if (!validDay) return;
      const m = validDay.getMonth();
      if (m !== lastMonth) { labels.push({ label: MONTHS[m], col }); lastMonth = m; }
    });
    return labels;
  }, [weeks]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="relative h-4 ml-8">
            {monthLabels.map(({ label, col }) => (
              <span
                key={col}
                className="absolute text-[10px] text-muted-foreground"
                style={{ left: `${col * 13}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((d, i) => (
                <div key={i} className="h-[11px] w-6 flex items-center">
                  <span className="text-[9px] text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) =>
                  day ? (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-[11px] h-[11px] rounded-sm cursor-default transition-opacity hover:opacity-80 ${getColor(
                            dataMap.get(format(day, "yyyy-MM-dd")) ?? 0
                          )}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <strong>
                          {dataMap.get(format(day, "yyyy-MM-dd")) ?? 0}
                        </strong>{" "}
                        {(dataMap.get(format(day, "yyyy-MM-dd")) ?? 0) === 1
                          ? "evento"
                          : "eventos"}{" "}
                        em{" "}
                        {format(day, "d 'de' MMMM", { locale: ptBR })}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={di} className="w-[11px] h-[11px]" />
                  )
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-1 ml-8">
            <span className="text-[10px] text-muted-foreground">
              {total} evento{total !== 1 ? "s" : ""} no último ano
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Menos</span>
              {[0, 1, 2, 3, 4].map((v) => (
                <div key={v} className={`w-[11px] h-[11px] rounded-sm ${getColor(v)}`} />
              ))}
              <span className="text-[10px] text-muted-foreground">Mais</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
