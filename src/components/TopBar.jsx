import React, { useEffect, useRef, useState } from 'react';

// Reliable, CORS-friendly default track. You can paste a custom URL in the input.
const DEFAULT_TRACK = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export default function TopBar() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [trackUrl, setTrackUrl] = useState(() => {
    try {
      return localStorage.getItem('musicTrackUrl') || DEFAULT_TRACK;
    } catch {
      return DEFAULT_TRACK;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('musicTrackUrl', trackUrl);
    } catch {}
  }, [trackUrl]);

  const ensureReady = async () => {
    if (!audioRef.current) return;
    try {
      // Reset and load to ensure latest URL is used
      audioRef.current.pause();
      await audioRef.current.load?.();
      await audioRef.current.play();
      setIsPlaying(true);
      setErrorMsg('');
    } catch (err) {
      setIsPlaying(false);
      setErrorMsg('Tap the play button again to start the music (autoplay was blocked).');
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await ensureReady();
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600/80">🎧</span>
          <span className="text-sm text-indigo-200/90 hidden sm:block">Focus Music</span>
        </div>

        <button
          onClick={togglePlay}
          className={`ml-2 px-3 py-1.5 rounded-md text-sm border transition-colors ${
            isPlaying ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 border-white/15 hover:bg-white/15'
          }`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="ml-3 flex-1 min-w-0">
          <input
            value={trackUrl}
            onChange={(e) => setTrackUrl(e.target.value)}
            placeholder="Paste a track URL (e.g., Unstoppable by Sia stream)"
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/60"
          />
        </div>

        <audio
          ref={audioRef}
          src={trackUrl}
          preload="none"
          controls={false}
          crossOrigin="anonymous"
        />
      </div>
      {errorMsg && (
        <div className="mx-auto max-w-6xl px-4 pb-2 text-xs text-amber-300">{errorMsg}</div>
      )}
    </header>
  );
}
