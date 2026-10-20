import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Calendar,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import StatusChip from './shared/StatusChip';
import { springUI, springSnappy, buttonPress } from '../../styles/motionConfig';

export default function RegistrationsTab({
  registrations = [],
  onSelectRegistration,
  onUpdateStatus,
  onDeleteRegistration,
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
  const [regToDelete, setRegToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const copyRefCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied ID: ${code}`);
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
    setSelectedIds([]);
  };

  // Row selection
  const toggleSelectAll = () => {
    const currentIds = paginatedRecords.map((r) => r.id || r.reference_code);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk status update
  const handleBulkStatus = async (newStatus) => {
    if (!onUpdateStatus || selectedIds.length === 0) return;
    setBulkProcessing(true);
    const targets = registrations.filter((r) =>
      selectedIds.includes(r.id || r.reference_code)
    );
    try {
      for (const reg of targets) {
        await onUpdateStatus(reg, newStatus);
      }
      toast.success(`Updated ${targets.length} registrations to ${newStatus}`);
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to update some registrations');
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-5 font-body relative">
      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        {/* Row 1: Search, Dropdowns, and Export */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Track, Mode, Sort, CSV */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Track Filter */}
            <select
              value={themeFilter}
              onChange={(e) => {
                setThemeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60 transition-all cursor-pointer"
            >
              <option value="all">All Tracks</option>
              <option value="Agentic AI">Agentic AI</option>
              <option value="Robotic AI">Robotic AI</option>
              <option value="Generative AI">Generative AI</option>
            </select>

            {/* Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60 transition-all cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="team">Team Only</option>
              <option value="individual">Individual</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60 transition-all cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="status">Sort: Status</option>
            </select>

            {/* Reset Filters */}
            {(searchTerm || statusFilter !== 'all' || themeFilter !== 'all' || modeFilter !== 'all') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="p-2.5 rounded-xl bg-[#131e36]/60 hover:bg-[#1a2846] border border-white/10 text-slate-400 hover:text-white transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {/* Export CSV Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#040711] font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </motion.button>
          </div>
        </div>

        {/* Row 2: Status Filter Pills with animated layout pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#060912]/60 border border-white/5">
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
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                    active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="regStatusPill"
                      transition={springUI}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{pill.label}</span>
                  <span
                    className={`relative z-10 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      active ? 'bg-cyan-400/30 text-cyan-200' : 'bg-white/5 text-slate-400'
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
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                  rowsPerPage === size
                    ? 'bg-cyan-500 text-[#060912] font-bold shadow-md shadow-cyan-500/30'
                    : 'bg-[#0d1527] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0e1629]/80 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0b1222] text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-white/10 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {paginatedRecords.length > 0 &&
                    paginatedRecords.every((r) => selectedIds.includes(r.id || r.reference_code)) ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 font-mono">Registration ID</th>
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Squad</th>
                <th className="py-3.5 px-4">Track</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 px-4 text-center text-slate-500 font-medium">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300 font-heading">
                        No registrations match your current filters.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((reg, idx) => {
                  const refCode = reg.reference_code || 'N/A';
                  const rowId = reg.id || refCode;
                  const isSelected = selectedIds.includes(rowId);
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

                  return (
                    <motion.tr
                      key={rowId}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`transition-colors group ${
                        isSelected
                          ? 'bg-cyan-500/10 hover:bg-cyan-500/15'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleSelectRow(rowId)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Registration ID */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => copyRefCode(refCode)}
                          className="font-mono text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors text-left text-xs group/btn"
                          title="Click to copy registration ID"
                        >
                          <span>{refCode}</span>
                          {copiedCode === refCode ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </td>

                      {/* Applicant Name & Email */}
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

                      {/* Squad / Team */}
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
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/5 text-[11px] font-medium inline-block">
                          {reg.theme || 'Open Innovation'}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Status Chip */}
                      <td className="py-3.5 px-4">
                        <StatusChip status={reg.status || 'pending'} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelectRegistration(reg)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 text-cyan-400 font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm"
                            title="View registration dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </motion.button>

                          {/* Quick Approve */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onUpdateStatus(reg, 'approved')}
                            className={`p-1.5 rounded-lg transition-colors ${
                              statusKey === 'approved'
                                ? 'bg-emerald-500 text-[#040711]'
                                : 'bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-emerald-400'
                            }`}
                            title="Quick Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </motion.button>

                          {/* Quick Reject */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onUpdateStatus(reg, 'rejected')}
                            className={`p-1.5 rounded-lg transition-colors ${
                              statusKey === 'rejected'
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-rose-400'
                            }`}
                            title="Quick Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </motion.button>

                          {/* Quick Delete */}
                          {onDeleteRegistration && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setRegToDelete(reg)}
                              className="p-1.5 rounded-lg transition-colors bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400"
                              title="Delete Registration Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count Footer */}
        <div className="p-4 bg-[#0a101f] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white font-mono">{filteredRecords.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</strong> to{' '}
            <strong className="text-white font-mono">{Math.min(currentPage * rowsPerPage, filteredRecords.length)}</strong> of{' '}
            <strong className="text-white font-mono">{filteredRecords.length}</strong> records
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs font-semibold text-white">
                {currentPage} / {totalPages}
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={springUI}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0b1222]/95 border border-cyan-400/40 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-white font-mono">
                {selectedIds.length} selected
              </span>
            </div>

            <div className="h-4 w-[1px] bg-white/10" />

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={bulkProcessing}
                onClick={() => handleBulkStatus('approved')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={bulkProcessing}
                onClick={() => handleBulkStatus('rejected')}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </motion.button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Deselect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {regToDelete && (
          <div
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => !isDeleting && setRegToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={springUI}
              className="bg-gradient-to-b from-[#151224] to-[#0c0d18] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 text-rose-400">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading">Delete Registration</h3>
                  <p className="text-xs text-slate-400">Permanently remove registration & team</p>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <p>
                  Are you sure you want to permanently delete registration{' '}
                  <strong className="text-cyan-400 font-mono">{regToDelete.reference_code || 'N/A'}</strong>?
                </p>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Applicant:</span>
                    <strong className="text-white">
                      {regToDelete.applicant_name || regToDelete.profiles?.full_name || regToDelete.user_name || 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team:</span>
                    <strong className="text-violet-300">
                      {regToDelete.teams?.team_name || (regToDelete.participation_type === 'team' ? 'Squad' : 'Individual')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Track:</span>
                    <span className="text-slate-300">{regToDelete.theme || 'Open Innovation'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> This will permanently delete the registration record, any associated team and member records, and uploaded files.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setRegToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (!onDeleteRegistration || !regToDelete) return;
                    setIsDeleting(true);
                    const ok = await onDeleteRegistration(regToDelete);
                    setIsDeleting(false);
                    if (ok) {
                      setRegToDelete(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
