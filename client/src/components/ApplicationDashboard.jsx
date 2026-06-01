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
  const [activeFilter, setActiveFilter] = useState('All'); // Options: 'All' | 'Pending' | 'Shortlisted'

  const token = localStorage.getItem('adminToken');
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setError('Unauthorized: No login token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/admin/applications`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          const cleanData = result.data.map(app => ({ ...app, status: app.status || 'Pending' }));
          setApps(cleanData);
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
  }, [token, API_BASE]);

  // Handle action changes from selection dropdown
  const handleActionChange = (id, currentName, selectedValue) => {
    if (selectedValue === 'Pending') {
      updateStatus(id, currentName, 'Pending');
    } else if (selectedValue === 'Shortlisted') {
      updateStatus(id, currentName, 'Shortlisted');
    } else if (selectedValue === 'RejectAndDelete') {
      triggerToastConfirmation(id, currentName);
    }
  };

  // State mutator for Pending and Shortlisted actions
  const updateStatus = async (id, currentName, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json'
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

  // Production-grade custom toast popup replacing browser confirmation dialog boxes
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
              // 🛠️ FIXED: Reset state array mapping briefly to force select menus off 'RejectAndDelete' on cancel
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

  // Complete DB and file deletion pipeline execution block
  const executeDeleteApplication = async (id, currentName) => {
    const loadingToast = toast.loading(`Cleaning up records for ${currentName}...`);
    try {
      const response = await fetch(`${API_BASE}/admin/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json'
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
        // 🛠️ FIXED: Reset dropdown visualization layout if the backend refuses to execute the deletion pipeline
        setApps(prev => [...prev]);
        toast.error(result.message || 'Server rejected standard document destruction request.');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      setApps(prev => [...prev]);
      toast.error('Network error blocked drop execution sequence.');
    }
  };

  // Compute stats metrics for dashboard counter items
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
    <div className="max-w-6xl mx-auto p-6 min-h-[calc(100vh-64px)] bg-[#f8fafc] text-slate-800 font-sans">
      
      {/* Header Panel Component */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-6 mb-8 border-b border-slate-200/80 gap-5">
        <div>
          <h2 className="text-2xl font-black text-[#0b1b3d] tracking-tight flex items-center gap-2">
            Lab Application Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Review applicant profiles, evaluate experience statements, and manage selection pipeline trajectories.
          </p>
        </div>

        {/* Dynamic Metric Multi-Toggles */}
        <div className="flex bg-slate-200/70 p-1 rounded-md border border-slate-300/50 shadow-xs text-xs font-bold select-none w-full lg:w-auto overflow-x-auto">
          {Object.keys(metrics).map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-sm whitespace-nowrap transition-all duration-200 cursor-pointer flex-1 lg:flex-none ${
                activeFilter === type 
                  ? 'bg-white text-[#0b1b3d] shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              {metrics[type].icon}
              <span>{type}</span>
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeFilter === type ? 'bg-[#0b1b3d] text-white' : 'bg-slate-300/70 text-slate-600'
              }`}>{metrics[type].count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dynamic Workspace Render Section */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-24 text-slate-400 bg-white border border-dashed border-slate-200 rounded-sm shadow-xs flex flex-col items-center justify-center gap-2">
          <Clock size={32} className="text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No applicant records match your selection criteria</p>
          <p className="text-xs text-slate-400">Currently no items are filed within the "{activeFilter}" data track.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredApps.map((app) => (
            <div 
              key={app._id} 
              className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-xs flex flex-col md:flex-row justify-between md:items-start gap-6 hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              {/* Left Segment: Profile Meta Block */}
              <div className="space-y-2.5 flex-grow max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2 tracking-tight">
                    <User size={18} className="text-slate-400" /> {app.applicantName}
                  </h3>
                  <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 border rounded-sm flex items-center gap-1 shadow-2xs ${
                    app.status === 'Shortlisted' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' 
                      : 'bg-amber-50/70 text-amber-700 border-amber-200/70'
                  }`}>
                    {app.status === 'Shortlisted' ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {app.status}
                  </span>
                </div>
                
                {/* Contact Coordinates Deck */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                    <Mail size={14} className="text-slate-400" /> {app.applicantEmail}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                    <Phone size={14} className="text-slate-400" /> {app.contact || 'No contact numbers submitted'}
                  </span>
                </div>
                
                {/* Dynamic Target Position Tracking Banner */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-slate-50 border border-slate-200/60 text-slate-600 px-2.5 py-1 inline-flex rounded-sm">
                  <Briefcase size={12} className="text-slate-400" />
                  <span>Target Post: <span className="text-[#0b1b3d] font-extrabold">{app.vacancyId?.title || 'Unknown Position'}</span></span>
                </div>
                
                {/* Statement Display Section */}
                {app.statement && app.statement !== 'null' && (
                  <div className="text-sm text-slate-600 flex items-start gap-3 bg-slate-50/50 p-3 rounded-sm border border-slate-200/40 mt-3 shadow-3xs">
                    <MessageSquare size={15} className="mt-0.5 text-slate-400 flex-shrink-0" />
                    <p className="leading-relaxed"><span className="font-semibold text-slate-500 not-italic">Purpose Statement:</span> <span className="italic text-slate-700">"{app.statement}"</span></p>
                  </div>
                )}
              </div>

              {/* Right Segment: Administrative Execution Controls */}
              <div className="flex sm:flex-row md:flex-col lg:flex-row items-center gap-3 md:self-start lg:self-center flex-shrink-0 md:pt-1 lg:pt-0">
                {/* 🛠️ FIXED: Added security parameters to prevent potential reverse tab-nabbing vulnerabilities */}
                <a 
                  href={app.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#0b1b3d] text-white px-4 py-2.5 rounded-sm text-xs font-bold hover:bg-[#15428a] shadow-xs active:scale-98 transition-all duration-150 w-full sm:w-auto md:w-full lg:w-auto"
                >
                  <FileText size={15} /> View Resume
                </a>

                <div className="relative w-full sm:w-auto md:w-full lg:w-auto">
                  <select
                    value={app.status}
                    onChange={(e) => handleActionChange(app._id, app.applicantName, e.target.value)}
                    className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-extrabold px-3 py-2.5 rounded-sm transition-all outline-none cursor-pointer focus:border-[#0b1b3d] focus:ring-1 focus:ring-[#0b1b3d] shadow-2xs w-full"
                  >
                    <option value="Pending">⚙️ Mark Pending State</option>
                    <option value="Shortlisted">✅ Shortlist Candidate</option>
                    <option value="RejectAndDelete">❌ Reject & Purge File</option>
                  </select>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsDashboard;