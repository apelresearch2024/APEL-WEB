import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LuLogIn, LuMenu, LuX, LuLogOut } from 'react-icons/lu'; 
import apelLogo from '../assets/APEL_Logo.jpeg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check login state every time the user shifts routes
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setIsOpen(false);
    navigate('/admin-login');
  };

  const getLinkClass = ({ isActive }) =>
    isActive
      ? "text-amber-400 border-b-2 border-amber-400 pb-0.5 transition-all font-semibold"
      : "hover:text-amber-400 text-slate-300 transition-colors pb-0.5";

  return (
    <div className="w-full sticky top-0 z-50 bg-[#0b1b3d] text-white font-sans antialiased shadow-md">

      {/* 1. TOP UTILITY STRIP */}
      <div className="hidden lg:flex w-full bg-[#081530] text-[11px] px-8 py-1.5 justify-between items-center border-b border-slate-800/60 text-slate-400 font-normal tracking-wide">
        <div>Indian Institute of Technology Roorkee — Department of Electrical Engineering</div>
        <div className="tracking-wider">estd. 2014 • Roorkee, Uttarakhand</div>
      </div>

      {/* 2. MAIN NAVIGATION CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">

        {/* Left Side: Brand Logo */}
        <div className="flex items-center space-x-3.5">
          <img
            src={apelLogo}
            alt="APEL logo"
            className="h-9 w-auto object-contain"
          />
          <div className="border-l border-slate-700 pl-3.5">
            <div className="text-base font-bold tracking-wide leading-tight">IIT Roorkee | APEL Lab</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mt-0.5">
              Applied Power Electronics Laboratory
            </div>
          </div>
        </div>

        {/* Center: Dynamic Navigation Tabs */}
        <nav className="hidden lg:flex">
          <ul className="flex items-center space-x-4 xl:space-x-6 text-[12px] font-medium tracking-wide">
            <li><NavLink to="/" end className={getLinkClass}>Home</NavLink></li>
            <li><NavLink to="/scholars" className={getLinkClass}>Scholars</NavLink></li>
            <li><NavLink to="/ongoing-projects" className={getLinkClass}>Ongoing Projects</NavLink></li>
            <li><NavLink to="/completed-projects" className={getLinkClass}>Completed Projects</NavLink></li>
            <li><NavLink to="/publications" className={getLinkClass}>Publications</NavLink></li>
            <li><NavLink to="/achievements" className={getLinkClass}>Achievements</NavLink></li>
            <li><NavLink to="/hiring" className={getLinkClass}>Hiring Portal</NavLink></li>
            
            {/* Desktop Admin View Gates */}
            {isLoggedIn && (
              <li><NavLink to="/admin/dashboard" className={getLinkClass}>Dashboard</NavLink></li>
            )}
            {isLoggedIn && (
              <li><NavLink to="/admin/applicationsDashboard" className={getLinkClass}>Applications <span className='mr-2'></span></NavLink></li>
            )}
          </ul>
        </nav>

        {/* Right Side Action Button (Dynamic Auth State) + Mobile Trigger Button */}
        <div className="flex items-center space-x-4">

          {/* Desktop Auth Actions */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hidden sm:flex border border-red-500/40 hover:border-red-500 text-[11px] font-medium tracking-wide px-3.5 py-1.5 rounded-sm items-center space-x-2 transition-all bg-red-950/20 text-red-400"
            >
              <LuLogOut className="text-xs" />
              <span>Logout</span>
            </button>
          ) : (
            <NavLink
              to="/admin-login"
              className={({ isActive }) =>
                `hidden sm:flex border text-[11px] font-medium tracking-wide px-3.5 py-1.5 rounded-sm items-center space-x-2 transition-all ${isActive
                  ? "border-amber-400 bg-amber-500/10 text-amber-400 shadow-md"
                  : "border-slate-600 hover:border-slate-300 text-slate-300 bg-[#0d1f44]/40"
                }`
              }
            >
              <LuLogIn className="text-xs" />
              <span>Admin Login</span>
            </NavLink>
          )}

          {/* Mobile Hamburger Control Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden block text-slate-200 hover:text-white transition-colors focus:outline-none p-1"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <LuX className="text-2xl" /> : <LuMenu className="text-2xl" />}
          </button>

        </div>
      </div>

      {/* 3. DYNAMIC MOBILE MENU DROPDOWN OVERLAY */}
      {isOpen && (
        <div className="lg:hidden w-full bg-[#081530] border-t border-slate-800/80 px-6 py-4 shadow-inner">
          <ul className="flex flex-col space-y-4 text-[13px] font-medium text-slate-300">
            <li onClick={() => setIsOpen(false)}><NavLink to="/" end className={getLinkClass}>Home</NavLink></li>
            <li onClick={() => setIsOpen(false)}><NavLink to="/scholars" className={getLinkClass}>Scholars</NavLink></li>
            <li onClick={() => setIsOpen(false)}><NavLink to="/ongoing-projects" className={getLinkClass}>Ongoing Projects</NavLink></li>
            <li onClick={() => setIsOpen(false)}><NavLink to="/completed-projects" className={getLinkClass}>Completed Projects</NavLink></li>
            <li onClick={() => setIsOpen(false)}><NavLink to="/publications" className={getLinkClass}>Publications</NavLink></li>
            <li onClick={() => setIsOpen(false)}><NavLink to="/achievements" className={getLinkClass}>Achievements</NavLink></li>
            <li onClick={() => setIsOpen(false)}><NavLink to="/hiring" className={getLinkClass}>Hiring Portal</NavLink></li>

            {isLoggedIn ? (
              <>
                <li onClick={() => setIsOpen(false)}><NavLink to="/admin/dashboard" className={getLinkClass}>Dashboard</NavLink></li>
                <li onClick={() => setIsOpen(false)}><NavLink to="/admin/applicationsDashboard" className={getLinkClass}>Applications</NavLink></li>
                <li className="border-t border-slate-800/60 pt-2">
                  <button onClick={handleLogout} className="text-red-400 font-semibold flex items-center space-x-2 w-full text-left py-1">
                    <LuLogOut className="text-sm" /> <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <li onClick={() => setIsOpen(false)} className="border-t border-slate-800/60 pt-2">
                <NavLink to="/admin-login" className="text-amber-400 font-semibold flex items-center space-x-2 py-1">
                  <LuLogIn className="text-sm" /> <span>Admin Login Area</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;