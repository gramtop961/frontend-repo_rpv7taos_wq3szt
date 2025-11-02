import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Music2 } from 'lucide-react';

const DEFAULT_TRACK = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export default function TopBar() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackUrl, setTrackUrl] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // Load saved track URL
  useEffect(() => {
    const saved = localStorage.getItem('topbar_track_url') || DEFAULT_TRACK;
    setTrackUrl(saved);
    setInputValue(saved);
  }, []);

  // Keep audio src in sync
  useEffect(() => {
    if (audioRef.current && trackUrl) {
      audioRef.current.src = trackUrl;
    }
  }, [trackUrl]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    setError('');
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (e) {
      // Autoplay blocked or CORS issues. Prompt user to tap again or change URL.
      setError('Playback blocked or unsupported source. Tap play again or try a different direct MP3 URL.');
    }
  };

  const handleUrlApply = () => {
    const url = inputValue.trim();
    if (!url) return;
    setTrackUrl(url);
    localStorage.setItem('topbar_track_url', url);
    // Attempt to play new source if already in playing state
    if (isPlaying) {
      setTimeout(() => togglePlay(), 50);
    }
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 dark:bg-neutral-900/70 border-b border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause background audio' : 'Play background audio'}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <Music2 className="text-indigo-500" size={20} aria-hidden="true" />
          <span className="font-semibold">Comback Mode 2.0</span>
        </div>

        <div className="ml-auto flex items-center gap-2 w-full max-w-xl">
          <label htmlFor="trackUrl" className="sr-only">Audio track URL</label>
          <input
            id="trackUrl"
            type="url"
            inputMode="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste a direct MP3 URL"
            className="flex-1 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleUrlApply}
            className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Apply
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="max-w-6xl mx-auto px-4 pb-3 text-sm text-amber-700 dark:text-amber-300">
          {error}
        </div>
      )}

      <audio ref={audioRef} preload="none" />
    </header>
  );
}
