import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { THEMES } from '../lib/constants';
import { Bot, Cpu, Sparkles, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ThemesPage() {
  const [selectedTrack, setSelectedTrack] = useState('all');

  const filteredThemes = selectedTrack === 'all' 
    ? THEMES 
    : THEMES.filter(t => t.id === selectedTrack);

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-10 h-10 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-10 h-10 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-10 h-10 text-purple-400" />;
      default: return <Zap className="w-10 h-10 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
      
      {/* HEADER */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-widest uppercase font-['Orbitron']">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>NATIONAL LEVEL HACKATHON • COMPETITION TRACKS</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase font-['Orbitron']">
          HACKATHON <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-400">THEMES</span>
        </h1>
        <p className="text-gray-300 text-base max-w-2xl mx-auto font-medium">
          Choose from three primary innovation tracks for the 48-Hour National Level Hackathon. Each track features specialized technical requirements, judging rubrics, and mentorship support.
        </p>

        {/* Filter buttons */}
        <div className="pt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setSelectedTrack('all')}
            className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all font-['Orbitron'] ${
              selectedTrack === 'all'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 scale-105'
                : 'bg-gray-900 border border-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            All Tracks
          </button>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTrack(theme.id)}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all font-['Orbitron'] ${
                selectedTrack === theme.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 scale-105'
                  : 'bg-gray-900 border border-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </section>

      {/* THEME DETAILS & PROBLEM STATEMENTS */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        {filteredThemes.map((theme) => (
          <div
            key={theme.id}
            className="p-8 sm:p-10 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-cyan-500/40 transition-all space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-8">
              <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl bg-gray-950 border border-gray-700 shadow-inner">
                  {renderIcon(theme.icon)}
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-['Orbitron'] uppercase">
                    {theme.badge}
                  </span>
                  <h2 className="text-3xl font-black uppercase text-white font-['Orbitron'] mt-2">
                    {theme.name}
                  </h2>
                </div>
              </div>
              <Link
                to={`/register?theme=${encodeURIComponent(theme.name)}`}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 text-white font-extrabold uppercase text-xs tracking-wider font-['Orbitron'] shadow-md self-start md:self-center hover:scale-105 transition-transform"
              >
                Register For This Track
              </Link>
            </div>

            <p className="text-gray-300 text-base leading-relaxed font-medium">
              {theme.description}
            </p>

            {/* Key focus areas */}
            <div>
              <h4 className="text-sm font-extrabold uppercase text-amber-400 font-['Orbitron'] mb-3">
                Key Technical Focus Areas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {theme.keyPoints.map((point, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 flex items-center space-x-3 text-xs font-semibold text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-16 text-center">
        <Link
          to="/register"
          className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 text-white font-extrabold uppercase text-sm tracking-wider font-['Orbitron'] shadow-xl hover:scale-105 transition-all"
        >
          <span>Select Your Theme & Register Team</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

    </div>
  );
}
