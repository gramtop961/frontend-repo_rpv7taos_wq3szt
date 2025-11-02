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

function Section({ children, title }) {
  return (
    <section className="snap-center shrink-0 w-full max-w-6xl px-4 py-6 sm:py-8">
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function SwipeDeck() {
  const containerRef = useRef(null);
  const goNext = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
  };

  // MOTIVATION & MOOD
  const moodOptions = [
    { key: 'happy', label: 'Happy 😄' },
    { key: 'sad', label: 'Sad 😢' },
    { key: 'angry', label: 'Angry 😠' },
    { key: 'lost', label: 'Lost 😔' },
    { key: 'hopeful', label: 'Hopeful 🌤️' },
  ];
  const moodData = useMemo(() => ({
    happy: {
      quotes: [
        'Khushiyan phailao — aaj tumhari energy sabko utha degi!',
        'Smile rakho, duniya thodi aur roshan ho jaayegi.'
      ],
      actions: ['Ek dost ko positive message bhejo', '5 gratitude lines likho']
    },
    sad: {
      quotes: [
        'Aaj tough hai, par tu tough se zyada strong hai, Gaurav.',
        'Rone do thoda, phir nayi himmat se khade ho jao.'
      ],
      actions: ['5 deep breaths lo', 'Apne aap ko ek garam chai treat do']
    },
    angry: {
      quotes: [
        'Gussa tera control mein — count 10, phir bolna.',
        'Power ko direction do, distraction nahi.'
      ],
      actions: ['10-sec breathing karein', '2 minute chup rehkar paani piyo']
    },
    lost: {
      quotes: [
        'Raasta milta hai chalne se — ek chhota step abhi lo.',
        'Confusion normal hai, clarity action se aati hai.'
      ],
      actions: ['1 chhota task complete karo', '1 dost ko call karo']
    },
    hopeful: {
      quotes: [
        'Umeed ki roshni se andhera hamesha halka padta hai.',
        'Kal behtar hoga — aaj se shuru karo.'
      ],
      actions: ['1 minute visualization', 'Kal ke 3 goals likho']
    }
  }), []);

  const [mood, setMood] = useState('hopeful');
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setQuoteIndex((i) => (i + 1) % moodData[mood].quotes.length), 3600000);
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

  // PHASE 1
  const [phaseActive, setPhaseActive] = useLocalStorage('phase1Active', false);
  const [p1, setP1] = useLocalStorage('phase1Tasks', {
    noDrink: false,
    sleep7: false,
    relaxMusic: false,
    journal: false,
  });
  const p1Progress = useMemo(() => Math.round((Object.values(p1).filter(Boolean).length / 4) * 100), [p1]);
  const markP1Complete = () => {
    try {
      // Simple clap sound via WebAudio API
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      o.start();
      o.stop(ctx.currentTime + 0.16);
    } catch {}
    alert('Proud of you Gaurav — tu broken nahi, bas restart kar raha hai.');
  };

  // JOURNAL
  const [entry, setEntry] = useState('');
  const [score, setScore] = useState(7);
  const [notes, setNotes] = useLocalStorage('journalEntries', []);
  const saveEntry = () => {
    if (!entry.trim()) return;
    const item = { id: Date.now(), text: entry.trim(), rating: score, at: new Date().toISOString() };
    setNotes([item, ...notes]);
    setEntry('');
  };

  const startVoice = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input not supported in this browser.'); return; }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setEntry((prev) => (prev ? prev + ' ' : '') + text);
    };
    rec.start();
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* 1. Motivation & Mood */}
        <Section title="Motivation & Mood">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-700 text-sm mb-2">Tap to change quote</div>
              <button
                onClick={() => setQuoteIndex((i) => (i + 1) % moodData[mood].quotes.length)}
                className="w-full text-left p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 hover:shadow"
              >
                <p className="text-lg font-semibold text-gray-900">{moodData[mood].quotes[quoteIndex]}</p>
                <p className="mt-2 text-sm text-orange-700">Action: {moodData[mood].actions[quoteIndex % moodData[mood].actions.length]}</p>
              </button>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">How are you feeling?</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {moodOptions.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { setMood(m.key); setQuoteIndex(0); }}
                    className={`rounded-lg px-3 py-2 border text-sm ${mood === m.key ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200 hover:border-orange-300'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <button onClick={goNext} className="inline-flex items-center gap-2 rounded-full bg-orange-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-orange-700">
                  Next
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* 2. Health & Daily Routine */}
        <Section title="Health & Daily Routine">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Water Tracker</p>
                <span className="text-sm text-gray-600">{water}/8 glasses</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setWater(Math.max(0, water - 1))} className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200">-</button>
                <button onClick={() => setWater(Math.min(8, water + 1))} className="px-3 py-1.5 rounded bg-orange-600 text-white hover:bg-orange-700">+</button>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${(water/8)*100}%` }} />
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
                  <label key={k} className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-orange-300">
                    <input type="checkbox" checked={!!routine[k]} onChange={(e)=> setRoutine({ ...routine, [k]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Completion: <span className="font-semibold text-gray-900">{healthCompletion}%</span></div>
              <button onClick={()=> setShowHealthProgress(true)} className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm">View Progress</button>
            </div>

            {showHealthProgress && (
              <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={()=> setShowHealthProgress(false)}>
                <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e)=> e.stopPropagation()}>
                  <h3 className="text-lg font-semibold mb-2">Health Progress</h3>
                  <p className="text-sm text-gray-600 mb-4">Great going! Keep the streak alive.</p>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${healthCompletion}%` }} />
                  </div>
                  <div className="mt-3 text-sm">Estimated streak: <span className="font-medium">{Math.round(healthCompletion/20)} days</span></div>
                  <div className="mt-4 text-right">
                    <button onClick={()=> setShowHealthProgress(false)} className="rounded bg-gray-900 text-white px-4 py-2 text-sm">Close</button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2">
              <button onClick={goNext} className="inline-flex items-center gap-2 rounded-full bg-orange-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-orange-700">
                Next
              </button>
            </div>
          </div>
        </Section>

        {/* 3. Phase 1: Control & Reset */}
        <Section title="Phase 1: Control & Reset (21 Days)">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPhaseActive(!phaseActive)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${phaseActive ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white'}`}
              >
                {phaseActive ? 'Phase 1 Active' : 'Start Phase 1'}
              </button>
              <div className="text-sm text-gray-600">Focus: regain control over alcohol, sleep, calm.</div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                ['noDrink','No Drink Today'],
                ['sleep7','Slept 7+ Hours'],
                ['relaxMusic','10-min Relax Music'],
                ['journal','Journal Entry Done'],
              ].map(([k,label]) => (
                <label key={k} className={`flex items-center gap-2 p-2 rounded border ${p1[k] ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`}>
                  <input type="checkbox" disabled={!phaseActive} checked={!!p1[k]} onChange={(e)=> setP1({ ...p1, [k]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>

            <div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${p1Progress}%` }} />
              </div>
              <div className="mt-1 text-sm text-gray-600">Progress: {p1Progress}%</div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={markP1Complete} className="rounded bg-orange-600 text-white px-4 py-2 text-sm">Mark Day Complete</button>
              <button className="rounded bg-gray-900 text-white px-4 py-2 text-sm" onClick={goNext}>Next</button>
            </div>

            <p className="text-xs text-gray-500">“Proud of you Gaurav — tu broken nahi, bas restart kar raha hai.”</p>
          </div>
        </Section>

        {/* 4. Reflection & Journal */}
        <Section title="Reflection & Journal">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">How was your day? (1–10)</label>
                <input type="range" min="1" max="10" value={score} onChange={(e)=> setScore(parseInt(e.target.value))} className="w-full" />
                <div className="text-sm text-gray-600">Rating: {score}</div>
              </div>
              <div className="flex items-end">
                <button onClick={startVoice} className="rounded bg-gray-900 text-white px-4 py-2 text-sm w-full">🎙️ Voice</button>
              </div>
            </div>

            <textarea
              value={entry}
              onChange={(e)=> setEntry(e.target.value)}
              rows={4}
              placeholder="What did I learn today? Aaj ka sabse important moment kya tha?"
              className="w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <div className="flex items-center justify-between">
              <button onClick={saveEntry} className="rounded bg-orange-600 text-white px-4 py-2 text-sm">Save Reflection</button>
              <button onClick={goNext} className="rounded bg-gray-900 text-white px-4 py-2 text-sm">Next</button>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Old Reflections</h4>
              <div className="space-y-2 max-h-48 overflow-auto pr-1">
                {notes.length === 0 ? (
                  <div className="text-sm text-gray-500">No reflections yet.</div>
                ) : notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500">{new Date(n.at).toLocaleString()}</div>
                    <div className="text-sm mt-1">{n.text}</div>
                    <div className="text-xs text-gray-600 mt-1">Day score: {n.rating}/10</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <div className="text-center text-xs text-gray-500 py-4">“Tu unstoppable hai — har din ek naya chance.”</div>
    </div>
  );
}
