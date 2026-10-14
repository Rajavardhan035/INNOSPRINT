import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  ExternalLink,
  FileText,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
    <div className="space-y-5 animate-fadeIn font-body">
      {/* Header & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-heading tracking-tight">
                Project Proposals & Submission Decks
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#111B2D] border border-[#1D2A40] text-[10px] font-mono text-cyan-400">
                {filtered.length} Submissions
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Review attached PowerPoint slide decks, problem statements, and technical briefs submitted by squads.
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
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition-colors"
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
          <div className="col-span-full p-12 text-center rounded-xl bg-[#0D1424] border border-[#1D2A40] text-slate-400">
            <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300 font-heading">No proposals match your search or filter.</p>
          </div>
        ) : (
          filtered.map((reg) => {
            const proposalUrl = resolveUrl(reg.proposal_url);
            const studentIdUrl = resolveUrl(reg.student_id_url);
            const isTeam = reg.participation_type === 'team' || reg.teams || reg.team_id;
            const teamName = reg.teams?.team_name || (isTeam ? 'Squad' : 'Individual');

            return (
              <div
                key={reg.id || reg.reference_code}
                className="p-5 rounded-xl bg-[#0D1424] border border-[#1D2A40] hover:border-[#2a3c5a] flex flex-col justify-between space-y-4 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 border-b border-[#1D2A40] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-cyan-400">
                        {reg.reference_code}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-medium text-slate-300">
                        {teamName}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#111B2D] text-slate-300 border border-[#1D2A40]">
                      {reg.theme || 'Open Innovation'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {reg.project_title || 'Untitled Innovation Pitch'}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-1 font-normal">
                      {reg.problem_statement || reg.project_description || 'No detailed problem statement provided in application.'}
                    </p>
                  </div>
                </div>

                {/* Attachments & Action Controls */}
                <div className="pt-2.5 border-t border-[#1D2A40] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {proposalUrl ? (
                      <a
                        href={proposalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] hover:border-cyan-500/50 text-cyan-400 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Slides</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No slide deck</span>
                    )}

                    {studentIdUrl && (
                      <a
                        href={studentIdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1.5 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                        title="Student ID Attachment"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ID</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectRegistration(reg)}
                    className="px-2.5 py-1.5 rounded-md bg-[#111B2D] hover:bg-[#162238] border border-[#1D2A40] text-slate-300 hover:text-white font-medium transition-all"
                  >
                    <span>Full Dossier</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
