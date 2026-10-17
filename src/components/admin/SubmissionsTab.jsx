import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Search,
  ExternalLink,
  FileText,
  Eye,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FolderArchive
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CountUp from './shared/CountUp';
import { springUI } from '../../styles/motionConfig';

export default function SubmissionsTab({ registrations = [], onSelectRegistration }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('all');

  const resolveUrl = (urlOrPath) => {
    if (!urlOrPath) return null;
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      return urlOrPath;
    }
    const { data } = supabase.storage.from('participant-uploads').getPublicUrl(urlOrPath);
    return data?.publicUrl || `https://hbntxrrexilmjvxncwvc.supabase.co/storage/v1/object/public/participant-uploads/${urlOrPath}`;
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return registrations.filter((r) => {
      const matchesSearch =
        !q ||
        (r.project_title || '').toLowerCase().includes(q) ||
        (r.problem_statement || '').toLowerCase().includes(q) ||
        (r.teams?.team_name || '').toLowerCase().includes(q) ||
        (r.reference_code || '').toLowerCase().includes(q) ||
        (r.applicant_name || '').toLowerCase().includes(q);

      const matchesTheme =
        themeFilter === 'all' || (r.theme || '').toLowerCase() === themeFilter.toLowerCase();

      return matchesSearch && matchesTheme;
    });
  }, [registrations, searchTerm, themeFilter]);

  return (
    <div className="space-y-5 font-body">
      {/* Header & Filter Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white font-heading tracking-tight">
                Pitch Decks & Innovation Briefs
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                <CountUp value={filtered.length} /> Submissions
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Review attached PowerPoint decks, problem statements, and technical architectures submitted by squads.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search project title, team, problem..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 font-mono transition-all"
              />
            </div>

            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/60 transition-all cursor-pointer"
            >
              <option value="all">All Tracks</option>
              <option value="Agentic AI">Agentic AI</option>
              <option value="Robotic AI">Robotic AI</option>
              <option value="Generative AI">Generative AI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-16 text-center rounded-2xl bg-gradient-to-b from-[#0e1629]/80 to-[#070b14]/90 border border-white/10 text-slate-400 shadow-xl">
            <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300 font-heading">No proposals match your search or filter.</p>
          </div>
        ) : (
          filtered.map((reg, idx) => {
            const proposalUrl = resolveUrl(reg.proposal_url);
            const studentIdUrl = resolveUrl(reg.student_id_url);
            const isTeam = reg.participation_type === 'team' || reg.teams || reg.team_id;
            const teamName = reg.teams?.team_name || (isTeam ? 'Squad' : 'Individual');

            return (
              <motion.div
                key={reg.id || reg.reference_code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 hover:border-cyan-500/40 flex flex-col justify-between space-y-4 transition-all shadow-xl backdrop-blur-xl group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-cyan-400">
                        {reg.reference_code}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-medium text-slate-300">
                        {teamName}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10">
                      {reg.theme || 'Open Innovation'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors font-heading">
                      {reg.project_title || 'Untitled Innovation Pitch'}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-1 font-normal">
                      {reg.problem_statement || reg.project_description || 'No detailed problem statement provided in application.'}
                    </p>
                  </div>
                </div>

                {/* Attachments & Action Controls */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {proposalUrl ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={proposalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Slide Deck</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </motion.a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No deck uploaded</span>
                    )}

                    {studentIdUrl && (
                      <a
                        href={studentIdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                        title="Student ID Attachment"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ID</span>
                      </a>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectRegistration(reg)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium transition-all"
                  >
                    <span>Full Dossier</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
