import React, { useState, useEffect } from 'react';

// API Base configured to point to your unified central engine prefix
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch(`${API_BASE}/publications`);
        const result = await response.json();

        if (result.success && result.data) {
          // Sort primarily by calendar year descending
          const sortedData = [...result.data].sort((a, b) => (b.year || 0) - (a.year || 0));
          setPublications(sortedData);
        }
      } catch (err) {
        console.error('Error fetching lab publications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  // Extract unique years using updated schema naming convention (.year)
  const uniqueYears = ['All', ...new Set(publications.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);

  // Filter logic: Handles text search variables and calendar year matches simultaneously
  const filteredPublications = publications.filter(pub => {
    const matchesSearch =
      (pub.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pub.authors || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pub.venue || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear = selectedYear === 'All' || String(pub.year) === String(selectedYear);

    return matchesSearch && matchesYear;
  });

  const categories = [
    {
      id: 'Journal',
      name: 'Journals',
      accent: 'border-l-red-500 bg-red-50/30 text-red-800',
      badge: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      id: 'Patent',
      name: 'Patents',
      accent: 'border-l-emerald-500 bg-emerald-50/30 text-emerald-800',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'Conference',
      name: 'Conferences',
      accent: 'border-l-blue-500 bg-blue-50/30 text-blue-800',
      badge: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'Letter',
      name: 'Letters',
      accent: 'border-l-amber-500 bg-amber-50/30 text-amber-800',
      badge: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-extrabold text-[#0b1b3d] tracking-tight sm:text-4xl">
            Research Publications
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-3xl">
            Our documented contributions to power electronics, wide bandgap semiconductor topologies, converters, and smart energy grid architectures.
          </p>
        </div>

        {/* Main Content Render */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0b1b3d] border-t-transparent mb-3"></div>
            <p className="text-sm font-semibold text-slate-500">Querying live repository records...</p>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed rounded-xl border-slate-200 p-8">
            <p className="text-sm text-slate-400 font-medium">No publications match your current search constraints.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => {
              // Match against mapped backend database property field (.type)
              const groupItems = filteredPublications.filter(p => (p.type || 'Journal') === category.id);
              if (groupItems.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  {/* Category Title Banner */}
                  <div className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border-l-4 shadow-sm flex items-center justify-between ${category.accent}`}>
                    <span>{category.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-white/80 rounded-full font-extrabold border shadow-sm">
                      {groupItems.length} Records
                    </span>
                  </div>

                  {/* Render list of papers in this specific category */}
                  <div className="bg-white border border-slate-200/60 rounded-xl divide-y divide-slate-100 shadow-sm overflow-hidden">
                    {groupItems.map((pub, idx) => (
                      <div key={pub._id || idx} className="p-5 sm:p-6 hover:bg-slate-50/40 transition-colors flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Title */}
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug tracking-tight">
                            "{pub.title}"
                          </h3>

                          {/* Authors */}
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {pub.authors}
                          </p>

                          {/* Metadata Row */}
                          <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 font-semibold">
                            <span className={`font-bold border px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${category.badge}`}>
                              {pub.venue}
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">Year: {pub.year}</span>

                            {pub.detail && (
                              <>
                                <span>•</span>
                                <span className="italic text-slate-500 font-normal">{pub.detail}</span>
                              </>
                            )}
                            {pub.number && (
                              <>
                                <span>•</span>
                                <span className="bg-slate-50 text-slate-600 border border-slate-200/80 px-1.5 py-0.2 rounded font-mono text-[11px] font-normal">
                                  {pub.number}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Direct Anchor Action Links */}
                        <div className="flex items-center gap-2 flex-shrink-0 pt-1 md:pt-0">
                          {pub.link && (
                            <a
                              href={pub.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              🔗 View Document
                            </a>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}