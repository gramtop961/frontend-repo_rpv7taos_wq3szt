import React from 'react';
import TopBar from './components/TopBar';
import HeroSpline from './components/HeroSpline';
import SwipeDeck from './components/SwipeDeck';
import AnalyticsPanel from './components/AnalyticsPanel';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-50">
      <TopBar />
      <HeroSpline />
      <SwipeDeck />
      <AnalyticsPanel />
      <footer className="max-w-6xl mx-auto px-4 py-10 text-xs text-neutral-500">
        Built for your daily comeback — mood, water, reflections, habits, breath.
      </footer>
    </div>
  );
}
