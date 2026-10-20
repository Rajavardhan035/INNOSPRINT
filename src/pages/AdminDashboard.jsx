import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { fetchCloudAuthorizedAdmins } from '../lib/adminList';
import {
  groupRegistrationsIntoTeamCertificateCards,
  fetchAllCertificatesMap,
} from '../lib/certificates';

import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import CommandPalette from '../components/admin/shared/CommandPalette';
import { pageTransitionVariants } from '../styles/motionConfig';

// Administrative Subcomponents
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopNav from '../components/admin/AdminTopNav';
import OverviewTab from '../components/admin/OverviewTab';
import RegistrationsTab from '../components/admin/RegistrationsTab';
import TeamsTab from '../components/admin/TeamsTab';
import SubmissionsTab from '../components/admin/SubmissionsTab';
import ResultsTab from '../components/admin/ResultsTab';
import AnnouncementsTab from '../components/admin/AnnouncementsTab';
import MessagesTab from '../components/admin/MessagesTab';
import RolesTab from '../components/admin/RolesTab';
import SettingsTab from '../components/admin/SettingsTab';
import CertificateManagementTab from '../components/CertificateManagementTab';
import RegistrationDetailsModal from '../components/RegistrationDetailsModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  // Navigation tab state
  const [tab, setTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Sidebar responsive & collapse states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('inno_sprint_admin_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('inno_sprint_admin_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Global Command+K / Ctrl+K hotkey for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Data states from live Supabase
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [userRolesList, setUserRolesList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [certificatesMap, setCertificatesMap] = useState({});

  const DEFAULT_ADMINS = [
    {
      id: 'main_admin',
      email: 'rajavardhan445@gmail.com',
      full_name: 'Raja Vardhan',
      role: 'superadmin',
      added_by: 'Primary Owner',
      created_at: '2026-03-01T00:00:00.000Z',
    },
  ];

  const [authorizedAdminsList, setAuthorizedAdminsList] = useState(DEFAULT_ADMINS);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const fetchAdminData = useCallback(async () => {
    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        // 1. Registrations with team members and profiles
        let regData = [];
        try {
          const res = await supabase
            .from('registrations')
            .select(
              '*, profiles(full_name, email, college, mobile), teams(id, team_name, theme, team_members(*))'
            )
            .order('created_at', { ascending: false });

          if (!res.error && res.data) {
            regData = res.data;
          } else {
            throw res.error;
          }
        } catch (joinErr) {
          console.warn('[Admin Dashboard] Nested team_members fallback:', joinErr);
          const res = await supabase
            .from('registrations')
            .select('*, profiles(full_name, email, college, mobile), teams(team_name)')
            .order('created_at', { ascending: false });
          regData = res.data || [];
        }

        // Clean out any registrations marked as deleted, system configuration records, or present in deleted cache
        const deletedIds = JSON.parse(localStorage.getItem('inno_sprint_deleted_regs') || '[]');
        const cleanRegData = regData.filter(
          (r) =>
            r.reference_code !== 'SYS-AUTH-ADMINS' &&
            !r.reference_code?.startsWith('SYS-') &&
            (!r.organizer_notes || !r.organizer_notes.includes('__DELETED__')) &&
            !deletedIds.includes(r.id) &&
            !deletedIds.includes(r.reference_code)
        );

        setRegistrations(cleanRegData);

        // Fetch certificate manifest map
        try {
          const certMap = await fetchAllCertificatesMap(cleanRegData);
          setCertificatesMap(certMap);
        } catch (cErr) {
          console.warn('[Admin Dashboard] Cert map fetch error:', cErr);
        }

        // 2. Contact Messages (with RPC fallback and local cache dual-sync)
        let resolvedMsgs = [];
        try {
          const { data: msgData, error: msgErr } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

          if (!msgErr && Array.isArray(msgData)) {
            resolvedMsgs = msgData;
          } else {
            if (msgErr) {
              console.warn('[Admin Dashboard] contact_messages table query notice:', msgErr.message || msgErr);
            }
            // Fallback to secure admin RPC helper
            const checkEmail = user?.email || (typeof checkIsAdminEmail === 'function' ? checkIsAdminEmail(user?.email)?.email : null);
            if (checkEmail) {
              const { data: rpcData, error: rpcErr } = await supabase
                .rpc('get_admin_contact_messages', { admin_email: checkEmail });
              if (!rpcErr && Array.isArray(rpcData)) {
                resolvedMsgs = rpcData;
              } else if (rpcErr) {
                console.warn('[Admin Dashboard] RPC get_admin_contact_messages notice:', rpcErr.message || rpcErr);
              }
            }
          }
        } catch (fetchErr) {
          console.warn('[Admin Dashboard] contact_messages catch notice:', fetchErr);
        }

        // Merge with local submissions cache so inquiries submitted on this machine are immediately accessible
        try {
          const localMsgs = JSON.parse(localStorage.getItem('inno_sprint_contact_messages') || '[]');
          const merged = [...resolvedMsgs];
          localMsgs.forEach((lm) => {
            if (lm && !merged.some((m) => (m.id && m.id === lm.id) || (m.reference_code && m.reference_code === lm.reference_code))) {
              merged.push(lm);
            }
          });
          merged.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          resolvedMsgs = merged;
          localStorage.setItem('inno_sprint_contact_messages', JSON.stringify(merged));
        } catch (storageErr) {
          console.warn('[Admin Dashboard] localStorage merge notice:', storageErr);
        }

        // Clean out any contact messages marked as deleted or present in deleted cache
        const deletedMsgIds = JSON.parse(localStorage.getItem('inno_sprint_deleted_messages') || '[]');
        const cleanMsgs = resolvedMsgs.filter(
          (m) =>
            m &&
            m.status !== '__DELETED__' &&
            (!m.id || !deletedMsgIds.includes(m.id)) &&
            (!m.reference_code || !deletedMsgIds.includes(m.reference_code))
        );

        setContactMessages(cleanMsgs);

        // 3. User Roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('*, profiles(full_name, email)');
        setUserRolesList(rolesData || []);

        // 4. Authorized Admins (fetch from live cloud registry synced across devices)
        try {
          const cloudAdmins = await fetchCloudAuthorizedAdmins();
          setAuthorizedAdminsList(cloudAdmins);
        } catch (authErr) {
          console.warn('[Admin authorized_admins notice]', authErr);
        }

        // 5. Announcements
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        setAnnouncements(annData || []);
      } catch (err) {
        console.error('[Admin Fetch Error]', err);
      }
    } else {
      // Local storage fallback mode
      const localRegs = JSON.parse(localStorage.getItem('inno_sprint_registrations') || '[]');
      setRegistrations(localRegs);
      const localMsgs = JSON.parse(localStorage.getItem('inno_sprint_contact_messages') || '[]');
      const deletedMsgIds = JSON.parse(localStorage.getItem('inno_sprint_deleted_messages') || '[]');
      const cleanLocalMsgs = localMsgs.filter(
        (m) =>
          m &&
          m.status !== '__DELETED__' &&
          (!m.id || !deletedMsgIds.includes(m.id)) &&
          (!m.reference_code || !deletedMsgIds.includes(m.reference_code))
      );
      setContactMessages(cleanLocalMsgs);

      const localAdmins = JSON.parse(
        localStorage.getItem('inno_sprint_authorized_admins') || '[]'
      );
      const revokedAdmins = JSON.parse(
        localStorage.getItem('inno_sprint_revoked_admins') || '[]'
      );
      const merged = [...DEFAULT_ADMINS];
      localAdmins.forEach((item) => {
        const cleanEmail = item?.email?.toLowerCase();
        if (
          cleanEmail &&
          !revokedAdmins.includes(cleanEmail) &&
          !merged.some((m) => m.email.toLowerCase() === cleanEmail)
        ) {
          merged.push(item);
        }
      });
      setAuthorizedAdminsList(merged);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Group registrations into structured Team Cards with complete member rosters
  const teamCards = useMemo(() => {
    return groupRegistrationsIntoTeamCertificateCards(registrations, certificatesMap);
  }, [registrations, certificatesMap]);

  // All individual participants
  const allParticipantRows = useMemo(() => {
    return teamCards.flatMap((t) => t.members);
  }, [teamCards]);

  const totalEligibleParticipants = allParticipantRows.length;
  const certificatesUploadedCount = allParticipantRows.filter(
    (m) => m.certificateStatus === 'Available'
  ).length;
  const certificatesPendingCount = totalEligibleParticipants - certificatesUploadedCount;

  // Real telemetric counts
  const totalRegs = registrations.length;
  const approvedRegs = registrations.filter(
    (r) => (r.status || '').toLowerCase() === 'approved'
  ).length;
  const pendingRegs = registrations.filter(
    (r) => (r.status || 'pending').toLowerCase() === 'pending'
  ).length;
  const unresolvedMsgs = contactMessages.filter(
    (m) => (m.status || 'new').toLowerCase() !== 'resolved'
  ).length;
  const proposalsCount = registrations.filter((r) => Boolean(r.proposal_url)).length;

  // Handle registration status mutation (approve, reject, waitlist)
  const handleUpdateStatus = async (regItem, newStatus) => {
    const regId = typeof regItem === 'object' ? regItem.id : regItem;
    const refCode = typeof regItem === 'object' ? regItem.reference_code : regItem;

    if (isSupabaseConfigured) {
      let query = supabase
        .from('registrations')
        .update({ status: newStatus, updated_at: new Date().toISOString() });

      if (regId) {
        query = query.eq('id', regId);
      } else {
        query = query.eq('reference_code', refCode);
      }

      const { error } = await query;
      if (error) console.error('Error updating registration status:', error);

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId || r.reference_code === refCode ? { ...r, status: newStatus } : r
        )
      );

      setSelectedRegistration((prev) => {
        if (!prev) return null;
        if (prev.id === regId || prev.reference_code === refCode) {
          return { ...prev, status: newStatus };
        }
        return prev;
      });
      toast.success(`Registration status marked as ${newStatus}`);
    } else {
      const localRegs = JSON.parse(localStorage.getItem('inno_sprint_registrations') || '[]');
      const updated = localRegs.map((r) =>
        r.id === regId || r.reference_code === refCode ? { ...r, status: newStatus } : r
      );
      localStorage.setItem('inno_sprint_registrations', JSON.stringify(updated));
      setRegistrations(updated);
      setSelectedRegistration((prev) => {
        if (!prev) return null;
        if (prev.id === regId || prev.reference_code === refCode) {
          return { ...prev, status: newStatus };
        }
        return prev;
      });
      toast.success(`Registration status marked as ${newStatus}`);
    }
  };

  // Handle registration deletion (permanently delete unwanted registration/team)
  const handleDeleteRegistration = async (regItem) => {
    if (!regItem) return false;
    const regId = typeof regItem === 'object' ? regItem.id : regItem;
    const refCode = typeof regItem === 'object' ? regItem.reference_code : regItem;
    const teamId = typeof regItem === 'object' ? (regItem.team_id || regItem.teams?.id) : null;

    if (isSupabaseConfigured) {
      try {
        let deletedInDatabase = false;

        // 1. Try dedicated RPC function if installed
        try {
          const { data: rpcSuccess, error: rpcErr } = await supabase.rpc(
            'delete_registration_permanently',
            { p_reg_id: regId || null, p_ref_code: refCode || null }
          );
          if (!rpcErr && rpcSuccess) {
            deletedInDatabase = true;
          }
        } catch {
          // RPC may not exist yet, proceed with direct operations
        }

        if (!deletedInDatabase) {
          // 2. Delete certificates if any
          if (refCode || regId) {
            try {
              let certQuery = supabase.from('certificates').delete();
              if (regId) certQuery = certQuery.eq('registration_id', regId);
              else if (refCode) certQuery = certQuery.eq('reference_code', refCode);
              await certQuery;
            } catch (certErr) {
              console.warn('[Admin] Notice deleting certificates:', certErr);
            }
          }

          // 3. Delete project submissions if any
          if (regId) {
            try {
              await supabase.from('project_submissions').delete().eq('registration_id', regId);
            } catch (subErr) {
              console.warn('[Admin] Notice deleting project_submissions:', subErr);
            }
          }

          // 4. Try hard DELETE from registrations with .select() to verify rows were removed
          try {
            let delQuery = supabase.from('registrations').delete();
            if (regId) {
              delQuery = delQuery.eq('id', regId);
            } else {
              delQuery = delQuery.eq('reference_code', refCode);
            }
            const { data: delRows, error: delErr } = await delQuery.select('id');
            if (!delErr && delRows && delRows.length > 0) {
              deletedInDatabase = true;
            }
          } catch (delErr) {
            console.warn('[Admin] Direct delete query notice:', delErr);
          }

          // 5. If hard delete was blocked by Supabase RLS, persist deletion flag in Supabase
          if (!deletedInDatabase) {
            try {
              let markQuery = supabase
                .from('registrations')
                .update({
                  organizer_notes: '__DELETED__',
                  status: 'rejected',
                  updated_at: new Date().toISOString(),
                });
              if (regId) {
                markQuery = markQuery.eq('id', regId);
              } else {
                markQuery = markQuery.eq('reference_code', refCode);
              }
              await markQuery;
            } catch (mErr) {
              console.warn('[Admin] Notice marking as deleted:', mErr);
            }
          }

          // 6. Delete associated team_members and teams if any
          if (teamId) {
            try {
              await supabase.from('team_members').delete().eq('team_id', teamId);
              await supabase.from('teams').delete().eq('id', teamId);
            } catch (teamErr) {
              console.warn('[Admin] Notice deleting team/team_members:', teamErr);
            }
          }
        }
      } catch (err) {
        console.error('[Admin] Delete operation failed:', err);
      }
    }

    // Maintain persistent deleted registry in localStorage so page reloads never resurrect it
    try {
      const deletedList = JSON.parse(localStorage.getItem('inno_sprint_deleted_regs') || '[]');
      if (regId && !deletedList.includes(regId)) deletedList.push(regId);
      if (refCode && !deletedList.includes(refCode)) deletedList.push(refCode);
      localStorage.setItem('inno_sprint_deleted_regs', JSON.stringify(deletedList));

      const localRegs = JSON.parse(localStorage.getItem('inno_sprint_registrations') || '[]');
      const updatedLocal = localRegs.filter(
        (r) => !(r.id === regId || (refCode && r.reference_code === refCode))
      );
      localStorage.setItem('inno_sprint_registrations', JSON.stringify(updatedLocal));
    } catch (e) {
      console.warn('[Admin] localStorage deletion notice:', e);
    }

    // Update in-memory state
    setRegistrations((prev) =>
      prev.filter((r) => !(r.id === regId || (refCode && r.reference_code === refCode)))
    );

    // Close modal if open for this registration
    setSelectedRegistration((prev) => {
      if (prev && (prev.id === regId || (refCode && prev.reference_code === refCode))) {
        return null;
      }
      return prev;
    });

    toast.success('Registration deleted successfully');
    return true;
  };

  // Handle contact message deletion (permanently delete inquiry/mail)
  const handleDeleteMessage = async (msgItem) => {
    if (!msgItem) return false;
    const msgId = msgItem.id;
    const refCode = msgItem.reference_code;

    if (
      !confirm(
        `Are you sure you want to permanently delete inquiry "${msgItem.subject || refCode || 'Ticket'}" from ${msgItem.name || msgItem.email}?`
      )
    ) {
      return false;
    }

    if (isSupabaseConfigured) {
      try {
        let deletedInDatabase = false;
        try {
          if (msgId) {
            const { error: dErr } = await supabase.from('contact_messages').delete().eq('id', msgId);
            if (!dErr) deletedInDatabase = true;
          } else if (refCode) {
            const { error: dErr } = await supabase.from('contact_messages').delete().eq('reference_code', refCode);
            if (!dErr) deletedInDatabase = true;
          }
        } catch (delErr) {
          console.warn('[Admin] Direct delete message notice:', delErr);
        }

        // Dual-resilience fallback: mark as __DELETED__ in Supabase so RLS blocks don't revive it
        if (!deletedInDatabase) {
          try {
            if (msgId) {
              await supabase.from('contact_messages').update({ status: '__DELETED__' }).eq('id', msgId);
            } else if (refCode) {
              await supabase.from('contact_messages').update({ status: '__DELETED__' }).eq('reference_code', refCode);
            }
          } catch (mErr) {
            console.warn('[Admin] Notice marking message as deleted:', mErr);
          }
        }
      } catch (err) {
        console.error('[Admin] Message delete operation failed:', err);
      }
    }

    // Persist to local deleted messages registry
    try {
      const deletedList = JSON.parse(localStorage.getItem('inno_sprint_deleted_messages') || '[]');
      if (msgId && !deletedList.includes(msgId)) deletedList.push(msgId);
      if (refCode && !deletedList.includes(refCode)) deletedList.push(refCode);
      localStorage.setItem('inno_sprint_deleted_messages', JSON.stringify(deletedList));

      const localMsgs = JSON.parse(localStorage.getItem('inno_sprint_contact_messages') || '[]');
      const updatedLocal = localMsgs.filter(
        (m) => !(m.id === msgId || (refCode && m.reference_code === refCode))
      );
      localStorage.setItem('inno_sprint_contact_messages', JSON.stringify(updatedLocal));
    } catch (e) {
      console.warn('[Admin] localStorage message deletion notice:', e);
    }

    // Update in-memory state
    setContactMessages((prev) =>
      prev.filter((m) => !(m.id === msgId || (refCode && m.reference_code === refCode)))
    );

    toast.success('Support inquiry deleted successfully');
    return true;
  };

  // Export registrations CSV
  const exportCSV = () => {
    toast.info('Generating registrations CSV export...');
    const headers = [
      'Ref Code',
      'Full Name',
      'Email',
      'College',
      'Participation',
      'Team Name',
      'Track',
      'Status',
      'Date',
    ];
    const rows = registrations.map((r) => [
      r.reference_code || '',
      r.applicant_name || r.profiles?.full_name || r.user_name || '',
      r.applicant_email || r.profiles?.email || r.user_email || '',
      r.applicant_college || r.profiles?.college || '',
      r.participation_type || '',
      r.teams?.team_name || '',
      r.theme || '',
      r.status || '',
      r.created_at || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `INNO_SPRINT_Registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-shell min-h-screen bg-[#070b14] text-white flex font-body selection:bg-cyan-500 selection:text-black">
      {/* Subtle Ambient Background Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/15 via-transparent to-transparent opacity-60" />

      {/* Futuristic Admin Sidebar */}
      <AdminSidebar
        activeTab={tab}
        setActiveTab={setTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        counts={{
          totalRegs,
          pendingRegs,
          totalTeams: teamCards.length,
          unresolvedMsgs,
          certsUploaded: certificatesUploadedCount,
          certsTotal: totalEligibleParticipants,
          proposalsCount,
          announcementsCount: announcements.length,
          adminsCount: authorizedAdminsList.length,
        }}
        user={user}
        role={role}
        handleLogout={handleLogout}
      />

      {/* Main Dynamic Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Futuristic Top Bar */}
        <AdminTopNav
          activeTab={tab}
          setMobileOpen={setMobileOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={fetchAdminData}
          loading={loading}
          pendingCount={pendingRegs}
          unresolvedMsgsCount={unresolvedMsgs}
          user={user}
          role={role}
          setActiveTab={setTab}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          handleLogout={handleLogout}
        />

        {/* Content Body with Fluid AnimatePresence Page Transitions */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              {...pageTransitionVariants}
              className="space-y-6"
            >
              {tab === 'overview' && (
                <OverviewTab
                  registrations={registrations}
                  contactMessages={contactMessages}
                  announcements={announcements}
                  certificatesMap={certificatesMap}
                  totalEligibleParticipants={totalEligibleParticipants}
                  certificatesUploadedCount={certificatesUploadedCount}
                  certificatesPendingCount={certificatesPendingCount}
                  exportCSV={exportCSV}
                  setActiveTab={setTab}
                  searchTerm={searchTerm}
                  user={user}
                  role={role}
                  onRefresh={fetchAdminData}
                  onSelectRegistration={(reg) => setSelectedRegistration(reg)}
                />
              )}

              {tab === 'registrations' && (
                <RegistrationsTab
                  registrations={registrations}
                  onSelectRegistration={(reg) => setSelectedRegistration(reg)}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteRegistration={handleDeleteRegistration}
                  exportCSV={exportCSV}
                />
              )}

              {tab === 'teams' && (
                <TeamsTab
                  teamCards={teamCards}
                  onSelectRegistration={(reg) => setSelectedRegistration(reg)}
                  onDeleteRegistration={handleDeleteRegistration}
                  onOpenCertificateModal={(member) => {
                    setTab('certificates');
                  }}
                  setActiveTab={setTab}
                />
              )}

              {tab === 'certificates' && (
                <CertificateManagementTab
                  registrations={registrations}
                  adminUser={user}
                  adminRole={role}
                  onRefreshRegistrations={fetchAdminData}
                />
              )}

              {tab === 'submissions' && (
                <SubmissionsTab
                  registrations={registrations}
                  onSelectRegistration={(reg) => setSelectedRegistration(reg)}
                />
              )}

              {tab === 'results' && (
                <ResultsTab
                  teamCards={teamCards}
                  setActiveTab={setTab}
                />
              )}

              {tab === 'cms' && (
                <AnnouncementsTab
                  announcements={announcements}
                  setAnnouncements={setAnnouncements}
                  adminUser={user}
                />
              )}

              {tab === 'messages' && (
                <MessagesTab
                  contactMessages={contactMessages}
                  setContactMessages={setContactMessages}
                  onRefreshMessages={fetchAdminData}
                  onDeleteMessage={handleDeleteMessage}
                  loading={loading}
                  adminUser={user}
                />
              )}

              {tab === 'roles' && (
                <RolesTab
                  authorizedAdminsList={authorizedAdminsList}
                  setAuthorizedAdminsList={setAuthorizedAdminsList}
                  userRolesList={userRolesList}
                  adminUser={user}
                />
              )}

              {tab === 'settings' && (
                <SettingsTab
                  onRefreshData={fetchAdminData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Pop-up Dossier Modal */}
      <RegistrationDetailsModal
        registration={selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteRegistration={handleDeleteRegistration}
      />

      {/* Global Spotlight Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        setActiveTab={setTab}
        onRefresh={fetchAdminData}
        exportCSV={exportCSV}
        registrations={registrations}
        onSelectRegistration={(reg) => setSelectedRegistration(reg)}
      />

      {/* Sleek Dark Theme Toaster */}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: '#0D1528',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 12px 35px rgba(0,0,0,0.65)',
          },
        }}
      />
    </div>
  );
}
