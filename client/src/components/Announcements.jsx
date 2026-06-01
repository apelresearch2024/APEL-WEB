import React, { useState, useEffect } from 'react';
import { LuArrowLeft, LuCalendarDays, LuMegaphone, LuInfo } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${API_BASE}/announcements`);
        const result = await res.json();
        if (result.success) setAnnouncements(result.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [API_BASE]);

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10 px-4 md:px-6">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-slate-400 hover:text-[#0b1b3d] text-xs font-semibold uppercase tracking-widest transition-all mb-8"
        >
          <LuArrowLeft className="mr-2" /> Back to Home
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
          <div className="p-2 bg-[#0b1b3d] text-white rounded">
            <LuMegaphone size={20} />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#0b1b3d]">
            Announcements & News
          </h1>
        </div>

        {/* List */}
        <div className="space-y-2"> {/* Reduced spacing between items for a tighter look */}
          {loading ? (
            <div className="flex items-center text-slate-500 text-sm italic">
               <LuInfo className="mr-2" /> Loading latest updates...
            </div>
          ) : announcements.length > 0 ? (
            announcements.map((item) => (
              <div 
                key={item._id} 
                className="group relative p-4 -ml-4 rounded-md transition-all duration-300 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
              >
                <div className="flex items-center text-[#bfa15f] text-[11px] font-bold uppercase tracking-wider mb-2 gap-1.5">
                  <LuCalendarDays size={12} />
                  {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                
                <h3 className="text-base font-bold text-slate-800 leading-snug mb-1.5 group-hover:text-[#15428a] transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm">No new announcements.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;