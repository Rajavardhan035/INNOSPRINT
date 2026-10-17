import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  CheckCircle2,
  X,
  Shield,
  Layers,
  Award,
  Command as CommandIcon,
  ChevronDown,
  LogOut,
  Sparkles,
  Mail,
  UserCheck
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { springUI } from '../../styles/motionConfig';

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
  setActiveTab,
  onOpenCommandPalette,
  handleLogout,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
  const adminDisplayName = user?.user_metadata?.full_name || (user?.email?.split('@')[0]) || 'Admin';
  const adminEmail = user?.email || 'admin@innosprint.com';

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#060A14]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 font-body select-none">
      {/* Left: Mobile hamburger + Page Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-colors"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5 text-cyan-400" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 truncate">
            <span>Admin</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-semibold">{meta.category}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-white font-heading truncate">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Center: Command Palette Trigger Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-500/40 text-xs text-slate-400 transition-all shadow-inner group"
        >
          <div className="flex items-center space-x-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="truncate">Quick actions, search teams or jump to page...</span>
          </div>
          <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-400">
            <CommandIcon className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Live Pill, Notifications, Refresh & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Supabase Status Pill */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono border ${
            isSupabaseConfigured
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isSupabaseConfigured && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </span>
          <span className="hidden xl:inline">{isSupabaseConfigured ? 'SUPABASE LIVE' : 'OFFLINE MODE'}</span>
        </div>

        {/* Real-time Notifications Bell with Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-all border ${
              totalAlerts > 0
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/50'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
            }`}
            title="Notifications & Action Items"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black flex items-center justify-center font-mono shadow-md animate-bounce">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={springUI}
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#090F1E] border border-white/[0.12] shadow-2xl p-4 space-y-3 z-50 text-left"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Action Items ({totalAlerts})
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-500 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {pendingCount > 0 ? (
                    <div
                      onClick={() => {
                        setActiveTab('registrations');
                        setShowNotifications(false);
                      }}
                      className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 flex items-start space-x-3 cursor-pointer transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-medium">
                          {pendingCount} Pending Registrations
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          Teams awaiting admission approval.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-slate-400 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>All registrations reviewed!</span>
                    </div>
                  )}

                  {unresolvedMsgsCount > 0 && (
                    <div
                      onClick={() => {
                        setActiveTab('messages');
                        setShowNotifications(false);
                      }}
                      className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 hover:border-rose-400 flex items-start space-x-3 cursor-pointer transition-colors"
                    >
                      <Mail className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-medium">
                          {unresolvedMsgsCount} Unresolved Support Inquiries
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          Participant inquiries pending resolution.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Refresh Button with Spinner micro-interaction */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all disabled:opacity-50"
          title="Refresh Data from Supabase"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Profile Avatar & Menu Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 text-black font-black text-[11px] flex items-center justify-center">
              {adminDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
              {adminDisplayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={springUI}
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#090F1E] border border-white/[0.12] shadow-2xl p-3 space-y-2 z-50 text-left"
              >
                <div className="px-2 py-1.5 border-b border-white/[0.06]">
                  <strong className="text-white block text-xs truncate">{adminDisplayName}</strong>
                  <span className="text-[10px] text-slate-400 truncate block font-mono">{adminEmail}</span>
                  <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                    {role}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    System Settings
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('roles');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    Access Roles
                  </button>
                  {handleLogout && (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors flex items-center space-x-1.5 pt-1.5 border-t border-white/[0.06]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
