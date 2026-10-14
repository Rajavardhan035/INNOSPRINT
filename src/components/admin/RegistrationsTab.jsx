import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Copy,
  CheckCircle2,
  AlertCircle,
  Users,
  RotateCcw,
  Calendar
} from 'lucide-react';

export default function RegistrationsTab({
  registrations = [],
  onSelectRegistration,
  onUpdateStatus,
  exportCSV
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [themeFilter, setThemeFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name' | 'status'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedCode, setCopiedCode] = useState('');

  const copyRefCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Status counts for pills
  const statusCounts = useMemo(() => {
    return {
      all: registrations.length,
      approved: registrations.filter((r) => (r.status || '').toLowerCase() === 'approved').length,
      pending: registrations.filter((r) => (r.status || 'pending').toLowerCase() === 'pending').length,
      waitlisted: registrations.filter((r) => (r.status || '').toLowerCase() === 'waitlisted').length,
      rejected: registrations.filter((r) => (r.status || '').toLowerCase() === 'rejected').length
    };
  }, [registrations]);

  // Filtered & Sorted records
  const filteredRecords = useMemo(() => {
    return registrations
      .filter((r) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (r.reference_code || '').toLowerCase().includes(q) ||
          (r.applicant_name || r.profiles?.full_name || r.user_name || '').toLowerCase().includes(q) ||
          (r.applicant_email || r.profiles?.email || r.user_email || '').toLowerCase().includes(q) ||
          (r.applicant_college || r.profiles?.college || '').toLowerCase().includes(q) ||
          (r.teams?.team_name || '').toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === 'all' || (r.status || 'pending').toLowerCase() === statusFilter.toLowerCase();

        const matchesTheme =
          themeFilter === 'all' || (r.theme || '').toLowerCase() === themeFilter.toLowerCase();

        const matchesMode =
          modeFilter === 'all' ||
          (modeFilter === 'team' && (r.participation_type === 'team' || r.teams || r.team_id)) ||
          (modeFilter === 'individual' && r.participation_type !== 'team' && !r.teams && !r.team_id);

        return matchesSearch && matchesStatus && matchesTheme && matchesMode;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === 'name') {
          const nameA = a.applicant_name || a.profiles?.full_name || '';
          const nameB = b.applicant_name || b.profiles?.full_name || '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'status') {
          return (a.status || 'pending').localeCompare(b.status || 'pending');
        }
        return 0;
      });
  }, [registrations, searchTerm, statusFilter, themeFilter, modeFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setThemeFilter('all');
    setModeFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 animate-fadeIn font-body">
      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-4">
        {/* Row 1: Search, Dropdowns, and Export */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by participant name, registration ID, email, team..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Controls: Track, Mode, Sort, CSV */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Track Filter Dropdown */}
            <select
              value={themeFilter}
              onChange={(e) => {
                setThemeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">All Tracks</option>
              <option value="Agentic AI">Agentic AI</option>
              <option value="Robotic AI">Robotic AI</option>
              <option value="Generative AI">Generative AI</option>
            </select>

            {/* Mode Filter Dropdown */}
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">All Modes</option>
              <option value="team">Team Only</option>
              <option value="individual">Individual</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="status">Sort: Status</option>
            </select>

            {/* Reset Filters */}
            {(searchTerm || statusFilter !== 'all' || themeFilter !== 'all' || modeFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="p-2 rounded-lg bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-400 hover:text-white transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm hover:shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1D2A40]">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All', count: statusCounts.all },
              { id: 'approved', label: 'Approved', count: statusCounts.approved, color: 'text-emerald-400' },
              { id: 'pending', label: 'Pending', count: statusCounts.pending, color: 'text-amber-400' },
              { id: 'waitlisted', label: 'Waitlisted', count: statusCounts.waitlisted, color: 'text-blue-400' },
              { id: 'rejected', label: 'Rejected', count: statusCounts.rejected, color: 'text-rose-400' }
            ].map((pill) => {
              const active = statusFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setStatusFilter(pill.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#111B2D] text-cyan-400 border border-cyan-500/50 shadow-sm'
                      : 'bg-[#070b14] text-slate-400 hover:text-slate-200 border border-[#1D2A40]'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-[#111B2D] text-slate-400'
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Show:</span>
            {[10, 25, 50].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setRowsPerPage(size);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                  rowsPerPage === size
                    ? 'bg-cyan-500 text-[#070b14] font-semibold'
                    : 'bg-[#111B2D] text-slate-400 hover:text-white border border-[#1D2A40]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="rounded-xl bg-[#0D1424] border border-[#1D2A40] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111B2D] text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-[#1D2A40]">
              <tr>
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Track</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2A40]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center text-slate-500 font-medium">
                    <div className="max-w-sm mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-400 font-heading">
                        No registrations match your current filters.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="text-xs text-cyan-400 hover:underline font-semibold"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((reg) => {
                  const refCode = reg.reference_code || 'N/A';
                  const applicantName =
                    reg.applicant_name || reg.profiles?.full_name || reg.user_name || 'Participant';
                  const applicantEmail = reg.applicant_email || reg.profiles?.email || reg.user_email || '';
                  const isTeam = reg.participation_type === 'team' || reg.teams || reg.team_id;
                  const teamName = reg.teams?.team_name || (isTeam ? 'Squad' : 'Individual');
                  const memberCount =
                    1 + (Array.isArray(reg.teams?.team_members) ? reg.teams.team_members.length : 0);
                  const dateStr = reg.created_at
                    ? new Date(reg.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : '—';

                  const statusKey = (reg.status || 'pending').toLowerCase();
                  let statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  if (statusKey === 'approved') statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (statusKey === 'rejected') statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (statusKey === 'waitlisted') statusBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

                  return (
                    <tr
                      key={reg.id || refCode}
                      className="hover:bg-[#111B2D]/70 transition-colors group"
                    >
                      {/* Registration ID */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => copyRefCode(refCode)}
                          className="font-mono text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors text-left text-xs"
                          title="Click to copy registration ID"
                        >
                          <span>{refCode}</span>
                          {copiedCode === refCode ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </td>

                      {/* Applicant Name */}
                      <td
                        className="py-3.5 px-4 cursor-pointer"
                        onClick={() => onSelectRegistration(reg)}
                      >
                        <strong className="text-white block font-medium group-hover:text-cyan-400 transition-colors text-xs">
                          {applicantName}
                        </strong>
                        {applicantEmail && (
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5 truncate max-w-[200px]">
                            {applicantEmail}
                          </span>
                        )}
                      </td>

                      {/* Team */}
                      <td className="py-3.5 px-4">
                        {isTeam ? (
                          <div>
                            <span className="text-xs font-medium text-slate-200 block truncate max-w-[140px]">
                              {teamName}
                            </span>
                            <span className="text-[10px] text-violet-400 font-mono">
                              {memberCount} members
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Individual</span>
                        )}
                      </td>

                      {/* Track */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#111B2D] text-slate-300 border border-[#1D2A40] text-[11px] font-medium inline-block">
                          {reg.theme || 'Open Innovation'}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium capitalize border ${statusBadge}`}
                        >
                          {reg.status || 'Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details / Dossier */}
                          <button
                            onClick={() => onSelectRegistration(reg)}
                            className="px-2.5 py-1 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-cyan-500/50 text-cyan-400 font-medium text-xs flex items-center gap-1 transition-all"
                            title="View full registration dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {/* Quick Approve */}
                          <button
                            onClick={() => onUpdateStatus(reg, 'approved')}
                            className={`p-1.5 rounded-md transition-colors ${
                              statusKey === 'approved'
                                ? 'bg-emerald-500 text-[#070b14]'
                                : 'bg-[#111B2D] hover:bg-emerald-950/60 border border-[#1D2A40] hover:border-emerald-500/50 text-emerald-400'
                            }`}
                            title="Quick Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Reject */}
                          <button
                            onClick={() => onUpdateStatus(reg, 'rejected')}
                            className={`p-1.5 rounded-md transition-colors ${
                              statusKey === 'rejected'
                                ? 'bg-rose-500 text-white'
                                : 'bg-[#111B2D] hover:bg-rose-950/60 border border-[#1D2A40] hover:border-rose-500/50 text-rose-400'
                            }`}
                            title="Quick Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count Footer */}
        <div className="p-3.5 bg-[#111B2D] border-t border-[#1D2A40] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white font-mono">{filteredRecords.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</strong> to{' '}
            <strong className="text-white font-mono">{Math.min(currentPage * rowsPerPage, filteredRecords.length)}</strong> of{' '}
            <strong className="text-white font-mono">{filteredRecords.length}</strong> matching records
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md bg-[#0D1424] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-1 rounded bg-[#0D1424] border border-[#1D2A40] font-mono text-xs font-semibold text-white">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md bg-[#0D1424] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
