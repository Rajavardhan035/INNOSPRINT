import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function TeamsTab({
  teamCards = [],
  onSelectRegistration,
  onOpenCertificateModal,
  setActiveTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [expandedTeams, setExpandedTeams] = useState(() => {
    // Default: expand all so admins can immediately view member rosters
    const initial = {};
    teamCards.forEach((t) => {
      initial[t.registrationId] = true;
    });
    return initial;
  });
  const [copiedCode, setCopiedCode] = useState('');

  const toggleExpand = (regId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [regId]: !prev[regId],
    }));
  };

  const expandAll = () => {
    const all = {};
    teamCards.forEach((t) => {
      all[t.registrationId] = true;
    });
    setExpandedTeams(all);
  };

  const collapseAll = () => {
    setExpandedTeams({});
  };

  const copyRefCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Filtered teams
  const filteredTeams = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return teamCards.filter((team) => {
      const matchesSearch =
        !q ||
        team.teamName.toLowerCase().includes(q) ||
        team.referenceCode.toLowerCase().includes(q) ||
        team.members.some(
          (m) =>
            m.fullName.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            (m.college || '').toLowerCase().includes(q)
        );

      const matchesTheme =
        themeFilter === 'all' || (team.theme || '').toLowerCase() === themeFilter.toLowerCase();

      const matchesSize =
        sizeFilter === 'all' || String(team.totalMembersCount) === sizeFilter;

      return matchesSearch && matchesTheme && matchesSize;
    });
  }, [teamCards, searchTerm, themeFilter, sizeFilter]);

  const totalMembers = teamCards.reduce((acc, t) => acc + t.totalMembersCount, 0);

  return (
    <div className="space-y-5 animate-fadeIn font-body">
      {/* Header & Controls Toolbar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <h2 className="text-lg font-bold text-white font-heading tracking-tight">
                Teams & Participant Rosters
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#111B2D] border border-[#1D2A40] text-[10px] font-mono text-violet-400">
                {teamCards.length} Teams • {totalMembers} Participants
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage team rosters (2–4 members) with individual participant identities and certificate tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1D2A40]">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by team name, registration ID, member name, or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Track Filter */}
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">All Tracks</option>
              <option value="Agentic AI">Agentic AI</option>
              <option value="Robotic AI">Robotic AI</option>
              <option value="Generative AI">Generative AI</option>
            </select>

            {/* Team Size Filter */}
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">All Squad Sizes</option>
              <option value="2">2 Members</option>
              <option value="3">3 Members</option>
              <option value="4">4 Members</option>
            </select>

            <span className="text-xs font-mono text-slate-400 whitespace-nowrap hidden lg:inline">
              <strong className="text-white font-mono">{filteredTeams.length}</strong> showing
            </span>
          </div>
        </div>
      </div>

      {/* Team Cards Stack */}
      <div className="space-y-3.5">
        {filteredTeams.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0D1424] border border-[#1D2A40] text-slate-400">
            <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300 font-heading">No teams match your search or filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setThemeFilter('all');
                setSizeFilter('all');
              }}
              className="text-xs text-cyan-400 hover:underline mt-2 font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTeams.map((team) => {
            const isExpanded = !!expandedTeams[team.registrationId];
            const leader = team.members.find((m) => m.roleInTeam === 'Team Leader') || team.members[0];
            const certCompletionRate = team.completionPercentage || 0;

            return (
              <div
                key={team.registrationId}
                className="rounded-xl bg-[#0D1424] border border-[#1D2A40] overflow-hidden transition-colors hover:border-[#2a3c5a]"
              >
                {/* Team Card Header */}
                <div
                  onClick={() => toggleExpand(team.registrationId)}
                  className="p-4 sm:p-5 bg-[#0D1424] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center flex-shrink-0 text-violet-400 group-hover:text-violet-300 transition-colors">
                      <Users className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white font-heading group-hover:text-cyan-400 transition-colors">
                          {team.teamName}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-[#111B2D] text-violet-400 border border-[#1D2A40] text-[10px] font-mono font-medium">
                          {team.totalMembersCount} Members
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#111B2D] text-slate-300 border border-[#1D2A40] text-[10px] font-medium">
                          {team.theme || 'Agentic AI'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
                        <span>
                          Lead: <strong className="text-slate-200 font-medium">{leader?.fullName}</strong>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-[11px] text-slate-400">{leader?.email}</span>
                        {leader?.college && (
                          <>
                            <span className="text-slate-600 hidden sm:inline">•</span>
                            <span className="hidden sm:inline text-slate-400 truncate max-w-[200px]">{leader.college}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Registration Code, Certificate Progress, Expand Button */}
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-[#1D2A40] pt-3 lg:pt-0">
                    {/* Reference Code */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyRefCode(team.referenceCode);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#111B2D] border border-[#1D2A40] font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                      title="Click to copy registration ID"
                    >
                      <span>{team.referenceCode}</span>
                      {copiedCode === team.referenceCode ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                    </button>

                    {/* Certificate Status Metric */}
                    <div className="flex items-center gap-2 bg-[#111B2D] px-2.5 py-1 rounded-md border border-[#1D2A40]">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-mono font-medium text-slate-300">
                        {team.uploadedCount}/{team.totalMembersCount} Certs
                      </span>
                      <div className="w-10 h-1 rounded-full bg-[#070b14] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full"
                          style={{ width: `${certCompletionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Toggle Expand Icon */}
                    <div className="p-1.5 rounded-md bg-[#111B2D] text-slate-400 group-hover:text-white transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Member Table */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-[#1D2A40] bg-[#090F1D] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 font-heading">
                        Member Roster ({team.totalMembersCount} Participants)
                      </span>
                      <button
                        onClick={() => {
                          const reg = team.rawRegistration;
                          if (reg && onSelectRegistration) onSelectRegistration(reg);
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Details</span>
                      </button>
                    </div>

                    <div className="rounded-lg border border-[#1D2A40] overflow-hidden bg-[#0D1424]">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-[#111B2D] text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-[#1D2A40]">
                          <tr>
                            <th className="py-2.5 px-3.5">Role</th>
                            <th className="py-2.5 px-3.5">Member Name</th>
                            <th className="py-2.5 px-3.5">Email</th>
                            <th className="py-2.5 px-3.5">Certificate</th>
                            <th className="py-2.5 px-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1D2A40]">
                          {team.members.map((member) => {
                            const isLeader = member.roleInTeam === 'Team Leader';
                            const hasCert = member.certificateStatus === 'Available';

                            return (
                              <tr key={member.uid} className="hover:bg-[#111B2D]/50 transition-colors">
                                <td className="py-2.5 px-3.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase ${
                                      isLeader
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-[#111B2D] text-slate-300 border border-[#1D2A40]'
                                    }`}
                                  >
                                    {isLeader ? 'Lead' : 'Member'}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3.5">
                                  <strong className="text-white font-medium text-xs block">
                                    {member.fullName}
                                  </strong>
                                  <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                                    {member.college || 'N/A'}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3.5 font-mono text-slate-300 text-xs">
                                  {member.email}
                                </td>

                                <td className="py-2.5 px-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        hasCert ? 'bg-emerald-400' : 'bg-slate-600'
                                      }`}
                                    />
                                    <span
                                      className={`text-[11px] font-medium ${
                                        hasCert ? 'text-emerald-400' : 'text-slate-400'
                                      }`}
                                    >
                                      {hasCert ? 'Uploaded' : 'Pending'}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3.5 text-right">
                                  <button
                                    onClick={() => {
                                      if (onOpenCertificateModal) {
                                        onOpenCertificateModal(member);
                                      } else if (setActiveTab) {
                                        setActiveTab('certificates');
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-all ${
                                      hasCert
                                        ? 'bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-amber-400 hover:text-amber-300'
                                        : 'bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold'
                                    }`}
                                  >
                                    <Upload className="w-3 h-3" />
                                    <span>{hasCert ? 'Replace' : 'Upload'}</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
