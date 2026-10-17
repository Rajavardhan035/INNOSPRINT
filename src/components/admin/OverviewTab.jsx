import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Megaphone,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sliders,
  FileCheck,
  UserCheck,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import AdminCard from './shared/AdminCard';
import StatCard from './shared/StatCard';
import CountUp from './shared/CountUp';
import StatusChip from './shared/StatusChip';
import { staggerContainerVariants, staggerItemVariants, buttonPress } from '../../styles/motionConfig';

// Custom Futuristic Glass Tooltip for Recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-[#080E1C]/95 border border-white/[0.15] p-3 shadow-2xl backdrop-blur-md">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
          {label}
        </span>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          <strong className="text-sm font-bold text-white font-mono">
            {payload[0].value} Teams
          </strong>
        </div>
      </div>
    );
  }
  return null;
}

export default function OverviewTab({
  registrations = [],
  contactMessages = [],
  announcements = [],
  certificatesMap = {},
  totalEligibleParticipants = 0,
  certificatesUploadedCount = 0,
  certificatesPendingCount = 0,
  exportCSV,
  setActiveTab,
  searchTerm = '',
  user,
  role = 'admin',
  onRefresh,
  onSelectRegistration
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  // Calculations
  const totalRegs = registrations.length;
  const approvedRegs = registrations.filter((r) => (r.status || '').toLowerCase() === 'approved').length;
  const pendingRegs = registrations.filter((r) => (r.status || 'pending').toLowerCase() === 'pending').length;
  const waitlistedRegs = registrations.filter((r) => (r.status || '').toLowerCase() === 'waitlisted').length;
  const rejectedRegs = registrations.filter((r) => (r.status || '').toLowerCase() === 'rejected').length;
  const totalTeams = registrations.filter((r) => r.participation_type === 'team' || r.teams || r.team_id).length;
  const unresolvedMsgs = contactMessages.filter((m) => (m.status || 'new').toLowerCase() !== 'resolved').length;

  // Track breakdown for Recharts
  const trackData = [
    {
      name: 'Agentic AI',
      teams: registrations.filter((r) => r.theme === 'Agentic AI').length,
      color: '#22d3ee',
    },
    {
      name: 'Robotic AI',
      teams: registrations.filter((r) => r.theme === 'Robotic AI').length,
      color: '#a855f7',
    },
    {
      name: 'Generative AI',
      teams: registrations.filter((r) => r.theme === 'Generative AI').length,
      color: '#fbbf24',
    },
    {
      name: 'Open Innovation',
      teams: registrations.filter((r) => !['Agentic AI', 'Robotic AI', 'Generative AI'].includes(r.theme)).length,
      color: '#38bdf8',
    },
  ];

  // Certificate completion rate
  const certCompletionRate = totalEligibleParticipants > 0
    ? Math.round((certificatesUploadedCount / totalEligibleParticipants) * 100)
    : 0;

  // Recent applications (filtered if search term active)
  const filteredRegs = searchTerm
    ? registrations.filter((r) => {
        const q = searchTerm.toLowerCase();
        return (
          (r.reference_code || '').toLowerCase().includes(q) ||
          (r.applicant_name || '').toLowerCase().includes(q) ||
          (r.applicant_email || '').toLowerCase().includes(q) ||
          (r.teams?.team_name || '').toLowerCase().includes(q)
        );
      })
    : registrations;

  const recentRegistrations = [...filteredRegs]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  const adminName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Administrator';
  const roleDisplay = role === 'super_admin' ? 'Super Administrator' : 'Event Organizer';

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 font-body"
    >
      {/* ========================================================
          1. HERO COMMAND HEADER
          ======================================================== */}
      <motion.div variants={staggerItemVariants}>
        <AdminCard className="p-6 sm:p-7 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                  Command Overview
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-xs font-mono font-medium text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Realtime Live Operations</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
                Mission control telemetrics, applicant status stream, and automated credential issuance.
              </p>
              <div className="flex items-center gap-2.5 mt-3 text-xs text-slate-400 font-mono">
                <span>Signed in as <strong className="text-white">{adminName}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-cyan-400 font-bold uppercase">
                  {roleDisplay}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <motion.button
                whileTap={buttonPress}
                onClick={exportCSV}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-cyan-500/50 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-all flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export CSV</span>
              </motion.button>

              <motion.button
                whileTap={buttonPress}
                onClick={() => setActiveTab('teams')}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-purple-500/50 text-xs font-semibold text-slate-200 hover:text-purple-300 transition-all flex items-center gap-2 shadow-sm"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Manage Teams</span>
              </motion.button>

              <motion.button
                whileTap={buttonPress}
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Sync Live'}</span>
              </motion.button>
            </div>
          </div>
        </AdminCard>
      </motion.div>

      {/* ========================================================
          2. METRIC STAT CARDS (4 Sleek Elevated Cards)
          ======================================================== */}
      <motion.div
        variants={staggerItemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Applications"
          value={totalRegs}
          icon={FileSpreadsheet}
          color="cyan"
          trend={{ value: '100%', direction: 'up', label: 'All 3 tracks' }}
          sparklineData={[12, 18, 22, 28, 31, 35, totalRegs]}
          onClick={() => setActiveTab('registrations')}
        />

        <StatCard
          title="Approved Registrations"
          value={approvedRegs}
          icon={CheckCircle2}
          color="emerald"
          trend={{
            value: totalRegs > 0 ? `${Math.round((approvedRegs / totalRegs) * 100)}%` : '0%',
            direction: 'up',
            label: 'Admitted',
          }}
          sparklineData={[4, 8, 12, 15, 18, approvedRegs]}
          onClick={() => setActiveTab('registrations')}
        />

        <StatCard
          title="Pending Review"
          value={pendingRegs}
          icon={Clock}
          color="amber"
          trend={{
            value: `${pendingRegs}`,
            direction: pendingRegs > 0 ? 'down' : 'up',
            label: 'Action needed',
          }}
          sparklineData={[15, 20, 24, 28, 27, pendingRegs]}
          onClick={() => setActiveTab('registrations')}
        />

        <StatCard
          title="Active Teams"
          value={totalTeams}
          icon={Users}
          color="purple"
          trend={{
            value: `${totalEligibleParticipants} Pax`,
            direction: 'up',
            label: 'Total Participants',
          }}
          sparklineData={[3, 6, 9, 14, 18, totalTeams]}
          onClick={() => setActiveTab('teams')}
        />
      </motion.div>

      {/* ========================================================
          3. CERTIFICATE ISSUANCE PROGRESS BANNER
          ======================================================== */}
      <motion.div variants={staggerItemVariants}>
        <AdminCard className="p-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white font-heading">
                  Certificate Issuance & Credentials Engine
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-medium text-amber-300">
                  <CountUp value={certCompletionRate} suffix="%" /> Complete
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                Individual certificates of participation and excellence stored in cloud storage.
              </p>
            </div>

            {/* Segmented Numbers */}
            <div className="flex items-center gap-6 py-2 px-5 rounded-xl bg-white/[0.03] border border-white/[0.08] self-start lg:self-center">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">Issued</span>
                <span className="text-lg font-bold font-heading text-amber-400">
                  <CountUp value={certificatesUploadedCount} />
                </span>
              </div>
              <div className="w-px h-8 bg-white/[0.1]" />
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">Pending</span>
                <span className="text-lg font-bold font-heading text-slate-300">
                  <CountUp value={certificatesPendingCount} />
                </span>
              </div>
              <div className="w-px h-8 bg-white/[0.1]" />
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">Eligible</span>
                <span className="text-lg font-bold font-heading text-white">
                  <CountUp value={totalEligibleParticipants} />
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileTap={buttonPress}
              onClick={() => setActiveTab('certificates')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-amber-950/40 self-start lg:self-center"
            >
              <Award className="w-4 h-4" />
              <span>Open Certificate Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Animated Glowing Progress Bar with Shimmer */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>Automated Verification Progress</span>
              <span className="text-cyan-400 font-bold">{certCompletionRate}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/[0.04] p-0.5 border border-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${certCompletionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>
        </AdminCard>
      </motion.div>

      {/* ========================================================
          4. TWO-COLUMN ANALYTICS & RECENT APPLICATIONS
          ======================================================== */}
      <motion.div variants={staggerItemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Recharts Track Distribution & Approval Cards */}
        <div className="space-y-6">
          {/* Animated Track Distribution Chart */}
          <AdminCard
            title="Registrations by Track"
            subtitle="Live distribution across technical tracks"
            badge={`${totalRegs} Total`}
          >
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                  <Bar dataKey="teams" radius={[6, 6, 0, 0]} animationDuration={1000}>
                    {trackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>

          {/* Workflow Status Tiles */}
          <AdminCard
            title="Admission Review Breakdown"
            subtitle="Status of active applicant cohorts"
            badge={`${approvedRegs} Admitted`}
          >
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-emerald-400">Approved</span>
                  <span className="text-xs font-mono text-slate-400">
                    {totalRegs > 0 ? `${Math.round((approvedRegs / totalRegs) * 100)}%` : '0%'}
                  </span>
                </div>
                <strong className="text-2xl font-bold font-heading text-white mt-1.5 block">
                  <CountUp value={approvedRegs} />
                </strong>
                <span className="text-[11px] text-slate-400">Admitted to compete</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-amber-400">Pending</span>
                  <span className="text-xs font-mono text-slate-400">
                    {totalRegs > 0 ? `${Math.round((pendingRegs / totalRegs) * 100)}%` : '0%'}
                  </span>
                </div>
                <strong className="text-2xl font-bold font-heading text-white mt-1.5 block">
                  <CountUp value={pendingRegs} />
                </strong>
                <span className="text-[11px] text-slate-400">Awaiting review</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-blue-400">Waitlisted</span>
                  <span className="text-xs font-mono text-slate-400">
                    {totalRegs > 0 ? `${Math.round((waitlistedRegs / totalRegs) * 100)}%` : '0%'}
                  </span>
                </div>
                <strong className="text-2xl font-bold font-heading text-white mt-1.5 block">
                  <CountUp value={waitlistedRegs} />
                </strong>
                <span className="text-[11px] text-slate-400">Secondary cohort queue</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-rose-400">Rejected</span>
                  <span className="text-xs font-mono text-slate-400">
                    {totalRegs > 0 ? `${Math.round((rejectedRegs / totalRegs) * 100)}%` : '0%'}
                  </span>
                </div>
                <strong className="text-2xl font-bold font-heading text-white mt-1.5 block">
                  <CountUp value={rejectedRegs} />
                </strong>
                <span className="text-[11px] text-slate-400">Ineligible or duplicate</span>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* RIGHT COLUMN: Recent Applications Stream & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Recent Applications Feed */}
          <AdminCard
            title="Recent Applications"
            subtitle="Latest applicant registrations"
            action={
              <button
                onClick={() => setActiveTab('registrations')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            }
          >
            <div className="space-y-2.5">
              {recentRegistrations.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-mono">
                  No registration records logged yet.
                </div>
              ) : (
                recentRegistrations.map((reg) => (
                  <div
                    key={reg.id || reg.reference_code}
                    onClick={() => onSelectRegistration && onSelectRegistration(reg)}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] font-mono text-[11px] text-cyan-400 group-hover:text-cyan-300 font-semibold">
                        {reg.reference_code}
                      </span>
                      <div className="min-w-0">
                        <strong className="text-white text-xs block font-semibold truncate group-hover:text-cyan-300 transition-colors">
                          {reg.applicant_name || reg.profiles?.full_name || 'Participant'}
                          {reg.teams?.team_name ? ` • ${reg.teams.team_name}` : ''}
                        </strong>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {reg.theme || 'Open Innovation'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <StatusChip status={reg.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>

          {/* Quick Shortcuts */}
          <AdminCard
            title="Management Shortcuts"
            subtitle="Frequently executed administrative tasks"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <motion.button
                whileTap={buttonPress}
                onClick={() => setActiveTab('cms')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-400/30 text-cyan-400 group-hover:scale-105 transition-transform">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block group-hover:text-cyan-400 transition-colors">
                    Broadcast Announcement
                  </span>
                  <span className="text-[10px] text-slate-400">Post updates to live portal</span>
                </div>
              </motion.button>

              <motion.button
                whileTap={buttonPress}
                onClick={() => setActiveTab('registrations')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-amber-500/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-400/30 text-amber-400 group-hover:scale-105 transition-transform">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block group-hover:text-amber-400 transition-colors">
                    Review Pending ({pendingRegs})
                  </span>
                  <span className="text-[10px] text-slate-400">Triage incoming applicants</span>
                </div>
              </motion.button>

              <motion.button
                whileTap={buttonPress}
                onClick={() => setActiveTab('roles')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-purple-500/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-400/30 text-purple-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block group-hover:text-purple-400 transition-colors">
                    Staff & Access Control
                  </span>
                  <span className="text-[10px] text-slate-400">Manage organizer permissions</span>
                </div>
              </motion.button>

              <motion.button
                whileTap={buttonPress}
                onClick={() => setActiveTab('settings')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-blue-500/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-400/30 text-blue-400 group-hover:scale-105 transition-transform">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block group-hover:text-blue-400 transition-colors">
                    System Configuration
                  </span>
                  <span className="text-[10px] text-slate-400">Supabase & environment</span>
                </div>
              </motion.button>
            </div>
          </AdminCard>
        </div>
      </motion.div>
    </motion.div>
  );
}
