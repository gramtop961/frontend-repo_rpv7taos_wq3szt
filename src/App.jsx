import React from 'react';
import TopBar from './components/TopBar.jsx';
import HeroSpline from './components/HeroSpline.jsx';
import SwipeDeck from './components/SwipeDeck.jsx';
import AnalyticsPanel from './components/AnalyticsPanel.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-[#0a0b10] text-white font-inter">
      <TopBar />
      <section className="relative h-[52vh] md:h-[60vh] w-full overflow-hidden">
        <HeroSpline />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70"></div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="px-4 py-2 rounded-full bg-white/10 backdrop-blur text-sm md:text-base border border-white/10">Comeback Mode: ON</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        <SwipeDeck />
        <AnalyticsPanel />
      </section>
    </div>
  );
}
