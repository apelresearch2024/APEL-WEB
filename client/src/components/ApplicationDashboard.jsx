import React, { useEffect, useState } from 'react';
import {
  Loader2,
  ShieldAlert,
  FileText,
  User,
  Mail,
  Phone,
  MessageSquare,
  Briefcase,
  CheckCircle,
  Clock,
  Trash2,
  UserCheck,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ApplicationsDashboard = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const [expandedBio, setExpandedBio] = useState({});

  const toggleBio = (id) => {
    setExpandedBio(prev => ({ ...prev, [id]: !prev[id] }));
  };
  // Helper helper function to resolve valid authorization keys dynamically
  const getAuthToken = () => {
    const storedToken = localStorage.getItem('adminToken');

    // If the token is valid and not a corrupted literal "undefined" string, use it
    if (storedToken && storedToken !== 'undefined') {
      return storedToken;
    }

    // Fallback: If AdminLogin stored "undefined", we pull the master key directly 
    // from frontend environment variables as a safety measure
    return import.meta.env.VITE_ADMIN_SECRET_KEY || import.meta.env.VITE_ADMIN_API_KEY || '';
  };

  useEffect(() => {
    const fetchApplications = async () => {
      const currentToken = getAuthToken();

      if (!currentToken) {
        setError('Unauthorized: No operational administrative key could be resolved. Please log back in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/admin/applications`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          }
        });
        const result = await response.json();

        if (result.success) {
          const cleanData = result.data.map(app => ({ ...app, status: app.status || 'Pending' }));
          setApps(cleanData);
          setError('');
        } else {
          setError(result.message || 'Failed to retrieve applications.');
        }
      } catch (err) {
        setError('Failed to connect to the administration server.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [API_BASE]);

  const handleActionChange = (id, currentName, selectedValue) => {
    if (selectedValue === 'Pending') {
      updateStatus(id, currentName, 'Pending');
    } else if (selectedValue === 'Shortlisted') {
      updateStatus(id, currentName, 'Shortlisted');
    } else if (selectedValue === 'RejectAndDelete') {
      triggerToastConfirmation(id, currentName);
    }
  };

  const updateStatus = async (id, currentName, newStatus) => {
    const currentToken = getAuthToken();

    try {
      const response = await fetch(`${API_BASE}/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();
      if (result.success) {
        setApps(apps.map(app => app._id === id ? { ...app, status: newStatus } : app));

        if (newStatus === 'Shortlisted') {
          toast.success(
            <div key={`shortlist-${id}`} className="flex flex-col text-xs">
              <span className="font-bold text-slate-800">Candidate Shortlisted</span>
              <span className="text-slate-500">{currentName} moved to Shortlist queue.</span>
            </div>,
            { icon: <Sparkles className="text-amber-500 animate-pulse" size={18} /> }
          );
        } else {
          toast.success(`${currentName} moved back to pending queue.`, { icon: '⚙️' });
        }
      } else {
        toast.error(result.message || 'Failed to update status.');
      }
    } catch (err) {
      toast.error('Network error occurred while updating status.');
    }
  };

  const triggerToastConfirmation = (id, currentName) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1 max-w-xs text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-slate-800">Confirm Permanent Deletion</p>
            <p className="text-slate-500 mt-0.5">Are you sure you want to permanently reject and remove {currentName}?</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setApps(prev => [...prev]);
            }}
            className="px-2.5 py-1.5 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-sm cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await executeDeleteApplication(id, currentName);
            }}
            className="px-2.5 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-sm cursor-pointer flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} /> Reject & Delete
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: { borderLeft: '4px solid #f43f5e', padding: '12px' }
    });
  };

  const executeDeleteApplication = async (id, currentName) => {
    const currentToken = getAuthToken();
    const loadingToast = toast.loading(`Cleaning up records for ${currentName}...`);

    try {
      const response = await fetch(`${API_BASE}/admin/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });

      const result = await response.json();
      toast.dismiss(loadingToast);

      if (result.success) {
        setApps(apps.filter(app => app._id !== id));
        toast.error(
          <div key={`deleted-${id}`} className="flex flex-col text-xs">
            <span className="font-bold text-slate-800">Application Purged</span>
            <span className="text-slate-500">{currentName} removed completely.</span>
          </div>,
          { icon: <Trash2 className="text-rose-500" size={16} /> }
        );
      } else {
        setApps(prev => [...prev]);
        toast.error(result.message || 'Server rejected standard document destruction request.');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      setApps(prev => [...prev]);
      toast.error('Network error blocked drop execution sequence.');
    }
  };

  const metrics = {
    All: { count: apps.length, icon: <User size={14} /> },
    Pending: { count: apps.filter(a => a.status === 'Pending').length, icon: <Clock size={14} /> },
    Shortlisted: { count: apps.filter(a => a.status === 'Shortlisted').length, icon: <UserCheck size={14} /> },
  };

  const filteredApps = apps.filter(app => activeFilter === 'All' || app.status === activeFilter);

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#0b1b3d] mb-4" size={36} />
        <p className="text-sm font-medium text-slate-500 tracking-wide">Assembling dashboard application streams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 font-bold flex flex-col justify-center min-h-[50vh] items-center gap-3">
        <ShieldAlert size={54} className="text-rose-500 animate-bounce" />
        <h3 className="text-lg text-slate-800">Dashboard Stream Disrupted</h3>
        <span className="text-sm font-normal text-slate-500 max-w-md">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 min-h-[calc(100vh-64px)] bg-[#f8fafc] text-slate-800 font-sans">
      {/* HEADER: Responsive stack */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-6 mb-8 border-b border-slate-200/80 gap-5">
        <div>
          <h2 className="text-2xl font-black text-[#0b1b3d] tracking-tight flex items-center gap-2">
            Lab Application Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Review applicant profiles, evaluate experience statements, and manage selection pipeline.
          </p>
        </div>

        {/* FILTERS: Scrollable on mobile, flexible on desktop */}
        <div className="flex bg-slate-200/70 p-1 rounded-md border border-slate-300/50 shadow-xs text-xs font-bold select-none w-full lg:w-auto overflow-x-auto">
          {Object.keys(metrics).map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-sm whitespace-nowrap transition-all duration-200 flex-1 lg:flex-none ${activeFilter === type
                ? 'bg-white text-[#0b1b3d] shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                }`}
            >
              <span>{type}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === type ? 'bg-[#0b1b3d] text-white' : 'bg-slate-300/70 text-slate-600'
                }`}>{metrics[type].count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* APPLICATIONS GRID: Responsive wrapping */}
      <div className="grid grid-cols-1 gap-5">
        {filteredApps.map((app) => (
          <div
            key={app._id}
            className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-sm shadow-xs flex flex-col md:flex-row justify-between items-start gap-6 hover:border-slate-300 transition-all"
          >
            {/* LEFT: Info Container */}
            <div className="space-y-3 flex-grow w-full">
              {/* Applicant Info Section */}
              <div className="space-y-2 flex-grow w-full">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Name: Slightly reduced weight for elegance */}
                  <h3 className="text-lg font-semibold text-slate-800 tracking-tight">
                    {app.applicantName}
                  </h3>

                  {/* Status: Kept distinct but clean */}
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 border rounded-sm ${app.status === 'Shortlisted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                    {app.status}
                  </span>
                </div>

                {/* Metadata: Normal weight for better readability */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 font-normal">
                  <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {app.applicantEmail}</span>
                  <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {app.contact || 'No contact provided'}</span>
                </div>
              </div>

              <div className="text-xs font-bold uppercase bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 inline-block rounded-sm">
                Target Post: <span className="text-[#0b1b3d]">{app.vacancyId?.title || 'N/A'}</span>
              </div>

              {app.statement && (
                <div className="mt-3 border border-slate-200 rounded-sm overflow-hidden bg-white">
                  <button
                    onClick={() => toggleBio(app._id)}
                    className="w-full flex items-center justify-between p-3 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <span>Brief Statement</span>
                    {expandedBio[app._id] ? '▲' : '▼'}
                  </button>

                  {expandedBio[app._id] && (
                    <div className="p-3 pt-0 text-sm text-slate-700 font-normal leading-relaxed max-w-lg border-t border-slate-100">
                      "{app.statement}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Action Buttons (Responsive width) */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 flex-shrink-0">
              <a
                href={typeof app.resumeUrl === 'object' ? app.resumeUrl.webViewLink : app.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0b1b3d] text-white px-4 py-2.5 rounded-sm text-xs font-bold hover:bg-[#15428a]"
              >
                <FileText size={15} /> Resume
              </a>

              <select
                value={app.status}
                onChange={(e) => handleActionChange(app._id, app.applicantName, e.target.value)}
                className="flex-1 md:flex-none bg-white border border-slate-300 text-slate-700 text-xs font-extrabold px-3 py-2.5 rounded-sm outline-none cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="RejectAndDelete">Reject & Purge</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationsDashboard;