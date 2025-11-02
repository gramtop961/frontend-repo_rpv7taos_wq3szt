import React, { useRef, useState } from 'react';

function MusicButton() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = async () => {
    try {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (e) {
      alert('Autoplay blocked. Tap again to play.');
    }
  };

  // Royalty-free calm motivational track from Pixabay (streamed)
  const TRACK_URL = 'https://cdn.pixabay.com/audio/2022/08/09/audio_9a8a2b1f63.mp3';

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={TRACK_URL} preload="none" />
      <button
        onClick={togglePlay}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors border ${isPlaying ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        <span role="img" aria-label="headphones">🎧</span>
        <span className="text-sm font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  );
}

export default function TopBar() {
  return (
    <header className="w-full sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b border-white/30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600">Gaurav Version 2.0</div>
        <MusicButton />
      </div>
    </header>
  );
}
