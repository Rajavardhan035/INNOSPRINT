import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth, checkIsAdminEmail } from '../lib/auth';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-body">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin mb-4" />
        <p className="text-cyan-300 text-sm font-mono tracking-wide">Verifying security credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = Boolean(checkIsAdminEmail(user.email));

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (isAdmin && (allowedRoles.includes('superadmin') || allowedRoles.includes('organizer'))) {
      return children;
    }
    return (
      <div className="min-h-[70vh] bg-gray-950 flex flex-col items-center justify-center p-6 text-center font-body">
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 mb-4 text-red-400 shadow-lg shadow-red-950/30">
          <ShieldAlert className="w-12 h-12 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white font-heading mb-2">Access Restricted</h2>
        <p className="text-gray-400 max-w-md mb-6 font-body text-sm leading-relaxed">
          Your current account (<span className="text-gray-200 font-mono text-xs">{user.email}</span>) with role (<strong className="text-amber-400 font-mono text-xs">{role || 'unassigned'}</strong>) does not have authorization to view this administrative control center.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Link>
          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  return children;
}
