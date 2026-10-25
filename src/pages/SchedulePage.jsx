import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  OFFICIAL_SCHEDULE_DAYS,
  EVENT_DETAILS
} from '../lib/constants';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Rocket,
  Lock,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Compass,
  ShieldCheck,
  Terminal,
  Layers,
  Coffee,
  Utensils,
  Mic,
  Presentation,
  Users,
  Flag,
  Sun,
  ShieldAlert,
  Wrench,
  FileText,
  AlertTriangle,
  Code,
  Check,
  ChevronRight
} from 'lucide-react';

// Scroll reveal hook for smooth cinematic entrance
function useStageReveal(threshold = 0.08) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setRevealed(true);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    const fallbackTimer = setTimeout(() => {
      setRevealed(true);
    }, 200);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, revealed];
}

// Icon mapper for schedule activity types
function EventIcon({ type, className = "w-5 h-5" }) {
  switch (type) {
    case 'milestone':
      return <Flag className={className} />;
    case 'ceremony':
      return <Sparkles className={className} />;
    case 'keynote':
      return <Mic className={className} />;
    case 'briefing':
      return <FileText className={className} />;
    case 'pitch':
      return <Presentation className={className} />;
    case 'code-start':
      return <Rocket className={className} />;
    case 'dev':
      return <Terminal className={className} />;
    case 'review':
      return <Users className={className} />;
    case 'refreshment':
      return <Coffee className={className} />;
    case 'meal':
      return <Utensils className={className} />;
    case 'qa':
      return <ShieldAlert className={className} />;
    case 'freeze':
      return <Lock className={className} />;
    case 'prep':
      return <FileText className={className} />;
    default:
      return <Clock className={className} />;
  }
}

// Theme styles per day
const DAY_THEMES = {
  cyan: {
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-400/40',
    badgeText: 'text-cyan-300',
    headerBorder: 'border-cyan-500/40',
    headerGlow: 'from-cyan-950/50 via-slate-950 to-slate-950',
    pillActive: 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]',
    cardBorder: 'border-cyan-500/20 hover:border-cyan-400/60',
    timeColor: 'text-cyan-300',
    accentDot: 'bg-cyan-400'
  },
  amber: {
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-400/40',
    badgeText: 'text-amber-300',
    headerBorder: 'border-amber-500/40',
    headerGlow: 'from-amber-950/50 via-slate-950 to-slate-950',
    pillActive: 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    cardBorder: 'border-amber-500/20 hover:border-amber-400/60',
    timeColor: 'text-amber-300',
    accentDot: 'bg-amber-400'
  },
  purple: {
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-400/40',
    badgeText: 'text-purple-300',
    headerBorder: 'border-purple-500/40',
    headerGlow: 'from-purple-950/50 via-slate-950 to-slate-950',
    pillActive: 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    cardBorder: 'border-purple-500/20 hover:border-purple-400/60',
    timeColor: 'text-purple-300',
    accentDot: 'bg-purple-400'
  }
};

