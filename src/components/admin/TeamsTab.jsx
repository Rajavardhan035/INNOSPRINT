import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import CountUp from './shared/CountUp';
import { springUI, buttonPress } from '../../styles/motionConfig';

export default function TeamsTab({
  teamCards = [],
  onSelectRegistration,
  onOpenCertificateModal,
  setActiveTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [expandedTeams, setExpandedTeams] = useState(() => {
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
    toast.success(`Copied ID: ${code}`);
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
    <div className="space-y-5 font-body">
      {/* Header & Controls Toolbar */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white font-heading tracking-tight">
                Squads & Rosters
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-[11px] font-mono text-violet-300">
                <CountUp value={teamCards.length} /> Squads • <CountUp value={totalMembers} /> Hackers
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage hackathon team rosters (2–4 members) with identity credentials and certificate issuance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center p-1 rounded-xl bg-[#060912]/80 border border-white/10">
              <button
                onClick={() => setViewMode('list')}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List view"
              >
                {viewMode === 'list' && (
                  <motion.div
                    layoutId="teamViewMode"
                    className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                    transition={springUI}
                  />
                )}
                <List className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10 hidden sm:inline">List</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'grid' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid view"
              >
                {viewMode === 'grid' && (
                  <motion.div
                    layoutId="teamViewMode"
                    className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                    transition={springUI}
                  />
                )}
                <LayoutGrid className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10 hidden sm:inline">Grid</span>
              </button>
            </div>

            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by team name, registration ID, member name, or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 font-mono transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Track Filter */}
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60 transition-all cursor-pointer"
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
              className="px-3 py-2 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60 transition-all cursor-pointer"
            >
              <option value="all">All Squad Sizes</option>
              <option value="2">2 Members</option>
              <option value="3">3 Members</option>
              <option value="4">4 Members</option>
            </select>

            <span className="text-xs font-mono text-slate-400 whitespace-nowrap hidden lg:inline">
              <strong className="text-white font-mono">{filteredTeams.length}</strong> matching
            </span>
          </div>
        </div>
      </div>

      {/* Grid or List View */}
      {filteredTeams.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-gradient-to-b from-[#0e1629]/80 to-[#070b14]/90 border border-white/10 text-slate-400 shadow-xl">
          <Users className="w-10 h-10 mx-auto text-slate-600 mb-3" />
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
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTeams.map((team, idx) => {
            const leader = team.members.find((m) => m.roleInTeam === 'Team Leader') || team.members[0];
            const certCompletionRate = team.completionPercentage || 0;

            return (
              <motion.div
                key={team.registrationId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="group relative rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 hover:border-cyan-500/40 p-5 backdrop-blur-xl shadow-xl transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[10px] font-mono">
                      {team.theme || 'Agentic AI'}
                    </span>
                    <h3 className="text-base font-bold text-white font-heading group-hover:text-cyan-400 transition-colors">
                      {team.teamName}
                    </h3>
                  </div>

                  <button
                    onClick={() => copyRefCode(team.referenceCode)}
                    className="px-2 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>{team.referenceCode}</span>
                    {copiedCode === team.referenceCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Leader info */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Lead:</span>
                    <strong className="text-slate-200">{leader?.fullName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>Email:</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{leader?.email}</span>
                  </div>
                </div>

                {/* Member Avatar Ring Stack */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Roster ({team.totalMembersCount} members)</span>
                    <span className="font-mono text-[11px] text-cyan-400">
                      {team.uploadedCount}/{team.totalMembersCount} certs
                    </span>
                  </div>

                  <div className="flex items-center -space-x-2">
                    {team.members.map((m, mIdx) => (
                      <div
                        key={m.uid}
                        title={`${m.fullName} (${m.roleInTeam})`}
                        className={`w-8 h-8 rounded-full border-2 border-[#070b14] flex items-center justify-center text-xs font-bold font-mono transition-transform hover:scale-110 hover:z-10 ${
                          m.roleInTeam === 'Team Leader'
                            ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-[#070b14]'
                            : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                        }`}
                      >
                        {m.fullName.charAt(0)}
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 transition-all"
                      style={{ width: `${certCompletionRate}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const reg = team.rawRegistration;
                      if (reg && onSelectRegistration) onSelectRegistration(reg);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>

                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('certificates');
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                    title="Manage Certificates"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* LIST / ACCORDION VIEW */
        <div className="space-y-3.5">
          {filteredTeams.map((team, idx) => {
            const isExpanded = !!expandedTeams[team.registrationId];
            const leader = team.members.find((m) => m.roleInTeam === 'Team Leader') || team.members[0];
            const certCompletionRate = team.completionPercentage || 0;

            return (
              <motion.div
                key={team.registrationId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className="rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 hover:border-cyan-500/30 overflow-hidden transition-all shadow-xl backdrop-blur-xl"
              >
                {/* Team Card Header */}
                <div
                  onClick={() => toggleExpand(team.registrationId)}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-400 group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white font-heading group-hover:text-cyan-400 transition-colors">
                          {team.teamName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-mono font-medium">
                          {team.totalMembersCount} Members
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5 text-[10px] font-medium">
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
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                    {/* Reference Code */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyRefCode(team.referenceCode);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#060912]/80 border border-white/10 font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
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
                    <div className="flex items-center gap-2 bg-[#060912]/80 px-3 py-1.5 rounded-xl border border-white/10">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-mono font-medium text-slate-300">
                        {team.uploadedCount}/{team.totalMembersCount} Certs
                      </span>
                      <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full"
                          style={{ width: `${certCompletionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Toggle Expand Icon */}
                    <div className="p-2 rounded-xl bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Member Table */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={springUI}
                      className="border-t border-white/10 bg-[#050811]/90 p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 font-heading">
                          Member Roster ({team.totalMembersCount} Participants)
                        </span>
                        <button
                          onClick={() => {
                            const reg = team.rawRegistration;
                            if (reg && onSelectRegistration) onSelectRegistration(reg);
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Details</span>
                        </button>
                      </div>

                      <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0a101f]/70">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-[#0e1629] text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-white/10">
                            <tr>
                              <th className="py-2.5 px-3.5">Role</th>
                              <th className="py-2.5 px-3.5">Member Name</th>
                              <th className="py-2.5 px-3.5">Email</th>
                              <th className="py-2.5 px-3.5">Certificate</th>
                              <th className="py-2.5 px-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {team.members.map((member) => {
                              const isLeader = member.roleInTeam === 'Team Leader';
                              const hasCert = member.certificateStatus === 'Available';

                              return (
                                <tr key={member.uid} className="hover:bg-white/[0.03] transition-colors">
                                  <td className="py-2.5 px-3.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium uppercase ${
                                        isLeader
                                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                          : 'bg-white/5 text-slate-300 border border-white/5'
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
                                        {hasCert ? 'Available' : 'Pending'}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-3.5 text-right">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        if (onOpenCertificateModal) {
                                          onOpenCertificateModal(member);
                                        } else if (setActiveTab) {
                                          setActiveTab('certificates');
                                        }
                                      }}
                                      className={`px-3 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm ${
                                        hasCert
                                          ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300'
                                          : 'bg-cyan-500 hover:bg-cyan-400 text-[#040711] font-semibold'
                                      }`}
                                    >
                                      <Upload className="w-3 h-3" />
                                      <span>{hasCert ? 'Replace' : 'Upload'}</span>
                                    </motion.button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
