import React, { useMemo, useState } from 'react';

const ranges = [
  { key: 7, label: 'Last 7 days' },
  { key: 30, label: 'Last 30 days' },
  { key: 365, label: 'Last year' },
];

function getDateKeys(days) {
  const arr = [];
  const d = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(d);
    dt.setDate(d.getDate() - i);
    arr.push(dt.toISOString().slice(0, 10));
  }
  return arr;
}

function readSeries(prefix, days, transform = (v) => Number(v) || 0) {
  const keys = getDateKeys(days);
  return keys.map((day) => ({
    day,
    value: transform(localStorage.getItem(`cm_${prefix}_${day}`)),
  }));
}

function BarChart({ title, data, max = 10, color = 'bg-indigo-500' }) {
  return (
    <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/50">
      <div className="mb-3 font-medium">{title}</div>
      <div className="flex items-end gap-1 h-28">
        {data.map((d) => {
          const pct = Math.min(100, Math.round(((d.value || 0) / max) * 100));
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center">
              <div className="w-full rounded-t-sm" style={{ height: `${pct}%` }}>
                <div className={`w-full h-full rounded-t-md ${color}`} />
              </div>
              <div className="mt-1 text-[10px] text-neutral-500">{d.day.slice(5)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPanel() {
  const [range, setRange] = useState(7);

  const moodSeries = useMemo(() => readSeries('mood', range, (v) => Number(v) || 0), [range]);
  const waterSeries = useMemo(() => readSeries('water', range, (v) => Number(v) || 0), [range]);
  const reflectionsSeries = useMemo(() => readSeries('reflections', range, (v) => Number(v) || 0), [range]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <select
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 text-sm"
        >
          {ranges.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <BarChart title="Mood" data={moodSeries} max={5} color="bg-rose-500" />
        <BarChart title="Reflections" data={reflectionsSeries} max={5} color="bg-violet-500" />
        <BarChart title="Water (glasses)" data={waterSeries} max={12} color="bg-sky-500" />
      </div>
    </section>
  );
}
