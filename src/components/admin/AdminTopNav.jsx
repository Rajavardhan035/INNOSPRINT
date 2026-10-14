import React from 'react';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  CheckCircle2,
  X,
  Shield,
  Layers,
  Award
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function AdminTopNav({
  activeTab,
  setMobileOpen,
  searchTerm,
  setSearchTerm,
  onRefresh,
  loading = false,
  pendingCount = 0,
  unresolvedMsgsCount = 0,
  user,
  role = 'organizer',
  setActiveTab
}) {
  const getTabMetadata = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Command Overview', category: 'Overview & Metrics', icon: Layers };
      case 'registrations':
        return { title: 'Registrations', category: 'Operations & Admissions', icon: Layers };
      case 'teams':
        return { title: 'Teams & Participants', category: 'Squads & Rosters', icon: Layers };
      case 'certificates':
        return { title: 'Certificate Center', category: 'Credentials & Verification', icon: Award };
      case 'submissions':
        return { title: 'Project Submissions', category: 'Proposals & Pitch Decks', icon: Layers };
      case 'results':
        return { title: 'Results & Judging', category: 'Evaluation & Awards', icon: Award };
      case 'cms':
        return { title: 'Announcements', category: 'Broadcasting & Feed', icon: Layers };
      case 'messages':
        return { title: 'Contact Enquiries', category: 'Support & Inquiries', icon: Layers };
      case 'roles':
        return { title: 'User Roles & Access', category: 'Security & Admins', icon: Shield };
      case 'settings':
        return { title: 'Settings', category: 'System Configuration', icon: Layers };
      default:
        return { title: 'Admin Console', category: 'Management', icon: Layers };
    }
  };

  const meta = getTabMetadata();
  const totalAlerts = pendingCount + unresolvedMsgsCount;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090f1d]/95 backdrop-blur-md border-b border-[#1d2a40] px-4 sm:px-6 flex items-center justify-between gap-4 font-body">
      {/* Left: Mobile hamburger + Page Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#111b2d] transition-colors border border-transparent hover:border-[#1d2a40]"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5 text-[#22d3ee]" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-gray-400 truncate">
            <span>Admin</span>
            <span className="text-gray-600">/</span>
            <span className="text-[#22d3ee] font-medium">{meta.category}</span>
          </div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white font-heading truncate">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search active records (name, ID, email, team)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#070b14] border border-[#1d2a40] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee]/30 transition-all font-body"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications & Status Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Supabase Status Dot */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono border ${
          isSupabaseConfigured
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="hidden xl:inline">{isSupabaseConfigured ? 'SUPABASE LIVE' : 'OFFLINE MODE'}</span>
        </div>

        {/* Real-time Notifications / Pending Action Badge */}
        {totalAlerts > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (pendingCount > 0) setActiveTab('registrations');
              else if (unresolvedMsgsCount > 0) setActiveTab('messages');
            }}
            className="relative p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/60 transition-colors"
            title={`${pendingCount} pending registrations, ${unresolvedMsgsCount} unresolved support messages`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center font-mono shadow-md">
              {totalAlerts}
            </span>
          </button>
        ) : (
          <div
            className="p-2 rounded-xl bg-[#0d1424] border border-[#1d2a40] text-gray-400"
            title="All items reviewed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        {/* Refresh Data Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-[#0d1424] hover:bg-[#111b2d] border border-[#1d2a40] text-gray-300 hover:text-[#22d3ee] transition-colors disabled:opacity-50"
          title="Refresh Supabase Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#22d3ee]' : ''}`} />
        </button>

        {/* Admin Role Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1d2a40]">
          <div className="w-7 h-7 rounded-lg bg-[#111b2d] border border-[#1d2a40] flex items-center justify-center text-[#22d3ee] text-xs font-bold uppercase font-heading shadow-sm">
            {(user?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight font-heading">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
            </span>
            <span className="text-[10px] font-medium uppercase font-mono text-[#22d3ee] tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
