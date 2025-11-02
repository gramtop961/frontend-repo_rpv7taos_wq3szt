import React, { useEffect, useMemo, useRef, useState } from 'react';

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}

function calcStreak(dates) {
  // dates: array of YYYY-MM-DD strings
  const set = new Set(dates);
  let streak = 0;
  let d = new Date();
  while (true) {
    const k = d.toISOString().slice(0,10);
    if (set.has(k)) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

function Section({ children, title, subtitle }) {
  return (
    <section className="snap-center shrink-0 w-full max-w-6xl px-4 py-6 sm:py-8">
      <div className="rounded-2xl border border-emerald-100 bg-white/85 backdrop-blur p-5 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function SwipeDeck() {
  const containerRef = useRef(null);
  const goBy = (dir) => {
    const el = containerRef.current; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  // MOTIVATION & MOOD
  const moodOptions = [
    { key: 'calm', label: 'Calm 🌿' },
    { key: 'hopeful', label: 'Hopeful 🌤️' },
    { key: 'stressed', label: 'Stressed 😣' },
    { key: 'angry', label: 'Angry 😠' },
    { key: 'lost', label: 'Lost 😔' },
  ];
  const moodData = useMemo(() => ({
    calm: {
      quotes: ['Saansein dheere — har pal mein shanti milti hai.', 'Aaj ka din dheere aur meethi pace mein chalne do.'],
      actions: ['4-7-8 breathing 3 rounds', 'Slow walk 10 minutes']
    },
    hopeful: {
      quotes: ['Kal behtar hoga — aaj se shuru karo.', 'Chhoti jeet bhi jeet hi hoti hai.'],
      actions: ['1-minute visualization', '3 goals likho']
    },
    stressed: {
      quotes: ['Pressure ko pace mein badlo, jaldi mein nahi.', 'Ek break lo — clarity wapas aayegi.'],
      actions: ['5 deep breaths', '1 easy task finish']
    },
    angry: {
      quotes: ['Gussa control mein — power ko direction do.', 'Count 10, phir bolo.'],
      actions: ['10-sec pause + paani', 'Write the trigger']
    },
    lost: {
      quotes: ['Raasta chalne se milta hai — ek step abhi.', 'Confusion action se clear hoti hai.'],
      actions: ['Call a friend', 'Do one micro task']
    }
  }), []);
  const [mood, setMood] = useState('hopeful');
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setQuoteIndex((i) => (i + 1) % moodData[mood].quotes.length), 10000);
    return () => clearInterval(timer);
  }, [mood, moodData]);

  // HEALTH & ROUTINE
  const [water, setWater] = useLocalStorage('water', 0); // glasses out of 8
  const [meals, setMeals] = useLocalStorage('meals', { breakfast: false, lunch: false, dinner: false });
  const [routine, setRoutine] = useLocalStorage('routine', {
    wake5: false,
    silence10: false,
    walk15: false,
    noDrink: false,
    message: false,
  });
  const [showHealthProgress, setShowHealthProgress] = useState(false);
  const healthCompletion = useMemo(() => {
    const total = 3 + 5; // meals + routine items
    const done = (meals.breakfast?1:0) + (meals.lunch?1:0) + (meals.dinner?1:0) +
                 Object.values(routine).filter(Boolean).length;
    return Math.round((done / total) * 100);
  }, [meals, routine]);
  // Track daily water history
  const [waterHist, setWaterHist] = useLocalStorage('hist_water', {}); // {date: value}
  useEffect(() => {
    const k = todayKey();
    setWaterHist({ ...waterHist, [k]: water });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [water]);

  // PHASES
  const [phase1Active, setPhase1Active] = useLocalStorage('phase1Active', false);
  const [p1, setP1] = useLocalStorage('phase1Tasks', {
    noDrink: false,
    sleep7: false,
    relaxMusic: false,
    journal: false,
  });
  const [p1Hist, setP1Hist] = useLocalStorage('hist_phase1', []); // array of dates
  const p1Progress = useMemo(() => Math.round((Object.values(p1).filter(Boolean).length / 4) * 100), [p1]);
  const markPhase = (num) => {
    const key = `hist_phase${num}`;
    const setter = num===1? setP1Hist : num===2? setP2Hist : setP3Hist;
    const hist = num===1? p1Hist : num===2? p2Hist : p3Hist;
    const k = todayKey();
    if (!hist.includes(k)) setter([k, ...hist]);
  };

  const [phase2Active, setPhase2Active] = useLocalStorage('phase2Active', false);
  const [p2, setP2] = useLocalStorage('phase2Tasks', {
    strength: false,
    cardio: false,
    focusBlock: false,
    connect: false,
  });
  const [p2Hist, setP2Hist] = useLocalStorage('hist_phase2', []);
  const p2Progress = useMemo(() => Math.round((Object.values(p2).filter(Boolean).length / 4) * 100), [p2]);

  const [phase3Active, setPhase3Active] = useLocalStorage('phase3Active', false);
  const [p3, setP3] = useLocalStorage('phase3Tasks', {
    habitDeep: false,
    learn30: false,
    hardThing: false,
    helpSomeone: false,
  });
  const [p3Hist, setP3Hist] = useLocalStorage('hist_phase3', []);
  const p3Progress = useMemo(() => Math.round((Object.values(p3).filter(Boolean).length / 4) * 100), [p3]);

  // HABITS
  const [habits, setHabits] = useLocalStorage('habits', [
    { id: 1, name: 'Read 10 pages', done: false },
    { id: 2, name: 'Stretch 5 min', done: false },
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [habitHist, setHabitHist] = useLocalStorage('hist_habits', {}); // {date: count}
  const toggleHabit = (id) => {
    setHabits(habits.map(h => h.id===id? { ...h, done: !h.done } : h));
  };
  const addHabit = () => {
    const name = newHabit.trim(); if (!name) return; 
    const id = Date.now();
    setHabits([...habits, { id, name, done: false }]);
    setNewHabit('');
  };
  useEffect(() => {
    const k = todayKey();
    const count = habits.filter(h=>h.done).length;
    setHabitHist({ ...habitHist, [k]: count });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits]);

  // JOURNAL
  const [entry, setEntry] = useState('');
  const [score, setScore] = useState(7);
  const [notes, setNotes] = useLocalStorage('journalEntries', []);
  const saveEntry = () => {
    if (!entry.trim()) return;
    const item = { id: Date.now(), text: entry.trim(), rating: score, at: new Date().toISOString() };
    setNotes([item, ...notes]);
    setEntry('');
    setPoints(points + 5);
  };

  // Calm Zone
  const [breathPhase, setBreathPhase] = useState('Inhale 4');
  const [breathCount, setBreathCount] = useState(0);
  useEffect(() => {
    let i = 0;
    const seq = [ ['Inhale', 4], ['Hold', 7], ['Exhale', 8] ];
    const tick = () => {
      const [label, secs] = seq[i % seq.length];
      setBreathPhase(`${label} ${secs}`);
      setBreathCount((c)=>c+1);
      timer = setTimeout(() => { i++; tick(); }, secs * 1000);
    };
    let timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, []);
  const soundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_5f3d5e2a3c.mp3?filename=brown-noise-22360.mp3';

  // Anger Management
  const [angerSecs, setAngerSecs] = useState(60);
  useEffect(() => {
    if (angerSecs <= 0) return;
    const t = setTimeout(() => setAngerSecs(angerSecs - 1), 1000);
    return () => clearTimeout(t);
  }, [angerSecs]);
  const [reframe, setReframe] = useState('');

  // Analytics & Rewards
  const [points, setPoints] = useLocalStorage('points', 0);
  useEffect(() => {
    // award when completing phase progress to 100
    if (p1Progress === 100) setPoints((p)=>p+10);
    if (p2Progress === 100) setPoints((p)=>p+10);
    if (p3Progress === 100) setPoints((p)=>p+10);
  }, [p1Progress, p2Progress, p3Progress]);
  const badges = useMemo(() => [
    { id: 'start', label: 'Day One', need: 5 },
    { id: 'streak', label: '3-Day Streak', need: 30 },
    { id: 'unstoppable', label: 'Unstoppable', need: 100 },
  ].filter(b => points >= b.need), [points]);

  // Notifications
  const requestNotify = async () => {
    if (!('Notification' in window)) { alert('Notifications not supported'); return; }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      new Notification('Gaurav 2.0', { body: 'Breathing break? 4-7-8 x3 rounds 🌿' });
    }
  };

  return (
    <div className="w-full relative">
      {/* Side arrows */}
      <button onClick={() => goBy(-1)} className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700">◀</button>
      <button onClick={() => goBy(1)} className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700">▶</button>

      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* 1. Motivation & Mood */}
        <Section title="Motivation & Mood" subtitle="Pick mood to see tailored quote and tiny action">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-slate-600 text-sm mb-2">Tap to change quote</div>
              <button
                onClick={() => setQuoteIndex((i) => (i + 1) % moodData[mood].quotes.length)}
                className="w-full text-left p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow"
              >
                <p className="text-lg font-semibold text-slate-900">{moodData[mood].quotes[quoteIndex]}</p>
                <p className="mt-2 text-sm text-emerald-700">Action: {moodData[mood].actions[quoteIndex % moodData[mood].actions.length]}</p>
              </button>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">How are you feeling?</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {moodOptions.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { setMood(m.key); setQuoteIndex(0); }}
                    className={`rounded-lg px-3 py-2 border text-sm ${mood === m.key ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 2. Health & Daily Routine */}
        <Section title="Health & Daily Routine" subtitle="Water, meals, routine, and quick progress view">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Water Tracker</p>
                <span className="text-sm text-slate-600">{water}/8 glasses</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setWater(Math.max(0, water - 1))} className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200">-</button>
                <button onClick={() => setWater(Math.min(8, water + 1))} className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">+</button>
              </div>
              <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(water/8)*100}%` }} />
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Food Tracker</p>
              <div className="flex items-center gap-4 text-sm">
                {['breakfast','lunch','dinner'].map((k) => (
                  <label key={k} className="flex items-center gap-2">
                    <input type="checkbox" checked={!!meals[k]} onChange={(e)=> setMeals({ ...meals, [k]: e.target.checked })} />
                    {k.charAt(0).toUpperCase()+k.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Daily Routine</p>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                {[
                  ['wake5','Wake at 5AM'],
                  ['silence10','10-min silence'],
                  ['walk15','15-min walk'],
                  ['noDrink','No Drink Today'],
                  ['message','Message an important person'],
                ].map(([k,label]) => (
                  <label key={k} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:border-emerald-300">
                    <input type="checkbox" checked={!!routine[k]} onChange={(e)=> setRoutine({ ...routine, [k]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {showHealthProgress && (
              <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={()=> setShowHealthProgress(false)}>
                <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e)=> e.stopPropagation()}>
                  <h3 className="text-lg font-semibold mb-2">Health Progress</h3>
                  <p className="text-sm text-slate-600 mb-4">Great going! Keep the streak alive.</p>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${healthCompletion}%` }} />
                  </div>
                  <div className="mt-3 text-sm">Estimated streak: <span className="font-medium">{Math.round(healthCompletion/20)} days</span></div>
                  <div className="mt-4 text-right">
                    <button onClick={()=> setShowHealthProgress(false)} className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Close</button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">Completion: <span className="font-semibold text-slate-900">{healthCompletion}%</span></div>
              <button onClick={()=> setShowHealthProgress(true)} className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm">View Progress</button>
            </div>
          </div>
        </Section>

        {/* 3. Phase 1: Control & Reset */}
        <Section title="Phase 1: Control & Reset (21 Days)" subtitle="Alcohol control, sleep, calm, journaling">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPhase1Active(!phase1Active)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${phase1Active ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}
              >
                {phase1Active ? 'Phase 1 Active' : 'Start Phase 1'}
              </button>
              <div className="text-sm text-slate-600">Focus: regain control over alcohol, sleep, calm.</div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                ['noDrink','No Drink Today'],
                ['sleep7','Slept 7+ Hours'],
                ['relaxMusic','10-min Relax Music'],
                ['journal','Journal Entry Done'],
              ].map(([k,label]) => (
                <label key={k} className={`flex items-center gap-2 p-2 rounded border ${p1[k] ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}>
                  <input type="checkbox" disabled={!phase1Active} checked={!!p1[k]} onChange={(e)=> setP1({ ...p1, [k]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>

            <div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${p1Progress}%` }} />
              </div>
              <div className="mt-1 text-sm text-slate-600">Progress: {p1Progress}%</div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => { markPhase(1); }} className="rounded bg-emerald-600 text-white px-4 py-2 text-sm">Mark Day Complete</button>
            </div>

            <div className="text-xs text-slate-500">Streak: {calcStreak(p1Hist)} days</div>
          </div>
        </Section>

        {/* 4. Phase 2: Build Power */}
        <Section title="Phase 2: Build Power (21 Days)" subtitle="Strength, cardio, focus blocks, connection">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setPhase2Active(!phase2Active)} className={`px-4 py-2 rounded-full text-sm font-medium ${phase2Active ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
                {phase2Active ? 'Phase 2 Active' : 'Start Phase 2'}
              </button>
              <div className="text-sm text-slate-600">Build physical and mental strength.</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                ['strength','Strength session'],
                ['cardio','20-min Cardio'],
                ['focusBlock','45-min Focus Block'],
                ['connect','Call/Meet someone important'],
              ].map(([k,label]) => (
                <label key={k} className={`flex items-center gap-2 p-2 rounded border ${p2[k] ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}>
                  <input type="checkbox" disabled={!phase2Active} checked={!!p2[k]} onChange={(e)=> setP2({ ...p2, [k]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
            <div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${p2Progress}%` }} />
              </div>
              <div className="mt-1 text-sm text-slate-600">Progress: {p2Progress}%</div>
            </div>
            <button onClick={() => { markPhase(2); }} className="rounded bg-emerald-600 text-white px-4 py-2 text-sm">Mark Day Complete</button>
            <div className="text-xs text-slate-500">Streak: {calcStreak(p2Hist)} days</div>
          </div>
        </Section>

        {/* 5. Phase 3: Thrive */}
        <Section title="Phase 3: Thrive (Forever)" subtitle="Deep habits, learning, doing hard things, kindness">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setPhase3Active(!phase3Active)} className={`px-4 py-2 rounded-full text-sm font-medium ${phase3Active ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
                {phase3Active ? 'Phase 3 Active' : 'Start Phase 3'}
              </button>
              <div className="text-sm text-slate-600">Live your best systems daily.</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                ['habitDeep','Deep habit practice'],
                ['learn30','Learn 30 minutes'],
                ['hardThing','Do one hard thing'],
                ['helpSomeone','Help someone'],
              ].map(([k,label]) => (
                <label key={k} className={`flex items-center gap-2 p-2 rounded border ${p3[k] ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}>
                  <input type="checkbox" disabled={!phase3Active} checked={!!p3[k]} onChange={(e)=> setP3({ ...p3, [k]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
            <div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${p3Progress}%` }} />
              </div>
              <div className="mt-1 text-sm text-slate-600">Progress: {p3Progress}%</div>
            </div>
            <button onClick={() => { markPhase(3); }} className="rounded bg-emerald-600 text-white px-4 py-2 text-sm">Mark Day Complete</button>
            <div className="text-xs text-slate-500">Streak: {calcStreak(p3Hist)} days</div>
          </div>
        </Section>

        {/* 6. Habits & Custom */}
        <Section title="Habits & Custom" subtitle="Track daily habits and add your own">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-2">
              {habits.map(h => (
                <label key={h.id} className={`flex items-center gap-2 p-2 rounded border ${h.done ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}>
                  <input type="checkbox" checked={h.done} onChange={() => toggleHabit(h.id)} />
                  <span className="text-sm">{h.name}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input value={newHabit} onChange={(e)=> setNewHabit(e.target.value)} placeholder="Add a new habit" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <button onClick={addHabit} className="rounded bg-emerald-600 text-white px-4 py-2 text-sm">Add</button>
            </div>
            <div className="text-xs text-slate-500">Today done: {habits.filter(h=>h.done).length} • Streak approx: {Math.round((habitHist[todayKey()]||0)/Math.max(1,habits.length)*3)} days</div>
          </div>
        </Section>

        {/* 7. Calm Zone */}
        <Section title="Calm Zone" subtitle="4-7-8 breathing with brown noise option">
          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <div className="flex flex-col items-center">
              <div className="h-40 w-40 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 text-lg font-semibold animate-pulse" aria-live="polite">{breathPhase}</div>
              <div className="mt-2 text-xs text-slate-500">Cycles: {Math.floor(breathCount/3)}</div>
            </div>
            <div className="space-y-3">
              <audio controls src={soundUrl} className="w-full" />
              <p className="text-sm text-slate-600">Tip: Close eyes, sit upright, tongue behind teeth. Inhale 4 — Hold 7 — Exhale 8.</p>
            </div>
          </div>
        </Section>

        {/* 8. Anger Management */}
        <Section title="Anger Management" subtitle="Pause, breathe, reframe, act with clarity">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setAngerSecs(60)} className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Start 60s Timer</button>
              <div className="text-sm text-slate-700">Time left: {angerSecs}s</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg border border-slate-200">
                Box Breathing: 4-in, 4-hold, 4-out, 4-hold x4.
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                Write Trigger → Reframe: What else could this mean?
              </div>
            </div>
            <textarea value={reframe} onChange={(e)=> setReframe(e.target.value)} rows={3} placeholder="Write your trigger and a calmer reframe..." className="w-full rounded-xl border border-slate-200 p-3 text-sm" />
          </div>
        </Section>

        {/* 9. Reflection & Journal */}
        <Section title="Reflection & Journal" subtitle="Rate your day and jot your thoughts">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">How was your day? (1–10)</label>
                <input type="range" min="1" max="10" value={score} onChange={(e)=> setScore(parseInt(e.target.value))} className="w-full" />
                <div className="text-sm text-slate-600">Rating: {score}</div>
              </div>
            </div>

            <textarea
              value={entry}
              onChange={(e)=> setEntry(e.target.value)}
              rows={4}
              placeholder="What did I learn today? Aaj ka sabse important moment kya tha?"
              className="w-full rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <div className="flex items-center justify-between">
              <button onClick={saveEntry} className="rounded bg-emerald-600 text-white px-4 py-2 text-sm">Save Reflection</button>
              <div className="text-sm text-slate-600">Points: {points}</div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Old Reflections</h4>
              <div className="space-y-2 max-h-48 overflow-auto pr-1">
                {notes.length === 0 ? (
                  <div className="text-sm text-slate-500">No reflections yet.</div>
                ) : notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500">{new Date(n.at).toLocaleString()}</div>
                    <div className="text-sm mt-1">{n.text}</div>
                    <div className="text-xs text-slate-600 mt-1">Day score: {n.rating}/10</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 10. Analytics */}
        <Section title="Analytics" subtitle="Simple charts for water, habits, and phases">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-semibold mb-2">Water (last 7 days)</h5>
              <BarChart data={last7(waterHist)} max={8} color="bg-emerald-500" />
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-2">Habits done (last 7 days)</h5>
              <BarChart data={last7(habitHist)} max={habits.length} color="bg-teal-500" />
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-2">Phase check-ins (P1/P2/P3)</h5>
              <div className="flex gap-4 text-sm">
                <Badge label="P1" value={p1Hist.length} />
                <Badge label="P2" value={p2Hist.length} />
                <Badge label="P3" value={p3Hist.length} />
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-2">Badges Earned</h5>
              <div className="flex flex-wrap gap-2">
                {badges.length === 0 ? <span className="text-sm text-slate-500">No badges yet.</span> : badges.map(b => (
                  <span key={b.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">🏅 {b.label}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 11. Rewards */}
        <Section title="Rewards" subtitle="Earn points for consistency and unlock badges">
          <div className="space-y-3">
            <div className="text-3xl font-bold text-emerald-600">{points}</div>
            <div className="text-sm text-slate-600">You gain +10 for full phase day, +5 per reflection.</div>
            <div className="flex flex-wrap gap-2">
              {[10,30,60,100].map(n => (
                <div key={n} className={`px-3 py-2 rounded-lg border ${points>=n? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>Milestone {n}</div>
              ))}
            </div>
          </div>
        </Section>

        {/* 12. Notifications */}
        <Section title="Notifications" subtitle="Enable gentle reminders (browser-based)">
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Turn on notifications to get a soft nudge for breathing or water.</p>
            <button onClick={requestNotify} className="rounded bg-emerald-600 text-white px-4 py-2 text-sm">Enable & Send Test</button>
            <div className="text-xs text-slate-500">Note: Works if your browser allows notifications.</div>
          </div>
        </Section>
      </div>

      <div className="text-center text-xs text-slate-500 py-4">“Tu unstoppable hai — har din ek naya chance.”</div>
    </div>
  );
}

function last7(obj) {
  // obj: {date: value}
  const out = [];
  for (let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const k = d.toISOString().slice(0,10);
    out.push({ label: k.slice(5), value: obj[k] || 0 });
  }
  return out;
}

function BarChart({ data, max, color }) {
  return (
    <div className="w-full h-32 flex items-end gap-2">
      {data.map((d, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center">
          <div className={`w-full rounded-t ${color}`} style={{ height: `${max? (d.value/max)*100 : 0}%`, minHeight: '4px' }} />
          <div className="mt-1 text-[10px] text-slate-500">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <span className="text-sm font-semibold text-emerald-700">{value}</span>
    </div>
  );
}
