import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Users,
  Award,
  Layers,
  Trophy,
  Megaphone,
  Mail,
  Shield,
  Settings,
  Download,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Command as CommandIcon,
  X
} from 'lucide-react';
import { springUI } from '../../../styles/motionConfig';

export default function CommandPalette({
  isOpen,
  onClose,
  setActiveTab,
  onRefresh,
  exportCSV,
  registrations = [],
  onSelectRegistration,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static Navigation items
  const navItems = [
    { id: 'overview', title: 'Command Overview', category: 'Navigation', icon: LayoutDashboard, tab: 'overview' },
    { id: 'registrations', title: 'Registrations & Admissions', category: 'Navigation', icon: Users, tab: 'registrations' },
    { id: 'teams', title: 'Teams & Participant Rosters', category: 'Navigation', icon: Users, tab: 'teams' },
    { id: 'certificates', title: 'Certificate Center', category: 'Navigation', icon: Award, tab: 'certificates' },
    { id: 'submissions', title: 'Project Submissions', category: 'Navigation', icon: Layers, tab: 'submissions' },
    { id: 'results', title: 'Results & Judging Leaderboard', category: 'Navigation', icon: Trophy, tab: 'results' },
    { id: 'cms', title: 'Announcements & CMS', category: 'Navigation', icon: Megaphone, tab: 'cms' },
    { id: 'messages', title: 'Contact Enquiries & Support', category: 'Navigation', icon: Mail, tab: 'messages' },
    { id: 'roles', title: 'Staff Roles & Access Control', category: 'Navigation', icon: Shield, tab: 'roles' },
    { id: 'settings', title: 'System Settings & Logs', category: 'Navigation', icon: Settings, tab: 'settings' },
  ];

  // Quick Action items
  const actionItems = [
    {
      id: 'act-export',
      title: 'Export Registrations as CSV',
      category: 'Actions',
      icon: Download,
      action: () => {
        if (exportCSV) exportCSV();
        onClose();
      },
    },
    {
      id: 'act-refresh',
      title: 'Sync & Refresh Realtime Supabase Data',
      category: 'Actions',
      icon: RotateCcw,
      action: () => {
        if (onRefresh) onRefresh();
        onClose();
      },
    },
  ];

  // Dynamic registration results
  const regResults = query.trim()
    ? registrations
        .filter(
          (r) =>
            (r.reference_code || '').toLowerCase().includes(query.toLowerCase()) ||
            (r.applicant_name || r.profiles?.full_name || '').toLowerCase().includes(query.toLowerCase()) ||
            (r.teams?.team_name || '').toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map((r) => ({
          id: `reg-${r.id || r.reference_code}`,
          title: `${r.applicant_name || 'Participant'} (${r.reference_code})`,
          subtitle: r.teams?.team_name ? `Team: ${r.teams.team_name}` : 'Individual',
          category: 'Registrations',
          icon: Sparkles,
          action: () => {
            if (onSelectRegistration) onSelectRegistration(r);
            onClose();
          },
        }))
    : [];

  // Filtered combined items
  const filteredItems = [
    ...navItems.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())),
    ...actionItems.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())),
    ...regResults,
  ];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          if (selected.tab) {
            setActiveTab(selected.tab);
            onClose();
          } else if (selected.action) {
            selected.action();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, setActiveTab, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={springUI}
            className="relative w-full max-w-xl rounded-2xl bg-[#090F1E] border border-white/[0.12] shadow-[0_16px_70px_rgba(0,0,0,0.9)] overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-white/[0.08] flex items-center space-x-3 bg-white/[0.02]">
              <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search registration, team, page..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-body"
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-mono">
                  No commands or records found for "{query}"
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon || Sparkles;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.tab) {
                          setActiveTab(item.tab);
                          onClose();
                        } else if (item.action) {
                          item.action();
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/15 text-white border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'text-slate-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg border ${
                            isSelected
                              ? 'bg-cyan-950 border-cyan-400/50 text-cyan-300'
                              : 'bg-white/[0.04] border-white/[0.06] text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs sm:text-sm font-semibold truncate">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="block text-[11px] text-slate-400 truncate">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                        <span>{item.category}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with key hints */}
            <div className="p-3 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center space-x-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <div className="flex items-center space-x-1 text-cyan-400">
                <CommandIcon className="w-3 h-3" />
                <span>INNO SPRINT</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
