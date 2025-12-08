import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

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
      ) => { dispose: () => void; play: () => void; pause: () => void; seek: (time: number) => void };
    };
  }
}

export function DemoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<{ dispose: () => void; play: () => void; pause: () => void; seek: (time: number) => void } | null>(null);

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

      const style = document.createElement('style');
      style.textContent = `
        .demo-carousel-player .ap-wrapper {
          background: #0d1117 !important;
        }
        .demo-carousel-player .ap-terminal {
          background: #0d1117 !important;
          padding: 16px !important;
        }
        .demo-carousel-player .ap-player {
          background: #0d1117 !important;
        }
        .demo-carousel-player .ap-control-bar {
          display: none !important;
        }
      `;
      document.head.appendChild(style);

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
        idleTimeLimit: 2,
        theme: 'dracula',
        fit: 'width',
        rows: 20,
        cols: 80,
        controls: false,
        pauseOnLostFocus: false,
        terminalFontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
        terminalFontSize: '14px'
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

  const restart = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.seek(0);
      playerInstanceRef.current.play();
      setIsPlaying(true);
    }
  };

  const currentDemo = demos[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-center gap-3">
        {demos.map((demo, index) => (
          <button
            key={demo.id}
            onClick={() => setCurrentIndex(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            Step {index + 1}
          </button>
        ))}
      </div>

      <div className="relative rounded-xl overflow-hidden bg-[#0d1117] border border-zinc-800 shadow-2xl">
        <div className="bg-[#161b22] px-4 py-3 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
            <div className="hidden sm:block h-4 w-px bg-zinc-700"></div>
            <span className="hidden sm:block text-xs text-zinc-500 font-mono">zsh</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={restart}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Restart"
            >
              <RotateCcw className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
              ) : (
                <Play className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
              )}
            </button>
          </div>
        </div>

        <div 
          ref={containerRef} 
          className="demo-carousel-player w-full"
          style={{ 
            background: '#0d1117',
            minHeight: '380px',
            maxHeight: '420px',
            overflow: 'hidden'
          }}
        >
          {!playerLoaded && (
            <div className="flex items-center justify-center h-[380px]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all"
          aria-label="Previous demo"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all"
          aria-label="Next demo"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="mt-5 text-center">
        <h3 className="text-lg font-semibold text-white mb-1">
          {currentDemo?.title}
        </h3>
        <p className="text-zinc-500 text-sm">
          {currentDemo?.description}
        </p>
      </div>
    </div>
  );
}
