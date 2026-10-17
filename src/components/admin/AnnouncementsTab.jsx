import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Eye,
  Sparkles,
  Flame,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import CountUp from './shared/CountUp';
import { springUI } from '../../styles/motionConfig';

export default function AnnouncementsTab({
  announcements = [],
  setAnnouncements,
  adminUser
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [priority, setPriority] = useState('normal'); // 'normal' | 'urgent'
  const [loading, setLoading] = useState(false);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setLoading(true);

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

      toast.success('Official announcement broadcasted successfully!');
      setNewTitle('');
      setNewContent('');
      setPriority('normal');
    } catch (err) {
      console.error('[Announcement Create Error]', err);
      toast.error(err.message || 'Failed to publish announcement.');
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
      toast.success('Announcement removed from broadcast');
    } catch (err) {
      console.warn('Delete announcement notice:', err);
      toast.error('Failed to remove announcement');
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Broadcast Creator Panel */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0e1629]/95 to-[#070b14]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-heading tracking-tight">
              Broadcast Live Announcement
            </h2>
            <p className="text-xs text-slate-400">
              Transmit instant alerts, schedule shifts, and judging notifications to participant screens.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              ANNOUNCEMENT HEADLINE *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Mentorship Review 2 Starting • Desk Check-in Open"
              className="w-full px-4 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 font-mono transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              TRANSMISSION CONTENT *
            </label>
            <textarea
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Detail instructions, zoom links, submission deadlines, or schedule milestones..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 resize-none transition-all leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Priority:</span>
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  priority === 'normal'
                    ? 'bg-cyan-500 text-[#040711] font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  priority === 'urgent'
                    ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Urgent Alert</span>
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#040711] font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Broadcasting...' : 'Transmit Broadcast'}</span>
            </motion.button>
          </div>
        </form>
      </div>

      {/* Broadcast Feed Archive */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-heading tracking-wide flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-cyan-400" />
            <span>Broadcast Feed (<CountUp value={announcements.length} />)</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live on Portal</span>
          </span>
        </div>

        {announcements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-gradient-to-b from-[#0e1629]/80 to-[#070b14]/90 border border-white/10 text-slate-400 text-xs shadow-xl">
            No live broadcasts currently active.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann, idx) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 hover:border-cyan-500/30 flex items-start justify-between gap-4 transition-all shadow-xl backdrop-blur-xl group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      DISPATCH
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {ann.created_at ? new Date(ann.created_at).toLocaleString() : 'Just now'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white font-heading group-hover:text-cyan-400 transition-colors">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {ann.content}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
