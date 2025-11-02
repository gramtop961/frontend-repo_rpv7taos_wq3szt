import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus, Droplets, Pencil, Save, X } from 'lucide-react';

// Helpers
const todayKey = () => new Date().toISOString().slice(0, 10);
const k = (name, date = todayKey()) => `cm_${name}_${date}`;

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Read 10 pages', unit: 'pages', goal: 10 },
  { id: 'h2', name: 'Stretch 5 min', unit: 'min', goal: 5 },
  { id: 'h3', name: 'Wake up at 5', unit: 'days', goal: 1 },
];

export default function SwipeDeck() {
  const dateKey = todayKey();
  // Core daily states
  const [mood, setMood] = useLocalStorage(k('mood'), 3);
  const [water, setWater] = useLocalStorage(k('water'), 0);
  const [reflections, setReflections] = useLocalStorage(k('reflections_entries'), []);
  const [habits, setHabits] = useLocalStorage('cm_habits', DEFAULT_HABITS);
  const [habitProgress, setHabitProgress] = useLocalStorage(k('habit_progress'), {});

  // Derived counters
  useEffect(() => {
    localStorage.setItem(k('reflections'), String(reflections.length));
  }, [reflections]);

  // Swipe state
  const cards = useMemo(
    () => [
      { key: 'mood', title: 'Mood', color: 'from-rose-500 to-pink-500' },
      { key: 'water', title: 'Water', color: 'from-sky-500 to-cyan-500' },
      { key: 'reflect', title: 'Reflections', color: 'from-violet-500 to-indigo-500' },
      { key: 'habits', title: 'Habits', color: 'from-emerald-500 to-teal-500' },
      { key: 'calm', title: 'Calm Zone', color: 'from-blue-500 to-indigo-500' },
    ],
    []
  );
  const [index, setIndex] = useState(0);
  const startX = useRef(null);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    if (startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (Math.abs(dx) > 70) {
      if (dx < 0) next(); else prev();
      startX.current = null;
    }
  };
  const onTouchEnd = () => { startX.current = null; };

  const prev = () => setIndex((i) => (i === 0 ? cards.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === cards.length - 1 ? 0 : i + 1));

  // Handlers
  const addReflection = (text) => {
    if (!text.trim()) return;
    setReflections((arr) => [...arr, { id: Date.now(), text, ts: new Date().toISOString() }]);
  };
  const removeReflection = (id) => {
    setReflections((arr) => arr.filter((r) => r.id !== id));
  };

  const updateHabit = (id, patch) => {
    setHabits((list) => list.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };
  const addHabit = () => {
    const id = `h${Date.now()}`;
    setHabits((list) => [...list, { id, name: 'New habit', unit: '', goal: 1 }]);
  };
  const removeHabit = (id) => {
    setHabits((list) => list.filter((h) => h.id !== id));
    setHabitProgress((p) => {
      const { [id]: _, ...rest } = p || {};
      return rest;
    });
  };

  const setProgress = (id, val) => {
    setHabitProgress((p) => ({ ...(p || {}), [id]: Math.max(0, Number(val) || 0) }));
  };

  return (
    <section className="max-w-6xl mx-auto px-4 -mt-10 relative">
      <div
        className="rounded-2xl bg-white/70 dark:bg-neutral-900/70 shadow-xl border border-black/5 dark:border-white/10 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={`px-4 sm:px-6 py-3 bg-gradient-to-r ${cards[index].color} text-white flex items-center justify-between`}>
          <button onClick={prev} aria-label="Previous card" className="p-2 rounded-md hover:bg-white/20 focus:ring-2 focus:ring-white/60">
            <ChevronLeft />
          </button>
          <div className="font-semibold tracking-wide">{cards[index].title}</div>
          <button onClick={next} aria-label="Next card" className="p-2 rounded-md hover:bg-white/20 focus:ring-2 focus:ring-white/60">
            <ChevronRight />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {cards[index].key === 'mood' && (
            <MoodCard mood={mood} setMood={(v)=>setMood(v)} />
          )}
          {cards[index].key === 'water' && (
            <WaterCard water={water} setWater={setWater} />
          )}
          {cards[index].key === 'reflect' && (
            <ReflectionsCard reflections={reflections} addReflection={addReflection} removeReflection={removeReflection} />
          )}
          {cards[index].key === 'habits' && (
            <HabitsCard
              habits={habits}
              habitProgress={habitProgress}
              addHabit={addHabit}
              removeHabit={removeHabit}
              updateHabit={updateHabit}
              setProgress={setProgress}
            />
          )}
          {cards[index].key === 'calm' && (
            <CalmZone />
          )}

          <div className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
            Data saved for {dateKey} — swipe to switch sections.
          </div>
        </div>
      </div>
    </section>
  );
}

function MoodCard({ mood, setMood }) {
  const moods = [1, 2, 3, 4, 5];
  return (
    <div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">How are you feeling today?</p>
      <div className="flex gap-2">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`flex-1 py-3 rounded-md border text-sm font-medium transition ${
              m === mood
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white/70 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
            aria-pressed={m === mood}
            aria-label={`Set mood ${m}`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

function WaterCard({ water, setWater }) {
  const inc = () => setWater((v) => v + 1);
  const dec = () => setWater((v) => Math.max(0, v - 1));
  return (
    <div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4 flex items-center gap-2">
        <Droplets className="text-sky-500" /> Track your water intake (glasses)
      </p>
      <div className="flex items-center gap-4">
        <button onClick={dec} className="p-3 rounded-md border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800">
          <Minus />
        </button>
        <div className="text-3xl font-bold tabular-nums min-w-[3ch] text-center">{water}</div>
        <button onClick={inc} className="p-3 rounded-md border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800">
          <Plus />
        </button>
      </div>
    </div>
  );
}

function ReflectionsCard({ reflections, addReflection, removeReflection }) {
  const [text, setText] = useState('');
  const onAdd = () => {
    addReflection(text);
    setText('');
  };
  return (
    <div>
      <label htmlFor="reflection" className="block text-sm text-neutral-600 dark:text-neutral-300 mb-2">Write a quick reflection</label>
      <textarea
        id="reflection"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Noticed something about my day..."
      />
      <div className="mt-2 flex justify-end">
        <button onClick={onAdd} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
          <Plus size={16} /> Add
        </button>
      </div>

      {reflections.length > 0 && (
        <ul className="mt-4 space-y-2">
          {reflections.map((r) => (
            <li key={r.id} className="group flex items-start justify-between gap-3 rounded-md border border-black/5 dark:border-white/10 bg-white/60 dark:bg-neutral-900/50 px-3 py-2">
              <div className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{r.text}</div>
              <button onClick={() => removeReflection(r.id)} className="opacity-70 group-hover:opacity-100 text-neutral-500 hover:text-red-500" aria-label="Remove reflection">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HabitsCard({ habits, habitProgress, addHabit, removeHabit, updateHabit, setProgress }) {
  const [editingId, setEditingId] = useState(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Track and edit your habits</p>
        <button onClick={addHabit} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800">
          <Plus size={16} /> New
        </button>
      </div>

      <div className="space-y-3">
        {habits.map((h) => {
          const progress = Number(habitProgress?.[h.id] ?? 0);
          const pct = Math.min(100, Math.round((progress / (h.goal || 1)) * 100));
          const isEditing = editingId === h.id;
          return (
            <div key={h.id} className="rounded-lg border border-black/10 dark:border-white/10 p-3 bg-white/60 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      value={h.name}
                      onChange={(e) => updateHabit(h.id, { name: e.target.value })}
                      className="flex-1 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-2 py-1 text-sm"
                    />
                    <input
                      value={h.unit}
                      onChange={(e) => updateHabit(h.id, { unit: e.target.value })}
                      className="w-28 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-2 py-1 text-sm"
                      placeholder="unit"
                    />
                    <input
                      type="number"
                      min={0}
                      value={h.goal}
                      onChange={(e) => updateHabit(h.id, { goal: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-24 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-2 py-1 text-sm"
                      placeholder="goal"
                    />
                    <button onClick={() => setEditingId(null)} className="p-2 rounded-md bg-indigo-600 text-white"><Save size={16} /></button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 font-medium">{h.name}</div>
                    <div className="text-xs text-neutral-500">Goal: {h.goal} {h.unit}</div>
                    <button onClick={() => setEditingId(h.id)} className="p-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800" aria-label="Edit habit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => removeHabit(h.id)} className="p-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800" aria-label="Remove habit">
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <label htmlFor={`progress-${h.id}`} className="text-sm text-neutral-600 dark:text-neutral-300">Progress today</label>
                  <input
                    id={`progress-${h.id}`}
                    type="number"
                    min={0}
                    value={progress}
                    onChange={(e) => setProgress(h.id, e.target.value)}
                    className="w-28 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-neutral-500">{h.unit}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-neutral-200/70 dark:bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalmZone() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/50">
        <h3 className="font-semibold mb-2">Box Breathing</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">Inhale 4s, hold 4s, exhale 4s, hold 4s — repeat 4 times.</p>
        <div className="grid grid-cols-4 gap-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-indigo-500/80 to-sky-500/80 flex items-center justify-center text-white font-semibold">{i}</div>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-neutral-900/50">
        <h3 className="font-semibold mb-2">Water Ambience</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">Play gentle water sounds to relax.</p>
        <audio
          controls
          src="https://cdn.pixabay.com/download/audio/2021/10/22/audio_0f8f9d6bb1.mp3?filename=river-nature-ambient-10138.mp3"
          className="w-full"
        />
      </div>
    </div>
  );
}
