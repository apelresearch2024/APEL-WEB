import { ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { LuLinkedin, LuMail, LuGraduationCap } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration parameter: point this to your specific base environment URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const navigate=useNavigate();
  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/scholars/alumni`);
        const result = await response.json();
        console.log(result.data);
        if (response.ok && result.success) {
          setAlumni(result.data);
        } else {
          throw new Error(result.message || 'Failed to retrieve alumni directory.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniData();
  }, [API_BASE]);
  const getDirectDriveUrl = (url) => {
    if (!url || typeof url !== 'string') return '';

    if (url.includes('googleusercontent.com')) return url;

    const match = url.match(/\/d\/([^/]+)/);
    const fileId = match ? match[1] : null;

    if (fileId) {

      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    return url;
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-[#0b1b3d] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading Alumni Registry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-red-200 rounded-xl p-6 max-w-md w-full text-center shadow-sm">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <h3 className="text-sm font-bold text-slate-800">Data Transfer Error</h3>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Panel */}
        <div className="border-b border-slate-200 pb-5 text-left">
          <button
            onClick={() => navigate("/scholars")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#0b1b3d] mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Current Scholars
          </button>
          <h1 className="text-2xl font-bold text-[#0b1b3d] tracking-tight">Alumni Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Celebrating the research contributions and career trajectories of our graduated scholars.
          </p>
        </div>

        {/* Empty State Grid */}
        {alumni.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-sm text-slate-400 font-medium">No alumni profiles are currently cataloged in the registry.</p>
          </div>
        ) : (
          /* Card Grid Grid Workspace Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((member) => {
              const imageSrc = getDirectDriveUrl(
                member.imageUrl && typeof member.imageUrl === "object"
                  ? member.imageUrl.webViewLink
                  : member.imageUrl
              );

              return (
                <div
                  key={member._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden text-left"
                >
                  <div className="p-5 space-y-4">
                    {/* Identity Header Row */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {imageSrc ? <img
                        src={getDirectDriveUrl(member.imageUrl && typeof member.imageUrl === 'object'
                          ? member.imageUrl.webViewLink
                          : member.imageUrl)}
                        alt={member.name}
                        className="w-20 h-20 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
                        }}
                      /> : (
                        <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <LuGraduationCap className="text-2xl" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <h2 className="text-sm font-bold text-slate-800 leading-tight">{member.name}</h2>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{member.role}</p>
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <div><span className="inline-flex px-2 py-1 rounded-full bg-slate-100 text-xs font-medium">
                            {member.joinedYear} – {member.graduationYear}
                          </span></div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Core Research Content Panel */}

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Research Domain</span>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{member.researchTopic ? member.researchTopic : "No research topic available."}</p>
                    </div>



                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 mt-auto w-full">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors min-w-0"
                      title={member.email}
                    >
                      <LuMail className="text-sm flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>

                    {member.linkedinUrl ? (
                      <a
                        href={member.linkedinUrl}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumni;