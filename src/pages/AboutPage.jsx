import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_DETAILS, THEMES, DEFAULT_RULES, DEFAULT_SCHEDULE, DEFAULT_FAQS, PARTNERS_DATA } from '../lib/constants';
import { Zap, Calendar, MapPin, Award, CheckCircle2, ChevronRight, HelpCircle, FileText, Users, Clock, ShieldAlert, Sparkles, Building2 } from 'lucide-react';

export default function AboutPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('agentic-ai');

  const currentThemeData = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
      
      {/* BANNER HEADER */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 border-b border-cyan-500/20 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-widest uppercase font-['Orbitron']">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>ABOUT INNOSPRINT 2026 • NATIONAL LEVEL HACKATHON</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase font-['Orbitron']">
            48-HOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-400">NATIONAL LEVEL HACKATHON</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            INNOSPRINT is a premier 48-Hour National Level Hackathon bringing together student innovators to tackle high-impact challenges in Agentic AI, Robotic AI, and Generative AI at {EVENT_DETAILS.venueShort}.
          </p>

          <div className="pt-6 flex flex-wrap justify-center items-center gap-4 text-sm font-semibold">
            <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{EVENT_DETAILS.dates}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>VVITU, Guntur, AP</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{EVENT_DETAILS.prizePool} Cash Prize Pool</span>
            </div>
          </div>
        </div>
      </section>

      {/* A & B: EVENT OBJECTIVES */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black uppercase font-['Orbitron']">
              EVENT <span className="text-cyan-400">OBJECTIVES</span>
            </h2>
            <p className="text-gray-300 text-base leading-relaxed font-medium">
              INNOSPRINT is structured to empower student developers with practical problem-solving capabilities, fast-paced AI prototyping, and interdisciplinary collaboration.
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-start space-x-4">
                <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400 font-bold font-mono">01</div>
                <div>
                  <h4 className="font-extrabold uppercase text-white font-['Orbitron']">Practical Innovation</h4>
                  <p className="text-xs text-gray-400 mt-1">Translate theoretical AI algorithms into working physical or software prototypes within 48 hours.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-start space-x-4">
                <div className="p-2.5 rounded-lg bg-amber-950 text-amber-400 font-bold font-mono">02</div>
                <div>
                  <h4 className="font-extrabold uppercase text-white font-['Orbitron']">Teamwork & Leadership</h4>
                  <p className="text-xs text-gray-400 mt-1">Foster collaborative spirit across engineering branches, data science, and design disciplines.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-start space-x-4">
                <div className="p-2.5 rounded-lg bg-purple-950 text-purple-400 font-bold font-mono">03</div>
                <div>
                  <h4 className="font-extrabold uppercase text-white font-['Orbitron']">Expert Technical Guidance</h4>
                  <p className="text-xs text-gray-400 mt-1">Access one-on-one mentorship from experienced faculty and industry practitioners throughout the sprint.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-gray-900 via-gray-950 to-black border border-cyan-500/30 space-y-6">
            <h3 className="text-2xl font-black uppercase text-amber-400 font-['Orbitron']">PARTICIPANT BENEFITS</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>₹50,000 Total Prize Pool:</strong> Grand cash rewards awarded to top performing project submissions.</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>Official Participation Certificates:</strong> Distributed to all registered participants presenting a valid project.</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>Live Mentorship & Hardware Labs:</strong> On-site assistance for sensor integration, GPU setup, and model deployment.</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>Portfolio & Industry Recognition:</strong> Showcase your working AI/Robotics project to judges and tech leaders.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* INDUSTRY & INSTITUTIONAL COLLABORATION */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950 border-t border-cyan-500/20">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>PARTNERSHIP HIERARCHY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase font-['Orbitron']">
              INDUSTRY & INSTITUTIONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-orange-400">COLLABORATION</span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
              INNO SPRINT 2026 brings together the advanced technical capabilities of <strong className="text-white">NAPROCS Technologies Pvt. Ltd.</strong> and the academic innovation ecosystem of <strong className="text-white">Vasireddy Venkatadri Institute of Technology (VVITU)</strong>, supported by its dedicated student councils.
            </p>
          </div>

          {/* FEATURED TECHNOLOGY PARTNER: NAPROCS */}
          <div className="group relative rounded-[26px] p-6 sm:p-8 bg-gradient-to-br from-[#0c132c]/95 via-[#080d22]/98 to-[#040816] border border-amber-500/35 hover:border-cyan-400/60 backdrop-blur-md shadow-[0_12px_45px_rgba(245,158,11,0.12)] hover:shadow-[0_18px_55px_rgba(6,182,212,0.22)] transition-all duration-300 ease-out hover:-translate-y-1.5 motion-reduce:transform-none overflow-hidden">
            {/* Top Amber-to-Cyan Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-orange-400 to-cyan-400 opacity-90 group-hover:h-[3px] transition-all duration-300" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-stretch gap-6 sm:gap-8">
              {/* Logo Box */}
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

              {/* Information */}
              <div className="flex-1 flex flex-col justify-between text-center lg:text-left">
                <div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-2.5">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                      {PARTNERS_DATA.technologyPartner.badge}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
                      Industry Collaboration with VVIT
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    {PARTNERS_DATA.technologyPartner.name}
                  </h3>

                  <p className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-200 to-orange-300 font-heading mt-1">
                    {PARTNERS_DATA.technologyPartner.heading}
                  </p>

                  <p className="font-body text-xs sm:text-sm text-gray-300 leading-relaxed mt-3 font-normal max-w-3xl">
                    {PARTNERS_DATA.technologyPartner.description}
                  </p>
                </div>

                {/* Highlights */}
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
                    Student Mentorship
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INSTITUTIONAL INNOVATION ECOSYSTEM */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase font-['Orbitron'] text-white flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                VVIT INSTITUTIONAL INNOVATION ECOSYSTEM
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
                Powered by collaboration between industry and student innovation communities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
              {PARTNERS_DATA.institutionalEcosystem.map((partner) => (
                <div
                  key={partner.id}
                  className="group relative rounded-[22px] p-5 sm:p-6 bg-gradient-to-b from-[#0a122c]/95 via-[#070d24]/95 to-[#040816]/98 border border-white/[0.08] hover:border-cyan-400/50 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:shadow-[0_12px_35px_rgba(6,182,212,0.18)] transition-all duration-300 ease-out hover:-translate-y-1.5 motion-reduce:transform-none flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent group-hover:via-cyan-400/80 transition-all duration-300" />

                  <div className="mb-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold font-mono tracking-wider uppercase">
                      {partner.badge}
                    </span>
                  </div>

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

                  <div className="flex-1 flex flex-col items-center text-center justify-center">
                    <h4 className="font-heading font-semibold text-base sm:text-lg text-white tracking-tight group-hover:text-cyan-300 transition-colors duration-250">
                      {partner.name}
                    </h4>

                    <p className="font-body text-xs text-gray-300/85 leading-relaxed mt-2 font-normal">
                      {partner.description}
                    </p>
                  </div>

                  <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/30 to-blue-500/30 mx-auto mt-4 rounded-full group-hover:w-14 group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* C & D: THEMES & TRACKS */}
      <section className="py-16 px-4 bg-gray-900/30 border-y border-gray-800" id="themes-section">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black uppercase font-['Orbitron']">
              HACKATHON <span className="text-cyan-400">THEMES & TRACKS</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              Click a theme tab to inspect the core technical focus areas for each track.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all font-['Orbitron'] ${
                  selectedTheme === theme.id
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-gray-900 border border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>

          <div className="p-8 rounded-2xl bg-gray-950 border border-cyan-500/30 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-['Orbitron'] uppercase">
                  {currentThemeData.badge}
                </span>
                <h3 className="text-2xl font-black uppercase text-white font-['Orbitron'] mt-2">
                  {currentThemeData.name}
                </h3>
              </div>
              <p className="text-sm text-gray-400 max-w-xl font-medium">
                {currentThemeData.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest font-['Orbitron']">
                <span>Key Technical Focus Areas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentThemeData.keyPoints.map((point, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center space-x-3 text-xs font-semibold text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E & F: SCHEDULE */}
      <section className="py-16 px-4 max-w-5xl mx-auto" id="schedule">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase font-['Orbitron']">
            48-HOUR <span className="text-amber-400">EVENT SCHEDULE</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            October 26–28, 2026 Timeline at VVITU Campus.
          </p>
        </div>

        <div className="space-y-4">
          {DEFAULT_SCHEDULE.map((item, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 text-xs text-cyan-400 font-bold uppercase font-['Orbitron']">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.date} • {item.time}</span>
                </div>
                <h3 className="text-xl font-extrabold text-white font-['Orbitron']">{item.title}</h3>
                <p className="text-xs text-gray-300 font-medium">{item.description}</p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-black/50 border border-gray-700 text-xs font-semibold text-gray-400 flex items-center space-x-1.5 self-start md:self-center">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{item.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* H: RULES AND ELIGIBILITY */}
      <section className="py-16 px-4 bg-gray-900/30 border-y border-gray-800">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black uppercase font-['Orbitron']">
              RULES & <span className="text-purple-400">ELIGIBILITY</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              Guidelines ensuring a fair and competitive hackathon experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {DEFAULT_RULES.map((ruleCat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
                <h3 className="text-xl font-extrabold text-cyan-300 font-['Orbitron'] flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{ruleCat.category}</span>
                </h3>
                <ul className="space-y-3 text-xs text-gray-300 leading-relaxed font-medium">
                  {ruleCat.items.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* I: FAQ ACCORDION */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black uppercase font-['Orbitron']">
            ABOUT <span className="text-cyan-400">FAQ</span>
          </h2>
        </div>

        <div className="space-y-4">
          {DEFAULT_FAQS.map((faq, idx) => (
            <div key={idx} className="rounded-xl bg-gray-900/60 border border-gray-800 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-base text-gray-200 hover:text-cyan-300 font-['Orbitron']"
              >
                <span>{faq.question}</span>
                <span className="text-cyan-400 font-mono text-lg">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="p-5 pt-0 text-xs text-gray-300 leading-relaxed border-t border-gray-800/50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* J: REGISTRATION CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-r from-cyan-950 via-gray-900 to-amber-950 border border-cyan-500/40 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase font-['Orbitron']">
            REGISTRATIONS ARE <span className="text-amber-400">CLOSED</span>
          </h2>
          <p className="text-gray-300 text-sm font-medium">
            The registration window for INNOSPRINT 2026 has concluded. Registered teams can check evaluation and dossier status below.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/status"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold uppercase tracking-wider text-sm font-['Orbitron'] shadow-lg hover:scale-105 transition-transform"
            >
              Check Registration Status
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-200 font-bold uppercase tracking-wider text-sm font-['Orbitron'] hover:bg-gray-800 transition-colors"
            >
              Contact Organizers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
