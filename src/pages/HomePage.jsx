import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StaggeredGrid } from '../components/StaggeredGrid';
import { THEMES, EVENT_DETAILS, DEFAULT_FAQS } from '../lib/constants';
import { 
  Zap, Bot, Cpu, Sparkles, ChevronRight, Award, Calendar, MapPin, 
  CheckCircle2, HelpCircle, Shield, Users, ArrowRight, Play, Pause, 
  Volume2, VolumeX, Clock 
} from 'lucide-react';
import MobileHero from '../components/MobileHero';

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // When page loads or refreshes, reset video to start and play once
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Hero video autoplay notice:', err);
          });
      }
    }
  }, []);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-8 h-8 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-8 h-8 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-purple-400" />;
      default: return <Zap className="w-8 h-8 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] selection:bg-cyan-500 selection:text-black">
      
      {/* 1. DESKTOP HERO SECTION (Preserved 100% UNCHANGED for screens > 768px) */}
      <section className="hero-desktop hidden md:block relative w-full h-screen min-h-[600px] overflow-hidden bg-black">
        {/* Full Screen Background Video (Plays once and stops; replays on refresh) */}
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          <source src="/main-intro.mp4" type="video/mp4" />
          <source src="/main intro.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>

        {/* Atmospheric Gradient for Navbar & Bottom Transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-gray-950 pointer-events-none" />

        {/* Floating Top Controls */}
        <div className="absolute top-24 right-6 sm:right-10 flex items-center space-x-3 z-30">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white transition-all shadow-2xl hover:scale-105 hover:border-cyan-400"
            title={isPlaying ? "Pause Video" : "Play Video"}
            aria-label="Play/Pause Video"
          >
            {isPlaying ? <Pause className="w-5 h-5 text-cyan-400" /> : <Play className="w-5 h-5 text-amber-400" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white transition-all shadow-2xl hover:scale-105 hover:border-amber-400"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label="Mute/Unmute Video"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />}
          </button>
        </div>

        {/* Bottom Full Screen Overlays */}
        {/* Bottom Full Screen Overlays */}
        <div className="absolute bottom-8 right-6 sm:right-12 z-20 flex flex-col items-end gap-2">
          {/* Dates & Venue Pill */}
          <div className="inline-flex items-center space-x-3 px-5 py-2 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-xs sm:text-sm font-['Orbitron'] shadow-2xl">
            <span className="text-amber-400 font-extrabold tracking-wider">OCTOBER 26–28, 2026</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-200 font-semibold tracking-wider">VVITU, GUNTUR</span>
          </div>
          {/* Partnership Line */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs text-gray-300 font-body shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>A VVIT-hosted innovation event with <strong className="text-amber-300 font-semibold">NAPROCS Technologies</strong> as Technology Partner</span>
          </div>
        </div>

        {/* Subtle Scroll Down Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center pointer-events-none opacity-60 animate-bounce">
          <ChevronRight className="w-5 h-5 text-cyan-400 rotate-90" />
        </div>
      </section>

      {/* 2. DEDICATED SEPARATE MOBILE HERO SECTION (For screens <= 768px - 9:16 portrait composition) */}
      <section className="hero-mobile block md:hidden relative w-full overflow-hidden bg-black">
        <MobileHero />
      </section>

      {/* 2. MIDDLE SCREEN: ENGINEER THE FUTURE WITH INNOSPRINT */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8 relative z-10">
        
        {/* Top Challenge Badge */}
        <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-widest uppercase font-['Orbitron'] shadow-xl shadow-cyan-500/20">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>48-HOUR NATIONAL LEVEL HACKATHON 2026</span>
        </div>

        {/* Big Middle Screen Title */}
        <h2 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight uppercase leading-tight font-['Orbitron']">
          ENGINEER THE FUTURE WITH <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-400 drop-shadow-[0_4px_20px_rgba(56,189,248,0.4)]">
            INNOSPRINT
          </span>
        </h2>

        {/* 48-Hour Subtitle */}
        <div className="flex items-center justify-center space-x-3 text-amber-400 font-extrabold text-base sm:text-2xl font-['Chakra_Petch']">
          <div className="h-0.5 w-10 sm:w-16 bg-amber-400" />
          <span>NATIONAL LEVEL HACKATHON • AI & ROBOTICS SPRINT</span>
          <div className="h-0.5 w-10 sm:w-16 bg-amber-400" />
        </div>

        {/* Partnership Attribution Line */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs sm:text-sm text-gray-200 font-body shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>A VVIT-hosted innovation event with <strong className="text-cyan-300 font-bold">NAPROCS Technologies</strong> as Technology Partner</span>
        </div>

        {/* Paragraph Description */}
        <p className="text-gray-300 text-base sm:text-xl leading-relaxed font-medium max-w-3xl mx-auto">
          INNOSPRINT is a high-intensity, <strong>48-Hour National Level Hackathon</strong> hosted at <strong>VVITU, Guntur, Andhra Pradesh</strong>. Assemble your team, build real-world AI and robotics solutions, and compete for <strong className="text-cyan-300">₹50,000 in grand cash prizes</strong>.
        </p>

        {/* 4 Highlights Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-left">
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center space-x-3 shadow-md hover:border-cyan-500/40 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-gray-200">Hands-on Technical Mentorship</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center space-x-3 shadow-md hover:border-amber-500/40 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-gray-200">₹50,000 Cash Prize Pool</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center space-x-3 shadow-md hover:border-purple-500/40 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-gray-200">Certificates for All Participants</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center space-x-3 shadow-md hover:border-emerald-500/40 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-gray-200">Team Registration (2–4 Members)</span>
          </div>
        </div>

        {/* Action Buttons Centered */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/status"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-rose-950/40 hover:scale-105 transition-all flex items-center space-x-2 font-['Orbitron']"
          >
            <Clock className="w-5 h-5 text-amber-200" />
            <span>REGISTRATIONS CLOSED</span>
          </Link>
          <Link
            to="/themes"
            className="px-7 py-4 rounded-xl bg-gray-900/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold uppercase tracking-wider text-sm sm:text-base hover:bg-gray-800 transition-all font-['Orbitron']"
          >
            EXPLORE TRACKS
          </Link>
          <Link
            to="/status"
            className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white font-bold uppercase tracking-wider text-xs sm:text-sm transition-all font-['Orbitron']"
          >
            CHECK STATUS
          </Link>
        </div>
      </section>

      {/* 2. EVENT STATS HIGHLIGHT BAR */}
      <section className="relative z-20 bg-gradient-to-r from-cyan-950/90 via-gray-900 to-amber-950/90 border-y border-cyan-500/30 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20">
            <span className="block text-3xl sm:text-4xl font-black text-cyan-400 font-['Orbitron']">OCT 26-28</span>
            <span className="text-xs sm:text-sm font-bold uppercase text-gray-300">2026 • National Level Hackathon</span>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20">
            <span className="block text-3xl sm:text-4xl font-black text-amber-400 font-['Orbitron']">₹50,000</span>
            <span className="text-xs sm:text-sm font-bold uppercase text-gray-300">Total Cash Prize Pool</span>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
            <span className="block text-3xl sm:text-4xl font-black text-purple-400 font-['Orbitron']">3 TRACKS</span>
            <span className="text-xs sm:text-sm font-bold uppercase text-gray-300">Agentic, Robotic & GenAI</span>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20">
            <span className="block text-3xl sm:text-4xl font-black text-emerald-400 font-['Orbitron']">100%</span>
            <span className="text-xs sm:text-sm font-bold uppercase text-gray-300">Certificate Guarantee</span>
          </div>
        </div>
      </section>

      {/* 4. HACKATHON THEMES & PARTNERS SHOWCASE (GSAP STAGGERED GRID & EXPANDING BENTO CARDS) */}
      <section id="tracks" className="w-full relative">
        <StaggeredGrid centerText="HACKATHON THEMES & TOPICS" />
      </section>

      {/* 5. EDITABLE SPONSORS & PARTNERS PLACEHOLDER */}
      <section className="py-16 px-4 bg-gray-950 border-b border-gray-900 text-center">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 font-['Orbitron'] mb-6 block">
            PARTNERS & INSTITUTIONAL SUPPORT
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="px-6 py-4 rounded-xl bg-gray-900/60 border border-gray-800 text-cyan-400 font-extrabold font-['Orbitron'] text-lg">
              VVITU
            </div>
            <div className="px-6 py-4 rounded-xl bg-gray-900/60 border border-gray-800 text-amber-400 font-extrabold font-['Orbitron'] text-lg">
              DEPARTMENT OF AI & ROBOTICS
            </div>
            <div className="px-6 py-4 rounded-xl bg-gray-900/60 border border-gray-800 text-purple-400 font-extrabold font-['Orbitron'] text-lg">
              INNOSPRINT LABS
            </div>
          </div>
          <p className="text-xs text-gray-500 italic mt-4">
            [Organizer Note: Additional corporate sponsor logos can be uploaded & updated dynamically via the Admin CMS]
          </p>
        </div>
      </section>

      {/* 6. FAQ ACCORDION PREVIEW */}
      <section className="py-20 px-4 max-w-4xl mx-auto" id="faq-preview">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase font-['Orbitron']">
            FREQUENTLY ASKED <span className="text-cyan-400">QUESTIONS</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2">Have questions? We have answers.</p>
        </div>

        <div className="space-y-4">
          {DEFAULT_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-gray-900/60 border border-gray-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-base text-gray-200 hover:text-cyan-300 transition-colors font-['Orbitron']"
              >
                <span>{faq.question}</span>
                <span className="text-cyan-400 ml-4 font-mono text-lg">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="p-5 pt-0 text-sm text-gray-300 leading-relaxed border-t border-gray-800/50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. QUICK REGISTER CTA BANNER */}
      <section className="py-16 px-4 bg-gradient-to-r from-cyan-950 via-gray-900 to-rose-950 border-t border-cyan-500/30 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-widest font-['Orbitron']">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>REGISTRATION PERIOD COMPLETED</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase font-['Orbitron']">
            REGISTRATIONS ARE <span className="text-rose-400">OFFICIALLY CLOSED</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-medium">
            The registration window for INNOSPRINT 2026 has concluded. Thank you to all teams who registered! You can verify your registration dossier and monitor shortlist announcements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to="/status"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 text-white font-extrabold text-base uppercase tracking-wider shadow-xl shadow-cyan-950/50 hover:scale-105 transition-all font-['Orbitron'] flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Check Registration Status</span>
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-900 border border-gray-700 text-white font-bold text-base uppercase tracking-wider hover:border-cyan-400/50 transition-all font-['Orbitron']"
            >
              Contact Organizers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
