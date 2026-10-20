import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Shield,
  Key,
  UserCheck,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { saveCloudAuthorizedAdmin, removeCloudAuthorizedAdmin } from '../../lib/adminList';
import CountUp from './shared/CountUp';
import { springUI } from '../../styles/motionConfig';

export default function RolesTab({
  authorizedAdminsList = [],
  setAuthorizedAdminsList,
  userRolesList = [],
  adminUser
}) {
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('organizer');
  const [loading, setLoading] = useState(false);

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    const cleanEmail = newAdminEmail.trim().toLowerCase();
    const cleanName = newAdminName.trim();

    if (!cleanEmail || !cleanName) {
      toast.error('Please specify both full name and a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const updated = await saveCloudAuthorizedAdmin({
        email: cleanEmail,
        full_name: cleanName,
        role: newAdminRole,
        added_by: adminUser?.email || 'rajavardhan445@gmail.com',
      });

      setAuthorizedAdminsList(updated);

      toast.success(
        `Granted ${newAdminRole.toUpperCase()} access to ${cleanName} (${cleanEmail}). They can now sign in on any device!`
      );
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminRole('organizer');
    } catch (err) {
      console.error('[Add Admin Error]', err);
      toast.error('Failed to authorize admin: ' + (err.message || 'Operation failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAdmin = async (adminId, adminEmail) => {
    if (adminEmail?.toLowerCase() === 'rajavardhan445@gmail.com') {
      toast.error('Main Admin (rajavardhan445@gmail.com) cannot be revoked.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke administrative permissions for ${adminEmail}?`))
      return;

    try {
      const updated = await removeCloudAuthorizedAdmin(adminEmail);
      setAuthorizedAdminsList(updated);
      toast.success(`Revoked administrative access for ${adminEmail}`);
    } catch (err) {
      console.error('[Revoke Admin Error]', err);
      toast.error('Failed to revoke access: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Authorize New Admin Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0e1629]/95 to-[#070b14]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading tracking-wide">
              Authorize Faculty Coordinator or Judge
            </h3>
            <p className="text-xs text-slate-400">
              Grant elevated privileges to university mentors, judges, and organizing committee staff.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end pt-2">
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              OFFICIAL FULL NAME *
            </label>
            <input
              type="text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              placeholder="e.g., Dr. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white focus:border-cyan-400/60 focus:outline-none font-mono transition-all"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              EMAIL ADDRESS *
            </label>
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="e.g., coordinator@vvitu.ac.in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-white focus:border-cyan-400/60 focus:outline-none font-mono transition-all"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              ROLE PRIVILEGES
            </label>
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#060912]/80 border border-white/10 text-xs text-slate-300 focus:border-cyan-400/60 focus:outline-none transition-all cursor-pointer"
            >
              <option value="organizer">Organizer (Co-Admin)</option>
              <option value="superadmin">Superadmin</option>
              <option value="judge">Judge (Evaluator)</option>
            </select>
          </div>

          <div className="sm:col-span-12 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#040711] font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Authorizing Access...' : 'Grant Privileges'}</span>
            </motion.button>
          </div>
        </form>
      </div>

      {/* Authorized Admins Roster */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0e1629]/90 to-[#070b14]/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden space-y-0">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-heading">
              Active Authorized Administrators (<CountUp value={authorizedAdminsList.length} />)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Secured via Supabase RLS</span>
        </div>

        <div className="divide-y divide-white/5">
          {authorizedAdminsList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs font-medium">
              No additional administrators listed.
            </div>
          ) : (
            authorizedAdminsList.map((adm, idx) => {
              const isSuper = adm.role === 'superadmin' || adm.email === 'rajavardhan445@gmail.com';

              return (
                <motion.div
                  key={adm.id || adm.email}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold font-mono text-xs">
                      {adm.full_name?.charAt(0) || 'A'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-semibold text-white">
                          {adm.full_name || 'Administrator'}
                        </strong>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isSuper
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {adm.role || 'Organizer'}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 block mt-0.5">
                        {adm.email}
                      </span>
                    </div>
                  </div>

                  {adm.email?.toLowerCase() !== 'rajavardhan445@gmail.com' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRevokeAdmin(adm.id, adm.email)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Revoke Administrator Privileges"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
