import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Shield,
  Key,
  UserCheck
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function RolesTab({
  authorizedAdminsList = [],
  setAuthorizedAdminsList,
  userRolesList = [],
  adminUser
}) {
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('organizer');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');
  const [adminErrorMsg, setAdminErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminSuccessMsg('');
    setAdminErrorMsg('');

    const cleanEmail = newAdminEmail.trim().toLowerCase();
    const cleanName = newAdminName.trim();

    if (!cleanEmail || !cleanName) {
      setAdminErrorMsg('Please specify both full name and a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('authorized_admins').upsert(
          {
            email: cleanEmail,
            full_name: cleanName,
            role: newAdminRole,
            added_by: adminUser?.email || 'rajavardhan445@gmail.com',
          },
          { onConflict: 'email' }
        );

        if (error) {
          console.warn('Supabase add admin notice:', error.message);
        }
      }

      const newAdminItem = {
        id: 'adm_' + Date.now(),
        email: cleanEmail,
        full_name: cleanName,
        role: newAdminRole,
        added_by: adminUser?.email || 'rajavardhan445@gmail.com',
        created_at: new Date().toISOString(),
      };

      const updated = [
        newAdminItem,
        ...authorizedAdminsList.filter((a) => a.email.toLowerCase() !== cleanEmail),
      ];
      setAuthorizedAdminsList(updated);
      localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(updated));

      setAdminSuccessMsg(
        `Granted ${newAdminRole.toUpperCase()} access to ${cleanName} (${cleanEmail}). They can now log in at /login.`
      );
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminRole('organizer');
      setTimeout(() => setAdminSuccessMsg(''), 5000);
    } catch (err) {
      console.error('[Add Admin Error]', err);
      setAdminErrorMsg('Failed to authorize admin: ' + (err.message || 'Operation failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAdmin = async (adminId, adminEmail) => {
    if (adminEmail?.toLowerCase() === 'rajavardhan445@gmail.com') {
      alert('Main Admin (rajavardhan445@gmail.com) cannot be revoked.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke administrative permissions for ${adminEmail}?`))
      return;

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('authorized_admins')
          .delete()
          .ilike('email', adminEmail);
      } catch (e) {
        console.warn('Revoke admin notice:', e);
      }
    }

    const updated = authorizedAdminsList.filter(
      (a) => a.email.toLowerCase() !== adminEmail.toLowerCase()
    );
    setAuthorizedAdminsList(updated);
    localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 animate-fadeIn font-body">
      {/* Authorize New Admin Form */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0D1424] border border-[#1D2A40] space-y-4 font-body">
        <div className="flex items-center gap-2 border-b border-[#1D2A40] pb-3">
          <UserPlus className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-heading tracking-wide">
            Authorize New Organizer, Faculty or Judge
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-normal">
          Add university faculty coordinators, evaluation judges, or student leads by email. Once authorized, they can log in via <strong className="text-cyan-400 font-mono">/login</strong> to review registrations and manage operations.
        </p>

        {adminSuccessMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{adminSuccessMsg}</span>
          </div>
        )}

        {adminErrorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{adminErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Admin / Organizer Name *
            </label>
            <input
              type="text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              placeholder="e.g., Dr. Ramesh Kumar"
              className="w-full px-3.5 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="e.g., coordinator@vvitu.ac.in"
              className="w-full px-3.5 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Role Privileges
            </label>
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#070b14] border border-[#1D2A40] text-xs text-slate-300 focus:border-cyan-400 focus:outline-none transition-colors"
            >
              <option value="organizer">Organizer (Co-Admin)</option>
              <option value="superadmin">Superadmin</option>
              <option value="judge">Judge (Evaluator)</option>
            </select>
          </div>

          <div className="sm:col-span-12 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Authorizing...' : 'Grant Admin Privileges'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Authorized Admins List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2 tracking-wide">
            <Users className="w-4 h-4 text-violet-400" />
            <span>Authorized Event Administrators & Faculty ({authorizedAdminsList.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Synced with Supabase
          </span>
        </div>

        <div className="rounded-xl bg-[#0D1424] border border-[#1D2A40] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#111B2D] text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-[#1D2A40]">
                <tr>
                  <th className="py-3 px-4">Admin Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role Privileges</th>
                  <th className="py-3 px-4">Authorized By</th>
                  <th className="py-3 px-4 text-center">Revoke Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2A40]">
                {authorizedAdminsList.map((adm) => {
                  const isMainAdmin = adm.email.toLowerCase() === 'rajavardhan445@gmail.com';

                  return (
                    <tr key={adm.id || adm.email} className="hover:bg-[#111B2D]/50 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-white block font-medium text-xs">
                          {adm.full_name || 'Admin'}
                        </strong>
                      </td>

                      <td className="py-3 px-4 font-mono text-cyan-400 text-xs">
                        {adm.email}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono uppercase tracking-wide ${
                            adm.role === 'superadmin'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : adm.role === 'judge'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-[#111B2D] text-slate-300 border border-[#1D2A40]'
                          }`}
                        >
                          {adm.role || 'organizer'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {adm.added_by || 'Main Admin'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isMainAdmin ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold font-mono uppercase">
                            Primary Owner
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRevokeAdmin(adm.id, adm.email)}
                            className="px-2 py-1 rounded-md bg-[#111B2D] hover:bg-rose-950/60 border border-[#1D2A40] hover:border-rose-500/40 text-rose-300 font-medium text-xs flex items-center gap-1 mx-auto transition-colors"
                            title="Revoke admin access"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Database User Roles Table */}
      <div className="space-y-3 pt-3 border-t border-[#1D2A40]">
        <h3 className="text-xs font-semibold text-slate-400">
          Registered Database Accounts in user_roles ({userRolesList.length})
        </h3>

        <div className="rounded-xl bg-[#0D1424] border border-[#1D2A40] overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111B2D] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#1D2A40]">
              <tr>
                <th className="py-2.5 px-3">User ID</th>
                <th className="py-2.5 px-3">Name / Email</th>
                <th className="py-2.5 px-3">Database Role</th>
                <th className="py-2.5 px-3">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2A40]">
              {userRolesList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-center text-slate-500 font-mono text-xs">
                    No records found in user_roles table.
                  </td>
                </tr>
              ) : (
                userRolesList.map((ur) => (
                  <tr key={ur.id} className="hover:bg-[#111B2D]/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] truncate max-w-[120px]">{ur.user_id}</td>
                    <td className="py-2.5 px-3 text-white font-medium text-xs">
                      {ur.profiles?.full_name || ur.profiles?.email || 'Registered User'}
                    </td>
                    <td className="py-2.5 px-3 uppercase font-semibold text-violet-400 font-mono text-[10px]">{ur.role}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {ur.created_at ? new Date(ur.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
