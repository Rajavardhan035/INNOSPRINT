import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Code2,
  Cpu,
  GitBranch,
  BarChart3,
  Award,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Terminal,
  Video,
  Sparkles,
  Users,
  Clock,
  Calendar,
  FileCode2,
  Layers,
  Lock
} from 'lucide-react';

// Custom hook to trigger scroll-based reveal while ensuring immediate fallback visibility
function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -20px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, isVisible];
}

// Animated Percentage Counter for Card 05 (Judging & Scoring)
function AnimatedScoreCounter({ target, trigger }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setCount(target);
      return;
    }

    let current = 0;
    const duration = 450;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, trigger]);

  return (
    <span aria-label={`${target}%`}>
      {trigger ? count : target}%
    </span>
  );
}

const JUDGING_CRITERIA = [
  {
    id: 'innovation',
    label: 'Innovation',
    weight: 30,
    description: 'Originality and the value of the idea.',
    color: 'from-cyan-400 to-blue-500',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgGlow: 'bg-cyan-500/20'
  },
  {
    id: 'execution',
    label: 'Technical Execution',
    weight: 30,
    description: 'Implementation quality and functionality.',
    color: 'from-blue-400 to-indigo-500',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgGlow: 'bg-blue-500/20'
  },
  {
    id: 'impact',
    label: 'Practical Impact',
    weight: 20,
    description: 'Relevance and potential real-world usefulness.',
    color: 'from-amber-400 to-orange-500',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgGlow: 'bg-amber-500/20'
  },
  {
    id: 'presentation',
    label: 'Presentation',
    weight: 20,
    description: 'Clarity, demonstration, and explanation.',
    color: 'from-purple-400 to-pink-500',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgGlow: 'bg-purple-500/20'
  }
];

const SPRINT_TIMELINE = [
  {
    step: '01',
    stage: 'KICKOFF',
    date: 'October 26',
    detail: 'Opening instructions and team readiness.',
    accent: 'cyan'
  },
  {
    step: '02',
    stage: 'BUILD',
    date: 'October 26–27',
    detail: 'Implementation, prototyping, and development.',
    accent: 'blue'
  },
  {
    step: '03',
    stage: 'REFINE',
    date: 'October 27–28',
    detail: 'Testing, debugging, and preparation.',
    accent: 'purple'
  },
  {
    step: '04',
    stage: 'CODE FREEZE',
    date: 'October 28',
    detail: 'Final submission according to the announced deadline.',
    accent: 'amber'
  },
  {
    step: '05',
    stage: 'PITCH & JUDGING',
    date: 'Official Event Schedule',
    detail: 'Live project pitch and evaluation according to the official event schedule.',
    accent: 'emerald'
  }
];

const INTEGRITY_VIOLATIONS = [
  'Plagiarism or uncredited code theft.',
  'Submitting complete pre-built applications as newly developed sprint work.',
  'Falsifying project contributions or development history.',
  'Misusing credentials or resources without authorization.',
  'Harassment, intimidation, or serious violations of the code of conduct.'
];

