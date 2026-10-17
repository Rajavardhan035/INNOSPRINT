import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Award,
  Layers,
  Trophy,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Sliders,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Globe,
  Zap,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { springUI } from '../../styles/motionConfig';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  counts = {},
  user,
  role = 'organizer',
  handleLogout,
}) {
  const navSections = [
    {
      group: 'MAIN OPERATIONS',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'registrations',
          label: 'Registrations',
          icon: FileSpreadsheet,
          badge: counts.totalRegs ? String(counts.totalRegs) : null,
        },
        {
          id: 'teams',
          label: 'Teams & Participants',
          icon: Users,
          badge: counts.totalTeams ? String(counts.totalTeams) : null,
        },
        {
          id: 'certificates',
          label: 'Certificate Center',
          icon: Award,
          badge: counts.certsUploaded !== undefined && counts.certsTotal !== undefined && counts.certsTotal > 0
            ? `${counts.certsUploaded}/${counts.certsTotal}`
            : null,
        },
      ],
    },
    {
      group: 'EVENT MANAGEMENT',
      items: [
        {
          id: 'submissions',
          label: 'Project Submissions',
          icon: Layers,
          badge: counts.proposalsCount ? String(counts.proposalsCount) : null,
        },
        {
          id: 'results',
          label: 'Results & Judging',
          icon: Trophy,
          badge: null,
        },
        {
          id: 'cms',
          label: 'Announcements',
          icon: Megaphone,
          badge: counts.announcementsCount ? String(counts.announcementsCount) : null,
        },
      ],
    },
    {
      group: 'SYSTEM & SUPPORT',
      items: [
        {
          id: 'messages',
          label: 'Contact Enquiries',
          icon: MessageSquare,
          badge: counts.unresolvedMsgs > 0 ? String(counts.unresolvedMsgs) : null,
          badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
        },
        {
          id: 'roles',
          label: 'User Roles & Access',
          icon: ShieldCheck,
          badge: counts.adminsCount ? String(counts.adminsCount) : null,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Sliders,
          badge: null,
        },
      ],
    },
  ];

  const adminDisplayName = user?.user_metadata?.full_name || (user?.email?.split('@')[0]) || 'Admin';
  const adminEmail = user?.email || 'admin@innosprint.com';

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        type="button"
        onClick={() => {
          setActiveTab(item.id);
          if (mobileOpen) setMobileOpen(false);
        }}
        title={collapsed ? item.label : undefined}
        className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors select-none ${
          isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {/* Active Sliding Pill Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeTabPill"
            transition={springUI}
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)] z-0"
          />
        )}

        {/* Hover Highlight (when not active) */}
        {!isActive && (
          <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none" />
        )}

        {/* Left Glowing Accent Line when active */}
        {isActive && (
          <motion.div
            layoutId="activeTabGlowLine"
            transition={springUI}
            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-10"
          />
        )}

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center flex-shrink-0">
          <Icon
            className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
              isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          />
        </div>

        {/* Label & Badge */}
        {!collapsed && (
          <div className="relative z-10 flex-1 flex items-center justify-between min-w-0">
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <motion.span
                key={item.badge}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  item.badgeColor ||
                  (isActive
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-white/[0.04] text-slate-400 border-white/[0.08]')
                }`}
              >
                {item.badge}
              </motion.span>
            )}
          </div>
        )}
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#060A14] text-slate-200 border-r border-white/[0.08] relative select-none">
      {/* Top Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#080E1C]/80 backdrop-blur-md">
        <Link
          to="/"
          className="flex items-center gap-2.5 overflow-hidden group"
          title="Back to Public Portal"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 p-0.5 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all">
            <div className="w-full h-full bg-[#060A14] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-sm tracking-wider text-white">
                  INNO<span className="text-cyan-400">SPRINT</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  PRO
                </span>
              </div>
              <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-widest">
                Mission Control
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-2">
                {sec.group}
              </h4>
            )}
            <div className="space-y-1">
              {sec.items.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile & Live Portal Shortcut */}
      <div className="p-3 border-t border-white/[0.08] bg-[#080E1C]/90 backdrop-blur-md space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
          title="Open Public Event Website"
        >
          <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          {!collapsed && <span>Open Public Portal</span>}
        </Link>

        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {adminDisplayName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-white truncate">
                  {adminDisplayName}
                </span>
                <span className="block text-[10px] text-cyan-400 font-mono capitalize">
                  {role}
                </span>
              </div>
            )}
          </div>

          {!collapsed && handleLogout && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar with smooth spring width */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={springUI}
        className="hidden lg:block fixed top-0 bottom-0 left-0 z-30 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Off-canvas Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={springUI}
              className="relative w-72 max-w-[85vw] h-full z-10"
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
