import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function AnnouncementsTab({
  announcements = [],
  setAnnouncements,
  adminUser
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [priority, setPriority] = useState('normal'); // 'normal' | 'urgent'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('announcements')
          .insert({
            title: newTitle.trim(),
            content: newContent.trim(),
            created_by: adminUser?.id || null,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setAnnouncements([data, ...announcements]);
        }
      } else {
        const fallbackItem = {
          id: 'ann_' + Date.now(),
          title: newTitle.trim(),
          content: newContent.trim(),
          created_at: new Date().toISOString(),
        };
        const updated = [fallbackItem, ...announcements];
        setAnnouncements(updated);
        localStorage.setItem('inno_sprint_announcements', JSON.stringify(updated));
      }

      setSuccessMsg('Official announcement broadcasted successfully!');
      setNewTitle('');
      setNewContent('');
      setPriority('normal');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('[Announcement Create Error]', err);
      setErrorMsg(err.message || 'Failed to publish announcement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;

    try {
      if (isSupabaseConfigured) {
        await supabase.from('announcements').delete().eq('id', annId);
      }
      const updated = announcements.filter((a) => a.id !== annId);
      setAnnouncements(updated);
      localStorage.setItem('inno_sprint_announcements', JSON.stringify(updated));
    } catch (err) {
      console.warn('Delete announcement notice:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-body">
      {/* Broadcast Creator Panel */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-5">
        <div className="flex items-center gap-3 border-b border-[#1D2A40] pb-4">
          <div className="w-9 h-9 rounded-lg bg-[#111B2D] border border-[#1D2A40] flex items-center justify-center text-cyan-400">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-heading tracking-tight">
              Broadcast Official Announcement
            </h2>
            <p className="text-xs text-slate-400">
              Transmit live notifications and critical updates directly to participant dashboards.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Announcement Title *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Mentorship Round 2 Starting • Desk Check-in Open"
              className="w-full px-3.5 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Message Content *
            </label>
            <textarea
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Detail instructions, links, or schedule milestones for registered teams..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none transition-colors"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400">Priority:</span>
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  priority === 'normal'
                    ? 'bg-cyan-500 text-[#070b14] font-semibold'
                    : 'bg-[#111B2D] border border-[#1D2A40] text-slate-400 hover:text-white'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  priority === 'urgent'
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'bg-[#111B2D] border border-[#1D2A40] text-slate-400 hover:text-white'
                }`}
              >
                Urgent Alert
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Transmitting...' : 'Dispatch Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast Archive */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white font-heading tracking-wide">
            Broadcast Archive ({announcements.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">Live on Portal</span>
        </div>

        {announcements.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#0D1424] border border-[#1D2A40] text-slate-400 text-xs">
            No broadcasts posted yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-xl bg-[#0D1424] border border-[#1D2A40] hover:border-[#2a3c5a] flex items-start justify-between gap-4 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono bg-[#111B2D] text-cyan-400 border border-[#1D2A40]">
                      Dispatch
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {ann.created_at ? new Date(ann.created_at).toLocaleString() : 'Just now'}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {ann.content}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-1.5 rounded-lg bg-[#111B2D] hover:bg-rose-950/60 border border-[#1D2A40] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete announcement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
