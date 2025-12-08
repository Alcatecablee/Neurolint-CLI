import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Demo {
  id: string;
  title: string;
  description: string;
  file: string;
}

const demos: Demo[] = [
  {
    id: 'patch',
    title: 'Step 1: Patch Vulnerability',
    description: 'Detect and patch CVE-2025-55182 in seconds',
    file: '/demo-step1-patch.cast'
  },
  {
    id: 'scan',
    title: 'Step 2: Scan for Compromise',
    description: 'Detect post-breach infections with 70 IoC signatures',
    file: '/demo-step2-scan.cast'
  },
  {
    id: 'action',
    title: 'Step 3: Complete Action Plan',
    description: 'Full security workflow: patch, scan, baseline',
    file: '/demo-step3-action.cast'
  }
];

declare global {
  interface Window {
    AsciinemaPlayer: {
      create: (
        src: string,
        container: HTMLElement,
        options?: Record<string, unknown>
      ) => { dispose: () => void; play: () => void; pause: () => void };
    };
  }
}

export function DemoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<{ dispose: () => void; play: () => void; pause: () => void } | null>(null);

  useEffect(() => {
    const loadAsciinemaPlayer = () => {
      if (window.AsciinemaPlayer) {
        setPlayerLoaded(true);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/asciinema-player@3/dist/bundle/asciinema-player.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/asciinema-player@3/dist/bundle/asciinema-player.min.js';
      script.onload = () => setPlayerLoaded(true);
      document.body.appendChild(script);
    };

    loadAsciinemaPlayer();
  }, []);

  useEffect(() => {
    if (!playerLoaded || !containerRef.current || !window.AsciinemaPlayer) return;

    if (playerInstanceRef.current) {
      playerInstanceRef.current.dispose();
    }

    containerRef.current.innerHTML = '';

    const currentDemo = demos[currentIndex];
    if (!currentDemo) return;

    playerInstanceRef.current = window.AsciinemaPlayer.create(
      currentDemo.file,
      containerRef.current,
      {
        autoPlay: isPlaying,
        loop: true,
        speed: 1,
        idleTimeLimit: 3,
        theme: 'monokai',
        fit: 'width',
        rows: 24,
        cols: 80,
        controls: false,
        pauseOnLostFocus: false
      }
    );

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.dispose();
        playerInstanceRef.current = null;
      }
    };
  }, [playerLoaded, currentIndex, isPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? demos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === demos.length - 1 ? 0 : prev + 1));
  };

  const togglePlay = () => {
    if (playerInstanceRef.current) {
      if (isPlaying) {
        playerInstanceRef.current.pause();
      } else {
        playerInstanceRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const currentDemo = demos[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
        <div className="bg-zinc-800/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="ml-3 text-sm text-zinc-400 font-mono">neurolint-demo</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-zinc-300" />
              ) : (
                <Play className="w-4 h-4 text-zinc-300" />
              )}
            </button>
          </div>
        </div>

        <div 
          ref={containerRef} 
          className="w-full min-h-[400px] md:min-h-[450px]"
          style={{ 
            background: '#1a1a2e',
            fontSize: '14px'
          }}
        >
          {!playerLoaded && (
            <div className="flex items-center justify-center h-[400px] md:h-[450px]">
              <div className="text-zinc-500 animate-pulse">Loading demo...</div>
            </div>
          )}
        </div>

        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            onClick={goToPrevious}
            className="ml-2 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all opacity-70 hover:opacity-100"
            aria-label="Previous demo"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={goToNext}
            className="mr-2 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all opacity-70 hover:opacity-100"
            aria-label="Next demo"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          {currentDemo?.title}
        </h3>
        <p className="text-zinc-400 text-sm mb-4">
          {currentDemo?.description}
        </p>
        
        <div className="flex items-center justify-center gap-2">
          {demos.map((demo, index) => (
            <button
              key={demo.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-zinc-600 hover:bg-zinc-500'
              }`}
              aria-label={`Go to ${demo.title}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
