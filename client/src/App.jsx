// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Scholars from './components/Scholars';
import OngoingProjects from './components/OngoingProjects';
import CompletedProjects from './components/CompletedProjects';
import Publications from './components/Publications';
import Achievements from './components/Achievements';
import HiringPortal from './components/HiringPortal';
import Hero from './components/Hero';
import HomeContent from './components/HomeContent';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AnnouncementsPage from './components/Announcements';
import { Toaster } from 'react-hot-toast';
import ResetPassword from './components/ResetPassword';
// 1. FIXED: Imported component with PascalCase convention
import ApplicationsDashboard from './components/ApplicationDashboard';

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
      {/* Global Navigation Header - Stays visible on all routes */}
      <Navbar />

      {/* Dynamic Route Switcher */}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <HomeContent />
            </>
          }
        />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/scholars" element={<Scholars />} />
        <Route path="/ongoing-projects" element={<OngoingProjects />} />
        <Route path="/completed-projects" element={<CompletedProjects />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/hiring" element={<HiringPortal />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/applicationsDashboard" element={<ApplicationsDashboard />} />
        <Route path="/admin/" element={<ApplicationsDashboard />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Optional fallback route for handling missing pages */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen text-slate-500 font-sans">
            Page Not Found
          </div>
        } />

      </Routes>
      <Footer />
    </Router>
  );
}