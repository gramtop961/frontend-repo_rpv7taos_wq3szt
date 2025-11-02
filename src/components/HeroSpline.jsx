import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroSpline() {
  return (
    <section className="relative h-[60vh] sm:h-[70vh] md:h-[75vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/qMOKV671Z1CM9yS7/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-white/80 dark:from-neutral-900/20 dark:via-neutral-900/0 dark:to-neutral-900/80" />

      <div className="relative z-10 h-full flex items-end">
        <div className="max-w-6xl mx-auto px-4 pb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400">
            Comeback Mode 2.0
          </h1>
          <p className="mt-2 text-neutral-700 dark:text-neutral-300 max-w-2xl">
            Track mood, water, reflections, and habits daily. Breathe, reset, and visualize your progress.
          </p>
        </div>
      </div>
    </section>
  );
}
