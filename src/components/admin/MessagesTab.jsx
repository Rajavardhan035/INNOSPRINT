import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Mail,
  Check,
  Copy,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function MessagesTab({
  contactMessages = [],
  setContactMessages,
  onRefreshMessages,
  loading = false,
  _adminUser = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'new' | 'in_progress' | 'resolved'
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionToast, setActionToast] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const showToast = (msg) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(''), 3000);
  };

  const copyRef = (code, e) => {
    if (e) e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied ${code} to clipboard`);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleMessageStatus = async (msgId, newStatus, e) => {
    if (e) e.stopPropagation();
    setStatusUpdatingId(msgId);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('contact_messages')
          .update({ status: newStatus })
          .eq('id', msgId);

        if (error) {
          console.warn('[MessagesTab Supabase update notice]:', error.message || error);
        }
      }

      const updated = contactMessages.map((m) =>
        (m.id === msgId || (m.reference_code && m.reference_code === msgId))
          ? { ...m, status: newStatus }
          : m
      );

      setContactMessages(updated);
      localStorage.setItem('inno_sprint_contact_messages', JSON.stringify(updated));

      // Also update selected message modal if open
      if (selectedMessage && (selectedMessage.id === msgId || selectedMessage.reference_code === msgId)) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }

      const statusLabels = { new: 'New', in_progress: 'In Progress', resolved: 'Resolved' };
      showToast(`Status updated to ${statusLabels[newStatus] || newStatus}`);
    } catch (err) {
      console.error('[MessagesTab status error]:', err);
      showToast('Failed to update status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return contactMessages.filter((m) => {
      const matchesSearch =
        !q ||
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.subject || '').toLowerCase().includes(q) ||
        (m.message || '').toLowerCase().includes(q) ||
        (m.reference_code || '').toLowerCase().includes(q) ||
        (m.registration_id_ref || '').toLowerCase().includes(q);

      const currentStatus = (m.status || 'new').toLowerCase();
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'new' && currentStatus === 'new') ||
        (statusFilter === 'in_progress' && currentStatus === 'in_progress') ||
        (statusFilter === 'resolved' && currentStatus === 'resolved') ||
        (statusFilter === 'unresolved' && currentStatus !== 'resolved');

      return matchesSearch && matchesStatus;
    });
  }, [contactMessages, searchTerm, statusFilter]);

  const newCount = contactMessages.filter(
    (m) => (m.status || 'new').toLowerCase() === 'new'
  ).length;

  const inProgressCount = contactMessages.filter(
    (m) => (m.status || '').toLowerCase() === 'in_progress'
  ).length;

  const resolvedCount = contactMessages.filter(
    (m) => (m.status || '').toLowerCase() === 'resolved'
  ).length;

  return (
    <div className="space-y-5 animate-fadeIn font-body">
      {/* Action Toast Feedback */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs font-mono font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Header & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <h2 className="text-lg font-bold text-white font-heading tracking-tight">
                Contact Form Inquiries & Support Tickets
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#111B2D] border border-amber-500/30 text-[10px] font-mono text-amber-300">
                {newCount} New
              </span>
              {inProgressCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#111B2D] border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                  {inProgressCount} In Progress
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Manage inquiries submitted by participants, mentors, and sponsors through the public contact portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sender, topic, ref..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">All ({contactMessages.length})</option>
              <option value="new">New ({newCount})</option>
              <option value="in_progress">In Progress ({inProgressCount})</option>
              <option value="resolved">Resolved ({resolvedCount})</option>
            </select>

            {/* Manual Refresh Button */}
            {onRefreshMessages && (
              <button
                onClick={onRefreshMessages}
                disabled={loading}
                title="Refresh Enquiries from Database"
                className="p-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5">
        {loading && contactMessages.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0D1424] border border-[#1D2A40] text-slate-400">
            <RefreshCw className="w-8 h-8 mx-auto text-cyan-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-300 font-heading">Loading contact enquiries from Supabase...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0D1424] border border-[#1D2A40] text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300 font-heading">No contact inquiries match your criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Submitted messages from the public Contact page will appear here.</p>
          </div>
        ) : (
          filtered.map((msg) => {
            const status = (msg.status || 'new').toLowerCase();
            const isResolved = status === 'resolved';
            const isInProgress = status === 'in_progress';
            const isUpdating = statusUpdatingId === (msg.id || msg.reference_code);

            return (
              <div
                key={msg.id || msg.reference_code}
                onClick={() => setSelectedMessage(msg)}
                className="p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] hover:border-cyan-500/40 hover:bg-[#0f182c] space-y-3.5 transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1D2A40] pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {msg.reference_code && (
                        <button
                          onClick={(e) => copyRef(msg.reference_code, e)}
                          title="Click to copy reference code"
                          className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30"
                        >
                          <span>{msg.reference_code}</span>
                          {copiedCode === msg.reference_code ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500" />
                          )}
                        </button>
                      )}

                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {msg.subject || 'General Enquiry'}
                      </h4>

                      {msg.registration_id_ref && (
                        <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/30">
                          Ref: {msg.registration_id_ref}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>
                        From: <strong className="text-slate-200">{msg.name}</strong>
                      </span>
                      <span className="text-slate-600">•</span>
                      <a
                        href={`mailto:${msg.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-cyan-400 hover:underline text-xs"
                      >
                        {msg.email}
                      </a>
                    </div>
                  </div>

                  {/* Status Pills & Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase ${
                        isResolved
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isResolved ? 'Resolved' : isInProgress ? 'In Progress' : 'New'}
                    </span>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1">
                      {status !== 'in_progress' && !isResolved && (
                        <button
                          onClick={(e) => handleMessageStatus(msg.id || msg.reference_code, 'in_progress', e)}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-md bg-[#111B2D] hover:bg-cyan-950/60 border border-[#1D2A40] hover:border-cyan-500/50 text-cyan-300 text-xs font-medium transition-colors"
                        >
                          In Progress
                        </button>
                      )}

                      {!isResolved ? (
                        <button
                          onClick={(e) => handleMessageStatus(msg.id || msg.reference_code, 'resolved', e)}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-md bg-[#111B2D] hover:bg-emerald-950/60 border border-[#1D2A40] hover:border-emerald-500/50 text-emerald-400 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleMessageStatus(msg.id || msg.reference_code, 'new', e)}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-400 hover:text-white text-xs font-medium transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Snippet */}
                <div className="p-3.5 rounded-lg bg-[#111B2D] border border-[#1D2A40] text-xs text-slate-300 leading-relaxed font-normal">
                  "{msg.message}"
                </div>

                {/* Card Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Logged: {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Just now'}</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 text-xs flex items-center gap-1 group-hover:underline">
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </span>
                    <a
                      href={`mailto:${msg.email}?subject=RE: INNOSPRINT - ${encodeURIComponent(msg.subject || 'Inquiry')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-medium font-body text-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ENQUIRY DETAIL MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0D1424] border border-[#1D2A40] p-6 space-y-5 shadow-2xl text-left max-h-[90vh] overflow-y-auto font-body">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#1D2A40] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                    {selectedMessage.reference_code || 'INQUIRY'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      selectedMessage.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : selectedMessage.status === 'in_progress'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {selectedMessage.status || 'New'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-heading">
                  {selectedMessage.subject || 'General Enquiry'}
                </h3>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#111B2D] border border-[#1D2A40] text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Sender Name:</span>
                <span className="text-white font-semibold text-sm">{selectedMessage.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Email Address:</span>
                <a href={`mailto:${selectedMessage.email}`} className="text-cyan-400 hover:underline font-mono">
                  {selectedMessage.email}
                </a>
              </div>
              {selectedMessage.registration_id_ref && (
                <div>
                  <span className="text-slate-400 block font-mono">Related Registration ID:</span>
                  <span className="text-amber-300 font-mono font-semibold">{selectedMessage.registration_id_ref}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block font-mono">Submitted Timestamp:</span>
                <span className="text-slate-300 font-mono">
                  {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Full Inquiry Message
              </label>
              <div className="p-4 rounded-xl bg-[#070b14] border border-[#1D2A40] text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#1D2A40] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Change Status:</span>
                <button
                  onClick={() => handleMessageStatus(selectedMessage.id || selectedMessage.reference_code, 'new')}
                  className={`px-2.5 py-1 rounded text-xs font-mono ${selectedMessage.status === 'new' ? 'bg-amber-500 text-black font-bold' : 'bg-gray-900 border border-gray-800 text-gray-300'}`}
                >
                  New
                </button>
                <button
                  onClick={() => handleMessageStatus(selectedMessage.id || selectedMessage.reference_code, 'in_progress')}
                  className={`px-2.5 py-1 rounded text-xs font-mono ${selectedMessage.status === 'in_progress' ? 'bg-cyan-500 text-black font-bold' : 'bg-gray-900 border border-gray-800 text-gray-300'}`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleMessageStatus(selectedMessage.id || selectedMessage.reference_code, 'resolved')}
                  className={`px-2.5 py-1 rounded text-xs font-mono ${selectedMessage.status === 'resolved' ? 'bg-emerald-500 text-black font-bold' : 'bg-gray-900 border border-gray-800 text-gray-300'}`}
                >
                  Resolved
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=RE: INNOSPRINT [${selectedMessage.reference_code}] - ${encodeURIComponent(selectedMessage.subject || 'Support Response')}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-heading shadow-md transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
