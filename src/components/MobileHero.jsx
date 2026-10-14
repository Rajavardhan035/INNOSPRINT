import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, ArrowRight, RotateCcw, ChevronDown, Volume2, VolumeX, 
  SkipForward, Play, Pause, Sparkles 
} from 'lucide-react';

export default function MobileHero() {
  // Mode: 'video' (initial playback on load/refresh) or 'image' (portrait poster with CTAs)
  const [mode, setMode] = useState('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [posterStage, setPosterStage] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const timersRef = useRef([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  // Start video autoplay on mount or page refresh
  useEffect(() => {
    // If user prefers reduced motion, jump straight to image poster
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('image');
      setPosterStage(5);
      return;
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn('Mobile video autoplay blocked by browser:', err);
            setAutoplayBlocked(true);
            setIsPlaying(false);
          });
      }
    }

    return () => clearAllTimers();
  }, []);

  // Transition from Video to Portrait Poster
  const transitionToPoster = () => {
    clearAllTimers();
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {}
    }
    setMode('image');
    setPosterStage(1);

    // Staged cinematic sequence for the poster
    const t1 = setTimeout(() => setPosterStage(2), 500); // Optic blue eyes
    const t2 = setTimeout(() => setPosterStage(3), 1100); // INNOSPRINT metallic sweep
    const t3 = setTimeout(() => setPosterStage(4), 1700); // 48-Hour Hackathon horizon flare
    const t4 = setTimeout(() => setPosterStage(5), 2300); // Action buttons & header badge

    timersRef.current = [t1, t2, t3, t4];
  };

  // Replay intro video
  const handleReplayVideo = (e) => {
    if (e) e.stopPropagation();
    clearAllTimers();
    setMode('video');
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Skip video directly to complete poster
  const handleSkipVideo = (e) => {
    if (e) e.stopPropagation();
    transitionToPoster();
    // Fast forward directly to interactive state
    clearAllTimers();
    setPosterStage(5);
  };

  // Toggle audio
  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle video play/pause
  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Fast skip poster animation
  const handleTapPoster = () => {
    if (posterStage < 5) {
      clearAllTimers();
      setPosterStage(5);
    }
  };

  return (
    <div className="relative w-full h-[100svh] min-h-[480px] max-h-[1024px] overflow-hidden bg-black select-none font-['Rajdhani']">
      
      {/* =========================================================================
          PHASE 1: MOBILE VIDEO INTRO (Plays first on load/refresh, then ends)
          ========================================================================= */}
      <div 
        className={`absolute inset-0 z-20 transition-opacity duration-1000 ${
          mode === 'video' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          webkit-playsinline="true"
          preload="auto"
          poster="/desktop-hero.png"
          className="absolute inset-0 w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={transitionToPoster}
        >
          <source src="/main-intro.mp4" type="video/mp4" />
          <source src="/main intro.mp4" type="video/mp4" />
          <source src="/desktop-hero.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-black/20 to-black/70 pointer-events-none" />

        {/* Video Floating Controls Header */}
        <div className="absolute top-[max(68px,calc(env(safe-area-inset-top)+54px))] inset-x-0 px-4 flex items-center justify-between z-30">
          {/* Live Indicator Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/40 text-[10px] xs:text-[11px] font-['Orbitron'] text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold tracking-widest uppercase">CINEMATIC INTRO</span>
          </div>

          {/* Sound & Skip Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/75 hover:bg-black/95 active:scale-90 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              aria-label="Toggle Audio"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={handleSkipVideo}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/95 active:scale-95 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[10px] xs:text-[11px] font-['Orbitron'] font-bold shadow-lg transition-all"
              title="Skip to Poster"
            >
              <span>SKIP</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Autoplay Blocked Fallback or Center Tap to Play */}
        {autoplayBlocked && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <button
              onClick={togglePlay}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-amber-500 text-white font-['Orbitron'] font-bold text-sm tracking-wider flex items-center space-x-2 shadow-2xl active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>PLAY INTRO VIDEO</span>
            </button>
            <button
              onClick={handleSkipVideo}
              className="mt-4 text-xs text-gray-400 hover:text-white underline font-['Orbitron']"
            >
              Skip directly to hackathon poster →
            </button>
          </div>
        )}

        {/* Bottom Video Footer Hint */}
        <div className="absolute bottom-[max(18px,calc(env(safe-area-inset-bottom)+12px))] inset-x-0 px-4 flex items-center justify-between z-30">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-gray-300 border border-white/10 active:scale-90"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
          <button
            onClick={handleSkipVideo}
            className="text-[11px] font-['Orbitron'] text-gray-400 hover:text-amber-400 tracking-wider flex items-center space-x-1"
          >
            <span>TAP TO SKIP INTRO</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          PHASE 2: VERTICAL 9:16 POSTER (Revealed after video completes or skipped)
          ========================================================================= */}
      <div 
        onClick={handleTapPoster}
        className={`relative z-10 w-full h-full flex items-center justify-center transition-opacity duration-1000 ${
          mode === 'image' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Ambient Atmosphere Edge Fill */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center filter blur-2xl scale-125 opacity-35 pointer-events-none"
          style={{ backgroundImage: `url('/mobile-hero-poster.jpg')` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-black/80 pointer-events-none" />

        {/* Proportional 9:16 Container (Guarantees zero cropping of robots & title) */}
        <div className="relative z-10 w-full h-full max-h-[100svh] aspect-[9/16] max-w-[500px] mx-auto flex flex-col justify-between items-center overflow-hidden">
          
          {/* Master 9:16 Poster Artwork */}
          <img
            ref={imgRef}
            src="/mobile-hero-poster.jpg"
            alt="INNOSPRINT 2026 - 48-Hour National Hackathon"
            onLoad={() => setImageLoaded(true)}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-all duration-700"
            loading="eager"
            decoding="async"
          />

          {/* Central Sunset Atmospheric Glow */}
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-amber-500/25 blur-3xl pointer-events-none" />

          {/* Robot Glowing Optic Eyes (Optimus on left & Bumblebee on right) */}
          {posterStage >= 2 && (
            <>
              {/* Left Robot (Optimus) Optic Eye */}
              <div 
                className="absolute pointer-events-none z-20"
                style={{ top: '16%', left: '18%' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_#00e5ff] animate-pulse" />
                <div className="absolute -inset-1.5 rounded-full bg-cyan-400/40 animate-ping" />
              </div>

              {/* Right Robot (Bumblebee) Optic Eye */}
              <div 
                className="absolute pointer-events-none z-20"
                style={{ top: '17.5%', right: '18%' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_#00e5ff] animate-pulse" />
                <div className="absolute -inset-1.5 rounded-full bg-cyan-400/40 animate-ping" />
              </div>

              {/* Metallic Rim Glow */}
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-cyan-500/20 to-transparent pointer-events-none animate-pulse" />
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-amber-500/20 to-transparent pointer-events-none animate-pulse" />
            </>
          )}

          {/* INNOSPRINT Metallic Specular Light Sweep */}
          {posterStage >= 3 && (
            <div 
              className="absolute z-20 pointer-events-none overflow-hidden"
              style={{ top: '41%', height: '18%', left: '12%', right: '12%' }}
            >
              <div className="w-full h-full animate-metallic-sweep bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-400/60 blur-md animate-ping" />
            </div>
          )}

          {/* 48-HOUR HACKATHON Gold Horizon Flare */}
          {posterStage >= 4 && (
            <div 
              className="absolute z-20 pointer-events-none flex items-center justify-center"
              style={{ top: '64.2%', left: '15%', right: '15%' }}
            >
              <div className="w-full h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b] animate-horizon-flare" />
              <div className="absolute w-6 h-6 rounded-full bg-amber-400/80 blur-sm animate-pulse" />
            </div>
          )}

          {/* Sparks & Embers */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <div className="absolute bottom-[20%] left-[22%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ember-1" />
            <div className="absolute bottom-[18%] right-[26%] w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_#ea580c] animate-ember-2" />
            <div className="absolute bottom-[24%] left-[48%] w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b] animate-ember-3" />
          </div>

          {/* Top Dates Badge & Replay Video Button */}
          <div className="w-full pt-[max(68px,calc(env(safe-area-inset-top)+54px))] px-3 xs:px-4 flex items-center justify-between z-30 transition-all duration-700">
            {/* Dates & Venue Pill Badge */}
            <div 
              className={`inline-flex items-center space-x-1.5 xs:space-x-2 px-2.5 xs:px-3.5 py-1 xs:py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/40 text-[9.5px] xs:text-[11px] font-['Orbitron'] shadow-xl transition-all duration-700 ${
                posterStage >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 font-extrabold tracking-wider">OCT 26–28, 2026</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-200 font-semibold tracking-wider">VVITU, GUNTUR</span>
            </div>

            {/* Replay Video Intro Button */}
            <button
              onClick={handleReplayVideo}
              title="Replay Video Intro"
              aria-label="Replay Video Intro"
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 active:scale-90 border border-cyan-500/40 text-cyan-400 hover:text-white backdrop-blur-md shadow-lg transition-all duration-500 text-[10px] xs:text-[11px] font-['Orbitron'] font-bold ${
                posterStage >= 5 ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <RotateCcw className="w-3 xs:w-3.5 h-3 xs:h-3.5 text-cyan-400" />
              <span>REPLAY VIDEO</span>
            </button>
          </div>

          {/* Bottom Interactive Controls (REGISTER & EXPLORE) */}
          <div 
            className={`w-full max-w-[390px] px-3 xs:px-4 pb-[max(14px,calc(env(safe-area-inset-bottom)+10px))] flex flex-col items-center gap-1.5 xs:gap-2 z-30 transition-all duration-700 ${
              posterStage >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            {/* Partnership Line */}
            <div className="w-full text-center px-1">
              <span className="inline-block text-[9.5px] xs:text-[10.5px] text-gray-300 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 leading-tight">
                A VVIT-hosted event with <strong className="text-cyan-300 font-bold">NAPROCS Technologies</strong> as Tech Partner
              </span>
            </div>

            {/* Primary Action: Register Now */}
            <Link
              to="/register"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2.5 xs:py-3.5 px-4 xs:px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-black text-xs xs:text-sm tracking-wider uppercase font-['Orbitron'] flex items-center justify-center space-x-2 text-center shadow-[0_8px_30px_rgba(249,115,22,0.4)] active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-amber-200 fill-amber-200 animate-pulse" />
              <span>REGISTER NOW</span>
              <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 ml-1" />
            </Link>

            {/* Secondary Action: Explore Hackathon */}
            <a
              href="#about"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 xs:py-2.5 px-4 xs:px-6 rounded-xl bg-gray-950/80 hover:bg-gray-900 active:bg-gray-950 backdrop-blur-md border border-white/20 text-gray-200 hover:text-white font-bold text-[11px] xs:text-xs tracking-wider uppercase font-['Orbitron'] flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-lg"
            >
              <span>EXPLORE CHALLENGES</span>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
