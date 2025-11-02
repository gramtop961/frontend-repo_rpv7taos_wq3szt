import React, { useEffect, useMemo, useState } from 'react';

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

// Simple bar chart without external deps
function BarChart({ data, maxValue, label }) {
  const max = Math.max(1, maxValue ?? Math.max(0, ...data.map((d) => d.value)));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-white/10 rounded">
              <div
                className="bg-indigo-500 rounded"
                style={{ height: `${(d.value / max) * 100}%` }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <div className="mt-1 text-[10px] text-white/70">{d.label}</div>
          </div>
        ))}
      </div>
      {label && <div className="mt-2 text-xs text-white/60">{label}</div>}
    </div>
  );
}

// Date helpers
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const todayKey = () => startOfDay(new Date());

export default function SwipeDeck() {
  // Mood tracking
  const [moods, setMoods] = useLocalStorage('moods', {}); // { dayTs: value1to5 }

  // Habits list with editable names and numeric goals
  const [habits, setHabits] = useLocalStorage('habits', [
    { id: 1, name: 'Read 10 pages', unit: 'pages', goal: 10 },
    { id: 2, name: 'Stretch 5 min', unit: 'min', goal: 5 },
    { id: 3, name: 'Wake up at 5', unit: '', goal: 1 },
  ]);
  const [habitProgress, setHabitProgress] = useLocalStorage('habitProgress', {}); // {dayTs: {habitId: value}}

  // Water tracker
  const [water, setWater] = useLocalStorage('waterIntake', {}); // {dayTs: cups}

  // Reflections per day
  const [reflections, setReflections] = useLocalStorage('reflections', {}); // {dayTs: count}

  const dayTs = todayKey();

  const setMood = (val) => {
    setMoods((prev) => ({ ...prev, [dayTs]: val }));
  };

  const updateHabit = (id, patch) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const updateHabitProgress = (id, value) => {
    setHabitProgress((prev) => ({
      ...prev,
      [dayTs]: { ...(prev[dayTs] || {}), [id]: Math.max(0, value) },
    }));
  };

  const addReflection = () => {
    setReflections((prev) => ({ ...prev, [dayTs]: (prev[dayTs] || 0) + 1 }));
  };

  const addWater = () => {
    setWater((prev) => ({ ...prev, [dayTs]: (prev[dayTs] || 0) + 1 }));
  };

  // Build last N days dataset helper
  const buildRangeData = (days) => {
    const arr = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const ts = startOfDay(d);
      arr.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        mood: moods[ts] || 0,
        reflect: reflections[ts] || 0,
        water: water[ts] || 0,
        ts,
      });
    }
    return arr;
  };

  // UI
  return (
    <div className="space-y-10">
      {/* Mood + quick actions */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">Today</h2>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={addWater} className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500">+ Water</button>
            <button onClick={addReflection} className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10">+ Reflection</button>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-white/70 mb-1">Mood</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-2 rounded-md border ${moods[dayTs] === m ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Habits editable */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-3">Daily Habits</h2>
        <div className="space-y-3">
          {habits.map((h) => {
            const prog = (habitProgress[dayTs] || {})[h.id] || 0;
            return (
              <div key={h.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 items-center">
                <input
                  className="md:col-span-2 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/60"
                  value={h.name}
                  onChange={(e) => updateHabit(h.id, { name: e.target.value })}
                />
                <div className="flex items-center gap-2 md:col-span-1">
                  <input
                    type="number"
                    className="w-24 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/60"
                    value={h.goal}
                    min={0}
                    onChange={(e) => updateHabit(h.id, { goal: Number(e.target.value) })}
                  />
                  <span className="text-xs text-white/60">{h.unit}</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="number"
                    className="w-28 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/60"
                    value={prog}
                    min={0}
                    onChange={(e) => updateHabitProgress(h.id, Number(e.target.value))}
                  />
                  <div className="flex-1 h-2 bg-white/10 rounded">
                    <div
                      className="h-2 bg-indigo-500 rounded"
                      style={{ width: `${Math.min(100, (prog / (h.goal || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Calm Zone with water sound */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold">Calm Zone</h2>
          <p className="text-sm text-white/70">Breathing + Water ambience</p>
        </div>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-white/70">Try box breathing • 4-4-4-4</div>
            <div className="h-24 rounded-xl bg-gradient-to-r from-indigo-900/60 to-indigo-700/40 border border-white/10 flex items-center justify-center">
              <span className="text-white/90">Inhale • Hold • Exhale • Hold</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-white/70">Water ambient sound</div>
            <audio
              src="https://cdn.pixabay.com/download/audio/2022/03/31/audio_6c7df2b8b6.mp3?filename=calm-river-ambient-ambient-203699.mp3"
              controls
              preload="none"
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
