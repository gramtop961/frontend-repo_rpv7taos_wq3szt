import React, { useMemo, useState } from 'react';

function useLocal(key, fallback) {
  const [val] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });
  return val;
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function BarChart({ data, color = 'bg-violet-500' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-white/10 rounded">
              <div className={`${color} rounded`} style={{ height: `${(d.value / max) * 100}%` }} />
            </div>
            <div className="mt-1 text-[10px] text-white/70">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPanel() {
  const moods = useLocal('moods', {});
  const reflections = useLocal('reflections', {});
  const water = useLocal('waterIntake', {});

  const [range, setRange] = useState('7'); // '7' | '30' | '365'

  const dataset = useMemo(() => {
    const days = Number(range);
    const now = new Date();
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const ts = startOfDay(d);
      arr.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        mood: moods[ts] || 0,
        reflect: reflections[ts] || 0,
        water: water[ts] || 0,
      });
    }
    return arr;
  }, [range, moods, reflections, water]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <select
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/60"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="mt-5 grid md:grid-cols-3 gap-5">
        <div>
          <div className="text-sm text-white/70 mb-2">Mood trend</div>
          <BarChart data={dataset.map((d) => ({ label: d.label, value: d.mood }))} color="bg-indigo-500" />
        </div>
        <div>
          <div className="text-sm text-white/70 mb-2">Reflections</div>
          <BarChart data={dataset.map((d) => ({ label: d.label, value: d.reflect }))} color="bg-violet-500" />
        </div>
        <div>
          <div className="text-sm text-white/70 mb-2">Water</div>
          <BarChart data={dataset.map((d) => ({ label: d.label, value: d.water }))} color="bg-cyan-500" />
        </div>
      </div>
    </section>
  );
}
