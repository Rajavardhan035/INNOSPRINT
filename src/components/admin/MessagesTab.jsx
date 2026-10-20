import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FileText,
  Send,
  AlertCircle,
  Inbox,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import CountUp from './shared/CountUp';
import { springUI } from '../../styles/motionConfig';

export default function MessagesTab({
  contactMessages = [],
  setContactMessages,
  onRefreshMessages,
  onDeleteMessage,
  loading = false,
  _adminUser = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'new' | 'in_progress' | 'resolved'
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const copyRef = (code, e) => {
    if (e) e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied ticket ref: ${code}`);
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

      if (selectedMessage && (selectedMessage.id === msgId || selectedMessage.reference_code === msgId)) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }

      const statusLabels = { new: 'New', in_progress: 'In Progress', resolved: 'Resolved' };
      toast.success(`Status updated to ${statusLabels[newStatus] || newStatus}`);
    } catch (err) {
      console.error('[MessagesTab status error]:', err);
      toast.error('Failed to update status');
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
    <div className="space-y-5 font-body">
      {/* Header & Filter Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                <Inbox className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white font-heading tracking-tight">
                Support Desk & Queries
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
                <CountUp value={newCount} /> New
              </span>
              {inProgressCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                  <CountUp value={inProgressCount} /> In Progress
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 font-mono transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60 transition-all cursor-pointer"
            >
              <option value="all">All ({contactMessages.length})</option>
              <option value="new">New ({newCount})</option>
              <option value="in_progress">In Progress ({inProgressCount})</option>
              <option value="resolved">Resolved ({resolvedCount})</option>
            </select>

            {/* Manual Refresh Button */}
            {onRefreshMessages && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRefreshMessages}
                disabled={loading}
                title="Refresh Enquiries from Database"
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5">
        {loading && contactMessages.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#0e1629]/80 border border-white/10 text-slate-400 shadow-xl">
            <RefreshCw className="w-8 h-8 mx-auto text-cyan-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-300 font-heading">Loading contact enquiries from Supabase...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-gradient-to-b from-[#0e1629]/80 to-[#070b14]/90 border border-white/10 text-slate-400 shadow-xl">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300 font-heading">No contact inquiries match your criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Submitted messages from the public Contact page will appear here.</p>
          </div>
        ) : (
          filtered.map((msg, idx) => {
            const status = (msg.status || 'new').toLowerCase();
            const isResolved = status === 'resolved';
            const isInProgress = status === 'in_progress';
            const isUpdating = statusUpdatingId === (msg.id || msg.reference_code);

            return (
              <motion.div
                key={msg.id || msg.reference_code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                onClick={() => setSelectedMessage(msg)}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 hover:border-cyan-500/40 space-y-3.5 transition-all cursor-pointer group shadow-xl backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {msg.reference_code && (
                        <button
                          onClick={(e) => copyRef(msg.reference_code, e)}
                          title="Click to copy reference code"
                          className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
                        >
                          <span>{msg.reference_code}</span>
                          {copiedCode === msg.reference_code ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500" />
                          )}
                        </button>
                      )}

                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-heading">
                        {msg.subject || 'General Inquiry'}
                      </h4>

                      {msg.registration_id_ref && (
                        <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
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
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase ${
                        isResolved
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
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
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-cyan-300 text-xs font-medium transition-colors"
                        >
                          In Progress
                        </button>
                      )}

                      {!isResolved ? (
                        <button
                          onClick={(e) => handleMessageStatus(msg.id || msg.reference_code, 'resolved', e)}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleMessageStatus(msg.id || msg.reference_code, 'new', e)}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                        >
                          Reopen
                        </button>
                      )}

                      {onDeleteMessage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMessage(msg);
                          }}
                          className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Inquiry Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Snippet */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 leading-relaxed font-normal">
                  "{msg.message}"
                </div>

                {/* Card Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Logged: {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Just now'}</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 text-xs flex items-center gap-1 group-hover:underline">
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </span>
                    <a
                      href={`mailto:${msg.email}?subject=RE: INNOSPRINT - ${encodeURIComponent(msg.subject || 'Inquiry')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-medium font-body text-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Direct Reply</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ENQUIRY DETAIL MODAL */}
      <AnimatePresence>
        {selectedMessage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={springUI}
              className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#10172a] to-[#080d19] border border-white/15 p-6 space-y-5 shadow-2xl text-left max-h-[90vh] overflow-y-auto font-body"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                      {selectedMessage.reference_code || 'TICKET'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1.5 font-heading">
                    {selectedMessage.subject || 'Support Ticket'}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
                <div>
                  <span className="text-slate-400 block font-mono">Sender Name</span>
                  <strong className="text-white text-sm">{selectedMessage.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">Email Address</span>
                  <a href={`mailto:${selectedMessage.email}`} className="text-cyan-400 font-mono hover:underline text-sm">
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">FULL MESSAGE CONTENT</label>
                <div className="p-4 rounded-2xl bg-[#060912]/80 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=RE: INNOSPRINT - ${encodeURIComponent(selectedMessage.subject || 'Support Request')}`}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#040711] font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reply via Email</span>
                  </a>

                  {onDeleteMessage && (
                    <button
                      onClick={() => {
                        const msgToDelete = selectedMessage;
                        setSelectedMessage(null);
                        onDeleteMessage(msgToDelete);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      title="Delete Inquiry Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
