import React, { useEffect, useState, useRef } from "react";
import { FAQSection } from "./FAQSection";
import { ModalDemo } from "./components/ModalDemo";
import { LayersDocSection } from "./components/LayersDocSection";
import { LandingFooter } from "./LandingFooter";
import 'asciinema-player/dist/bundle/asciinema-player.css';

import {
  Target,
  Zap,
  Search,
  Puzzle,
  BarChart3,
  Atom,
  Settings,
  Copy,
  Check,
  GitBranch,
  Shield,
  RefreshCw,
  CheckSquare,
  FileCheck,
  X,
} from "lucide-react";
import { InstallCTA } from "./components/InstallCTA";

// Security Alert Modal Component - Critical CVE notification
const SecurityAlertModal = ({ onClose }: { onClose: () => void }) => {
  const [copied, setCopied] = React.useState(false);
  
  const copyCommand = () => {
    navigator.clipboard.writeText('npx @neurolint/cli security:cve-2025-55182 . --fix');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-black rounded-xl shadow-2xl animate-slide-in-up">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                Critical Security Vulnerability
              </h2>
              <p className="text-sm text-gray-400">
                CVE-2025-55182 | CVSS 10.0
              </p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-gray-300">
              A critical remote code execution vulnerability affects all React 19 apps using Server Components. Patch immediately.
            </p>
            
            <div className="bg-zinc-800 border border-black rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">One-Command Fix</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-white font-mono">
                  npx @neurolint/cli security:cve-2025-55182 . --fix
                </code>
                <button
                  onClick={copyCommand}
                  className="p-2 bg-zinc-700 hover:bg-zinc-600 border border-black rounded-lg transition-colors"
                  aria-label="Copy command"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/blog/cve-2025-55182-react-server-components-rce"
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-black text-white rounded-lg font-medium text-sm text-center transition-colors"
            >
              Learn More
            </a>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-semibold text-sm transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Beta Banner Component - Floating notification style (mobile-first)
const BetaBanner = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-50 max-w-sm animate-slide-in-up">
      <div className="bg-zinc-900/95 backdrop-blur-md border border-black rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-black">
            <span className="text-sm">Beta</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="text-white font-medium">NeuroLint CLI is in beta.</span>{" "}
              We'd love your feedback and contributions!
            </p>
            <a 
              href="https://github.com/Alcatecablee/Neurolint-CLI/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Share feedback
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
            aria-label="Close banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Lazy Loading Hook
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView] as const;
};

// TypewriterHeadline Component
const TypewriterHeadline = () => {
  const [currentText, setCurrentText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);

  const words = [
    "Stop Hydration Crashes",
    "Kill Missing Keys",
    "Fix ESLint Errors",
    "Prevent Deploy Bugs",
    "Ship Clean Code",
  ];

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenWords = 2000;

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    if (currentIndex < currentWord.length) {
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev + currentWord[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);
    } else {
      timeout = setTimeout(
        () => {
          if (currentText.length > 0) {
            setCurrentText((prev) => prev.slice(0, -1));
          } else {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
            setCurrentIndex(0);
          }
        },
        currentText.length === currentWord.length
          ? delayBetweenWords
          : deletingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, currentText, currentWordIndex, words]);

  return (
    <div className="mb-8 md:mb-12 h-[48px] xs:h-[56px] sm:h-[72px] md:h-[84px] lg:h-[100px] flex items-center justify-center">
      <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white whitespace-nowrap">
        {currentText}
      </h1>
    </div>
  );
};

