/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
        .demo-player .ap-wrapper,
        .demo-player .ap-terminal,
        .demo-player .ap-player {
          background: #0d1117 !important;
        }
        .demo-player .ap-terminal {
          padding: 16px !important;
        }
        .demo-player .ap-control-bar {
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

  const restart = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.seek(0);
      playerInstanceRef.current.play();
      setIsPlaying(true);
    }
  };

  const currentDemo = demos[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-center gap-2">
        {demos.map((demo, index) => (
          <button
            key={demo.id}
            onClick={() => setCurrentIndex(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              index === currentIndex
                ? 'bg-white text-black border-black'
                : 'bg-zinc-900 text-zinc-400 border-black hover:bg-zinc-800 hover:text-white'
            }`}
          >
            Step {index + 1}
          </button>
        ))}
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-[#0d1117] border border-black shadow-2xl">
        <div className="bg-[#161b22] border-b border-black px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 bg-[#0d1117] rounded-lg border border-black">
                <span className="text-sm text-zinc-400 font-mono">neurolint-security</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={restart}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors border border-black"
                aria-label="Restart"
              >
                <RotateCcw className="w-4 h-4 text-zinc-400" />
              </button>
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors border border-black"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-zinc-400" />
                ) : (
                  <Play className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div 
          ref={containerRef} 
          className="demo-player w-full"
          style={{ 
            background: '#0d1117',
            minHeight: '380px',
            maxHeight: '420px',
            overflow: 'hidden'
          }}
        >
          {!playerLoaded && (
            <div className="flex items-center justify-center h-[380px]">
              <span className="text-zinc-500 text-sm">Loading...</span>
            </div>
          )}
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-900/90 border border-black hover:bg-zinc-800 transition-all"
          aria-label="Previous demo"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-900/90 border border-black hover:bg-zinc-800 transition-all"
          aria-label="Next demo"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <div className="bg-[#161b22] border-t border-black px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-zinc-500 font-mono">
            {currentDemo?.title}
          </div>
          <div className="text-xs text-zinc-600">
            {currentIndex + 1} / {demos.length}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-zinc-500 text-sm">
        {currentDemo?.description}
      </p>
    </div>
  );
}
