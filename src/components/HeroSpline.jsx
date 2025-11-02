import React from 'react';
import Spline from '@splinetool/react-spline';

// System-provided calming cover background (hourglass with glowing sand)
const SCENE_URL = 'https://prod.spline.design/qMOKV671Z1CM9yS7/scene.splinecode';

export default function HeroSpline() {
  return (
    <div className="relative h-full w-full">
      <Spline scene={SCENE_URL} style={{ width: '100%', height: '100%' }} />
      {/* Soft gradient to improve contrast for any overlay text; non-blocking for pointer events */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0b10]/20 to-[#0a0b10]/60" />
    </div>
  );
}
