import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Zap, User, LogOut, LayoutDashboard, Shield, Award } from 'lucide-react';
import { useAuth } from '../lib/auth';

import { SpotlightNavbar } from './SpotlightNavbar';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, role, signOut, isOrganizerOrAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Themes', path: '/themes' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Rules', path: '/rules' },
    { name: 'Prizes', path: '/prizes' },
    { name: 'Check Status', path: '/status' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-950/90 backdrop-blur-md border-b border-cyan-500/20 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-black/80 via-gray-950/50 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-gray-950 rounded-[7px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-amber-400 font-['Orbitron']">
              INNOSPRINT
            </span>
            <span className="text-[10px] tracking-widest text-cyan-400 font-semibold uppercase -mt-1 font-['Chakra_Petch']">
              NATIONAL LEVEL HACKATHON
            </span>
          </div>
        </Link>

        {/* Desktop Spotlight Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-2 xl:mx-4">
          <SpotlightNavbar
            items={navLinks.map((link) => ({
              label: link.name,
              href: link.path,
            }))}
            activeHref={location.pathname}
            onItemClick={(item) => navigate(item.href)}
          />
        </div>

        {/* Desktop CTA / Auth buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link
            to="/status"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-600/90 via-red-600/90 to-amber-600/90 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-rose-950/40 hover:scale-105 transition-all font-['Orbitron'] flex items-center space-x-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
            <span>Registrations Closed</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              {isOrganizerOrAdmin ? (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase hover:bg-purple-900/50 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin CMS</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase hover:bg-cyan-900/50 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dashboard</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-full bg-gray-900 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-full bg-gray-900/80 hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-bold tracking-wider uppercase transition-colors font-['Orbitron']"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden space-x-3">
          <Link
            to="/status"
            className="px-3 py-1.5 rounded-full bg-rose-950/90 border border-rose-500/40 text-rose-200 text-[11px] font-bold uppercase tracking-wider font-['Orbitron'] flex items-center space-x-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Closed</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-900 border border-gray-700 text-cyan-400 hover:text-white transition-colors"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-gray-950/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl p-6 transition-all animate-fadeIn">
          <div className="flex flex-col space-y-4 font-['Rajdhani']">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-lg text-base uppercase font-bold tracking-wider transition-colors ${
                    isActive
                      ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300'
                      : 'text-gray-300 hover:bg-gray-900 hover:text-cyan-400'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="pt-4 border-t border-gray-800 flex flex-col space-y-3">
              {user ? (
                <>
                  <div className="px-4 py-2 text-xs text-gray-400 flex items-center justify-between">
                    <span>Logged in as: <strong className="text-cyan-300">{profile?.full_name || user.email}</strong></span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                      {role}
                    </span>
                  </div>

                  {isOrganizerOrAdmin ? (
                    <Link
                      to="/admin"
                      className="w-full text-center px-4 py-2.5 rounded-lg bg-purple-900/60 border border-purple-500/40 text-purple-200 font-bold uppercase text-sm"
                    >
                      Admin CMS Panel
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="w-full text-center px-4 py-2.5 rounded-lg bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 font-bold uppercase text-sm"
                    >
                      Participant Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-2 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 font-bold uppercase text-sm"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="w-1/2 text-center py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-bold uppercase text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/status"
                    className="w-1/2 text-center py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 text-white font-extrabold uppercase text-xs shadow-md flex items-center justify-center space-x-1"
                  >
                    <span>Check Status</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
