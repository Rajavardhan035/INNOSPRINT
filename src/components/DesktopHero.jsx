import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, ChevronRight, Shield, Award, Calendar, Zap, Sparkles, Clock } from 'lucide-react';

export default function DesktopHero() {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.ended) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsPlaying(true);
      } else if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="hero-desktop relative w-full min-h-screen bg-gray-950 text-white overflow-hidden flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Main Intro Video Layer (No pics) */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          <source src="/main-intro.mp4" type="video/mp4" />
          <source src="/main intro.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
        
        {/* Dark Vignette & Atmospheric Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-gray-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-gray-950/80" />
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/90 to-transparent" />
      </div>

      {/* DESKTOP NAVBAR */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-8 py-5 md:py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-gray-950 rounded-[7px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <span className="text-xl md:text-2xl font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-amber-400 font-['Orbitron']">
            INNOSPRINT
          </span>
        </div>

        <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold tracking-wider text-gray-300">
          <a href="#about" className="hover:text-cyan-400 transition-colors uppercase">About</a>
          <a href="#tracks" className="hover:text-cyan-400 transition-colors uppercase">Tracks</a>
          <a href="#prizes" className="hover:text-cyan-400 transition-colors uppercase">Prizes</a>
          <a href="#schedule" className="hover:text-cyan-400 transition-colors uppercase">Schedule</a>
          <a href="#sponsors" className="hover:text-cyan-400 transition-colors uppercase">Sponsors</a>
          <a href="#faq" className="hover:text-cyan-400 transition-colors uppercase">FAQ</a>
        </nav>

        <div className="flex items-center space-x-3">
          {/* Play/Pause Control */}
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all shadow-lg hover:border-cyan-400"
            title={isPlaying ? "Pause Intro Video" : "Play Intro Video"}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-cyan-300" /> : <Play className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Audio Mute/Unmute Control */}
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-cyan-300 transition-all shadow-lg hover:border-amber-400"
            title={isMuted ? "Unmute Intro Audio" : "Mute Intro Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />}
          </button>

          <a
            href="/status"
            className="px-5 md:px-6 py-2 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs md:text-sm tracking-wider uppercase shadow-lg shadow-rose-950/40 hover:scale-105 transition-all flex items-center space-x-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
            <span>Registrations Closed</span>
          </a>
        </div>
      </header>

      {/* DESKTOP HERO CONTENT */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-8 py-16 flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md shadow-inner">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>REGISTRATION WINDOW COMPLETED</span>
        </div>

        {/* 3D Title */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-2 uppercase leading-none select-none font-['Orbitron']">
          <span className="title-inno-metal">INNO</span>
          <span className="title-sprint-metal">SPRINT</span>
        </h1>

        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <span className="text-2xl md:text-3xl font-extrabold tracking-widest text-amber-400 uppercase font-['Chakra_Petch'] drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
            48-HOUR HACKATHON
          </span>
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>

        <p className="max-w-2xl text-lg text-gray-300 font-medium mb-10 leading-relaxed drop-shadow-md">
          Assemble your team, unleash cutting-edge AI & robotics algorithms, and compete for <span className="text-cyan-300 font-bold">₹50,000 in grand prizes</span>. 48 hours of non-stop innovation.
        </p>

        {/* CTAs */}
        <div className="flex flex-row items-center justify-center space-x-6">
          <a
            href="/status"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white font-extrabold text-base tracking-wider uppercase shadow-xl shadow-rose-950/50 hover:scale-105 transition-all flex items-center space-x-3 group font-['Orbitron']"
          >
            <Clock className="w-5 h-5 text-amber-200" />
            <span>REGISTRATIONS CLOSED (CHECK STATUS)</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/about"
            className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-lg border border-white/20 text-white font-bold text-base tracking-wider uppercase transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 font-['Orbitron']"
          >
            EXPLORE HACKATHON
          </a>
        </div>
      </main>

      {/* DESKTOP FOOTER STATS */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-8 py-8 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>OCTOBER 26 - 28, 2026</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>₹50,000 PRIZE POOL</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>VVITU, GUNTUR, AP</span>
          </div>
        </div>
        <div className="text-xs tracking-wider uppercase text-gray-500 font-['Orbitron']">
          © 2026 INNOSPRINT • ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}
