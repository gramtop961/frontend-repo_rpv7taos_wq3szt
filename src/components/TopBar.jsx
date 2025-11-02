import React from 'react';

function MusicButton() {
  const handlePlay = () => {
    // Open official track on YouTube in a new tab (user gesture ensures playback)
    window.open('https://www.youtube.com/watch?v=YaEG2aWJnZ8', '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handlePlay}
      className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 px-3 py-1.5 transition-colors"
      aria-label="Play Unstoppable by Sia"
    >
      <span role="img" aria-label="headphones">🎧</span>
      <span className="text-sm font-medium">Play</span>
    </button>
  );
}

export default function TopBar() {
  return (
    <header className="w-full sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/30 bg-white/60 border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg sm:text-xl font-bold tracking-tight text-orange-500">Gaurav Version 2.0</div>
        <MusicButton />
      </div>
    </header>
  );
}
