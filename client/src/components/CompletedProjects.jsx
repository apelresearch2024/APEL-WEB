import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { TableSkeletonRow } from '../components/Skeletons';
import toast from 'react-hot-toast';

const CompletedProjects = () => {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const res = await fetch(`${API_BASE}/projects`);
        const result = await res.json();
        if (result.success) {
          // Isolate project entities marked implicitly as completed archive listings
          const archivalPool = (result.data || []).filter(p => p.status === 'Completed');
          setCompletedProjects(archivalPool);
        }
      } catch (err) {
        toast.error('Error fetching archives:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompleted();
  }, [API_BASE]);

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* --- HEADER SECTION --- */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1b3d] tracking-tight">Completed Projects</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Successfully concluded sponsored research projects
            </p>
          </div>
        </div>
        <div className="h-px bg-slate-200 mt-6" />
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="w-full overflow-x-auto shadow-sm border border-slate-200 rounded-xl bg-white">
        <table className="min-w-full bg-white divide-y divide-slate-200">
          <thead className="bg-[#0b1b3d] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Project Title</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Details</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Principal Investigator</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Period</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <>
                <TableSkeletonRow />
                <TableSkeletonRow />
                <TableSkeletonRow />
              </>
            ) : completedProjects.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-wide bg-slate-50/50">
                  No archived projects found in the repository.
                </td>
              </tr>
            ) : (
              completedProjects.map((proj) => {
                // 🔥 FIX: Clean out structural metadata payload mapping issues safely
                const actualPdfLink = proj.pdfUrl && typeof proj.pdfUrl === 'object' ? proj.pdfUrl.webViewLink : proj.pdfUrl;

                return (
                  <tr key={proj._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-800 font-semibold max-w-[300px]">
                      {proj.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {actualPdfLink ? (
                        <a
                          href={actualPdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-blue-200 text-[10px] font-bold text-blue-700 bg-blue-50/40 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                        >
                          View Details
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {proj.pi || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {proj.duration || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-200">
                        Completed
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompletedProjects;