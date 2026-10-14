import React, { useState } from 'react';
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
  Sliders
} from 'lucide-react';

export default function ResultsTab({ teamCards = [], setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState('all');
  const [isPublished, setIsPublished] = useState(() => {
    return localStorage.getItem('inno_sprint_results_published') === 'true';
  });
  const [teamAwards, setTeamAwards] = useState(() => {
    return JSON.parse(localStorage.getItem('inno_sprint_team_awards') || '{}');
  });
  const [saveSuccess, setSaveSuccess] = useState('');

  const togglePublication = () => {
    const nextState = !isPublished;
    if (nextState) {
      if (!confirm('Are you sure you want to publish event results live to the participant check portal?')) return;
    }
    setIsPublished(nextState);
    localStorage.setItem('inno_sprint_results_published', String(nextState));
    setSaveSuccess(nextState ? 'Results published live to participants!' : 'Results set to draft (unpublished).');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleSetAward = (regId, award) => {
    const updated = { ...teamAwards, [regId]: award };
    setTeamAwards(updated);
    localStorage.setItem('inno_sprint_team_awards', JSON.stringify(updated));
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

  return (
    <div className="space-y-5 animate-fadeIn font-body">
      {/* Top Results Control Panel */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-heading tracking-tight">
              Results & Judging Evaluation Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Assign competition distinctions, track podium placements, and control when finalized winners and participation awards become publicly accessible.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Public Portal</span>
              <span
                className={`text-xs font-semibold uppercase font-mono ${
                  isPublished ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isPublished ? 'Live' : 'Draft'}
              </span>
            </div>
          </div>

          <button
            onClick={togglePublication}
            className={`px-3.5 py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${
              isPublished
                ? 'bg-[#111B2D] hover:bg-rose-950/60 border border-[#1D2A40] hover:border-rose-500/50 text-rose-300'
                : 'bg-emerald-500 hover:bg-emerald-400 text-[#070b14] font-semibold'
            }`}
          >
            {isPublished ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Revoke to Draft</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>Publish Results Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams by name or registration ID..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors"
        >
          <option value="all">All Tracks</option>
          <option value="Agentic AI">Agentic AI</option>
          <option value="Robotic AI">Robotic AI</option>
          <option value="Generative AI">Generative AI</option>
        </select>
      </div>

      {/* Team Evaluation & Award Table */}
      <div className="rounded-xl bg-[#0D1424] border border-[#1D2A40] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111B2D] text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-[#1D2A40]">
              <tr>
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Team & Track</th>
                <th className="py-3 px-4">Roster</th>
                <th className="py-3 px-4">Certificate Readiness</th>
                <th className="py-3 px-4">Award / Distinction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2A40]">
              {filtered.map((team) => {
                const currentAward = teamAwards[team.registrationId] || 'Participant';

                return (
                  <tr key={team.registrationId} className="hover:bg-[#111B2D]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-400 text-xs">
                      {team.referenceCode}
                    </td>

                    <td className="py-3 px-4">
                      <strong className="text-white block font-medium text-xs">
                        {team.teamName}
                      </strong>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {team.theme || 'Open Innovation'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300 text-xs">
                      {team.totalMembersCount} Members
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 w-fit ${
                          team.isComplete
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        <span>
                          {team.uploadedCount} of {team.totalMembersCount} Uploaded
                        </span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={currentAward}
                        onChange={(e) => handleSetAward(team.registrationId, e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111B2D] border border-[#1D2A40] text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                      >
                        <option value="Participant">Participant</option>
                        <option value="Winner (1st Place)">🏆 Winner (1st Place)</option>
                        <option value="1st Runner-Up">🥈 1st Runner-Up</option>
                        <option value="2nd Runner-Up">🥉 2nd Runner-Up</option>
                        <option value="Best Innovation Award">⚡ Best Innovation Award</option>
                        <option value="Special Jury Mention">⭐ Special Jury Mention</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
