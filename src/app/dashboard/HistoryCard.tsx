"use client";

import { useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import { Eyebrow } from "../../components/ui/eyebrow";

type View = "week" | "month" | "year";

export default function HistoryCard({
  completedDates,
  today,
  hasPartner,
}: {
  completedDates: string[];
  today: string;
  hasPartner: boolean;
}) {
  const [view, setView] = useState<View>("week");
  const completed = useMemo(() => new Set(completedDates), [completedDates]);

  return (
    <div className="rounded-[14px] border border-[#c8ddc8] bg-[#fffdf8] p-4 flex flex-col gap-3 min-h-full">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>History</Eyebrow>
        <Toggle value={view} onChange={setView} />
      </div>
      {!hasPartner ? (
        <p className="text-[13px] text-[#7a9e7e] py-4">
          Once you and a partner start hitting days together, they&apos;ll show
          up here.
        </p>
      ) : view === "week" ? (
        <WeekView today={today} completed={completed} />
      ) : view === "month" ? (
        <MonthView today={today} completed={completed} />
      ) : (
        <YearView today={today} completed={completed} />
      )}
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: View;
  onChange: (v: View) => void;
}) {
  const opts: { value: View; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];
  return (
    <div className="inline-flex rounded-full bg-[#f0f4ee] p-0.5">
      {opts.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 rounded-full text-[12px] font-medium transition-colors active:scale-[0.97]",
            value === opt.value
              ? "bg-[#fffdf8] text-[#3b6e45] border border-[#c8ddc8]"
              : "text-[#7a9e7e]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function StatLine({
  numerator,
  denominator,
  label,
}: {
  numerator: number;
  denominator: number;
  label: string;
}) {
  const pct = denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
  return (
    <p className="text-[13px] text-[#5a7a5a]">
      {label} ·{" "}
      <span className="text-[#3b6e45] font-medium">
        {numerator}/{denominator}
      </span>{" "}
      · {pct}%
    </p>
  );
}

function cellTone({
  isCompleted,
  isToday,
  isFuture,
}: {
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}): string {
  if (isCompleted) return "bg-[#d4e8d4] text-[#3b6e45]";
  if (isFuture) return "bg-transparent border border-dashed border-[#e0eade] text-[#c0d0c0]";
  if (isToday) return "border border-[#5a9e6a] text-[#3b6e45]";
  return "border border-[#e0eade] text-[#a0b8a0]";
}

function WeekView({
  today,
  completed,
}: {
  today: string;
  completed: Set<string>;
}) {
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const cells = Array.from({ length: 7 }, (_, i) => {
    const date = shiftDate(today, -6 + i);
    const dow = new Date(date + "T00:00:00Z").getUTCDay();
    return {
      date,
      label: dayLabels[dow],
      isCompleted: completed.has(date),
      isToday: date === today,
      isFuture: date > today,
    };
  });
  const completedCount = cells.filter((c) => c.isCompleted).length;

  return (
    <>
      <StatLine
        numerator={completedCount}
        denominator={7}
        label="Last 7 days"
      />
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c) => (
          <div key={c.date} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-[#a0b8a0]">
              {c.label}
            </span>
            <span
              className={cn(
                "h-9 w-full rounded-[8px] flex items-center justify-center text-[11px] font-medium",
                cellTone(c)
              )}
            >
              {c.isCompleted ? "•" : ""}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function MonthView({
  today,
  completed,
}: {
  today: string;
  completed: Set<string>;
}) {
  const [y, m] = today.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const monthName = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "long",
  });

  const dates = Array.from(
    { length: daysInMonth },
    (_, i) =>
      `${y}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
  );
  const elapsed = dates.filter((d) => d <= today).length;
  const completedCount = dates.filter((d) => completed.has(d)).length;

  const cells: Array<
    | null
    | { date: string; isCompleted: boolean; isToday: boolean; isFuture: boolean }
  > = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (const d of dates) {
    cells.push({
      date: d,
      isCompleted: completed.has(d),
      isToday: d === today,
      isFuture: d > today,
    });
  }

  return (
    <>
      <StatLine
        numerator={completedCount}
        denominator={elapsed}
        label={monthName}
      />
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
          <span
            key={i}
            className="text-center text-[10px] font-medium text-[#a0b8a0]"
          >
            {l}
          </span>
        ))}
        {cells.map((c, i) =>
          c == null ? (
            <span key={`pad-${i}`} />
          ) : (
            <span
              key={c.date}
              className={cn(
                "aspect-square rounded-[6px] flex items-center justify-center text-[10px] font-medium",
                cellTone(c)
              )}
            >
              {Number(c.date.slice(8))}
            </span>
          )
        )}
      </div>
    </>
  );
}

function YearView({
  today,
  completed,
}: {
  today: string;
  completed: Set<string>;
}) {
  const [y, m] = today.split("-").map(Number);
  const months = Array.from({ length: 12 }, (_, idx) => {
    const i = 11 - idx;
    const dt = new Date(Date.UTC(y, m - 1 - i, 1));
    const yy = dt.getUTCFullYear();
    const mm = dt.getUTCMonth() + 1;
    const daysInM = new Date(Date.UTC(yy, mm, 0)).getUTCDate();
    let total = 0;
    let comp = 0;
    for (let day = 1; day <= daysInM; day++) {
      const dateStr = `${yy}-${String(mm).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      if (dateStr <= today) {
        total++;
        if (completed.has(dateStr)) comp++;
      }
    }
    return {
      key: `${yy}-${mm}`,
      label: dt.toLocaleString("en-US", { month: "short" }),
      total,
      completed: comp,
      isCurrent: yy === y && mm === m,
    };
  }).reverse();

  const totalAll = months.reduce((s, x) => s + x.total, 0);
  const completedAll = months.reduce((s, x) => s + x.completed, 0);

  return (
    <>
      <StatLine
        numerator={completedAll}
        denominator={totalAll}
        label="Last 12 months"
      />
      <div className="grid grid-cols-4 gap-1.5">
        {months.map((mo) => {
          const pct = mo.total > 0 ? mo.completed / mo.total : 0;
          const tone =
            mo.total === 0
              ? "bg-transparent border border-dashed border-[#e0eade] text-[#a0b8a0]"
              : pct === 0
              ? "border border-[#e0eade] text-[#a0b8a0]"
              : pct < 0.34
              ? "bg-[#f0f4ee] text-[#5a7a5a]"
              : pct < 0.67
              ? "bg-[#d4e8d4] text-[#3b6e45]"
              : "bg-[#b5d4b5] text-[#3b6e45]";
          return (
            <div
              key={mo.key}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 rounded-[8px]",
                tone,
                mo.isCurrent && "ring-1 ring-[#5a9e6a]"
              )}
            >
              <span className="text-[10px] font-medium">{mo.label}</span>
              <span className="text-[11px] font-medium">
                {mo.total > 0 ? `${Math.round(pct * 100)}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
