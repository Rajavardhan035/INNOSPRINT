import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Search,
  CheckCircle2,
  Lock,
  Globe,
  Star,
  Users,
  Eye,
  Check,
  AlertTriangle,
  Sliders,
  Sparkles,
  Medal,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import CountUp from './shared/CountUp';
import { springUI } from '../../styles/motionConfig';

export default function ResultsTab({ teamCards = [], setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState('all');
  const [isPublished, setIsPublished] = useState(() => {
    return localStorage.getItem('inno_sprint_results_published') === 'true';
  });
  const [teamAwards, setTeamAwards] = useState(() => {
    return JSON.parse(localStorage.getItem('inno_sprint_team_awards') || '{}');
  });

  const togglePublication = () => {
    const nextState = !isPublished;
    if (nextState) {
      if (!confirm('Are you sure you want to publish event results live to the participant check portal?')) return;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success('Results published live to all participants!');
    } else {
      toast.info('Results reverted to draft status');
    }
    setIsPublished(nextState);
    localStorage.setItem('inno_sprint_results_published', String(nextState));
  };

  const handleSetAward = (regId, award) => {
    const updated = { ...teamAwards, [regId]: award };
    setTeamAwards(updated);
    localStorage.setItem('inno_sprint_team_awards', JSON.stringify(updated));
    toast.success(`Distinction assigned: ${award}`);
  };

  const filtered = teamCards.filter((t) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.teamName.toLowerCase().includes(q) ||
      t.referenceCode.toLowerCase().includes(q);

    const matchesTrack =
      trackFilter === 'all' || (t.theme || '').toLowerCase() === trackFilter.toLowerCase();

    return matchesSearch && matchesTrack;
  });

  // Calculate podium stats
  const winnerTeam = teamCards.find((t) => teamAwards[t.registrationId] === 'Winner (1st Place)');
  const runner1Team = teamCards.find((t) => teamAwards[t.registrationId] === '1st Runner-Up');
  const runner2Team = teamCards.find((t) => teamAwards[t.registrationId] === '2nd Runner-Up');

  return (
    <div className="space-y-6 font-body">
      {/* Top Results Control Panel */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0e1629]/95 to-[#070b14]/95 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white font-heading tracking-tight">
              Judging & Results Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Assign podium awards, crown winners, and publish verified scores to the participant portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#060912]/80 border border-white/10 flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPublished ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-amber-400'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium">Public Status</span>
              <span
                className={`text-xs font-bold uppercase font-mono tracking-wider ${
                  isPublished ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isPublished ? 'Live on Portal' : 'Draft / Private'}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={togglePublication}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              isPublished
                ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
                : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-[#040711] shadow-emerald-500/20'
            }`}
          >
            {isPublished ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Revoke to Draft</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Publish Results Live</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Podium Cards Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1st Place / Winner */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-[#0e1629]/90 to-[#070b14]/90 border border-amber-500/30 shadow-xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>1st Place • Champion</span>
              </span>
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                {winnerTeam?.teamName || 'Unassigned'}
              </h3>
              <p className="text-xs text-amber-200/80 font-mono mt-0.5">
                {winnerTeam ? `${winnerTeam.referenceCode} • ${winnerTeam.theme}` : 'Select below'}
              </p>
            </div>
          </div>
        </div>

        {/* 2nd Place / 1st Runner Up */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-400/10 via-[#0e1629]/90 to-[#070b14]/90 border border-slate-400/25 shadow-xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-slate-400/20 text-slate-200 border border-slate-400/30 text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-slate-300" />
                <span>1st Runner-Up</span>
              </span>
              <Award className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                {runner1Team?.teamName || 'Unassigned'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {runner1Team ? `${runner1Team.referenceCode} • ${runner1Team.theme}` : 'Select below'}
              </p>
            </div>
          </div>
        </div>

        {/* 3rd Place / 2nd Runner Up */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-700/10 via-[#0e1629]/90 to-[#070b14]/90 border border-amber-700/30 shadow-xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-amber-700/20 text-amber-300 border border-amber-700/30 text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-amber-500" />
                <span>2nd Runner-Up</span>
              </span>
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                {runner2Team?.teamName || 'Unassigned'}
              </h3>
              <p className="text-xs text-amber-400/80 font-mono mt-0.5">
                {runner2Team ? `${runner2Team.referenceCode} • ${runner2Team.theme}` : 'Select below'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams by name or registration ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 font-mono transition-all"
          />
        </div>

        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60 transition-all cursor-pointer"
        >
          <option value="all">All Tracks</option>
          <option value="Agentic AI">Agentic AI</option>
          <option value="Robotic AI">Robotic AI</option>
          <option value="Generative AI">Generative AI</option>
        </select>
      </div>

      {/* Team Evaluation & Award Table */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0e1629]/80 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0b1222] text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-mono">Registration ID</th>
                <th className="py-3.5 px-4">Team & Track</th>
                <th className="py-3.5 px-4">Roster</th>
                <th className="py-3.5 px-4">Certificate Readiness</th>
                <th className="py-3.5 px-4">Award Distinction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((team, idx) => {
                const currentAward = teamAwards[team.registrationId] || 'Participant';

                return (
                  <motion.tr
                    key={team.registrationId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-cyan-400 text-xs">
                      {team.referenceCode}
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-white block font-medium text-xs font-heading">
                        {team.teamName}
                      </strong>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {team.theme || 'Open Innovation'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">
                      {team.totalMembersCount} Members
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 w-fit ${
                          team.isComplete
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>
                          {team.uploadedCount} of {team.totalMembersCount} Uploaded
                        </span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={currentAward}
                        onChange={(e) => handleSetAward(team.registrationId, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          currentAward === 'Winner (1st Place)'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : currentAward.includes('Runner-Up')
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-[#060912]/80 border-white/10 text-slate-200 focus:border-cyan-400/60'
                        }`}
                      >
                        <option value="Participant">Participant</option>
                        <option value="Winner (1st Place)">🏆 Winner (1st Place)</option>
                        <option value="1st Runner-Up">🥈 1st Runner-Up</option>
                        <option value="2nd Runner-Up">🥉 2nd Runner-Up</option>
                        <option value="Best Innovation Award">⚡ Best Innovation Award</option>
                        <option value="Special Jury Mention">⭐ Special Jury Mention</option>
                      </select>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
