import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  SCHEDULE_JOURNEY_STAGES,
  SCHEDULE_FINAL_STAGE
} from '../lib/constants';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Rocket,
  Cpu,
  Settings,
  Lock,
  MonitorPlay,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Compass,
  ShieldCheck,
  Terminal,
  Bot,
  Layers
} from 'lucide-react';

// Scroll reveal hook with immediate fallback so content is always accessible and never stuck hidden
function useStageReveal(threshold = 0.12) {
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
    }, 220);

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

// Theme palette map for each stage's accent color
const STAGE_THEMES = {
  cyan: {
    badgeBg: 'bg-cyan-950/90',
    badgeBorder: 'border-cyan-400/50',
    badgeText: 'text-cyan-300',
    cardBorder: 'border-cyan-500/35 hover:border-cyan-400/90',
    cardShadow: 'hover:shadow-[0_12px_45px_rgba(34,211,238,0.22)]',
    topBar: 'from-cyan-400 via-sky-400 to-blue-500',
    glowOrb: 'bg-cyan-500/15 group-hover:bg-cyan-400/25',
    nodeBg: 'bg-cyan-950',
    nodeBorder: 'border-cyan-400',
    nodeGlow: 'shadow-[0_0_28px_rgba(34,211,238,0.55)]',
    nodeText: 'text-cyan-300',
    checkIcon: 'text-cyan-400',
    dateBadge: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200',
    strokeHex: '#22d3ee',
    secondaryHex: '#0284c7',
    hudLabel: 'LAUNCH PROTOCOL // 01'
  },
  red: {
    badgeBg: 'bg-red-950/90',
    badgeBorder: 'border-red-400/50',
    badgeText: 'text-red-300',
    cardBorder: 'border-red-500/35 hover:border-red-400/90',
    cardShadow: 'hover:shadow-[0_12px_45px_rgba(239,68,68,0.22)]',
    topBar: 'from-red-500 via-rose-500 to-orange-500',
    glowOrb: 'bg-red-500/15 group-hover:bg-red-500/25',
    nodeBg: 'bg-red-950',
    nodeBorder: 'border-red-400',
    nodeGlow: 'shadow-[0_0_28px_rgba(239,68,68,0.55)]',
    nodeText: 'text-red-300',
    checkIcon: 'text-red-400',
    dateBadge: 'bg-red-950/80 border-red-500/40 text-red-200',
    strokeHex: '#ef4444',
    secondaryHex: '#f97316',
    hudLabel: 'PROTOTYPE FORGE // 02'
  },
  purple: {
    badgeBg: 'bg-purple-950/90',
    badgeBorder: 'border-purple-400/50',
    badgeText: 'text-purple-300',
    cardBorder: 'border-purple-500/35 hover:border-purple-400/90',
    cardShadow: 'hover:shadow-[0_12px_45px_rgba(168,85,247,0.22)]',
    topBar: 'from-purple-500 via-violet-400 to-fuchsia-500',
    glowOrb: 'bg-purple-500/15 group-hover:bg-purple-500/25',
    nodeBg: 'bg-purple-950',
    nodeBorder: 'border-purple-400',
    nodeGlow: 'shadow-[0_0_28px_rgba(168,85,247,0.55)]',
    nodeText: 'text-purple-300',
    checkIcon: 'text-purple-400',
    dateBadge: 'bg-purple-950/80 border-purple-500/40 text-purple-200',
    strokeHex: '#a855f7',
    secondaryHex: '#ec4899',
    hudLabel: 'SYSTEM CALIBRATION // 03'
  },
  amber: {
    badgeBg: 'bg-amber-950/90',
    badgeBorder: 'border-amber-400/50',
    badgeText: 'text-amber-300',
    cardBorder: 'border-amber-500/40 hover:border-amber-400/95',
    cardShadow: 'hover:shadow-[0_12px_45px_rgba(245,158,11,0.24)]',
    topBar: 'from-amber-400 via-yellow-500 to-orange-500',
    glowOrb: 'bg-amber-500/15 group-hover:bg-amber-400/25',
    nodeBg: 'bg-amber-950',
    nodeBorder: 'border-amber-400',
    nodeGlow: 'shadow-[0_0_28px_rgba(245,158,11,0.55)]',
    nodeText: 'text-amber-300',
    checkIcon: 'text-amber-400',
    dateBadge: 'bg-amber-950/80 border-amber-500/40 text-amber-200',
    strokeHex: '#f59e0b',
    secondaryHex: '#eab308',
    hudLabel: 'VAULT LOCKDOWN // 04'
  },
  blue: {
    badgeBg: 'bg-blue-950/90',
    badgeBorder: 'border-blue-400/50',
    badgeText: 'text-blue-300',
    cardBorder: 'border-blue-500/35 hover:border-blue-400/90',
    cardShadow: 'hover:shadow-[0_12px_45px_rgba(59,130,246,0.22)]',
    topBar: 'from-blue-400 via-sky-400 to-cyan-400',
    glowOrb: 'bg-blue-500/15 group-hover:bg-blue-400/25',
    nodeBg: 'bg-blue-950',
    nodeBorder: 'border-blue-400',
    nodeGlow: 'shadow-[0_0_28px_rgba(59,130,246,0.55)]',
    nodeText: 'text-blue-300',
    checkIcon: 'text-blue-400',
    dateBadge: 'bg-blue-950/80 border-blue-500/40 text-blue-200',
    strokeHex: '#3b82f6',
    secondaryHex: '#22d3ee',
    hudLabel: 'EVALUATION ARENA // 05'
  }
};

