import React from 'react';
import { Link } from 'react-router-dom';
import { EVENT_DETAILS } from '../lib/constants';
import { Award, Shield, Sparkles, CheckCircle2, ChevronRight, Zap, Lightbulb, Users } from 'lucide-react';

export default function PrizesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Rajdhani'] pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
      
      <section className="py-12 px-4 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-widest uppercase font-['Orbitron']">
          <Award className="w-4 h-4 text-amber-400" />
          <span>NATIONAL LEVEL HACKATHON • REWARDS & RECOGNITION</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase font-['Orbitron']">
          PRIZES & <span className="text-amber-400">BENEFITS</span>
        </h1>
        <p className="text-gray-300 text-base max-w-2xl mx-auto font-medium">
          INNOSPRINT is a 48-Hour National Level Hackathon offering a grand prize pool along with valuable learning opportunities, technical mentorship, and official certification.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Main Prize Pool Banner */}
        <div className="p-10 rounded-3xl bg-gradient-to-r from-amber-950/80 via-gray-900 to-cyan-950/80 border border-amber-500/40 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-['Orbitron'] block mb-2">
            GRAND HACKATHON REWARD
          </span>
          <h2 className="text-5xl sm:text-7xl font-black text-amber-400 font-['Orbitron'] tracking-tight">
            ₹50,000
          </h2>
          <p className="text-xl text-gray-200 font-extrabold uppercase font-['Orbitron'] mt-2">
            TOTAL CASH PRIZE POOL
          </p>
          <p className="text-xs text-gray-400 mt-4 max-w-xl mx-auto font-medium">
            Awarded to top projects across Agentic AI, Robotic AI, and Generative AI tracks based on innovation, technical execution, and real-world impact.
          </p>
          <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-black/60 border border-gray-700 text-[11px] text-gray-400 italic">
            *Final track-wise prize allocation breakdown will be published by the organizing team.
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white font-['Orbitron'] uppercase">
              Certificates for All
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Every participant who completes and presents their project submission will receive an official certificate of participation from VVITU.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-950 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white font-['Orbitron'] uppercase">
              Expert Mentorship
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Work directly with AI and Robotics experts, faculty advisors, and mentors throughout the 48-hour development window.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-950 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white font-['Orbitron'] uppercase">
              Portfolio & Networking
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Build high-quality open-source projects, network with ambitious peers across universities, and showcase your skills to tech leaders.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link
            to="/register"
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 text-white font-extrabold uppercase text-sm tracking-wider font-['Orbitron'] shadow-xl hover:scale-105 transition-all"
          >
            <span>Register Now & Claim Your Spot</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
