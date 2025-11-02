import React from 'react';
import TopBar from './components/TopBar';
import HeroSpline from './components/HeroSpline';
import SwipeDeck from './components/SwipeDeck';

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white text-gray-900">
      <TopBar />
      <HeroSpline />
      <main className="max-w-[100vw] overflow-hidden">
        <div className="w-full flex justify-center">
          <div className="w-full">
            <SwipeDeck />
          </div>
        </div>
      </main>
      <footer className="py-8 text-center text-sm text-gray-500">
        Tu ruk gaya tha Gaurav, khatam nahi hua. Ab comeback ka time hai.
      </footer>
    </div>
  );
}