export default function SchedulePage() {
  const [headerRef, headerRevealed] = useStageReveal(0.05);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = All Days, 1 = Day 1, 2 = Day 2, 3 = Day 3
  const [filterMilestonesOnly, setFilterMilestonesOnly] = useState(false);

  // Filter days based on tab selection
  const displayedDays = selectedDay === 0
    ? OFFICIAL_SCHEDULE_DAYS
    : OFFICIAL_SCHEDULE_DAYS.filter(d => d.dayNumber === selectedDay);

  return (
    <div className="min-h-screen bg-[#030712] text-white font-['Rajdhani'] pt-20 pb-24 selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      
      {/* Background Lighting & Grid */}
      <div className="fixed inset-0 bg-tech-grid pointer-events-none opacity-60 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[400px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/3 left-0 w-[500px] h-[400px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* =====================================================================
          1. SCHEDULE PAGE HEADER
          ===================================================================== */}
      <header
        ref={headerRef}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 text-center"
      >
        <div className="relative rounded-3xl border border-cyan-500/25 bg-slate-950/85 backdrop-blur-xl px-4 sm:px-10 py-10 sm:py-12 overflow-hidden shadow-[0_0_55px_rgba(0,0,0,0.85)]">
          {/* Top Animated Scanline */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-slate-950/90 pointer-events-none" />

          {/* Corner HUD Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

          {/* Small Label */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-[0.22em] uppercase font-['Orbitron'] shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-4">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>48-HOUR INNOVATION SPRINT // OFFICIAL TIMELINE</span>
          </div>

          {/* Main Title & Subtitle */}
          <div
            className={`space-y-2 transition-all duration-700 ${
              headerRevealed ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-4'
            }`}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase font-['Orbitron'] tracking-tight text-white">
              NAPROCS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]">INNOVATION SPRINT</span> 2026
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl font-black uppercase font-['Orbitron'] tracking-[0.18em] text-cyan-300">
              OFFICIAL EVENT SCHEDULE
            </p>
          </div>

          {/* Tagline */}
          <p className="mt-3 text-xs sm:text-sm md:text-base font-bold font-['Orbitron'] tracking-[0.22em] uppercase text-amber-300/95">
            48 HOURS. UNLIMITED INNOVATION.
          </p>

          {/* Key Information Panels */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-900/90 border border-cyan-500/40 flex items-center space-x-3 text-left shadow-lg">
              <div className="p-2.5 rounded-xl bg-gray-950 border border-white/10 flex-shrink-0">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 font-['Orbitron']">
                  CONFIRMED DATES
                </span>
                <strong className="block text-xs sm:text-sm font-black uppercase font-['Orbitron'] text-white tracking-wider mt-0.5 leading-snug">
                  OCTOBER 26–28, 2026
                </strong>
                <span className="block text-[10px] text-gray-400 mt-0.5">Mon 10:00 AM – Wed 12:00 PM</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-900/90 border border-amber-500/40 flex items-center space-x-3 text-left shadow-lg">
              <div className="p-2.5 rounded-xl bg-gray-950 border border-white/10 flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 font-['Orbitron']">
                  INAUGURATION
                </span>
                <strong className="block text-xs sm:text-sm font-black uppercase font-['Orbitron'] text-white tracking-wider mt-0.5 leading-snug">
                  10:00 AM
                </strong>
                <span className="block text-[10px] text-amber-300/90 mt-0.5">Monday, October 26, 2026</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-900/90 border border-purple-500/40 flex items-center space-x-3 text-left shadow-lg">
              <div className="p-2.5 rounded-xl bg-gray-950 border border-white/10 flex-shrink-0">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 font-['Orbitron']">
                  OFFICIAL VENUE
                </span>
                <strong className="block text-xs sm:text-sm font-black uppercase font-['Orbitron'] text-white tracking-wider mt-0.5 leading-snug">
                  VVITU
                </strong>
                <span className="block text-[10px] text-gray-400 mt-0.5">Numbur, Guntur, AP</span>
              </div>
            </div>
          </div>

          {/* Official Source Notice Banner */}
          <div className="mt-7 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-amber-950/60 border border-cyan-500/30 text-xs sm:text-sm text-gray-200 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/50 text-cyan-300 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="font-bold text-white uppercase font-['Orbitron'] tracking-wider text-[11px] block">
                  Authoritative Timeline Notice
                </span>
                <span className="text-gray-300 text-xs leading-relaxed">
                  Start: <strong>Monday, October 26 at 10:00 AM</strong> (Hackathon Begins at 12:00 PM) • End: <strong>Wednesday, October 28 at 12:00 PM</strong>.
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-amber-300 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-500/30 self-stretch md:self-auto justify-center">
              <span>Day 1 Phase 1 Ends (04:00 PM)</span>
              <span className="text-gray-600">|</span>
              <span>Day 2 Phase 2 Ends (11:00 AM)</span>
              <span className="text-gray-600">|</span>
              <span>Day 3 Phase 3 Ends (09:00 AM)</span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. INTERACTIVE CONTROLS & DAY FILTER TABS
          ===================================================================== */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/80 border border-gray-800 backdrop-blur-md">
          {/* Day Tabs */}
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedDay(0)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-['Orbitron'] uppercase tracking-wider transition-all ${
                selectedDay === 0
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700/60'
              }`}
            >
              All 3 Days
            </button>
            {OFFICIAL_SCHEDULE_DAYS.map((day) => {
              const theme = DAY_THEMES[day.theme];
              const isActive = selectedDay === day.dayNumber;
              return (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDay(day.dayNumber)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-['Orbitron'] uppercase tracking-wider transition-all ${
                    isActive
                      ? theme.pillActive
                      : 'bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700/60'
                  }`}
                >
                  <span>{day.dayName}</span>
                  <span className="ml-1.5 opacity-70 text-[10px] hidden md:inline">({day.shortDate})</span>
                </button>
              );
            })}
          </div>

          {/* Filter Toggle: Key Milestones Only */}
          <button
            onClick={() => setFilterMilestonesOnly(!filterMilestonesOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-['Orbitron'] uppercase tracking-wider transition-all flex items-center space-x-2 border ${
              filterMilestonesOnly
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                : 'bg-gray-900/60 text-gray-400 border-gray-700 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{filterMilestonesOnly ? 'Showing Key Milestones' : 'Highlight Key Milestones'}</span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          3. DAY-WISE SCHEDULE TIMELINES
          ===================================================================== */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {displayedDays.map((day) => {
          const theme = DAY_THEMES[day.theme];
          const eventsToRender = filterMilestonesOnly
            ? day.events.filter(e => e.isMilestone)
            : day.events;

          return (
            <article
              key={day.dayNumber}
              id={`day-${day.dayNumber}`}
              className={`rounded-3xl border ${theme.headerBorder} bg-gradient-to-b ${theme.headerGlow} overflow-hidden shadow-2xl backdrop-blur-md`}
            >
              {/* Day Header Banner */}
              <div className="p-6 sm:p-8 border-b border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full ${theme.badgeBg} border ${theme.badgeBorder} ${theme.badgeText} text-xs font-black font-['Orbitron'] tracking-widest uppercase`}>
                      {day.dayLabel}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm font-semibold tracking-wider uppercase font-['Orbitron']">
                      {day.date}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase font-['Orbitron'] text-white">
                    {day.dayName}: <span className={theme.timeColor}>{day.highlightText}</span>
                  </h2>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono bg-black/60 px-4 py-2 rounded-xl border border-white/10 self-start md:self-auto">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{eventsToRender.length} Scheduled Sessions</span>
                </div>
              </div>

              {/* Day Events Timeline Grid */}
              <div className="p-6 sm:p-8 space-y-4">
                {eventsToRender.map((event, idx) => {
                  const isHighlight = event.highlight;
                  const isFreeze = event.type === 'freeze';
                  const isPitchOrDemo = event.type === 'pitch';

                  return (
                    <div
                      key={idx}
                      className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-300 border ${
                        isFreeze
                          ? 'bg-red-950/40 border-red-500/70 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                          : isHighlight
                          ? 'bg-slate-900/90 border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.15)]'
                          : 'bg-gray-950/70 border-gray-800/80 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Time & Title Section */}
                        <div className="flex items-start space-x-4">
                          {/* Event Icon Orb */}
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                              isFreeze
                                ? 'bg-red-950 border-red-400 text-red-300 animate-pulse'
                                : isHighlight
                                ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                                : 'bg-gray-900 border-gray-700 text-gray-300'
                            }`}
                          >
                            <EventIcon type={event.type} />
                          </div>

                          {/* Time, Title & Description */}
                          <div className="space-y-1">
                            <div className="flex items-center flex-wrap gap-2">
                              {/* Exact Time Badge */}
                              <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                                {event.time}
                              </span>

                              {/* Badge Category */}
                              <span
                                className={`text-[10px] font-black font-['Orbitron'] uppercase tracking-widest px-2.5 py-0.5 rounded-md ${
                                  isFreeze
                                    ? 'bg-red-900 text-red-200 border border-red-400'
                                    : event.isMilestone
                                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                    : 'bg-gray-900 text-gray-400 border border-gray-800'
                                }`}
                              >
                                {event.badge}
                              </span>

                              {/* Extra Note Pill (e.g., 10 mins per team) */}
                              {event.note && (
                                <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 px-2.5 py-0.5 rounded-md border border-purple-400/40">
                                  {event.note}
                                </span>
                              )}
                            </div>

                            <h3 className={`text-base sm:text-lg font-bold font-['Orbitron'] ${
                              isFreeze ? 'text-red-200' : 'text-white'
                            }`}>
                              {event.title}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed max-w-3xl">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        {/* Right Milestone / Action Marker */}
                        {event.isMilestone && (
                          <div className="flex-shrink-0 self-start md:self-center">
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gray-900 border border-gray-700 text-[10px] font-bold uppercase font-['Orbitron'] text-gray-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Milestone</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}

        {/* ===================================================================
            4. DAY 3 GRAND EVALUATION & CEREMONY HIGHLIGHT BOX
            =================================================================== */}
        <section className="rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-2 border-amber-400/60 p-6 sm:p-10 shadow-[0_0_50px_rgba(245,158,11,0.2)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-950 border border-amber-400/50 text-amber-300 text-xs font-black font-['Orbitron'] uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>GRAND EVALUATION & CLOSING CEREMONY</span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-black uppercase font-['Orbitron'] text-white">
                FINAL PRESENTATION & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200">AWARDS CEREMONY</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed">
                Wednesday, October 28, 2026. Final Evaluation (08:00 AM – 09:00 AM) followed by the Grand Closing Ceremony & Awards (10:00 AM – 12:00 PM):
              </p>

              {/* Exact Presentation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/30 text-center">
                  <span className="block text-xl sm:text-2xl font-black font-mono text-amber-300">10 MIN</span>
                  <span className="block text-[11px] font-bold font-['Orbitron'] uppercase text-gray-300 mt-1">Presentation</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/30 text-center">
                  <span className="block text-xl sm:text-2xl font-black font-mono text-cyan-300">5 MIN</span>
                  <span className="block text-[11px] font-bold font-['Orbitron'] uppercase text-gray-300 mt-1">Live Demo</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/60 border border-purple-500/30 text-center">
                  <span className="block text-xl sm:text-2xl font-black font-mono text-purple-300">10 MIN</span>
                  <span className="block text-[11px] font-bold font-['Orbitron'] uppercase text-gray-300 mt-1">Judges Q&A</span>
                </div>
              </div>
            </div>

            {/* Official Awards Recognition List */}
            <div className="w-full lg:w-80 space-y-2.5 bg-slate-900/90 p-5 rounded-2xl border border-amber-500/30">
              <span className="block text-xs font-bold uppercase font-['Orbitron'] text-amber-400 tracking-wider mb-2">
                OFFICIAL AWARDS & RECOGNITION
              </span>
              {[
                "Winner Trophy",
                "Certificates of Excellence",
                "Exciting Rewards",
                "Recognition from the CEO",
                "Opportunity to convert project into company product",
                "Special awards: Innovation, Teamwork, Technical Excellence & Presentation"
              ].map((award, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-gray-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{award}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            5. SUBMISSION REQUIREMENTS CHECKLIST
            =================================================================== */}
        <section className="rounded-3xl bg-slate-950/85 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-md">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest block mb-1">
              OFFICIAL SUBMISSION CHECKLIST
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase font-['Orbitron'] text-white">
              WHAT EVERY TEAM MUST SUBMIT BEFORE FREEZE
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Ensure all components are uploaded and verified before the Day 3 Final Evaluation (08:00 AM – 09:00 AM).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {[
              { label: "Complete Source Code", note: "Clean repository with commits" },
              { label: "BRD / Documentation", note: "Business Requirement Document" },
              { label: "Presentation (PPT)", note: "Official pitch deck" },
              { label: "Architecture Diagram", note: "System design & data flow" },
              { label: "Installation Guide", note: "Local setup & prerequisites" },
              { label: "Feature List", note: "Implemented capabilities" },
              { label: "Business Use Case", note: "Practical enterprise value" },
              { label: "Future Roadmap", note: "Scalability & expansion" },
              { label: "README File", note: "Project overview & attribution" },
            ].map((req, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">{req.label}</span>
                  <span className="text-[11px] text-gray-400">{req.note}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gray-900/50 border border-white/5 text-[11px] text-gray-400 flex items-center space-x-2">
            <span className="text-cyan-400 font-bold uppercase font-mono">Note:</span>
            <span>Demonstration video is <strong>optional</strong>. Live demonstrations will be conducted directly during the Day 3 evaluation.</span>
          </div>
        </section>

        {/* ===================================================================
            6. CALL TO ACTION SECTION
            =================================================================== */}
        <section className="rounded-3xl bg-slate-950/90 border border-cyan-500/35 p-8 sm:p-12 text-center shadow-[0_0_50px_rgba(6,182,212,0.14)] space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold font-['Orbitron'] uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>48 HOURS. UNLIMITED INNOVATION.</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase font-['Orbitron'] text-white">
            REVIEW THE RULES &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-400">
              EVALUATION CRITERIA
            </span>
          </h2>

          <p className="text-gray-300 text-sm sm:text-base font-semibold max-w-2xl mx-auto">
            Prepare your project documentation, architecture diagrams, and live demos in accordance with the official rules and guidelines.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/rules"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider font-['Orbitron'] flex items-center justify-center space-x-2 shadow-[0_8px_30px_rgba(249,115,22,0.35)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>VIEW OFFICIAL RULES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-cyan-400/60 text-gray-200 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wider font-['Orbitron'] flex items-center justify-center space-x-2 transition-all"
            >
              <span>EVENT OVERVIEW & COMMITTEE</span>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
