import React, { useState, useEffect, useMemo } from 'react';
import { LuLinkedin, LuMail, LuGraduationCap } from 'react-icons/lu';
import { Users } from 'lucide-react';

const Scholars = () => {
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        const res = await fetch(`${API_BASE}/scholars`);
        const result = await res.json();
        if (result.success) {
          const activeRoster = (result.data || []).filter(s => s.status !== 'Alumni');
          setScholars(activeRoster);
        }
      } catch (err) {
        console.error('Error fetching scholars pool:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScholars();
  }, [API_BASE]);

  const getDirectDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  if (url.includes('googleusercontent.com')) return url;

  const match = url.match(/\/d\/([^/]+)/);
  const fileId = match ? match[1] : null;

  if (fileId) {

    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url; // Fallback to original
};

  // Group scholars into descriptive visual categories
  const groupedScholars = useMemo(() => {
    if (!scholars.length) return [];

    const categories = [
      { id: 'phd', label: 'Ph.D. Research Scholars', matches: ['phd', 'ph.d'] },
      { id: 'mtech', label: 'M.Tech. Postgraduates', matches: ['mtech', 'm.tech'] },
      { id: 'btech', label: 'B.Tech. Undergraduates', matches: ['btech', 'b.tech'] },
      { id: 'anrf/jrf', label: 'ANRF/JRF Research Fellows', matches: ['anrf', 'anrf-jrf', 'jrf', 'jrf.'] },
      { id: 'project-associate', label: 'Project Associates', matches: ['project-associate', 'project associate'] },
      { id: 'btp_iop', label: 'BTP / IOP Projects', matches: ['btp', 'btp.', 'iop', 'iop.'] },
      { id: 'interns', label: 'Research Interns', matches: ['intern', 'intern.'] },
      { id: 'others', label: 'Other Project Staff', matches: [] }
    ];

    const groups = categories.map(cat => ({ ...cat, list: [] }));

    scholars.forEach(scholar => {
      const roleLower = scholar.role?.toLowerCase() || '';
      const targetGroup = groups.find(group =>
        group.matches.some(keyword => roleLower.includes(keyword))
      );

      if (targetGroup) {
        targetGroup.list.push(scholar);
      } else {
        groups[groups.length - 1].list.push(scholar);
      }
    });

    return groups.filter(g => g.list.length > 0);
  }, [scholars]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#0b1b3d]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl border border-slate-200 flex-shrink-0">
              <Users size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#0b1b3d] tracking-tight">Our Team</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Meet the minds pushing the boundaries of power electronics engineering at APEL Lab.
              </p>
            </div>
          </div>

          <a
            href={`${API_BASE}/scholars/alumni/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center self-start sm:self-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-bold shadow-sm transition-all whitespace-nowrap"
          >
            <span>Alumni (PDF)</span>
          </a>
        </div>

        {/* Conditional Structural Check */}
        {groupedScholars.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-sm text-slate-400 font-medium">No scholar profiles are currently registered on the roster.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedScholars.map((group) => (
              <div key={group.id} className="space-y-6">

                <div className="flex items-center gap-3 border-b border-slate-200/60 pb-2">
                  <h2 className="text-lg font-bold text-[#0b1b3d] tracking-tight">{group.label}</h2>
                  <span className="px-2 py-0.5 bg-slate-200/60 text-slate-700 rounded-full text-xs font-bold">
                    {group.list.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {group.list.map((scholar) => {
                    const targetImageSrc = scholar.imageUrl && typeof scholar.imageUrl === 'object'
                      ? scholar.imageUrl.webViewLink
                      : scholar.imageUrl;

                    return (
                      <div key={scholar._id} className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-2 bg-[#0b1b3d]" />

                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-start gap-4 mb-4">
                            
                            {/* Render extracted asset link safely */}
                            {targetImageSrc ? (
                              <img
                                src={getDirectDriveUrl(targetImageSrc)}
                                alt={scholar.name}
                                className="w-20 h-20 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <LuGraduationCap className="text-2xl" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-slate-800 truncate">{scholar.name}</h3>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-[#0b1b3d] text-[10px] font-bold uppercase rounded tracking-wide">
                                {scholar.role}
                              </span>
                              <p className="text-xs text-slate-400 font-medium mt-1">Joined Year: {scholar.joinedYear}</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-lg flex-grow mb-5 border border-slate-100">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Research Domain</span>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed italic line-clamp-3">
                              "{scholar.researchTopic || 'Topic exploration in power systems engineering active'}"
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 mt-auto w-full">
                            <a
                              href={`mailto:${scholar.email}`}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors min-w-0"
                              title={scholar.email}
                            >
                              <LuMail className="text-sm flex-shrink-0" />
                              <span className="truncate">{scholar.email}</span>
                            </a>

                            {scholar.linkedinUrl ? (
                              <a
                                href={scholar.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-50 text-sky-600 border border-sky-100 rounded-lg text-xs font-bold hover:bg-sky-100 transition-all min-w-0"
                              >
                                <LuLinkedin className="text-sm flex-shrink-0" />
                                <span>Connect</span>
                              </a>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100/50 text-slate-400 border border-slate-100 rounded-lg text-xs font-medium select-none cursor-not-allowed">
                                <LuLinkedin className="text-sm opacity-50" />
                                <span>N/A</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Scholars;