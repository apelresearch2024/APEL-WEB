import React, { useState, useEffect } from 'react';
import { LuAward, LuCalendar, LuLandmark } from 'react-icons/lu'; // Added LuLandmark
import { Trophy } from 'lucide-react';

const Achievements = () => {
  // MOVE STATE HOOKS TO THE TOP
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); 
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch(`${API_BASE}/achievements`);
        const result = await res.json();
        if (result.success) {
          setAchievements(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching achievements portfolio:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [API_BASE]);

  // NOW THIS WILL WORK
  const filteredAchievements = filter === 'All' 
    ? achievements 
    : achievements.filter(ach => ach.category === filter);
  
  const getIcon = (category) => {
    return category === 'Grant' ? <LuLandmark className="text-xl" /> : <LuAward className="text-xl" />;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        {/* Header and Filter Controls */}
        <div className="border-b border-slate-200 pb-6 mb-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Trophy size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#0b1b3d] tracking-tight">Achievements</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Honors, fellowships, and landmark awards.</p>
            </div>
          </div>

          <div className="flex gap-2">
            {['All', 'Award', 'Grant'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-colors ${
                  filter === cat 
                  ? 'bg-[#0b1b3d] text-white' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List Rendering */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-sm text-slate-400 font-medium">No records found for this category.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAchievements.map((ach) => (
              <div key={ach._id} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
                  {getIcon(ach.category)}
                </div>
                <div className="space-y-2 flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-[#0b1b3d] border border-slate-200 text-[9px] font-extrabold uppercase rounded">{ach.category}</span>
                    <div className="flex items-center text-slate-400 text-xs font-semibold gap-1">
                      <LuCalendar size={12} /> <span>{ach.year}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">{ach.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;