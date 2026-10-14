import React from 'react';
import { Link } from 'react-router-dom';
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
          badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-500/30',
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
        className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-body transition-colors duration-150 ${
          isActive
            ? 'bg-[#22d3ee]/10 text-[#22d3ee] font-medium border-l-2 border-[#22d3ee]'
            : 'text-gray-400 hover:text-gray-200 hover:bg-[#111b2d]/60 font-normal'
        }`}
      >
        <div className="relative flex items-center justify-center flex-shrink-0">
          <Icon
            className={`w-4 h-4 transition-colors ${
              isActive ? 'text-[#22d3ee]' : 'text-gray-400 group-hover:text-gray-200'
            }`}
          />
        </div>

        {!collapsed && (
          <span className="flex-1 text-left truncate">
            {item.label}
          </span>
        )}

        {!collapsed && item.badge && (
          <span
            className={`px-2 py-0.5 text-[11px] font-mono rounded-md border ${
              item.badgeColor || 'bg-[#111b2d] text-gray-300 border-[#1d2a40]'
            }`}
          >
            {item.badge}
          </span>
        )}

        {/* Collapsed Tooltip */}
        {collapsed && (
          <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-[#0d1424] border border-[#1d2a40] text-white text-xs font-medium font-body whitespace-nowrap shadow-xl z-50">
            {item.label}
            {item.badge && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#111b2d] text-gray-300 border border-[#1d2a40]">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between select-none font-body bg-[#090f1d] text-gray-200">
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1d2a40] bg-[#090f1d]">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#111b2d] border border-[#1d2a40] flex items-center justify-center flex-shrink-0 group-hover:border-[#22d3ee]/40 transition-colors">
              <Zap className="w-4 h-4 text-[#22d3ee]" />
            </div>

            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-heading">
                  INNO<span className="text-[#22d3ee]">SPRINT</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded bg-[#111b2d] text-cyan-300 border border-cyan-500/30 font-mono">
                  ADMIN
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#111b2d] transition-colors border border-transparent hover:border-[#1d2a40]"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#22d3ee]" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#111b2d]"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation Item Groups */}
        <div className="py-4 px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-210px)] custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 font-heading">
                  {section.group}
                </div>
              )}
              {collapsed && <div className="h-1.5" />}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile / Quick Links */}
      <div className="p-3 border-t border-[#1d2a40] bg-[#090f1d] space-y-2">
        {/* User Card */}
        <div
          className={`p-2.5 rounded-xl bg-[#0d1424] border border-[#1d2a40] flex items-center gap-2.5 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#111b2d] border border-[#1d2a40] flex items-center justify-center text-[#22d3ee] font-bold text-xs uppercase flex-shrink-0 font-heading">
            {adminDisplayName.charAt(0)}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate block font-heading">
                  {adminDisplayName}
                </span>
                <span
                  className={`text-[9px] font-medium uppercase px-1.5 py-0.5 rounded font-mono ${
                    role === 'superadmin'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      : 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {role}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono truncate block">
                {adminEmail}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className={`flex items-center gap-1.5 ${collapsed ? 'flex-col' : ''}`}>
          <Link
            to="/"
            title="Return to Public Website"
            className={`flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg bg-[#0d1424] hover:bg-[#111b2d] border border-[#1d2a40] text-gray-300 hover:text-[#22d3ee] text-xs font-medium font-body transition-colors ${
              collapsed ? 'w-full' : 'flex-1'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {!collapsed && <span>Live Portal</span>}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out of Admin Console"
            className={`flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg bg-[#0d1424] hover:bg-rose-950/40 border border-[#1d2a40] hover:border-rose-500/40 text-gray-300 hover:text-rose-300 text-xs font-medium font-body transition-colors ${
              collapsed ? 'w-full' : 'flex-1'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-40 bg-[#090f1d] border-r border-[#1d2a40] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090f1d] border-r border-[#1d2a40] transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
