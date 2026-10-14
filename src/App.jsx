import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ThemesPage from './pages/ThemesPage';
import SchedulePage from './pages/SchedulePage';
import RulesPage from './pages/RulesPage';
import PrizesPage from './pages/PrizesPage';
import RegisterPage from './pages/RegisterPage';
import RegisterStatusPage from './pages/RegisterStatusPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import ParticipantDashboard from './pages/ParticipantDashboard';
import AdminDashboard from './pages/AdminDashboard';

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Global Header Navigation for public pages */}
      {!isAdminRoute && <Navbar />}

      {/* Main Application Body */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/prizes" element={<PrizesPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/status" element={<RegisterStatusPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Participant Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ParticipantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Command Center Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'superadmin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Unified Footer for public pages */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}
