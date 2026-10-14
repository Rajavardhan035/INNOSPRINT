import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import {
  groupRegistrationsIntoTeamCertificateCards,
  fetchAllCertificatesMap,
} from '../lib/certificates';

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

  useEffect(() => {
    localStorage.setItem('inno_sprint_admin_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

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
    {
      id: 'adm_ujwal',
      email: '24bq5a6135@vvit.net',
      full_name: 'Ujwal',
      role: 'organizer',
      added_by: 'rajavardhan445@gmail.com',
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

        setRegistrations(regData);

        // Fetch certificate manifest map
        try {
          const certMap = await fetchAllCertificatesMap(regData);
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

        setContactMessages(resolvedMsgs);

        // 3. User Roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('*, profiles(full_name, email)');
        setUserRolesList(rolesData || []);

        // 4. Authorized Admins
        try {
          const { data: authAdminData } = await supabase
            .from('authorized_admins')
            .select('*')
            .order('created_at', { ascending: false });

          const localAdmins = JSON.parse(
            localStorage.getItem('inno_sprint_authorized_admins') || '[]'
          );
          const fetchedOrLocal =
            authAdminData && authAdminData.length > 0 ? authAdminData : localAdmins;

          const merged = [...DEFAULT_ADMINS];
          fetchedOrLocal.forEach((item) => {
            if (
              item?.email &&
              !merged.some((m) => m.email.toLowerCase() === item.email.toLowerCase())
            ) {
              merged.push(item);
            }
          });

          setAuthorizedAdminsList(merged);
          localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(merged));
        } catch (authErr) {
          console.warn('[Admin authorized_admins notice]', authErr);
          const localAdmins = JSON.parse(
            localStorage.getItem('inno_sprint_authorized_admins') || '[]'
          );
          const merged = [...DEFAULT_ADMINS];
          localAdmins.forEach((item) => {
            if (
              item?.email &&
              !merged.some((m) => m.email.toLowerCase() === item.email.toLowerCase())
            ) {
              merged.push(item);
            }
          });
          setAuthorizedAdminsList(merged);
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
      setContactMessages(localMsgs);
      const localAdmins = JSON.parse(
        localStorage.getItem('inno_sprint_authorized_admins') || '[]'
      );
      const merged = [...DEFAULT_ADMINS];
      localAdmins.forEach((item) => {
        if (
          item?.email &&
          !merged.some((m) => m.email.toLowerCase() === item.email.toLowerCase())
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
    }
  };

  // Export registrations CSV
  const exportCSV = () => {
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
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
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
              exportCSV={exportCSV}
            />
          )}

          {tab === 'teams' && (
            <TeamsTab
              teamCards={teamCards}
              onSelectRegistration={(reg) => setSelectedRegistration(reg)}
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
        </main>
      </div>

      {/* Pop-up Dossier Modal */}
      <RegistrationDetailsModal
        registration={selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