// Stage-specific custom holographic icon & engineering module graphic
function StageModuleIcon({ iconType, accent }) {
  const theme = STAGE_THEMES[accent] || STAGE_THEMES.cyan;

  return (
    <div
      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${theme.nodeBg} border ${theme.badgeBorder} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden`}
      aria-hidden="true"
    >
      {/* Corner tech ticks */}
      <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/40" />
      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/40" />

      {iconType === 'kickoff' && (
        <div className="relative flex flex-col items-center justify-center">
          <Rocket className="w-7 h-7 text-cyan-300" />
          <span className="w-6 h-1 rounded-full bg-cyan-400/60 mt-1 blur-[1px]" />
        </div>
      )}

      {iconType === 'build' && (
        <div className="relative flex items-center justify-center">
          <Bot className="w-7 h-7 text-red-400" />
          <Terminal className="w-3.5 h-3.5 text-orange-300 absolute -bottom-1 -right-1 bg-red-950 rounded p-0.5 border border-red-400/50" />
        </div>
      )}

      {iconType === 'refine' && (
        <div className="relative flex items-center justify-center">
          <Settings className="w-7 h-7 text-purple-300 group-hover:rotate-45 transition-transform duration-500" />
          <Cpu className="w-3.5 h-3.5 text-fuchsia-300 absolute -bottom-1 -right-1 bg-purple-950 rounded p-0.5 border border-purple-400/50" />
        </div>
      )}

      {iconType === 'code-freeze' && (
        <div className="relative flex items-center justify-center">
          <Lock className="w-7 h-7 text-amber-300" />
          <ShieldCheck className="w-3.5 h-3.5 text-yellow-300 absolute -bottom-1 -right-1 bg-amber-950 rounded p-0.5 border border-amber-400/50" />
        </div>
      )}

      {iconType === 'pitch' && (
        <div className="relative flex items-center justify-center">
          <MonitorPlay className="w-7 h-7 text-blue-300" />
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 absolute -top-1 -right-1" />
        </div>
      )}
    </div>
  );
}

// Desktop Zigzag SVG Connector between stage cards
function ZigzagRouteConnector({ fromAlign, fromColor, toColor }) {
  // If fromAlign === 'left', curve from left-center to right-center; otherwise right-center to left-center
  const pathData =
    fromAlign === 'left'
      ? 'M 280 0 C 280 55, 720 45, 720 100'
      : 'M 720 0 C 720 55, 280 45, 280 100';

  const gradientId = `grad-${fromAlign}-${fromColor}-${toColor}`.replace(/[^a-zA-Z0-9-_]/g, '');

  return (
    <div
      className="hidden lg:block relative w-full h-20 -my-2 pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={fromColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor={toColor} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Soft outer glow path */}
        <path
          d={pathData}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeOpacity="0.18"
          strokeLinecap="round"
        />

        {/* Solid base circuit track */}
        <path
          d={pathData}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeOpacity="0.45"
        />

        {/* Animated glowing dashed energy pulse */}
        <path
          d={pathData}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-route-dash"
        />
      </svg>
    </div>
  );
}

// Individual Game Stage Milestone Row
function StageMilestoneRow({ stage, index, nextStage }) {
  const [rowRef, rowRevealed] = useStageReveal(0.12);
  const theme = STAGE_THEMES[stage.accent] || STAGE_THEMES.cyan;
  const isLeft = stage.align === 'left';
  const nextTheme = nextStage ? STAGE_THEMES[nextStage.accent] || STAGE_THEMES.cyan : null;

  return (
    <div id={stage.id} ref={rowRef} className="relative scroll-mt-28">
      {/* Desktop 3-column Zigzag Grid / Mobile & Tablet Vertical Timeline Row */}
      <div className="relative flex flex-row lg:grid lg:grid-cols-12 items-start lg:items-center gap-4 sm:gap-6 lg:gap-0">
        
        {/* ===============================================================
            MOBILE / TABLET LEFT MILESTONE NODE & SPINE (< 1024px)
            =============================================================== */}
        <div className="flex lg:hidden flex-col items-center self-stretch flex-shrink-0">
          {/* Glowing Numbered Node */}
          <div
            className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${theme.nodeBg} border-2 ${theme.nodeBorder} ${theme.nodeGlow} flex flex-col items-center justify-center transition-all duration-500 ${
              rowRevealed ? 'scale-100 opacity-100' : 'scale-90 opacity-85'
            }`}
          >
            <span className="text-[8px] font-bold font-['Orbitron'] text-gray-300 uppercase tracking-tighter">
              STAGE
            </span>
            <span className={`text-base sm:text-lg font-black font-['Orbitron'] ${theme.nodeText} leading-none`}>
              {stage.number}
            </span>
          </div>

          {/* Vertical Glowing Connector Spine to Next Stage */}
          <div className="w-1 flex-1 my-1.5 rounded-full bg-gradient-to-b from-cyan-400/70 via-purple-500/50 to-amber-400/70 relative overflow-hidden min-h-[40px]">
            <div className="absolute inset-0 bg-white/30 animate-pulse" />
          </div>
        </div>

        {/* ===============================================================
            DESKTOP LEFT COLUMN (Col 1–5)
            =============================================================== */}
        <div
          className={`hidden lg:block lg:col-span-5 ${
            isLeft ? 'pr-4' : 'pointer-events-none'
          }`}
        >
          {isLeft ? (
            <StageCard stage={stage} theme={theme} revealed={rowRevealed} />
          ) : (
            /* Subtle HUD Telemetry Coordinates on opposite side for visual balance */
            <div className="flex flex-col items-end pr-8 opacity-45 select-none">
              <span className="text-[11px] font-['Orbitron'] font-bold tracking-[0.25em] text-gray-400 uppercase">
                {theme.hudLabel}
              </span>
              <span className="text-xs font-mono text-gray-500 mt-1">
                {stage.date}
              </span>
            </div>
          )}
        </div>

        {/* ===============================================================
            DESKTOP CENTER MILESTONE NODE COLUMN (Col 6–7)
            =============================================================== */}
        <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center relative z-20">
          {/* Horizontal branch line connecting node to left or right card */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-[2px] w-1/2 ${
              isLeft ? 'left-0' : 'right-0'
            }`}
            style={{
              background: `linear-gradient(90deg, ${theme.strokeHex}, ${theme.secondaryHex})`
            }}
          />

          {/* Large Glowing Numbered Milestone Node */}
          <div
            className={`relative w-20 h-20 rounded-3xl ${theme.nodeBg} border-2 ${theme.nodeBorder} ${theme.nodeGlow} flex flex-col items-center justify-center transition-all duration-500 ${
              rowRevealed ? 'scale-100 opacity-100' : 'scale-90 opacity-85'
            }`}
          >
            {/* Outer rotating/pulsing HUD ring */}
            <div
              className={`absolute -inset-2 rounded-3xl border ${theme.badgeBorder} opacity-50 pointer-events-none`}
            />
            <span className="text-[9px] font-bold font-['Orbitron'] text-gray-300 tracking-[0.18em] uppercase">
              STAGE
            </span>
            <span className={`text-2xl font-black font-['Orbitron'] ${theme.nodeText} leading-tight`}>
              {stage.number}
            </span>
          </div>
        </div>

        {/* ===============================================================
            DESKTOP RIGHT COLUMN (Col 8–12)
            =============================================================== */}
        <div
          className={`hidden lg:block lg:col-span-5 ${
            !isLeft ? 'pl-4' : 'pointer-events-none'
          }`}
        >
          {!isLeft ? (
            <StageCard stage={stage} theme={theme} revealed={rowRevealed} />
          ) : (
            <div className="flex flex-col items-start pl-8 opacity-45 select-none">
              <span className="text-[11px] font-['Orbitron'] font-bold tracking-[0.25em] text-gray-400 uppercase">
                {theme.hudLabel}
              </span>
              <span className="text-xs font-mono text-gray-500 mt-1">
                {stage.date}
              </span>
            </div>
          )}
        </div>

        {/* ===============================================================
            MOBILE / TABLET SINGLE-COLUMN CARD (< 1024px)
            =============================================================== */}
        <div className="flex-1 min-w-0 lg:hidden pb-8">
          <StageCard stage={stage} theme={theme} revealed={rowRevealed} />
        </div>
      </div>

      {/* Desktop Zigzag Animated SVG Connector to next stage */}
      {nextStage && nextTheme && (
        <ZigzagRouteConnector
          fromAlign={stage.align}
          fromColor={theme.strokeHex}
          toColor={nextTheme.strokeHex}
        />
      )}
    </div>
  );
}

// Reusable Futuristic Game Stage Card
function StageCard({ stage, theme, revealed }) {
  return (
    <article
      className={`group relative rounded-3xl bg-slate-950/90 border ${theme.cardBorder} p-5 sm:p-7 transition-all duration-500 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] ${theme.cardShadow} overflow-hidden ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-4'
      }`}
    >
      {/* Top Stage Accent Bar */}
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${theme.topBar}`} />

      {/* Soft Stage-Specific Ambient Glow */}
      <div
        className={`absolute -top-24 -right-24 w-52 h-52 ${theme.glowOrb} rounded-full blur-3xl transition-all duration-500 pointer-events-none`}
      />

      {/* Corner HUD Brackets */}
      <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-white/20 pointer-events-none" />
      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-white/20 pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Card Header: Stage Label, Title, Date, and Module Icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full ${theme.badgeBg} border ${theme.badgeBorder} ${theme.badgeText} text-[10px] font-black font-['Orbitron'] uppercase tracking-[0.18em]`}
              >
                {stage.stageLabel}
              </span>
              <span
                className={`px-3 py-1 rounded-full border ${theme.dateBadge} text-xs font-bold flex items-center space-x-1.5`}
              >
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{stage.date}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase font-['Orbitron'] text-white tracking-wide">
              {stage.fullTitle}
            </h2>
          </div>

          <StageModuleIcon iconType={stage.iconType} accent={stage.accent} />
        </div>

        {/* Concise Stage Description */}
        <p className="text-sm sm:text-base text-gray-200 font-semibold border-l-2 border-white/25 pl-3.5 leading-relaxed">
          {stage.description}
        </p>

        {/* Stage Checklist */}
        <div className="space-y-2.5 pt-1">
          <span className="block text-[10px] font-bold font-['Orbitron'] uppercase tracking-[0.2em] text-gray-400">
            MISSION OBJECTIVES & CHECKLIST
          </span>
          <ul className="space-y-2.5 text-sm text-gray-200 font-medium">
            {stage.checklist.map((item, idx) => (
              <li
                key={idx}
                style={{ transitionDelay: `${idx * 60}ms` }}
                className="flex items-start space-x-2.5 leading-relaxed"
              >
                <CheckCircle2 className={`w-4 h-4 ${theme.checkIcon} mt-1 flex-shrink-0`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Special Callout for STAGE 04 — CODE FREEZE */}
        {stage.specialCallout && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-950/60 border border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <span className="text-xs font-black font-['Orbitron'] uppercase tracking-wider text-amber-200">
                {stage.specialCallout.label}
              </span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-gray-950 border border-amber-400/40 text-xs font-black font-['Orbitron'] text-amber-300 tracking-wider uppercase self-start sm:self-center">
              {stage.specialCallout.value}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function SchedulePage() {
  const [headerRef, headerRevealed] = useStageReveal(0.05);
  const [finalRef, finalRevealed] = useStageReveal(0.12);
  const [ctaRef, ctaRevealed] = useStageReveal(0.12);
  const mapContainerRef = useRef(null);
  const [scrollMarkerPercent, setScrollMarkerPercent] = useState(12);

  // Visual navigation marker along the schedule route as the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (!mapContainerRef.current) return;
      const rect = mapContainerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;
      const totalHeight = rect.height || 1;
      const scrolledIntoMap = viewportHeight * 0.45 - rect.top;
      const ratio = Math.max(0.06, Math.min(0.96, scrolledIntoMap / totalHeight));
      setScrollMarkerPercent(Math.round(ratio * 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white font-['Rajdhani'] pt-20 pb-24 selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      
      {/* =====================================================================
          1. TECHNICAL GRID & ATMOSPHERIC GAME LIGHTING
          ===================================================================== */}
      <div className="fixed inset-0 bg-tech-grid pointer-events-none opacity-65 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[420px] bg-red-500/8 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/3 left-0 w-[500px] h-[420px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* =====================================================================
          2. SCHEDULE PAGE HEADER (COMPACT CINEMATIC PROTOCOL HEADER)
          ===================================================================== */}
      <header
        ref={headerRef}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12 text-center"
      >
        <div className="relative rounded-3xl border border-cyan-500/25 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-10 py-10 sm:py-12 overflow-hidden shadow-[0_0_55px_rgba(0,0,0,0.85)]">
          {/* Top Animated Scanline */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-horizontal pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-slate-950/90 pointer-events-none" />

          {/* Corner HUD Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

          {/* Small Label: 48-HOUR NATIONAL LEVEL HACKATHON */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-[0.22em] uppercase font-['Orbitron'] shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-4">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>48-HOUR NATIONAL LEVEL HACKATHON</span>
          </div>

          {/* Main Title: INNOSPRINT & Subtitle: EVENT SCHEDULE */}
          <div
            className={`space-y-1.5 transition-all duration-700 ${
              headerRevealed ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-4'
            }`}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase font-['Orbitron'] tracking-tight text-white">
              INNO<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]">SPRINT</span>
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl font-black uppercase font-['Orbitron'] tracking-[0.18em] text-cyan-300">
              EVENT SCHEDULE
            </p>
          </div>

          {/* Supporting Text: YOUR JOURNEY FROM IDEA TO IMPACT */}
          <p className="mt-3 text-xs sm:text-sm md:text-base font-bold font-['Orbitron'] tracking-[0.22em] uppercase text-amber-300/95">
            YOUR JOURNEY FROM IDEA TO IMPACT
          </p>

          {/* Three Compact Information Panels */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto">
            {[
              {
                icon: Calendar,
                label: 'EVENT DATES',
                value: 'OCT 26–28, 2026',
                border: 'border-cyan-500/40',
                iconColor: 'text-cyan-400'
              },
              {
                icon: MapPin,
                label: 'HOST VENUE',
                value: 'VVIT UNIVERSITY, GUNTUR, ANDHRA PRADESH',
                border: 'border-amber-500/40',
                iconColor: 'text-amber-400'
              },
              {
                icon: Clock,
                label: 'CHALLENGE FORMAT',
                value: '48 HOURS OF INNOVATION',
                border: 'border-blue-500/40',
                iconColor: 'text-blue-400'
              }
            ].map((panel, idx) => {
              const IconComp = panel.icon;
              return (
                <div
                  key={panel.value}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-gray-900/90 border ${panel.border} flex items-center space-x-3 text-left shadow-lg transition-all duration-500 hover:border-cyan-400/70 ${
                    headerRevealed ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-3'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-gray-950 border border-white/10 flex-shrink-0">
                    <IconComp className={`w-5 h-5 ${panel.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 font-['Orbitron']">
                      {panel.label}
                    </span>
                    <strong className="block text-xs sm:text-sm font-black uppercase font-['Orbitron'] text-white tracking-wider mt-0.5 leading-snug">
                      {panel.value}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Stage Waypoint Quick-Jump Bar */}
          <nav
            aria-label="Schedule Stage Quick Navigation"
            className="mt-7 pt-5 border-t border-gray-800/80 flex flex-wrap items-center justify-center gap-2"
          >
            {SCHEDULE_JOURNEY_STAGES.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3 py-1.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 hover:border-cyan-400/60 text-[10px] font-bold font-['Orbitron'] uppercase tracking-wider text-gray-200 hover:text-cyan-300 transition-all"
              >
                <span className="text-cyan-400 mr-1">{s.number}</span>
                {s.title}
              </a>
            ))}
            <a
              href={`#${SCHEDULE_FINAL_STAGE.id}`}
              className="px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/60 border border-amber-500/40 text-[10px] font-bold font-['Orbitron'] uppercase tracking-wider text-amber-300 transition-all flex items-center space-x-1"
            >
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>RESULTS</span>
            </a>
          </nav>
        </div>
      </header>

      {/* =====================================================================
          3. MAIN FEATURE — VERTICAL GAME-MAP PROGRESSION PATH
          ===================================================================== */}
      <section
        ref={mapContainerRef}
        aria-label="48-Hour Hackathon Progression Map"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12"
      >
        {/* Desktop Central Vertical Guide Track & Illuminated Scroll Marker */}
        <div
          className="hidden lg:block absolute top-10 bottom-28 left-1/2 -translate-x-1/2 w-[3px] bg-gray-900/90 rounded-full pointer-events-none z-0"
          aria-hidden="true"
        >
          {/* Illuminated Route Progress Fill */}
          <div
            className="w-full rounded-full bg-gradient-to-b from-cyan-400 via-red-500 via-purple-500 via-amber-400 to-blue-400 transition-all duration-300"
            style={{ height: `${scrollMarkerPercent}%` }}
          />
          {/* Illuminated Navigation Marker Orb */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-300 border-2 border-white shadow-[0_0_20px_#22d3ee] transition-all duration-300"
            style={{ top: `${scrollMarkerPercent}%` }}
          />
        </div>

        {/* Stages 01 to 05 */}
        <div className="relative z-10 space-y-2 lg:space-y-0">
          {SCHEDULE_JOURNEY_STAGES.map((stage, index) => (
            <StageMilestoneRow
              key={stage.id}
              stage={stage}
              index={index}
              nextStage={SCHEDULE_JOURNEY_STAGES[index + 1] || null}
            />
          ))}
        </div>

        {/* Connector from Stage 05 into Final Stage */}
        <div
          className="hidden lg:flex flex-col items-center justify-center h-20 -my-1 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-1 h-full bg-gradient-to-b from-blue-400 via-cyan-300 to-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        </div>

        {/* ===================================================================
            4. FINAL STAGE — RESULTS & RECOGNITION (GRAND FINALE MILESTONE)
            =================================================================== */}
        <div
          id={SCHEDULE_FINAL_STAGE.id}
          ref={finalRef}
          className="relative z-20 mt-4 lg:mt-0 scroll-mt-28"
        >
          <article
            className={`relative rounded-3xl bg-gradient-to-b from-amber-950/45 via-slate-950 to-slate-950 border-2 border-amber-400/60 p-6 sm:p-10 lg:p-12 shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden transition-all duration-700 ${
              finalRevealed ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-4'
            }`}
          >
            {/* Metallic Gold Top Bar */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[250px] bg-amber-400/15 blur-[110px] rounded-full pointer-events-none" />

            {/* Celebratory Corner Sparks */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-400/70 pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-400/70 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-400/70 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-400/70 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
              {/* Futuristic Trophy Emblem */}
              <div className="relative animate-trophy-float">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-amber-950 border-2 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.45)] flex items-center justify-center">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                </div>
                <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-black font-['Orbitron'] text-[10px] uppercase tracking-wider shadow">
                  FINALE
                </span>
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-amber-950/90 border border-amber-400/50 text-amber-300 text-xs font-black font-['Orbitron'] uppercase tracking-[0.2em]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{SCHEDULE_FINAL_STAGE.stageLabel}</span>
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                  {SCHEDULE_FINAL_STAGE.fullTitle}
                </h2>
                <p className="text-gray-200 text-sm sm:text-base font-semibold max-w-xl mx-auto">
                  {SCHEDULE_FINAL_STAGE.description}
                </p>
              </div>

              {/* Four Recognition Pillars */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
                {SCHEDULE_FINAL_STAGE.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-950/90 border border-amber-500/35 hover:border-amber-400/70 flex items-start space-x-3 transition-colors"
                  >
                    <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-400/40 text-amber-300 flex-shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold font-['Orbitron'] text-amber-400/90 uppercase tracking-wider">
                        RECOGNITION 0{idx + 1}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white leading-snug">
                        {item}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* =====================================================================
          5. CALL-TO-ACTION SECTION
          ===================================================================== */}
      <section
        ref={ctaRef}
        aria-label="Schedule Call to Action"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mt-8 text-center"
      >
        <div
          className={`rounded-3xl bg-slate-950/90 border border-cyan-500/35 p-8 sm:p-12 shadow-[0_0_50px_rgba(6,182,212,0.14)] space-y-6 transition-all duration-700 ${
            ctaRevealed ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-4'
          }`}
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold font-['Orbitron'] uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>48-HOUR MISSION BRIEFING COMPLETE</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase font-['Orbitron'] text-white">
            READY FOR THE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-400">
              48-HOUR JOURNEY?
            </span>
          </h2>

          <p className="text-gray-200 text-sm sm:text-lg font-extrabold font-['Orbitron'] tracking-wider uppercase max-w-2xl mx-auto">
            FORM YOUR TEAM. PLAN YOUR IDEAS. SEE YOU AT INNOSPRINT!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider font-['Orbitron'] flex items-center justify-center space-x-2.5 shadow-[0_8px_30px_rgba(249,115,22,0.35)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-cyan-400/60 text-gray-200 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wider font-['Orbitron'] flex items-center justify-center space-x-2 transition-all"
            >
              <span>VIEW FULL DETAILS</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
