import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import imagesLoaded from 'imagesloaded';
import { cn } from '../lib/utils';
import { Bot, Cpu, Sparkles, Zap, ChevronRight, Shield, Award, ExternalLink, ArrowRight } from 'lucide-react';
import { PARTNERS_DATA } from '../lib/constants';

gsap.registerPlugin(ScrollTrigger);

export function StaggeredGrid({
  centerText = "INNOSPRINT 2026",
  className,
  showFooter = false
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const gridFullRef = useRef(null);
  const textRef = useRef(null);

  // Bento Grid State (Default active index = 0 for Theme 01 Flagship Track)
  const [activeBento, setActiveBento] = useState(0);

  // Four Official Hackathon Partners & Incubators
  const institutionalPartners = [
    {
      id: 'vvitu',
      name: 'VVIT University',
      description: 'Vasireddy Venkatadri Institute of Technology',
      img: '/logos/vvitu.jpg',
      badge: 'HOST INSTITUTION'
    },
    {
      id: 'iic',
      name: 'IIC',
      description: "Ministry of Education's Innovation Council",
      img: '/logos/iic.jpg',
      badge: 'GOVT RECOGNIZED'
    },
    {
      id: 'vvisc',
      name: 'VVISC',
      description: 'Student Innovation Club',
      img: '/logos/vvisc.jpg',
      badge: 'STUDENT CLUB'
    },
    {
      id: 'ecell',
      name: 'E-CELL VVITU',
      description: 'Entrepreneurship Cell VVITU',
      img: '/logos/ecell.png',
      badge: 'INCUBATION'
    }
  ];

  // Preserved Title Innovation Partner & Sponsor
  const titleSponsor = {
    id: 'naprocs',
    name: 'NAPROCS',
    description: 'Next-Gen Neural Computing, Custom Accelerators & Physical AI Architecture',
    img: '/logos/napros.png',
    badge: 'TITLE INNOVATION PARTNER',
    tagline: 'OFFICIAL TITLE SPONSOR',
    poweredText: 'POWERED BY NAPROCS'
  };

  // Backwards compatibility alias
  const partnerLogos = [
    institutionalPartners[0],
    institutionalPartners[1],
    titleSponsor,
    institutionalPartners[2],
    institutionalPartners[3]
  ];

  // Bento Items corresponding to the 3 Official INNOSPRINT Competition Themes
  const bentoItems = [
    {
      id: 'agentic-ai',
      trackNum: 'TRACK 01',
      badge: 'FLAGSHIP TRACK',
      title: 'AGENTIC AI',
      themeValue: 'Agentic AI',
      subtitle: 'AUTONOMOUS AGENTS & WORKFLOWS',
      description: 'Develop autonomous agents that plan, execute multi-step workflows, interact with APIs, and solve complex real-world tasks with minimal human intervention.',
      tags: [
        'Autonomous Multi-Agent Collaboration',
        'Intelligent Tool & API Calling Workflows',
        'Self-Correcting & Reasoning Systems'
      ],
      icon: <Bot className="w-6 h-6 text-cyan-400" />,
      image: '/robot-gold-black.jpg',
      color: 'cyan'
    },
    {
      id: 'robotic-ai',
      trackNum: 'TRACK 02',
      badge: 'CORE TRACK',
      title: 'ROBOTIC AI',
      themeValue: 'Robotic AI',
      subtitle: 'PHYSICAL AI & INTELLIGENT AUTOMATION',
      description: 'Integrate artificial intelligence with physical or simulated robotics, sensor networks, computer vision, and real-world automation.',
      tags: [
        'Intelligent Autonomous Robotics',
        'Real-time Sensor Processing & IoT Integration',
        'Computer Vision for Navigation & Object Handling'
      ],
      icon: <Cpu className="w-6 h-6 text-amber-400" />,
      image: '/robot-red-blue.jpg',
      color: 'amber'
    },
    {
      id: 'generative-ai',
      trackNum: 'TRACK 03',
      badge: 'INNOVATION TRACK',
      title: 'GENERATIVE AI',
      themeValue: 'Generative AI',
      subtitle: 'MULTIMODAL LLMS & SYNTHESIS',
      description: 'Harness multimodal LLMs, diffusion models, and synthesis architectures to revolutionize content generation, creative design, and technical productivity.',
      tags: [
        'Multimodal Text, Code & Media Synthesis',
        'Domain-Specific Fine-Tuned GenAI Workflows',
        'Generative Assistive Tools for Education & Healthcare'
      ],
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      image: '/mobile-city-bg.jpg',
      color: 'purple'
    }
  ];

  const splitText = (text) => {
    return text.split('').map((char, i) => (
      <span key={i} className="char inline-block" style={{ willChange: 'transform' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  useEffect(() => {
    const handleLoad = () => {
      document.body.classList.remove('loading');
      setIsLoaded(true);
    };

    const imgLoad = imagesLoaded(document.querySelectorAll('.grid__item-img'), { background: true }, handleLoad);

    // Fallback if imagesLoaded doesn't trigger immediately
    const timer = setTimeout(() => setIsLoaded(true), 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Animate Text Element
    if (textRef.current) {
      const chars = textRef.current.querySelectorAll('.char');
      gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top bottom',
          end: 'center center-=15%',
          scrub: 1,
        }
      })
      .from(chars, {
        ease: 'sine.out',
        yPercent: 200,
        autoAlpha: 0,
        stagger: {
          each: 0.04,
          from: 'center'
        }
      });
    }

    // Animate Staggered Full Grid
    if (gridFullRef.current) {
      const gridFullItems = gridFullRef.current.querySelectorAll('.grid__item');
      const numColumns = 7;
      const middleColumnIndex = Math.floor(numColumns / 2);

      const columns = Array.from({ length: numColumns }, () => []);
      gridFullItems.forEach((item) => {
        const colAttr = item.getAttribute('data-col');
        const columnIndex = colAttr !== null ? parseInt(colAttr, 10) : 0;
        if (columns[columnIndex]) {
          columns[columnIndex].push(item);
        }
      });

      columns.forEach((columnItems, columnIndex) => {
        const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.15;

        gsap.timeline({
          scrollTrigger: {
            trigger: gridFullRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 1.2,
          }
        })
        .from(columnItems, {
          yPercent: 250,
          autoAlpha: 0,
          delay: delayFactor,
          ease: 'sine.out',
        });
      });

      // Specific animation for Bento Container
      const bentoContainer = gridFullRef.current.querySelector('.bento-container');
      if (bentoContainer) {
        gsap.timeline({
          scrollTrigger: {
            trigger: gridFullRef.current,
            start: 'top top+=20%',
            end: 'bottom center',
            scrub: 1,
            invalidateOnRefresh: true,
          }
        })
        .to(bentoContainer, {
          y: window.innerHeight * 0.05,
          scale: 1.08,
          zIndex: 100,
          ease: 'power2.out',
          duration: 1,
          force3D: true
        }, 0);
      }
    }
  }, [isLoaded]);

  // Mixed grid items (21 slots for 7 columns x 3 rows)
  const gridLogos = [
    institutionalPartners[0], // VVITU
    institutionalPartners[1], // IIC
    institutionalPartners[2], // VVISC
    institutionalPartners[3], // E-CELL
    institutionalPartners[0], // VVITU
    institutionalPartners[1], // IIC
    institutionalPartners[2], // VVISC
  ];

  return (
    <div className={cn("relative overflow-hidden w-full bg-gray-950 text-white font-['Rajdhani']", className)}>
      
      {/* 1. TOP PARTNER SECTION: INDUSTRY COLLABORATION & VVIT INNOVATION ECOSYSTEM */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-cyan-400 font-heading">
                POWERED BY INDUSTRY. INNOVATION AT VVIT.
              </h3>
            </div>
            <p className="text-gray-300 font-body text-sm sm:text-base max-w-2xl">
              INNO SPRINT 2026 brings together industry expertise and VVIT's student innovation ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              TECHNOLOGY PARTNER
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              HOST & COUNCILS
            </span>
          </div>
        </div>

        {/* FEATURED NAPROCS CARD (PROMINENT TECHNOLOGY PARTNER) */}
        <div className="mb-12 group relative rounded-[26px] p-6 sm:p-8 bg-gradient-to-br from-[#0c132c]/95 via-[#080d22]/98 to-[#040816] border border-amber-500/35 hover:border-cyan-400/60 backdrop-blur-md shadow-[0_12px_45px_rgba(245,158,11,0.12)] hover:shadow-[0_18px_55px_rgba(6,182,212,0.22)] transition-all duration-300 ease-out hover:-translate-y-1.5 motion-reduce:transform-none overflow-hidden">
          {/* Subtle Orange-to-Cyan top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-orange-400 to-cyan-400 opacity-90 group-hover:h-[3px] transition-all duration-300" />
          
          {/* Ambient Corner Glows */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-stretch gap-6 sm:gap-8">
            {/* Left: Dedicated Logo Box */}
            <div className="flex-shrink-0 w-full sm:w-64 lg:w-72 flex flex-col justify-center">
              <div className="w-full h-32 sm:h-36 rounded-2xl bg-white p-5 flex items-center justify-center overflow-hidden shadow-inner border border-white/20 transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transform-none">
                <img
                  src={PARTNERS_DATA.technologyPartner.img}
                  alt={PARTNERS_DATA.technologyPartner.name}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right: Content & Hierarchy */}
            <div className="flex-1 flex flex-col justify-between text-center lg:text-left">
              <div>
                {/* Badge row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-2.5">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    {PARTNERS_DATA.technologyPartner.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
                    Industry Collaboration with VVIT
                  </span>
                </div>

                {/* Company Name */}
                <h4 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight group-hover:text-amber-200 transition-colors">
                  {PARTNERS_DATA.technologyPartner.name}
                </h4>

                {/* Heading */}
                <p className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-200 to-orange-300 font-heading mt-1">
                  {PARTNERS_DATA.technologyPartner.heading}
                </p>

                {/* Supporting description */}
                <p className="font-body text-xs sm:text-sm text-gray-300 leading-relaxed mt-3 font-normal max-w-3xl">
                  {PARTNERS_DATA.technologyPartner.description}
                </p>
              </div>

              {/* Bottom Feature Badges / Highlights */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-gray-300 font-mono">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  AI & Robotics Architecture
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Technical Acceleration
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Ecosystem Support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INSTITUTIONAL COLLABORATION SECTION */}
        <div className="mb-12">
          <div className="mb-6">
            <h4 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              VVIT INSTITUTIONAL INNOVATION ECOSYSTEM
            </h4>
            <p className="text-xs sm:text-sm text-gray-400 font-body mt-1">
              Powered by collaboration between industry and student innovation communities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
            {PARTNERS_DATA.institutionalEcosystem.map((partner) => (
              <div
                key={partner.id}
                className="group relative rounded-[22px] p-5 sm:p-6 bg-gradient-to-b from-[#0a122c]/95 via-[#070d24]/95 to-[#040816]/98 border border-white/[0.08] hover:border-cyan-400/50 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:shadow-[0_12px_35px_rgba(6,182,212,0.18)] transition-all duration-300 ease-out hover:-translate-y-1.5 motion-reduce:transform-none flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top cyan line */}
                <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent group-hover:via-cyan-400/80 transition-all duration-300" />

                {/* Top Badge */}
                <div className="mb-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold font-mono tracking-wider uppercase">
                    {partner.badge}
                  </span>
                </div>

                {/* Dedicated Logo Container */}
                <div className="w-full mb-4">
                  <div className="w-full h-24 sm:h-28 rounded-xl bg-white p-3.5 flex items-center justify-center overflow-hidden shadow-inner border border-white/20 transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transform-none">
                    <img
                      src={partner.img}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Name & Description */}
                <div className="flex-1 flex flex-col items-center text-center justify-center">
                  <h5 className="font-heading font-semibold text-base sm:text-lg text-white tracking-tight group-hover:text-cyan-300 transition-colors duration-250">
                    {partner.name}
                  </h5>

                  <p className="font-body text-xs text-gray-300/85 leading-relaxed mt-2 font-normal">
                    {partner.description}
                  </p>
                </div>

                {/* Bottom accent */}
                <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/30 to-blue-500/30 mx-auto mt-4 rounded-full group-hover:w-14 group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* COLLABORATION BANNER (INDUSTRY × INSTITUTION × INNOVATION) */}
        <div className="relative rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-gray-950 via-cyan-950/40 to-gray-950 border border-cyan-500/30 overflow-hidden shadow-xl">
          {/* Subtle connecting pulse glow */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left max-w-xl">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>PARTNERSHIP ARCHITECTURE</span>
              </div>
              <h4 className="text-lg sm:text-xl font-black uppercase text-white font-heading tracking-wide">
                INDUSTRY <span className="text-amber-400">×</span> INSTITUTION <span className="text-cyan-400">×</span> INNOVATION
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 font-body mt-1 leading-relaxed">
                Connecting technology expertise with VVIT's student innovators to build practical solutions in AI, robotics, and software.
              </p>
            </div>

            {/* Horizontal Visual Graphic */}
            <div className="flex items-center gap-2 sm:gap-3 text-center">
              {/* NAPROCS Node */}
              <div className="px-3.5 py-2 rounded-xl bg-amber-950/70 border border-amber-500/50 shadow-md">
                <span className="block text-[11px] font-mono text-amber-300 font-bold">NAPROCS</span>
                <span className="block text-[9px] text-gray-400 uppercase font-mono">Industry Partner</span>
              </div>

              {/* Connector line 1 */}
              <div className="hidden sm:flex items-center w-6 lg:w-10">
                <div className="w-full h-0.5 bg-gradient-to-r from-amber-500 to-cyan-500 relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute -top-0.5 left-1/2 -translate-x-1/2 animate-pulse" />
                </div>
              </div>
              <span className="sm:hidden text-gray-500 text-xs">×</span>

              {/* VVITU Node */}
              <div className="px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/60 shadow-md">
                <span className="block text-[11px] font-mono text-cyan-300 font-bold">VVIT</span>
                <span className="block text-[9px] text-gray-400 uppercase font-mono">Host Institution</span>
              </div>

              {/* Connector line 2 */}
              <div className="hidden sm:flex items-center w-6 lg:w-10">
                <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute -top-0.5 left-1/2 -translate-x-1/2 animate-pulse" />
                </div>
              </div>
              <span className="sm:hidden text-gray-500 text-xs">×</span>

              {/* Councils Node */}
              <div className="px-3.5 py-2 rounded-xl bg-purple-950/70 border border-purple-500/50 shadow-md">
                <span className="block text-[11px] font-mono text-purple-300 font-bold">VVISC • IIC • E-CELL</span>
                <span className="block text-[9px] text-gray-400 uppercase font-mono">Student Ecosystem</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION HEADER WITH GSAP ANIMATED TITLE */}
      <section className="grid place-items-center w-full relative pt-12 pb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-['Orbitron']">
            COMPETITION TRACKS & BENTO SHOWCASE
          </span>
        </div>
        <div ref={textRef} className="text font-alt uppercase flex content-center text-[clamp(2.5rem,7vw,6rem)] font-black tracking-tight leading-[0.9] text-white font-['Orbitron'] text-center">
          {splitText(centerText)}
        </div>
        <p className="text-sm text-gray-400 font-medium max-w-xl text-center mt-3">
          Hover or click on the track cards below to expand track details, problem statements, and key focus areas.
        </p>
      </section>

      {/* 3. INTERACTIVE BENTO GRID TRACK CARDS */}
      <section className="max-w-7xl mx-auto px-4 py-8 relative">
        <div ref={gridFullRef} className="relative w-full my-4 h-auto min-h-[500px]">
          
          {/* Main Bento Container with 3 Expanding Track Cards */}
          <div className="bento-container w-full grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-20">
            {bentoItems.map((item, index) => {
              const isActive = activeBento === index;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveBento(index)}
                  onMouseEnter={() => setActiveBento(index)}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] border flex flex-col justify-between min-h-[420px]",
                    isActive
                      ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black border-cyan-500/60 shadow-[0_0_40px_rgba(56,189,248,0.25)] scale-[1.02]"
                      : "bg-gray-950/90 border-gray-800 hover:border-gray-700 opacity-90 hover:opacity-100"
                  )}
                >
                  {/* Background Image & Protection Gradient */}
                  {item.image && (
                    <div className="absolute inset-0 overflow-hidden z-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-700",
                          isActive ? "opacity-35 scale-105" : "opacity-15 scale-100"
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
                    </div>
                  )}

                  {/* Top Bar Badges */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold font-['Orbitron'] uppercase tracking-wider border",
                      isActive
                        ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                        : "bg-gray-900 text-gray-400 border-gray-800"
                    )}>
                      {item.trackNum} • {item.badge}
                    </span>

                    <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-700 text-cyan-400 shadow-md">
                      {item.icon}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="relative z-10 space-y-3 my-auto">
                    <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-['Orbitron'] tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-cyan-300 font-bold uppercase tracking-wider font-['Chakra_Petch']">
                      {item.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="relative z-10 pt-4 border-t border-gray-800/80 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-1 rounded-md bg-gray-900/80 border border-gray-700 text-[10px] font-semibold text-gray-300"
                        >
                          • {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/register?theme=${encodeURIComponent(item.themeValue || item.title)}`}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider font-['Orbitron'] shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2"
                    >
                      <span>Select Track & Register</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {showFooter && (
        <footer className="w-full p-8 flex justify-between items-center relative z-50 text-gray-400 uppercase font-medium text-xs tracking-wider border-t border-gray-900">
          <span>INNOSPRINT 2026</span>
          <span>VVITU • Guntur</span>
        </footer>
      )}

    </div>
  );
}

export default StaggeredGrid;