// CLI Demo Player Component with real asciinema player - Enterprise Edition
const AsciinemaPlayerComponent = () => {
  const playerRef = React.useRef<HTMLDivElement>(null);
  const playerInstance = React.useRef<any>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [player, setPlayer] = React.useState<any>(null);
  const [showControls, setShowControls] = React.useState(true);

  // Dynamically import the player module
  React.useEffect(() => {
    import('asciinema-player').then((p) => {
      setPlayer(p);
    });
  }, []);

  // Create and dispose player instance
  React.useEffect(() => {
    if (!player || !playerRef.current || playerInstance.current) return;

    try {
      playerInstance.current = player.create(
        '/demo-new.cast',
        playerRef.current,
        {
          autoPlay: true,
          loop: true,
          speed: speed,
          fit: 'width',
          theme: 'monokai',
          fontSize: 'medium',
          terminalFontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
        }
      );

      setIsPlaying(true);

      const intervalId = setInterval(() => {
        if (playerInstance.current) {
          setCurrentTime(playerInstance.current.getCurrentTime() || 0);
          setDuration(playerInstance.current.getDuration() || 0);
        }
      }, 100);

      return () => {
        clearInterval(intervalId);
        if (playerInstance.current) {
          try {
            playerInstance.current.dispose();
          } catch (e) {
            // Ignore disposal errors
          }
          playerInstance.current = null;
        }
      };
    } catch (error) {
      console.error('Failed to load asciinema player:', error);
      return;
    }
  }, [player, speed]);

  const togglePlayPause = () => {
    if (!playerInstance.current) return;
    
    if (isPlaying) {
      playerInstance.current.pause();
      setIsPlaying(false);
    } else {
      playerInstance.current.play();
      setIsPlaying(true);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    if (nextSpeed !== undefined) {
      setSpeed(nextSpeed);
      if (playerInstance.current) {
        playerInstance.current.setSpeed(nextSpeed);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerInstance.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    playerInstance.current.seek(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full relative group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Player Container with enhanced styling */}
      <div 
        ref={playerRef} 
        className="w-full overflow-hidden"
        style={{ 
          minHeight: '450px',
          background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        }}
      />
      
      {/* Enterprise-grade Control Bar */}
      <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        
        <div className="relative px-5 py-4">
          {/* Progress Bar - Sleek design */}
          <div 
            className="group/progress flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer mb-4 hover:h-2 transition-all duration-200"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-100 relative"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              {/* Glow effect on progress */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-emerald-500/50 opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-6">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause Button - Refined */}
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Time Display - Minimal */}
              <div className="text-white/80 text-sm font-mono tracking-wide">
                <span className="text-white">{formatTime(currentTime)}</span>
                <span className="text-white/40 mx-1">/</span>
                <span className="text-white/60">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Speed Control - Pill style */}
              <button 
                onClick={changeSpeed}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-xs font-mono transition-all duration-200 border border-black"
                aria-label={`Playback speed: ${speed}x`}
              >
                {speed}x
              </button>

              {/* Live indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-black">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Index() {
  const [mounted, setMounted] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [bannerVisible, setBannerVisible] = React.useState(true);
  const [demoModalOpen, setDemoModalOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Lazy loading refs for each section
  const [demoSectionRef, demoSectionInView] = useInView(0.1);
  const [howItWorksSectionRef, howItWorksInView] = useInView(0.2);
  const [orchestrationSectionRef, orchestrationSectionInView] = useInView(0.2);
  const [faqSectionRef, faqSectionInView] = useInView(0.2);
  const [finalCtaSectionRef, finalCtaSectionInView] = useInView(0.2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm install -g @neurolint/cli');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".feature-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const [securityBannerVisible, setSecurityBannerVisible] = React.useState(true);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden" id="main-content">
      {/* Security Alert Modal */}
      {securityBannerVisible && <SecurityAlertModal onClose={() => setSecurityBannerVisible(false)} />}
      
      {/* Beta Banner */}
      {bannerVisible && <BetaBanner onClose={() => setBannerVisible(false)} />}

      {/* Global Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-green-500/15 to-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header - Mobile First */}
      <nav 
        className="fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-black transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <a href="/" className="flex items-center group">
              <img src="/logo.png" alt="NeuroLint" className="h-8 md:h-9 transition-transform duration-200 group-hover:scale-105" />
            </a>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 touch-manipulation"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <a 
                href="#comprehensive-demo" 
                className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Demo
              </a>
              <a 
                href="/quick-start" 
                className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Quick Start
              </a>
              <a 
                href="#faq" 
                className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                FAQ
              </a>
              <a 
                href="/blog" 
                className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Blog
              </a>
              <a 
                href="https://github.com/Alcatecablee/Neurolint-CLI/blob/main/CLI_USAGE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Docs
              </a>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <a 
                href="https://github.com/Alcatecablee/Neurolint-CLI"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://www.npmjs.com/package/@neurolint/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 px-5 py-2 min-h-[44px] flex items-center bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 text-sm"
              >
                Install
              </a>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        <div 
          className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${
            mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-4 space-y-2 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800">
            <a 
              href="#comprehensive-demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
            >
              Demo
            </a>
            <a 
              href="/quick-start" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
            >
              Quick Start
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
            >
              FAQ
            </a>
            <a 
              href="/blog" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
            >
              Blog
            </a>
            <a 
              href="https://github.com/Alcatecablee/Neurolint-CLI/blob/main/CLI_USAGE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
            >
              Docs
            </a>
            <div className="border-t border-zinc-800 my-3"></div>
            <div className="flex items-center gap-3 px-4">
              <a 
                href="https://github.com/Alcatecablee/Neurolint-CLI"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center text-gray-300 hover:text-white bg-white/5 rounded-lg transition-all duration-200 touch-manipulation"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://www.npmjs.com/package/@neurolint/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-5 py-3 min-h-[48px] flex items-center justify-center bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 text-base touch-manipulation"
              >
                Install CLI
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center justify-center text-center px-4 py-16 pt-20 relative"
        aria-label="Hero section"
        role="main"
      >

        <div className="max-w-6xl mx-auto z-10 animate-fade-in-blur">
          <div className="mb-6 md:mb-8 animate-slide-in-down animate-delay-200">
            <span
              className="inline-block px-4 md:px-5 py-1.5 md:py-2 bg-white text-black rounded-full text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-shadow duration-300 cursor-default"
              role="banner"
              aria-label="Product category"
            >
              The Only Tool That Actually Fixes Your Code
            </span>
          </div>

          <TypewriterHeadline />

          <div className="mb-8 md:mb-10 animate-slide-in-up animate-delay-500">
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              While other tools tell you what's wrong, we{" "}
              <span className="text-white font-bold">
                actually fix your code
              </span>
              . Rule-based transformations (not AI) with{" "}
              <span className="text-white font-bold">
                deterministic fixes in seconds
              </span>
              .
            </p>
          </div>

          {/* Install Command */}
          <div className="mb-6 md:mb-8 animate-slide-in-up animate-delay-700">
            <div className="max-w-2xl mx-auto bg-zinc-900/80 border border-black rounded-xl p-4 md:p-5 backdrop-blur-sm relative group hover:border-black transition-colors duration-300">
              <code className="text-blue-400 font-mono text-sm md:text-base lg:text-lg block text-center pr-10">
                $ npm install -g @neurolint/cli
              </code>
              <button
                onClick={copyToClipboard}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-md transition-colors"
                aria-label="Copy install command"
              >
                {copied ? (
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                ) : (
                  <Copy className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up animate-delay-800">
            <a
              href="#comprehensive-demo"
              className="group relative px-8 md:px-10 py-3.5 md:py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 ease-out flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black touch-manipulation min-h-[48px]"
              aria-label="Try interactive demo - scroll to demo section"
            >
              Try Interactive Demo
              <svg
                className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300 ease-out"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
          </div>

        </div>
      </section>

      {/* CLI Demo Video Section - Enterprise Edition (mobile-first) */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-black rounded-full mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live Demo</span>
            </div>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 tracking-tight text-white">
              See It In Action
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto">
              Watch NeuroLint analyze <span className="text-white font-medium">288 files</span> and automatically fix issues in seconds
            </p>
          </div>
          
          {/* Premium Video Preview Card */}
          <div className="relative group">
            {/* Outer glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-[#0d1117] rounded-2xl border border-black shadow-2xl overflow-hidden">
              {/* macOS-style window header */}
              <div className="bg-[#161b22] border-b border-black px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Traffic lights */}
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm shadow-red-500/30" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-sm shadow-yellow-500/30" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-sm shadow-green-500/30" />
                    </div>
                    {/* Tab-style title */}
                    <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1.5 bg-[#0d1117] rounded-lg border border-black">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-zinc-400 font-mono">neurolint-demo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600 font-mono hidden md:block">zsh</span>
                  </div>
                </div>
              </div>
              
              {/* Terminal content preview - clickable */}
              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-inset touch-manipulation"
                aria-label="Open demo video"
              >
                <div className="relative bg-[#0d1117] p-4 sm:p-6 md:p-10 lg:p-12 min-h-[200px] sm:min-h-[240px] md:min-h-[320px]">
                  {/* Scanline effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
                  
                  {/* Terminal Preview Lines - Mobile optimized */}
                  <div className="font-mono text-[10px] xs:text-xs sm:text-sm md:text-base space-y-1 sm:space-y-2 text-left max-w-3xl opacity-70 group-hover:opacity-50 transition-opacity duration-300 overflow-hidden">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-emerald-400">$</span>
                      <span className="text-white truncate">npm install -g @neurolint/cli</span>
                    </div>
                    <div className="text-zinc-500 text-[10px] xs:text-xs hidden xs:block">added 132 packages in 37s</div>
                    <div className="mt-2 sm:mt-4 flex items-center gap-1 sm:gap-2">
                      <span className="text-emerald-400">$</span>
                      <span className="text-white truncate">neurolint analyze . --verbose</span>
                    </div>
                    <div className="text-zinc-400 truncate">Processing <span className="text-cyan-400">288 files</span>...</div>
                    <div className="hidden sm:flex flex-wrap gap-x-4 gap-y-1 text-zinc-400">
                      <span>[ANALYZED] <span className="text-zinc-300">src/hooks/use-local-storage.ts</span></span>
                    </div>
                    <div className="text-zinc-400 pl-2 sm:pl-4 text-[10px] xs:text-xs sm:text-sm">Issues: <span className="text-amber-400 font-medium">10</span> | Layers: <span className="text-cyan-400">4, 5</span></div>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                      <span className="text-emerald-400">$</span>
                      <span className="text-white truncate">neurolint fix . --all-layers</span>
                    </div>
                    <div className="text-emerald-400 text-[10px] xs:text-xs sm:text-sm">[SUCCESS] <span className="text-white">156 fixes</span> in 2.3s</div>
                  </div>
                  
                  {/* Premium Play Button Overlay - Mobile optimized */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Pulsing ring */}
                      <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 rounded-full animate-ping opacity-20" />
                      {/* Main button */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-black group-hover:from-white/30 group-hover:to-white/10 group-hover:scale-110 transition-all duration-300 shadow-2xl">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-0.5 sm:ml-1 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom status bar - Mobile optimized */}
                <div className="bg-[#161b22] border-t border-black px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-zinc-500">
                    <span className="flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-mono">1:00</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-2">
                      <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Real CLI Recording</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-white group-hover:text-emerald-400 transition-colors">
                    <span className="text-xs sm:text-sm font-medium">Watch Demo</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          {/* CTA for CLI Demo Section */}
          <InstallCTA className="mt-12" />
        </div>
      </section>
      
      {/* Demo Video Modal - Enterprise Edition */}
      {demoModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
            onClick={() => setDemoModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden animate-fade-in-blur">
            {/* Outer glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-blue-500/30 rounded-2xl blur-md opacity-50" />
            
            <div className="relative bg-[#0d1117] rounded-2xl border border-black shadow-2xl overflow-hidden">
              {/* macOS-style Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-black">
                <div className="flex items-center gap-4">
                  {/* Traffic lights - functional */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDemoModalOpen(false)}
                      className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors shadow-sm shadow-red-500/30 group"
                      aria-label="Close"
                    >
                      <span className="sr-only">Close</span>
                    </button>
                    <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-sm shadow-yellow-500/30" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-sm shadow-green-500/30" />
                  </div>
                  {/* Title */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] rounded-lg border border-black">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 id="demo-modal-title" className="text-sm text-zinc-400 font-mono">neurolint-demo</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Live badge */}
                  <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-black">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">LIVE</span>
                  </div>
                  {/* Close button */}
                  <button
                    onClick={() => setDemoModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-zinc-500 hover:text-white"
                    aria-label="Close demo"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              {/* Player Container */}
              <div className="relative overflow-hidden bg-[#0d1117]">
                <AsciinemaPlayerComponent />
              </div>
              
              {/* Modal Footer - Minimal */}
              <div className="px-4 py-3 bg-[#161b22] border-t border-black flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span className="hidden sm:block">Hover for controls</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-zinc-800 rounded border border-black font-mono text-xs text-zinc-400">Space</kbd>
                    <span className="text-xs text-zinc-500">pause/play</span>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-zinc-800 rounded border border-black font-mono text-xs text-zinc-400">Esc</kbd>
                    <span className="text-xs text-zinc-500">close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Demo Section */}
      <div ref={demoSectionRef} id="comprehensive-demo" className={`transition-all duration-1000 transform ${
        demoSectionInView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-20'
      }`}>
        <ModalDemo />
      </div>

      {/* Layers Documentation Section */}
      <LayersDocSection />

      {/* Featured On Section - Static Grid */}
      <section className="py-16 md:py-24 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <p className="text-sm uppercase tracking-widest text-zinc-500 font-medium">
              Featured On
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12">
            <a 
              href="https://www.producthunt.com/products/neurolint-cli?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-neurolint-cli" 
              target="_blank"
              rel="noopener noreferrer"
              className="group transition-all duration-300 hover:scale-105 hover:opacity-90"
            >
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1043969&theme=dark&t=1764635497036" 
                alt="NeuroLint CLI on Product Hunt" 
                width="220" 
                height="48"
                className="h-10 sm:h-12 w-auto drop-shadow-lg"
              />
            </a>
            
            <a 
              href="https://startupfa.me/s/neurolint-cli?utm_source=neurolint.dev" 
              target="_blank"
              rel="noopener noreferrer"
              className="group transition-all duration-300 hover:scale-105 hover:opacity-90"
            >
              <img 
                src="https://startupfa.me/badges/featured/dark-small-rounded.webp" 
                alt="Featured on Startup Fame" 
                width="200" 
                height="32"
                className="h-8 sm:h-9 w-auto drop-shadow-lg"
              />
            </a>
            
            <a 
              href="https://dang.ai/" 
              target="_blank"
              rel="noopener noreferrer"
              className="group transition-all duration-300 hover:scale-105 hover:opacity-90"
            >
              <img 
                src="https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png" 
                alt="Featured on Dang.ai" 
                width="140" 
                height="48"
                className="h-10 sm:h-12 w-auto drop-shadow-lg"
              />
            </a>
            
            <a 
              href="https://wired.business" 
              target="_blank"
              rel="noopener noreferrer"
              className="group transition-all duration-300 hover:scale-105 hover:opacity-90"
            >
              <img 
                src="https://wired.business/badge0-dark.svg" 
                alt="Featured on Wired Business" 
                width="180" 
                height="48"
                className="h-10 sm:h-12 w-auto drop-shadow-lg"
              />
            </a>
            
            <a 
              href="https://github.com/Alcatecablee/Neurolint-CLI/stargazers" 
              target="_blank"
              rel="noopener noreferrer"
              className="group transition-all duration-300 hover:scale-105 hover:opacity-90"
            >
              <img 
                src="https://img.shields.io/github/stars/Alcatecablee/Neurolint-CLI?style=for-the-badge&logo=github&logoColor=white&labelColor=181717&color=181717" 
                alt="GitHub Stars" 
                height="28"
                className="h-7 sm:h-8 w-auto drop-shadow-lg"
              />
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section - Simplified and moved up */}
      <section ref={howItWorksSectionRef} className="py-16 md:py-24 px-4" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ease-out transform ${
            howItWorksInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-20'
          }`}>
            <h2 
              id="how-it-works-heading"
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white transition-all duration-700 delay-100 ease-out transform px-4 ${
                howItWorksInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              One Command, Thousands of Fixes
            </h2>
            <p className={`text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium transition-all duration-700 delay-200 ease-out transform px-4 ${
              howItWorksInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              Unlike other tools that suggest fixes, we actually apply them automatically
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Install",
                description:
                  "npm install -g @neurolint/cli - One command to install the free CLI tool globally",
              },
              {
                step: "02",
                title: "Analyze",
                description:
                  "neurolint analyze src/ - Scan your codebase and detect hydration crashes, missing keys, and ESLint errors",
              },
              {
                step: "03",
                title: "Fix",
                description:
                  "neurolint fix --all-layers - Apply automatic fixes with built-in backups. Rollback anytime if needed.",
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`group relative transition-all duration-700 ease-out transform ${
                  howItWorksInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-20 scale-95'
                }`}
                style={{ transitionDelay: `${(index * 150) + 400}ms` }}
              >
                <div className="relative p-6 md:p-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl border-2 border-black rounded-2xl transition-all duration-300 ease-out hover:bg-gradient-to-br hover:from-white/8 hover:to-white/4 hover:border-black min-h-[280px] sm:min-h-[320px] flex flex-col shadow-lg hover:shadow-2xl focus-within:ring-2 focus-within:ring-white/30 focus-within:ring-offset-2 focus-within:ring-offset-black">
                  <div className="text-4xl md:text-5xl font-black text-white mb-3 md:mb-4" aria-hidden="true">
                    {item.step}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-medium text-sm md:text-base flex-grow">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA for How It Works Section */}
          <InstallCTA className="mt-16" />
        </div>
      </section>

      {/* Orchestration Pattern Section */}
      <section ref={orchestrationSectionRef} className="py-20 md:py-32 px-4 bg-gradient-to-b from-black via-zinc-900/30 to-black">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-700 ease-out transform ${
            orchestrationSectionInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-20'
          }`}>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white transition-all duration-700 delay-100 ease-out transform ${
              orchestrationSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              Why NeuroLint Never Breaks Your Code
            </h2>
            <p className={`text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed transition-all duration-700 delay-200 ease-out transform ${
              orchestrationSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              The 5-Step Fail-Safe Orchestration System That AI Tools Can't Match
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
            {[
              {
                stage: "1",
                title: "AST Transform",
                description: "Try precise code transformation using Abstract Syntax Tree parsing for deep structural understanding.",
                Icon: GitBranch
              },
              {
                stage: "2",
                title: "First Validation",
                description: "Immediately validate the AST result to ensure code remains syntactically correct and semantically sound.",
                Icon: FileCheck
              },
              {
                stage: "3",
                title: "Regex Fallback",
                description: "If AST or validation fails, fall back to regex-based transformation as a safety net.",
                Icon: RefreshCw
              },
              {
                stage: "4",
                title: "Second Validation",
                description: "Re-validate the regex result with the same strict checks. Every path must pass validation — no shortcuts.",
                Icon: CheckSquare
              },
              {
                stage: "5",
                title: "Accept or Revert",
                description: "Only apply changes if validation passed. If validation fails at any step, automatically revert to last known good state.",
                Icon: Shield
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl p-6 md:p-8 rounded-2xl border-2 border-black hover:border-black hover:from-white/8 hover:to-white/4 transition-all duration-700 ease-out transform shadow-lg hover:shadow-2xl ${
                  orchestrationSectionInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-20 scale-95'
                }`}
                style={{ transitionDelay: `${(index * 100) + 400}ms` }}
              >
                <div className="mb-4">
                  <item.Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-white mb-3">Stage {item.stage}</div>
                <h3 className="text-lg md:text-xl font-bold mb-3 text-white leading-tight">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className={`max-w-6xl mx-auto space-y-12 transition-all duration-700 ease-out transform ${
            orchestrationSectionInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-20'
          }`} style={{ transitionDelay: '850ms' }}>
            
            {/* AI Tools vs NeuroLint Comparison */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-black shadow-2xl overflow-hidden">
              <div className="bg-black/40 border-b border-black p-6 md:p-8">
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-white text-center tracking-tight">AI Tools vs NeuroLint</h3>
              </div>
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  <div className="bg-black/60 border-2 border-black rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-black transition-all duration-300">
                    <h4 className="text-xl md:text-2xl font-black text-zinc-400 mb-6">
                      AI Code Tools
                    </h4>
                    <div className="space-y-4 text-zinc-400 text-sm md:text-base">
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-black">
                        <span className="text-zinc-500 font-mono">01</span>
                        <span>Generate code without validation</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-black">
                        <span className="text-zinc-500 font-mono">02</span>
                        <span>Hallucinate invalid syntax</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-black">
                        <span className="text-zinc-500 font-mono">03</span>
                        <span>Break production deployments</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-black">
                        <span className="text-zinc-500 font-mono">04</span>
                        <span>Waste developer time debugging</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/60 border-2 border-black rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-black transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    <h4 className="text-xl md:text-2xl font-black text-white mb-6 relative">
                      NeuroLint
                    </h4>
                    <div className="space-y-4 text-gray-200 text-sm md:text-base relative">
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 border border-black">
                        <span className="text-white font-mono font-bold">01</span>
                        <span>Validate every transformation twice</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 border border-black">
                        <span className="text-white font-mono font-bold">02</span>
                        <span>Deterministic, rule-based fixes</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 border border-black">
                        <span className="text-white font-mono font-bold">03</span>
                        <span>Auto-revert on validation failure</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 border border-black">
                        <span className="text-white font-mono font-bold">04</span>
                        <span>Guaranteed valid code output</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA for Orchestration Section */}
            <InstallCTA className="mt-12" />
              
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div ref={faqSectionRef} className={`transition-all duration-1000 transform ${
        faqSectionInView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-20'
      }`}>
        <FAQSection />
      </div>

      {/* Final CTA Section */}
      <section ref={finalCtaSectionRef} className="py-24 px-4">
        <div className="max-w-6xl mx-auto relative">
          <div className={`relative bg-gradient-to-r from-zinc-800 to-black backdrop-blur-xl border-2 border-black rounded-3xl p-8 sm:p-12 md:p-16 lg:p-24 text-center transition-all duration-700 ease-out transform shadow-lg ${
            finalCtaSectionInView
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-20 scale-95'
          }`}>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white transition-all duration-700 delay-100 ease-out transform px-4 ${
              finalCtaSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              Stop Shipping Bugs. Start Using NeuroLint.
            </h2>
            <p className={`text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 md:mb-16 max-w-4xl mx-auto font-medium transition-all duration-700 delay-200 ease-out transform px-4 ${
              finalCtaSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              100% Free CLI. No registration required. Automatic backups included.
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center transition-all duration-700 delay-300 ease-out transform ${
              finalCtaSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-20'
            }`}>
              <a
                href="https://www.npmjs.com/package/@neurolint/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 ease-out text-base sm:text-lg shadow-2xl hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black min-h-[48px] touch-manipulation"
                aria-label="Install NeuroLint CLI from npm"
              >
                Install Free CLI
              </a>
              <a
                href="#comprehensive-demo"
                className="px-8 sm:px-10 py-4 sm:py-5 bg-black/60 text-white font-bold rounded-2xl border-2 border-black hover:bg-black/80 hover:border-black active:bg-black transition-all duration-300 ease-out text-base sm:text-lg backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black min-h-[48px] touch-manipulation"
                aria-label="Try interactive demo"
              >
                Try Interactive Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
