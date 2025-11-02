import React from 'react';
import Spline from '@splinetool/react-spline';

export default function HeroSpline() {
  return (
    <section className="relative h-[48vh] sm:h-[58vh] w-full overflow-hidden">
      <Spline
        scene="https://prod.spline.design/LU2mWMPbF3Qi1Qxh/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Stronger gradient for readability below */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-sm sm:text-base font-medium tracking-wide text-emerald-700">You Can Do It, I Believe in You.</p>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            Comeback Mode: ON
          </h1>
          <p className="mt-2 text-gray-600 max-w-xl mx-auto">
            Swipe through your motivation, routine, and growth. Hum saath hain — aaj se naya chapter.
          </p>
        </div>
      </div>
    </section>
  );
}
