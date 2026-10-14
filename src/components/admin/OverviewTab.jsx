import React, { useState, useEffect } from 'react';
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
  FileCheck
} from 'lucide-react';

// Animated Number Counter Hook for smooth UI
function useCounter(targetNumber, duration = 700) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;
    const startValue = 0;
    const endValue = Number(targetNumber) || 0;

    if (endValue === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + (endValue - startValue) * easedProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetNumber, duration]);

  return count;
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

  // Real calculations
  const totalRegs = registrations.length;
  const approvedRegs = registrations.filter((r) => (r.status || '').toLowerCase() === 'approved').length;
  const pendingRegs = registrations.filter((r) => (r.status || 'pending').toLowerCase() === 'pending').length;
  const waitlistedRegs = registrations.filter((r) => (r.status || '').toLowerCase() === 'waitlisted').length;
  const rejectedRegs = registrations.filter((r) => (r.status || '').toLowerCase() === 'rejected').length;

  const totalTeams = registrations.filter((r) => r.participation_type === 'team' || r.teams || r.team_id).length;
  const unresolvedMsgs = contactMessages.filter((m) => (m.status || 'new').toLowerCase() !== 'resolved').length;

  // Track breakdown
  const tracks = {
    'Agentic AI': registrations.filter((r) => r.theme === 'Agentic AI').length,
    'Robotic AI': registrations.filter((r) => r.theme === 'Robotic AI').length,
    'Generative AI': registrations.filter((r) => r.theme === 'Generative AI').length,
  };

  // Completion percentage
  const certCompletionRate = totalEligibleParticipants > 0
    ? Math.round((certificatesUploadedCount / totalEligibleParticipants) * 100)
    : 0;

  // Animated counters
  const animatedTotal = useCounter(totalRegs);
  const animatedApproved = useCounter(approvedRegs);
  const animatedPending = useCounter(pendingRegs);
  const animatedTeams = useCounter(totalTeams);
  const animatedCertsUploaded = useCounter(certificatesUploadedCount);
  const animatedCertsPending = useCounter(certificatesPendingCount);
  const animatedEligible = useCounter(totalEligibleParticipants);

  // Recent 5 registrations (filtered if search term is active)
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
    <div className="space-y-6 font-body animate-fadeIn">
      {/* ========================================================
          SECTION 1: WELCOME HEADER
          ======================================================== */}
      <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              Command Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111B2D] border border-[#1D2A40] text-[11px] font-medium text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live telemetry and event operations for INNO SPRINT 2026.
          </p>
          <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-400">
            <span>Signed in as <strong className="text-slate-200 font-medium">{adminName}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="px-2 py-0.5 rounded bg-[#111B2D] border border-[#1D2A40] text-[11px] font-mono text-cyan-400">
              {roleDisplay}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-cyan-500/50 text-xs font-medium text-slate-200 hover:text-cyan-400 transition-all flex items-center gap-2 shadow-sm"
            title="Export full registrations as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className="px-3.5 py-2 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-violet-500/50 text-xs font-medium text-slate-200 hover:text-violet-300 transition-all flex items-center gap-2 shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>Manage Teams</span>
          </button>

          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-cyan-500/50 text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: METRIC CARDS ROW (4 Balanced Cards)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Applications */}
        <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#2a3c5a]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-400">Total Applications</span>
            <div className="w-9 h-9 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
              {animatedTotal}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-cyan-400 font-mono">100%</span>
              <span>across all 3 tracks</span>
            </div>
          </div>
        </div>

        {/* Card 2: Approved */}
        <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#2a3c5a]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-400">Approved</span>
            <div className="w-9 h-9 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-heading text-emerald-400 tracking-tight">
              {animatedApproved}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-mono font-medium">
                {totalRegs > 0 ? `${Math.round((approvedRegs / totalRegs) * 100)}%` : '0%'}
              </span>
              <span>of total applicants</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Review */}
        <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#2a3c5a]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Review</span>
            <div className="w-9 h-9 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-heading text-amber-400 tracking-tight">
              {animatedPending}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono">
                Needs attention
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Teams */}
        <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#2a3c5a]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-400">Active Teams</span>
            <div className="w-9 h-9 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
              {animatedTeams}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-violet-400 font-mono font-medium">{animatedEligible}</span>
              <span>total participants</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 3: CERTIFICATE CONTROL SUMMARY (Compact)
          ======================================================== */}
      <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold font-heading text-white">
                Certificate Issuance
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-400">
                {certCompletionRate}% Issued
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Individual credentials generated and stored in Supabase cloud storage.
            </p>
          </div>

          {/* Middle: 3 Mini Stats */}
          <div className="flex items-center gap-6 py-1 px-4 rounded-lg bg-[#111B2D] border border-[#1D2A40] self-start lg:self-center">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Issued</span>
              <span className="text-base font-bold font-heading text-amber-400">{animatedCertsUploaded}</span>
            </div>
            <div className="w-px h-7 bg-[#1D2A40]" />
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Pending</span>
              <span className="text-base font-bold font-heading text-slate-300">{animatedCertsPending}</span>
            </div>
            <div className="w-px h-7 bg-[#1D2A40]" />
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Eligible</span>
              <span className="text-base font-bold font-heading text-white">{animatedEligible}</span>
            </div>
          </div>

          {/* Right: Open Button */}
          <div className="self-start lg:self-center">
            <button
              onClick={() => setActiveTab('certificates')}
              className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs transition-all flex items-center gap-2 shadow-sm hover:shadow-cyan-500/20"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Open Certificate Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clean Thin Progress Bar along the bottom */}
        <div className="mt-4 pt-3 border-t border-[#1D2A40]/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
            <span>Issuance Progress</span>
            <span className="text-cyan-400 font-medium">{certCompletionRate}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#111B2D] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-700"
              style={{ width: `${certCompletionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 4: TWO-COLUMN ANALYTICS & ACTIVITY
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Track & Admission Telemetry */}
        <div className="space-y-6">
          {/* Registrations by Track */}
          <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1D2A40] pb-3">
              <div>
                <h3 className="text-sm font-semibold font-heading text-white">
                  Registrations by Track
                </h3>
                <p className="text-[11px] text-slate-400">Distribution across hackathon tracks</p>
              </div>
              <span className="text-xs font-mono font-medium text-cyan-400">
                {totalRegs} Total
              </span>
            </div>

            <div className="space-y-3.5">
              {Object.entries(tracks).map(([theme, count]) => {
                const pct = totalRegs > 0 ? Math.round((count / totalRegs) * 100) : 0;
                let barColor = 'bg-cyan-400';
                if (theme === 'Robotic AI') barColor = 'bg-violet-400';
                if (theme === 'Generative AI') barColor = 'bg-amber-400';

                return (
                  <div key={theme} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{theme}</span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        <strong className="text-slate-100 font-semibold">{count}</strong> teams ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#111B2D] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Approval Status Breakdown */}
          <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1D2A40] pb-3">
              <div>
                <h3 className="text-sm font-semibold font-heading text-white">
                  Approval Status Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">Application review workflow status</p>
              </div>
              <span className="text-xs font-mono font-medium text-emerald-400">
                {approvedRegs} Admitted
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-400">Approved</span>
                  <span className="text-xs font-mono text-slate-400">
                    {totalRegs > 0 ? `${Math.round((approvedRegs / totalRegs) * 100)}%` : '0%'}
                  </span>
                </div>
                <span className="text-xl font-bold font-heading text-white mt-1 block">
                  {approvedRegs}
                </span>
                <span className="text-[10px] text-slate-400">Admitted to compete</span>
              </div>

              <div className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-amber-400">Pending</span>
                  <span className="text-xs font-mono text-slate-400">
                    {totalRegs > 0 ? `${Math.round((pendingRegs / totalRegs) * 100)}%` : '0%'}
                  </span>
                </div>
                <span className="text-xl font-bold font-heading text-white mt-1 block">
                  {pendingRegs}
                </span>
                <span className="text-[10px] text-slate-400">Awaiting organizer review</span>
              </div>

              <div className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-cyan-400">Waitlisted</span>
                  <span className="text-xs font-mono text-slate-400">
                    {totalRegs > 0 ? `${Math.round((waitlistedRegs / totalRegs) * 100)}%` : '0%'}
                  </span>
                </div>
                <span className="text-xl font-bold font-heading text-white mt-1 block">
                  {waitlistedRegs}
                </span>
                <span className="text-[10px] text-slate-400">Secondary cohort queue</span>
              </div>

              <div className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-rose-400">Rejected</span>
                  <span className="text-xs font-mono text-slate-400">
                    {totalRegs > 0 ? `${Math.round((rejectedRegs / totalRegs) * 100)}%` : '0%'}
                  </span>
                </div>
                <span className="text-xl font-bold font-heading text-white mt-1 block">
                  {rejectedRegs}
                </span>
                <span className="text-[10px] text-slate-400">Ineligible or duplicate</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Applications & Quick Actions */}
        <div className="space-y-6">
          {/* Recent Applications Feed */}
          <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1D2A40] pb-3">
              <div>
                <h3 className="text-sm font-semibold font-heading text-white">
                  Recent Applications
                </h3>
                <p className="text-[11px] text-slate-400">Latest submissions stream</p>
              </div>
              <button
                onClick={() => setActiveTab('registrations')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group transition-colors"
              >
                <span>View All Registrations</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="space-y-2">
              {recentRegistrations.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No registration records logged yet.
                </p>
              ) : (
                recentRegistrations.map((reg) => {
                  const statusKey = (reg.status || 'pending').toLowerCase();
                  let statusStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  if (statusKey === 'approved') statusStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (statusKey === 'rejected') statusStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (statusKey === 'waitlisted') statusStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

                  return (
                    <div
                      key={reg.id || reg.reference_code}
                      onClick={() => onSelectRegistration && onSelectRegistration(reg)}
                      className="p-3 rounded-lg bg-[#111B2D] border border-[#1D2A40] hover:border-cyan-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="px-2 py-0.5 rounded bg-[#0D1424] border border-[#1D2A40] font-mono text-[11px] text-slate-300 group-hover:text-cyan-400 transition-colors">
                          {reg.reference_code}
                        </span>
                        <div className="min-w-0">
                          <strong className="text-white text-xs block font-semibold truncate group-hover:text-cyan-400 transition-colors">
                            {reg.applicant_name || reg.profiles?.full_name || 'Participant'}
                            {reg.teams?.team_name ? ` • ${reg.teams.team_name}` : ''}
                          </strong>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {reg.theme || 'Open Innovation'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-medium capitalize ${statusStyle}`}>
                          {reg.status || 'Pending'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#0D1424] border border-[#1D2A40] rounded-xl p-5 space-y-3">
            <div className="border-b border-[#1D2A40] pb-3">
              <h3 className="text-sm font-semibold font-heading text-white">
                Quick Actions
              </h3>
              <p className="text-[11px] text-slate-400">High-frequency management operations</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveTab('cms')}
                className="p-3 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-cyan-500/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-md bg-[#0D1424] border border-[#1D2A40] text-cyan-400 group-hover:text-cyan-300">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-slate-200 block group-hover:text-cyan-400 transition-colors">
                    Broadcast Announcement
                  </span>
                  <span className="text-[10px] text-slate-400">Post update to live site</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('registrations')}
                className="p-3 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-amber-500/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-md bg-[#0D1424] border border-[#1D2A40] text-amber-400 group-hover:text-amber-300">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-slate-200 block group-hover:text-amber-400 transition-colors">
                    Review Pending
                  </span>
                  <span className="text-[10px] text-slate-400">{pendingRegs} awaiting decision</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('roles')}
                className="p-3 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-violet-500/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-md bg-[#0D1424] border border-[#1D2A40] text-violet-400 group-hover:text-violet-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-slate-200 block group-hover:text-violet-400 transition-colors">
                    Manage Roles
                  </span>
                  <span className="text-[10px] text-slate-400">Admin permissions & access</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="p-3 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-slate-500/40 text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-md bg-[#0D1424] border border-[#1D2A40] text-slate-400 group-hover:text-slate-200">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-slate-200 block group-hover:text-white transition-colors">
                    System Settings
                  </span>
                  <span className="text-[10px] text-slate-400">Environment & controls</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
