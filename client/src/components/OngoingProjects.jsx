import React, { useState, useEffect } from 'react';
import { LuFileText, LuCheck } from 'react-icons/lu';
import { Activity } from 'lucide-react';
import { RowSkeleton } from '../components/Skeletons';

const OngoingProjects = () => {
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchOngoing = async () => {
      try {
        const res = await fetch(`${API_BASE}/projects`);
        const result = await res.json();
        if (result.success) {
          const activePool = (result.data || []).filter(p => p.status === 'Ongoing');
          setOngoingProjects(activePool);
        }
      } catch (err) {
        console.error('Error fetching ongoing project cluster:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOngoing();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#0b1b3d]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div>
          {/* Header Section */}
          <div className="mb-8 flex items-center gap-4">
            {/* Icon Container */}
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Activity size={24} strokeWidth={2.5} />
            </div>

            {/* Text Content */}
            <div>
              <h1 className="text-3xl font-extrabold text-[#0b1b3d] tracking-tight mb-0.5">Ongoing Research Projects</h1>
              <p className="text-sm text-slate-500">Externally funded projects currently active at APEL</p>
            </div>
          </div>

          {/* Horizontal Rule moved outside to span the full width */}
          <div className="h-px bg-slate-200 w-full mb-10" />
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {ongoingProjects.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 text-center rounded-sm h-40 flex items-center justify-center">
              <p className="text-slate-400 text-sm">No ongoing projects currently registered.</p>
            </div>
          ) : (
            ongoingProjects.map((p) => {
              // 🔥 FIX: Extract link string cleanly whether MongoDB returned Option A (string) or Option B (object)
              const actualPdfLink = p.pdfUrl && typeof p.pdfUrl === 'object' ? p.pdfUrl.webViewLink : p.pdfUrl;

              return (
                <div key={p._id} className="bg-white border-l-4 border-l-[#0b1b3d] border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-sm hover:shadow-md transition-shadow">

                  {/* Project Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{p.title}</h3>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                      <span><strong className="text-slate-700">PI:</strong> {p.pi}</span>
                      {p.duration && <span><strong className="text-slate-700">Started:</strong>{p.duration}</span>}
                      <span><strong className="text-slate-700">Grant:</strong> {p.grantValue}</span>
                      <span><strong className="text-slate-700">Funding Agencies:</strong> {p.fundingAgency}</span>
                    </div>
                  </div>

                  {/* Status and PDF Link */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-start flex-shrink-0">
                    <div className="bg-green-50 text-green-700 text-[10px] uppercase font-bold px-2 py-1 border border-green-200 flex items-center gap-1 rounded-sm">
                      <LuCheck className="text-[10px] font-extrabold" />
                      Ongoing
                    </div>

                    {/* 🔥 FIX: Check and pass the actual evaluated string URL */}
                    {actualPdfLink && (
                      <a
                        href={actualPdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline transition-all"
                      >
                        <LuFileText /> View Details
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OngoingProjects;