export default function RulesPage() {
  const [heroRef, heroVisible] = useScrollReveal(0.05);
  const [cardsRef, cardsVisible] = useScrollReveal(0.08);
  const [scoreRef, scoreVisible] = useScrollReveal(0.15);
  const [timelineRef, timelineVisible] = useScrollReveal(0.12);
  const [integrityRef, integrityVisible] = useScrollReveal(0.12);
  const [certRef, certVisible] = useScrollReveal(0.15);

  return (
    <div className="min-h-screen bg-[#030712] text-white font-['Rajdhani'] pt-20 pb-24 selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      
      {/* =====================================================================
          1. AMBIENT TECHNICAL GRID & BACKGROUND ACCENTS
          ===================================================================== */}
      <div className="fixed inset-0 bg-tech-grid pointer-events-none opacity-65 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-0 w-[500px] h-[400px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* =====================================================================
          2. HERO SECTION — COMPETITION PROTOCOL
          ===================================================================== */}
      <header
        ref={heroRef}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-14 text-center"
      >
        {/* Subtle Cyan Scanning Line Overlay inside Hero Protocol Frame */}
        <div className="relative rounded-3xl border border-cyan-500/20 bg-slate-950/75 backdrop-blur-xl px-4 sm:px-10 py-10 sm:py-14 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)]">
          
          {/* Animated Horizontal Scanline */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 animate-scan-horizontal pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-slate-950/90 pointer-events-none" />

          {/* Corner HUD Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

          {/* Small Protocol Label */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-[0.2em] uppercase font-['Orbitron'] shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-5">
            <Shield className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>NATIONAL LEVEL HACKATHON • OFFICIAL COMPETITION GUIDELINES</span>
          </div>

          {/* Masked Main Heading */}
          <div className="overflow-hidden py-1">
            <h1
              className={`text-3xl sm:text-5xl md:text-6xl font-black uppercase font-['Orbitron'] tracking-tight transition-all duration-700 ${
                heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-90'
              }`}
            >
              RULES &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]">
                ELIGIBILITY
              </span>
            </h1>
          </div>

          {/* Supporting Text */}
          <p className="mt-4 text-gray-200 text-base sm:text-xl max-w-2xl mx-auto font-semibold tracking-wide">
            “Build with integrity. Innovate without limits. Compete by the rules.”
          </p>

          {/* Three Compact Information Panels */}
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto">
            {[
              {
                icon: Users,
                label: 'TEAM SIZE',
                value: '02–04 MEMBERS',
                accent: 'border-cyan-500/40 text-cyan-300',
                iconColor: 'text-cyan-400'
              },
              {
                icon: Clock,
                label: 'SPRINT DURATION',
                value: '48 HOURS',
                accent: 'border-blue-500/40 text-blue-300',
                iconColor: 'text-blue-400'
              },
              {
                icon: Calendar,
                label: 'EVENT DATES',
                value: 'OCT 26–28, 2026',
                accent: 'border-amber-500/40 text-amber-300',
                iconColor: 'text-amber-400'
              }
            ].map((panel, index) => {
              const IconComp = panel.icon;
              return (
                <div
                  key={panel.label}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  className={`relative p-4 rounded-2xl bg-gray-900/90 border ${panel.accent} flex items-center space-x-3.5 text-left shadow-lg transition-all duration-500 hover:border-cyan-400/70 hover:-translate-y-0.5 ${
                    heroVisible ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-3'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-gray-950 border border-white/10 flex-shrink-0">
                    <IconComp className={`w-5 h-5 ${panel.iconColor}`} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 font-['Orbitron']">
                      {panel.label}
                    </span>
                    <strong className="block text-sm sm:text-base font-extrabold uppercase font-['Orbitron'] text-white tracking-wider mt-0.5">
                      {panel.value}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* =====================================================================
          3. RULE CATEGORIES — SIX ANIMATED INTERACTIVE CARDS
          ===================================================================== */}
      <section
        ref={cardsRef}
        aria-label="Official Rule Categories"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-gray-800/80 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 font-['Orbitron'] block">
              COMPETITION DIRECTIVES // 01–06
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-['Orbitron'] text-white mt-1">
              CORE RULE CATEGORIES
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-semibold font-['Orbitron'] uppercase tracking-wider">
            INNOSPRINT 2026 • VVITU
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* -----------------------------------------------------------------
              CARD 01 — ELIGIBILITY & TEAM FORMATION
              ----------------------------------------------------------------- */}
          <article
            className={`group relative rounded-3xl bg-slate-950/90 border border-cyan-500/30 hover:border-cyan-400/80 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.75)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.18)] overflow-hidden ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-4'
            }`}
          >
            {/* Top Gradient Accent & Scanline */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all pointer-events-none" />

            <div className="space-y-5 relative z-10">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-105 transition-transform">
                    <UserCheck className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold font-['Orbitron'] tracking-[0.2em] text-cyan-400 uppercase block">
                      CATEGORY 01
                    </span>
                    <h3 className="text-lg sm:text-xl font-black uppercase font-['Orbitron'] text-white">
                      ELIGIBILITY & TEAM FORMATION
                    </h3>
                  </div>
                </div>
                <span className="text-2xl font-black font-['Orbitron'] text-cyan-500/25 group-hover:text-cyan-400/50 transition-colors">
                  01
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 font-semibold border-l-2 border-cyan-500/50 pl-3">
                Academic verification and mandatory team formation structure for all participants.
              </p>

              {/* Rule Points */}
              <ul className="space-y-3 text-sm text-gray-200 font-medium">
                {[
                  'Participants must be currently enrolled students at an accredited educational institution.',
                  'A valid student ID must be presented during check-in.',
                  'Teams must contain 2–4 members. Individual participation is not permitted.',
                  'Cross-institutional teams are allowed.',
                  'Each participant may belong to only one team throughout the event.'
                ].map((point, i) => (
                  <li key={i} className="flex items-start space-x-3 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category 01 Unique Visual Accent: Team Slot Verification Matrix */}
            <div className="mt-6 pt-4 border-t border-gray-800/90 relative z-10">
              <div className="flex items-center justify-between text-[10px] font-['Orbitron'] text-cyan-300 uppercase tracking-wider mb-2">
                <span>IDENTITY & SQUAD MATRIX</span>
                <span className="text-emerald-400 font-bold">● ID VERIFICATION REQUIRED</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { slot: 'M-01', status: 'REQUIRED', active: true },
                  { slot: 'M-02', status: 'REQUIRED', active: true },
                  { slot: 'M-03', status: 'OPTIONAL', active: false },
                  { slot: 'M-04', status: 'OPTIONAL', active: false }
                ].map((member) => (
                  <div
                    key={member.slot}
                    className={`p-2 rounded-xl border text-center ${
                      member.active
                        ? 'bg-cyan-950/60 border-cyan-400/50 text-cyan-200'
                        : 'bg-gray-900/70 border-gray-800 text-gray-400'
                    }`}
                  >
                    <span className="block text-[10px] font-black font-['Orbitron']">{member.slot}</span>
                    <span className="block text-[9px] tracking-wider font-bold mt-0.5">{member.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* -----------------------------------------------------------------
              CARD 02 — ORIGINALITY & DEVELOPMENT
              ----------------------------------------------------------------- */}
          <article
            className={`group relative rounded-3xl bg-slate-950/90 border border-blue-500/30 hover:border-blue-400/80 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.75)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.18)] overflow-hidden ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-4'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-blue-950/80 border border-blue-400/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-105 transition-transform">
                    <Code2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold font-['Orbitron'] tracking-[0.2em] text-blue-400 uppercase block">
                      CATEGORY 02
                    </span>
                    <h3 className="text-lg sm:text-xl font-black uppercase font-['Orbitron'] text-white">
                      ORIGINALITY & DEVELOPMENT
                    </h3>
                  </div>
                </div>
                <span className="text-2xl font-black font-['Orbitron'] text-blue-500/25 group-hover:text-blue-400/50 transition-colors">
                  02
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 font-semibold border-l-2 border-blue-500/50 pl-3">
                Authentic 48-hour sprint build standards and open-source attribution rules.
              </p>

              <ul className="space-y-3 text-sm text-gray-200 font-medium">
                {[
                  'Project development for the competition must occur during the official 48-hour sprint.',
                  'Existing open-source libraries, frameworks, and APIs are allowed when appropriately credited.',
                  'Complete pre-built applications cannot be presented as work created during the sprint.',
                  'Plagiarism, uncredited code theft, or falsified development claims can result in disqualification.'
                ].map((point, i) => (
                  <li key={i} className="flex items-start space-x-3 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category 02 Unique Visual Accent: Terminal Build Verification */}
            <div className="mt-6 pt-4 border-t border-gray-800/90 relative z-10">
              <div className="p-3 rounded-xl bg-gray-950 border border-blue-500/30 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span className="flex items-center space-x-1.5 text-blue-300 font-bold">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>SPRINT_COMMIT_GUARD</span>
                  </span>
                  <span className="text-cyan-400">&lt;48H_WINDOW /&gt;</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-900 overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 animate-progress-glow" />
                </div>
                <div className="text-[11px] text-gray-300 truncate">
                  <span className="text-emerald-400">$</span> verify --fresh-build --credit-oss
                </div>
              </div>
            </div>
          </article>

          {/* -----------------------------------------------------------------
              CARD 03 — AI TOOLS & INFRASTRUCTURE
              ----------------------------------------------------------------- */}
          <article
            className={`group relative rounded-3xl bg-slate-950/90 border border-purple-500/30 hover:border-purple-400/80 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.75)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.18)] overflow-hidden ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-4'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl group-hover:bg-purple-400/25 transition-all pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-400/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:scale-105 transition-transform">
                    <Cpu className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold font-['Orbitron'] tracking-[0.2em] text-purple-400 uppercase block">
                      CATEGORY 03
                    </span>
                    <h3 className="text-lg sm:text-xl font-black uppercase font-['Orbitron'] text-white">
                      AI TOOLS & INFRASTRUCTURE
                    </h3>
                  </div>
                </div>
                <span className="text-2xl font-black font-['Orbitron'] text-purple-500/25 group-hover:text-purple-400/50 transition-colors">
                  03
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 font-semibold border-l-2 border-purple-500/50 pl-3">
                Guidelines for LLMs, cloud APIs, authorized credentials, and custom AI system design.
              </p>

              <ul className="space-y-3 text-sm text-gray-200 font-medium">
                {[
                  'Commercial and open-source LLMs, APIs, and AI frameworks are permitted.',
                  'Teams must use API keys and cloud credentials they are authorized to use.',
                  'Submissions must demonstrate original system architecture and meaningful custom code or prompt engineering.',
                  'Teams must disclose significant third-party tools and dependencies used in their projects.'
                ].map((point, i) => (
                  <li key={i} className="flex items-start space-x-3 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category 03 Unique Visual Accent: Connected Neural Node Topology */}
            <div className="mt-6 pt-4 border-t border-gray-800/90 relative z-10">
              <div className="p-3 rounded-xl bg-gray-950/90 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                  <span className="text-[10px] font-['Orbitron'] font-bold text-gray-300">LLM / API</span>
                </div>
                <div className="flex-1 mx-2 h-[1.5px] bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 relative">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-['Orbitron'] font-bold text-purple-300">CUSTOM ARCH</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
                </div>
              </div>
            </div>
          </article>

          {/* -----------------------------------------------------------------
              CARD 04 — SUBMISSION REQUIREMENTS
              ----------------------------------------------------------------- */}
          <article
            className={`group relative rounded-3xl bg-slate-950/90 border border-amber-500/30 hover:border-amber-400/80 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.75)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.18)] overflow-hidden ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-4'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-cyan-400" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform">
                    <GitBranch className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold font-['Orbitron'] tracking-[0.2em] text-amber-400 uppercase block">
                      CATEGORY 04
                    </span>
                    <h3 className="text-lg sm:text-xl font-black uppercase font-['Orbitron'] text-white">
                      SUBMISSION REQUIREMENTS
                    </h3>
                  </div>
                </div>
                <span className="text-2xl font-black font-['Orbitron'] text-amber-500/25 group-hover:text-amber-400/50 transition-colors">
                  04
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 font-semibold border-l-2 border-amber-500/50 pl-3">
                Required source code, demonstration media, and live presentation deliverables.
              </p>

              <ul className="space-y-3 text-sm text-gray-200 font-medium">
                {[
                  'Submit a public GitHub repository containing the project source code.',
                  'Include a demonstration video no longer than 3 minutes.',
                  'Deliver a live project pitch.',
                  'Submit the final project before the official code-freeze deadline on October 28, 2026.'
                ].map((point, i) => (
                  <li key={i} className="flex items-start space-x-3 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category 04 Unique Visual Accent: Deliverables Checklist & Deadline Notice */}
            <div className="mt-6 pt-4 border-t border-gray-800/90 space-y-2.5 relative z-10">
              <div className="grid grid-cols-3 gap-2 text-[10px] font-['Orbitron'] font-bold">
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-center justify-center space-x-1">
                  <FileCode2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>PUBLIC REPO</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-center justify-center space-x-1">
                  <Video className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>≤ 3M VIDEO</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-center justify-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>LIVE PITCH</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-800 text-[11px] text-gray-300 flex items-center justify-between">
                <span className="font-bold text-amber-400 font-['Orbitron'] text-[10px]">OCT 28 CODE FREEZE:</span>
                <span>Official deadline time to be announced.</span>
              </div>
            </div>
          </article>

          {/* -----------------------------------------------------------------
              CARD 05 — JUDGING & SCORING
              ----------------------------------------------------------------- */}
          <article
            ref={scoreRef}
            className={`group relative rounded-3xl bg-slate-950/90 border border-cyan-500/30 hover:border-cyan-400/80 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.75)] hover:shadow-[0_12px_40px_rgba(34,211,238,0.18)] overflow-hidden ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-4'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold font-['Orbitron'] tracking-[0.2em] text-cyan-400 uppercase block">
                      CATEGORY 05
                    </span>
                    <h3 className="text-lg sm:text-xl font-black uppercase font-['Orbitron'] text-white">
                      JUDGING & SCORING
                    </h3>
                  </div>
                </div>
                <span className="text-2xl font-black font-['Orbitron'] text-cyan-500/25 group-hover:text-cyan-400/50 transition-colors">
                  05
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 font-semibold border-l-2 border-cyan-500/50 pl-3">
                Quantitative jury evaluation across four weighted criteria totaling 100%.
              </p>

              {/* Segmented 100% Distribution Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-['Orbitron'] text-gray-400 uppercase">
                  <span>WEIGHT DISTRIBUTION MATRIX</span>
                  <span className="text-cyan-300 font-bold">TOTAL: 100%</span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full bg-gray-900 overflow-hidden flex p-0.5 gap-0.5 border border-gray-800"
                  role="img"
                  aria-label="Judging score weights: Innovation 30%, Technical Execution 30%, Practical Impact 20%, Presentation 20%"
                >
                  <div className="h-full rounded-l-full bg-cyan-400" style={{ width: '30%' }} />
                  <div className="h-full bg-blue-500" style={{ width: '30%' }} />
                  <div className="h-full bg-amber-400" style={{ width: '20%' }} />
                  <div className="h-full rounded-r-full bg-purple-500" style={{ width: '20%' }} />
                </div>
              </div>

              {/* Animated Criteria Progress Bars */}
              <div className="space-y-3.5 pt-1">
                {JUDGING_CRITERIA.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold font-['Orbitron'] uppercase text-white">
                        {item.label}
                      </span>
                      <span className={`font-black font-['Orbitron'] text-sm ${item.textColor}`}>
                        <AnimatedScoreCounter target={item.weight} trigger={scoreVisible} />
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-medium">{item.description}</p>
                    <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden border border-gray-800/80">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                        style={{ width: scoreVisible ? `${item.weight}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800/90 relative z-10">
              <p className="text-xs text-cyan-200/90 font-semibold flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>The organizers&apos; and judges&apos; decisions are final and binding under the event rules.</span>
              </p>
            </div>
          </article>

          {/* -----------------------------------------------------------------
              CARD 06 — CODE OF CONDUCT
              ----------------------------------------------------------------- */}
          <article
            className={`group relative rounded-3xl bg-slate-950/90 border border-sky-500/30 hover:border-sky-400/80 p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.75)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.18)] overflow-hidden ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-4'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-400/20 transition-all pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-sky-950/80 border border-sky-400/40 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)] group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold font-['Orbitron'] tracking-[0.2em] text-sky-400 uppercase block">
                      CATEGORY 06
                    </span>
                    <h3 className="text-lg sm:text-xl font-black uppercase font-['Orbitron'] text-white">
                      CODE OF CONDUCT
                    </h3>
                  </div>
                </div>
                <span className="text-2xl font-black font-['Orbitron'] text-sky-500/25 group-hover:text-sky-400/50 transition-colors">
                  06
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 font-semibold border-l-2 border-sky-500/50 pl-3">
                Professionalism, mutual respect, honest representation, and venue safety rules.
              </p>

              <ul className="space-y-3 text-sm text-gray-200 font-medium">
                {[
                  'Treat participants, mentors, judges, volunteers, and organizers respectfully.',
                  'Harassment, discrimination, threats, and disruptive behavior are prohibited.',
                  'Do not misrepresent project ownership, development history, or results.',
                  'Follow event safety requirements and organizer instructions.'
                ].map((point, i) => (
                  <li key={i} className="flex items-start space-x-3 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category 06 Unique Visual Accent: Professional Ethics Status */}
            <div className="mt-6 pt-4 border-t border-gray-800/90 relative z-10">
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-sky-300 font-['Orbitron'] font-bold text-[10px]">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>SAFE & COLLABORATIVE CAMPUS ENVIRONMENT</span>
                </div>
                <span className="text-[10px] font-['Orbitron'] text-sky-400 font-extrabold">ACTIVE</span>
              </div>
            </div>
          </article>

        </div>
      </section>

      {/* =====================================================================
          4. NEW SECTION — THE 48-HOUR SPRINT (ANIMATED TIMELINE)
          ===================================================================== */}
      <section
        ref={timelineRef}
        aria-label="The 48-Hour Sprint Progression"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mt-20"
      >
        <div className="rounded-3xl bg-slate-950/85 border border-gray-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 font-['Orbitron'] block">
              OPERATIONAL PROGRESSION
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase font-['Orbitron'] text-white mt-1">
              THE 48-HOUR <span className="text-cyan-400">SPRINT</span>
            </h2>
            <p className="text-gray-300 text-sm mt-2 font-medium">
              Five sequential stages from opening kickoff on October 26 to final submission and judging on October 28, 2026.
            </p>
          </div>

          {/* Desktop Horizontal / Mobile Vertical Timeline */}
          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden lg:block absolute top-7 left-10 right-10 h-0.5 bg-gray-800 overflow-hidden pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 transition-all duration-1000 ease-out"
                style={{ width: timelineVisible ? '100%' : '0%' }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
              {SPRINT_TIMELINE.map((item, idx) => (
                <div
                  key={item.step}
                  style={{ transitionDelay: `${idx * 120}ms` }}
                  className={`relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3 text-left lg:text-center transition-all duration-500 ${
                    timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-4'
                  }`}
                >
                  {/* Node Circle */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gray-950 border-2 border-cyan-400/70 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                      <span className="text-[9px] font-bold text-gray-400 font-['Orbitron']">STAGE</span>
                      <span className="text-sm font-black text-cyan-300 font-['Orbitron']">{item.step}</span>
                    </div>
                  </div>

                  {/* Stage Card */}
                  <div className="flex-1 w-full p-4 rounded-2xl bg-gray-900/75 border border-gray-800 hover:border-cyan-500/40 transition-colors">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold font-['Orbitron'] uppercase tracking-wider">
                      {item.date}
                    </span>
                    <h3 className="text-base font-black uppercase font-['Orbitron'] text-white mt-2">
                      {item.stage}
                    </h3>
                    <p className="text-xs text-gray-300 font-medium mt-1 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. DISQUALIFICATION — INTEGRITY PROTOCOL
          ===================================================================== */}
      <section
        ref={integrityRef}
        aria-label="Disqualification and Integrity Protocol"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mt-16"
      >
        <div className="relative rounded-3xl bg-gradient-to-br from-red-950/35 via-slate-950 to-slate-950 border border-red-500/40 p-6 sm:p-10 overflow-hidden shadow-[0_0_45px_rgba(239,68,68,0.12)]">
          
          {/* Subtle Red Technical Grid & Restrained Red Scanning Line */}
          <div className="absolute inset-0 bg-tech-grid-red pointer-events-none opacity-60" />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan-red pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/25 pb-5">
              <div className="flex items-start sm:items-center space-x-4">
                <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)] flex-shrink-0">
                  <ShieldAlert className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 font-['Orbitron'] block">
                    COMPETITION INTEGRITY PROTOCOL
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase font-['Orbitron'] text-white mt-0.5">
                    INTEGRITY IS NON-NEGOTIABLE
                  </h2>
                </div>
              </div>
              <span className="self-start sm:self-center px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold font-['Orbitron'] uppercase tracking-wider">
                STRICT ENFORCEMENT
              </span>
            </div>

            <p className="text-gray-200 text-base sm:text-lg font-semibold">
              “Every submission must reflect honest work, responsible collaboration, and respect for the competition.”
            </p>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-300 font-['Orbitron'] block">
                Serious rule violations include:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INTEGRITY_VIOLATIONS.map((violation, idx) => (
                  <div
                    key={idx}
                    style={{ transitionDelay: `${idx * 90}ms` }}
                    className={`p-3.5 rounded-2xl bg-gray-950/85 border border-red-500/30 flex items-start space-x-3 transition-all duration-500 ${
                      integrityVisible ? 'opacity-100 translate-x-0' : 'opacity-90 -translate-x-2'
                    }`}
                  >
                    <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 font-['Orbitron'] font-bold text-[10px] mt-0.5 flex-shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="text-sm text-gray-200 font-medium leading-relaxed">
                      {violation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs sm:text-sm text-gray-200 font-medium leading-relaxed">
              <strong className="text-red-300 font-['Orbitron'] uppercase text-xs mr-2">
                Enforcement Notice:
              </strong>
              Serious violations may result in disqualification and loss of certificate eligibility, subject to the event rules and organizers&apos; determination.
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. CERTIFICATES & PARTICIPATION
          ===================================================================== */}
      <section
        ref={certRef}
        aria-label="Certificates and Participation"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mt-12"
      >
        <div
          className={`rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-cyan-950/30 border border-amber-500/40 p-6 sm:p-10 shadow-xl transition-all duration-700 ${
            certVisible ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-4'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-400/50 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex-shrink-0">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400 font-['Orbitron'] block">
                  OFFICIAL RECOGNITION
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase font-['Orbitron'] text-white">
                  YOUR PARTICIPATION MATTERS
                </h2>
                <p className="text-gray-100 text-base sm:text-lg font-semibold">
                  “Certificates of participation will be provided to registered participants in accordance with the event guidelines.”
                </p>
                <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed max-w-3xl">
                  To qualify for a certificate of participation, registered team members must satisfy applicable check-in attendance, active participation, and valid project submission requirements established by the organizers.
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto flex-shrink-0 p-4 rounded-2xl bg-gray-950/90 border border-amber-500/30 text-center">
              <span className="block text-[10px] font-bold font-['Orbitron'] text-gray-400 uppercase tracking-wider">
                ELIGIBILITY STATUS
              </span>
              <strong className="block text-sm font-black font-['Orbitron'] text-amber-300 uppercase mt-1">
                VERIFIED SUBMISSIONS
              </strong>
              <span className="block text-[11px] text-gray-400 mt-0.5">
                Subject to Event Guidelines
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. RULES ACKNOWLEDGEMENT & CALL TO ACTION
          ===================================================================== */}
      <section
        aria-label="Rules Acknowledgement"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mt-16 text-center"
      >
        <div className="rounded-3xl bg-slate-950/90 border border-cyan-500/30 p-8 sm:p-12 shadow-[0_0_50px_rgba(6,182,212,0.12)] space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold font-['Orbitron'] uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>PROTOCOL ACKNOWLEDGEMENT</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase font-['Orbitron'] text-white">
            READY TO BUILD WITH <span className="text-cyan-400">INTEGRITY?</span>
          </h2>

          <p className="text-gray-200 text-base sm:text-lg font-semibold max-w-xl mx-auto">
            “Review the competition guidelines before registering your team.”
          </p>

          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            By registering for INNOSPRINT 2026, all team leaders and team members acknowledge that they are responsible for reading, understanding, and following the official competition rules.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/status"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-gray-800 hover:from-cyan-500 hover:to-gray-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider font-['Orbitron'] flex items-center justify-center space-x-2.5 shadow-[0_8px_30px_rgba(6,182,212,0.25)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>CHECK REGISTRATION STATUS (CLOSED)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-cyan-400/50 text-gray-200 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wider font-['Orbitron'] flex items-center justify-center space-x-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>CONTACT FOR CLARIFICATION</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
