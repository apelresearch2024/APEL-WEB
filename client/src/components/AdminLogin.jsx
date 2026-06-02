// src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LuLock, LuUser, LuMail } from 'react-icons/lu';

const AdminLogin = () => {
  // Navigation & Base Configuration URLs
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Component Operation State Machines
  const [view, setView] = useState('login'); // Supports either 'login' or 'forgot' state views
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. POST Execution: Trigger regular MongoDB verification
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.apiKey);
        toast.success('Authentication verified. Welcome back!');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.message || 'Invalid administrative credentials.');
      }
    } catch (err) {
      toast.error('Connection failed. Verify backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // 2. POST Execution: Request safe SMTP recovery instruction mail links
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Recovery email transmitted successfully!');
        setView('login'); // Automatically bounce back to entry screen upon success
      } else {
        toast.error(data.message || 'Failed to dispatch password recovery link.');
      }
    } catch (err) {
      toast.error('Network failure connecting to authentication cluster services.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto w-full sm:max-w-md">
        
        {/* Secure Form Wrapper Card */}
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/60 rounded-xl sm:px-10">
          
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-[#0b1b3d] tracking-wide">
              APEL Lab Admin Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide uppercase">
              {view === 'login' ? 'Authorized Gateway Access Only' : 'Account Recovery Station'}
            </p>
          </div>

          {view === 'login' ? (
            /* --- RENDER SECTION: LOGIN INTERFACE PANEL --- */
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LuUser className="text-sm" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  {/* Toggle button to change internal panel state views smoothly */}
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LuLock className="text-sm" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-[#0b1b3d] hover:bg-[#112754] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b1b3d] disabled:opacity-50 transition-all cursor-pointer tracking-wide"
                >
                  {loading ? 'Verifying Credentials...' : 'Login to Dashboard'}
                </button>
              </div>
            </form>
          ) : (
            /* --- RENDER SECTION: FORGOT PASSWORD RECOVERY PANEL --- */
            <form className="space-y-5" onSubmit={handleForgotPassword}>
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 border border-slate-100 rounded-lg">
                Enter your administrative email account. If verified, our recovery dispatcher will transmit a secure, one-time link valid for 15 minutes to modify your password.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Registered Admin Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LuMail className="text-sm" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all cursor-pointer tracking-wide"
                >
                  {loading ? 'Transmitting link...' : 'Send Recovery Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider py-1 cursor-pointer block"
                >
                  Return to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;