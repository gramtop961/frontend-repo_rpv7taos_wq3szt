import React, { useRef, useState } from 'react';

function MusicButton() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');

  const ensureReady = () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.muted = false; // ensure not muted on iOS
      a.playsInline = true;
      a.crossOrigin = 'anonymous';
      if (a.readyState < 2) a.load();
    } catch {}
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    ensureReady();
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setError('');
      }
    } catch (e) {
      // Some browsers reject first attempt; a second tap after load usually works
      setError('Tap once more to start playback.');
      try { await audioRef.current.play(); setIsPlaying(true); setError(''); } catch {}
    }
  };

  // Calm, royalty-free track (reliable CORS)
  const TRACK_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={TRACK_URL} preload="auto" crossOrigin="anonymous" />
      <button
        onClick={togglePlay}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors border ${isPlaying ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        <span role="img" aria-label="headphones">🎧</span>
        <span className="text-sm font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
      </button>
      {error && <span className="text-xs text-slate-500">{error}</span>}
    </div>
  );
}

export default function TopBar() {
  return (
    <header className="w-full sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b border-white/30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg sm:text-xl font-semibold tracking-tight text-indigo-700">Gaurav Version 2.0</div>
        <MusicButton />
      </div>
    </header>
  );
}
