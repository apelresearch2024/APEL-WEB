
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload, FileText } from 'lucide-react';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);;
  const [activeTab, setActiveTab] = useState('scholars');
  const [loading, setLoading] = useState(false);
  const [scholarsList, setScholarsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [publications, setPublications] = useState([]);
  const [isEditingScholar, setIsEditingScholar] = useState(false);
  const [editingScholarId, setEditingScholarId] = useState(null);
  const [editingPub, setEditingPub] = useState(null);
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('adminToken');

  // --- INITIAL FIELD STATES ---
  const initialScholarState = {
    name: '',
    role: '',
    email: '',
    joinedYear: new Date().getFullYear(),
    linkedinUrl: '',
    researchTopic: '',
    imageFile: null,
    status: 'Current',
    graduationYear: ''
  };

  const initialOngoingState = {
    title: '',
    pi: '',
    startDate: '',
    grantValue: '',
    outcome: '',
    status: 'Ongoing',
    fundingAgency: '',
    pdfFile: null
  };

  const initialCompletedState = {
    title: '',
    pi: '',
    duration: '',
    grantValue: '',
    outcome: '',
    status: 'Completed',
    fundingAgency: '',
    pdfFile: null

  };

  const initialAchievementState = {
    category: 'Award', // Default to 'Award' to match your filter logic
    title: '',
    year: new Date().getFullYear().toString()
  };
  const initialAnnouncementState = { title: '', description: '', date: '' };
  const initialVacancyState = {
    title: '',
    slots: '',
    project: '',
    qualification: '',
    stipend: '',
    deadline: '',
    pdfFile: null
  };
  const initialPublicationState = {
    type: 'Journal',
    title: '',
    authors: '',
    venue: '',
    detail: '',
    number: '',
    year: new Date().getFullYear(),
    link: ''
  };
  const [imageForm, setImageForm] = useState({
    file: null,
    previewUrl: '',
    caption: ''
  });
  const [photosList, setPhotosList] = useState([
    {
      url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800',
      caption: 'Advanced Wide-Bandgap GaN semiconductor inverter test workbench setup.',
      date: new Date().toISOString()
    }
  ]);
  // State Management Hooks
  const [scholarForm, setScholarForm] = useState(initialScholarState);
  const [ongoingForm, setOngoingForm] = useState(initialOngoingState);
  const [completedForm, setCompletedForm] = useState(initialCompletedState);
  const [achievementForm, setAchievementForm] = useState(initialAchievementState);
  const [announcementForm, setAnnouncementForm] = useState(initialAnnouncementState);
  const [vacancyForm, setVacancyForm] = useState(initialVacancyState);
  const [publicationForm, setPublicationForm] = useState(initialPublicationState);

  const galleryInputRef = React.useRef(null);
  // Security Verification
  useEffect(() => {
    if (!token) {
      toast.error("Session expired or missing. Please re-authenticate.");
      navigate('/admin-login');
    }
  }, [token, navigate]);

  const formatMonthYear = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  // --- API READ OPERATIONS ---
  const fetchAllData = useCallback(async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'x-api-key': token
      };

      // 1. Added resPublications into the parallel database fetch pool
      const [
        resScholars,
        resProjects,
        resAchievements,
        resAnnouncements,
        resVacancies,
        resPublications
      ] = await Promise.all([
        fetch(`${API_BASE}/scholars`, { headers }),
        fetch(`${API_BASE}/projects`, { headers }),
        fetch(`${API_BASE}/achievements`, { headers }),
        fetch(`${API_BASE}/announcements`, { headers }),
        fetch(`${API_BASE}/vacancies`, { headers }),
        fetch(`${API_BASE}/publications`, { headers }) // <-- Loaded!
      ]);

      // 2. Parse out the publication response JSON stream
      const dScholars = await resScholars.json();
      const dProjects = await resProjects.json();
      const dAchievements = await resAchievements.json();
      const dAnnouncements = await resAnnouncements.json();
      const dVacancies = await resVacancies.json();
      const dPublications = await resPublications.json(); // <-- Parsed!

      // 3. Dispatch data arrays directly into local React view state states
      if (dScholars.success) setScholarsList(dScholars.data || dScholars);
      if (dProjects.success) setProjectsList(dProjects.data || dProjects);
      if (dAchievements.success) setAchievementsList(dAchievements.data || dAchievements);
      if (dAnnouncements.success) setAnnouncements(dAnnouncements.data || dAnnouncements);
      if (dVacancies.success) setVacancies(dVacancies.data || dVacancies);

      // 4. Safely extract backend .data block matching your Express model setup
      if (dPublications.success) {
        setPublications(dPublications.data || dPublications);
      }

    } catch (err) {
      console.error('Database pool reading error:', err);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, fetchAllData]);

  // --- API WRITE (CREATE) OPERATION ---
  const handleFormSubmit = async (e, endpoint, formData, resetForm, fallbackState) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === 'pdfFile' || key === 'imageFile') {
          if (formData[key]) data.append(key, formData[key]);
        }
        else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      if (endpoint === 'projects' && formData.status === 'Ongoing' && formData.startDate) {
        data.append('duration', `${formatMonthYear(formData.startDate)}`);
      }

      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': token
        },
        body: data
      });

      const resData = await response.json();

      if (response.ok || resData.success) {
        toast.success(resData.message || 'Record successfully integrated.');
        resetForm(fallbackState);
        fetchAllData();
      } else {
        toast.error(resData.message || 'Validation error.');
      }
    } catch (err) {
      toast.error('Network failure connecting with remote server.');
    } finally {
      setLoading(false);
    }
  };
  const handleAchievementSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(achievementForm)
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success("Achievement recorded!");
        setAchievementForm(initialAchievementState);
        fetchAllData();
      } else {
        toast.error(resData.message || "Failed to save achievement.");
      }
    } catch (err) {
      toast.error('Network failure.');
    } finally {
      setLoading(false);
    }
  };
  const handleMarkAsAlumnus = (scholarId) => {
    const currentYear = new Date().getFullYear();

    toast.custom((t) => {
      const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const graduationYear = formData.get('graduationYear') || currentYear;
        toast.remove(t.id);
        const loadingToastId = toast.loading('Archiving scholar profile...');
        try {
          const response = await fetch(`${API_BASE}/scholars/${scholarId}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-api-key': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ graduationYear: Number(graduationYear) })
          });

          const data = await response.json();

          if (response.ok || data.success) {
            toast.success(data.message || 'Scholar successfully archived to Alumni.', { id: loadingToastId });
            fetchAllData();
          } else {
            toast.error(data.message || 'Could not update scholar status.', { id: loadingToastId });
          }
        } catch (err) {
          toast.error('Network error reaching the server.', { id: loadingToastId });
        }
      };

      return (
        <div className="w-[420px] bg-white shadow-2xl rounded-xl pointer-events-auto flex flex-col p-6 border border-slate-200">
          <form onSubmit={handleSubmit}>
            <h5 className="text-sm font-bold text-[#0b1b3d] uppercase tracking-wide flex items-center gap-1.5">
              🎓 Archive Scholar Record
            </h5>
            <p className="text-xs text-slate-400 font-medium mt-1 mb-4">
              Specify the graduation or departure year to process this status transition.
            </p>

            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Departure Year</label>
            <input
              type="number"
              name="graduationYear"
              defaultValue={currentYear}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              placeholder="YYYY"
              required
            />

            <div className="flex justify-end items-center gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => toast.remove(t.id)}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all uppercase tracking-wider"
              >
                Confirm Status Update
              </button>
            </div>
          </form>
        </div>
      );
    }, { duration: Infinity });
  };
  const submitAlumniStatus = async (scholarId, graduationYear) => {
    try {
      const response = await fetch(`${API_BASE}/scholars/${scholarId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ graduationYear })
      });

      const data = await response.json();

      if (response.ok || data.success) {
        toast.success(data.message || 'Scholar successfully archived to Alumni.');
        fetchAllData();
      } else {
        toast.error(data.message || 'Could not update scholar status.');
      }
    } catch (err) {
      toast.error('Network error reaching the server.');
    }
  };
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', scholarForm.name);
      formData.append('role', scholarForm.role);
      formData.append('email', scholarForm.email);
      formData.append('status', scholarForm.status);
      formData.append('joinedYear', scholarForm.joinedYear);
      formData.append('researchTopic', scholarForm.researchTopic);

      if (scholarForm.graduationYear) formData.append('graduationYear', scholarForm.graduationYear);
      if (scholarForm.linkedinUrl) formData.append('linkedinUrl', scholarForm.linkedinUrl);

      if (scholarForm.imageFile) {
        formData.append('imageFile', scholarForm.imageFile);
      }

      const adminToken = localStorage.getItem('token') || localStorage.getItem('adminToken');

      const res = await fetch(`${API_BASE}/scholars/${scholarForm._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Profile updated successfully!'); // ✅ Success feedback
        setIsEditingScholar(false);
        setScholarForm(initialScholarState);
        fetchAllData();
      } else {
        // ✅ Error feedback using toast
        toast.error(result.message || "Failed to update target record properties.");
      }
    } catch (err) {
      console.error("Modal update execution failed:", err);
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };
  const categorizedAdminScholars = useMemo(() => {
    if (activeTab !== 'scholars' || !scholarsList.length) return [];

    const categories = [
      { id: 'phd', label: 'Ph.D. Research Scholars', matches: ['phd', 'ph.d'] },
      { id: 'mtech', label: 'M.Tech. Postgraduates', matches: ['mtech', 'm.tech'] },
      { id: 'btech', label: 'B.Tech. Undergraduates', matches: ['btech', 'b.tech'] },
      { id: 'anrf', label: 'ANRF Research Fellows', matches: ['anrf', 'anrf-jrf'] },
      { id: 'jrf', label: 'Junior Research Fellows (JRF)', matches: ['jrf', 'jrf.'] },
      { id: 'project-associate', label: 'Project Associates', matches: ['project-associate', 'project associate'] },
      { id: 'btp_iop', label: 'BTP / IOP Projects', matches: ['btp', 'btp.', 'iop', 'iop.'] },
      { id: 'interns', label: 'Research Interns', matches: ['intern', 'intern.'] },
      { id: 'others', label: 'Other Project Staff', matches: [] }
    ];

    const groups = categories.map(cat => ({ ...cat, list: [] }));

    scholarsList.forEach(scholar => {
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
  }, [scholarsList, activeTab]);
  // ================= CORE GALLERY API FUNCTIONS =================

  /**
   * 1. Fetches all active photos from the backend database 
   */
  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${API_BASE}/photos`);
      const result = await res.json();
      if (result.success) {
        setPhotosList(result.data || []);
      } else {
        toast.error("Database rejected photo asset pull requested.");
      }
    } catch (err) {
      toast.error("Failed to connect to backend photo storage endpoint:");
    }
  };

  /**
   * 2. Compiles file payloads and handles the multi-part upload pipeline
   */
  const handleUpload = async () => {
    if (!imageForm.file) {
      toast.error("Please select an image file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageForm.file);

    try {
      const res = await fetch(`${API_BASE}/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Image uploaded and published successfully!");

        // Prepend newly uploaded item to the existing list
        setPhotosList([result.data, ...photosList]);

        // Reset staging states
        setImageForm({ file: null, previewUrl: '' });
        if (galleryInputRef.current) {
          galleryInputRef.current.value = '';
        }
      } else {
        toast.error(result.message || "Upload processing error from server.");
      }
    } catch (err) {
      toast.error("Connection error: Unable to complete upload to cloud backend.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. Triggers target deletion criteria to clear out records and physical local files
   */
  const handleDelete = async (photoId) => {
    if (!photoId) return;

    toast((t) => (
      <div className={`flex flex-col gap-3 p-2 min-w-[280px] ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-slate-800">Confirm Deletion</p>
            <p className="text-[11px] text-slate-500">This action can't be undo</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await executeDelete(photoId);
            }}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-md transition-colors shadow-sm"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#fff',
        color: '#333',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        padding: '16px',
      }
    });
  };

  // Separate the logic to perform the deletion
  const executeDelete = async (photoId) => {
    try {
      const res = await fetch(`${API_BASE}/photos/${photoId}`, {
        method: 'DELETE'
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Asset deleted successfully.");
        setPhotosList(photosList.filter((photo) => photo._id !== photoId));
      } else {
        toast.error(result.message || "Failed to drop targeted resource.");
      }
    } catch (err) {
      console.error("Deletion error:", err);
      toast.error("Network failure: Unable to process asset wipe.");
    }
  };
  useEffect(() => {
    if (activeTab === 'UploadImages') {
      fetchPhotos();
    }
  }, [activeTab]);
  // Handler for setting form state when editing a scholar
  const handleEditClick = (scholar) => {
    setScholarForm({
      _id: scholar._id,
      name: scholar.name,
      role: scholar.role,
      email: scholar.email,
      status: scholar.status || 'Current',
      joinedYear: scholar.joinedYear,
      graduationYear: scholar.graduationYear || '',
      linkedinUrl: scholar.linkedinUrl || '',
      researchTopic: scholar.researchTopic || '',
      imageFile: null
    });
    setEditingScholarId(scholar._id);
    setIsEditingScholar(true);
  };

  /**
  * 1. Unified Edit Initiation Handler
  * Dynamically maps project details to either the ongoing or completed form states
  */
  const startProjectEdit = (project, type) => {
    setEditingId(project._id);
    setEditingType(type);

    const sharedData = {
      title: project.title,
      pi: project.pi,
      grantValue: project.grantValue,
      fundingAgency: project.fundingAgency,
      pdfFile: null,
      existingPdfUrl: project.pdfUrl
    };

    if (type === 'ongoing') {
      setOngoingForm({
        ...sharedData,
        startDate: project.startDate
      });
    } else if (type === 'completed') {
      setCompletedForm({
        ...sharedData,
        duration: project.duration,
        outcome: project.outcome || ''
      });
    }

    // Smoothly scroll to the top of the viewport for editing access
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 2. Unified Update Submit Handler
   * Packages Form Data dynamically and dispatches to the same backend route structure
   */
  const submitProjectUpdate = async (e, type) => {
    e.preventDefault();
    setLoading(true);

    // 1. Determine which form state to use
    const currentForm = type === 'ongoing' ? ongoingForm : completedForm;

    try {
      const formData = new FormData();
      formData.append('title', currentForm.title);
      formData.append('pi', currentForm.pi);
      formData.append('grantValue', currentForm.grantValue);
      formData.append('fundingAgency', currentForm.fundingAgency);

      // 2. Add type-specific fields
      if (type === 'ongoing') {
        formData.append('startDate', currentForm.startDate);
        if (currentForm.pdfFile) formData.append('pdfFile', currentForm.pdfFile);
      } else {
        formData.append('duration', currentForm.duration);
        formData.append('outcome', currentForm.outcome);
        if (currentForm.pdfFile) formData.append('pdfFile', currentForm.pdfFile);
      }

      const adminToken = localStorage.getItem('token') || localStorage.getItem('adminToken');

      const res = await fetch(`${API_BASE}/projects/${editingId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`${type === 'ongoing' ? 'Ongoing' : 'Completed'} project updated!`);
        // Cleanup
        setEditingId(null);
        setEditingType(null);
        type === 'ongoing' ? setOngoingForm(initialOngoingState) : setCompletedForm(initialCompletedState);
        fetchAllData();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Update failed.');
    } finally {
      setLoading(false);
    }
  };
  const performCompletion = async (proj, finishedDate, outcome) => {
    const startStr = proj.startDate ? formatMonthYear(proj.startDate) : 'Unknown Start';
    const finishStr = formatMonthYear(finishedDate);
    const duration = `${startStr} - ${finishStr}`;

    try {
      const response = await fetch(`${API_BASE}/projects/${proj._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': token
        },
        body: JSON.stringify({
          ...proj,
          status: 'Completed',
          duration: duration,
          outcome: outcome || 'N/A' // Fallback for the new field
        })
      });

      if (response.ok) {
        toast.success("Project archived successfully!");
        fetchAllData();
      } else {
        toast.error("Failed to archive.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };
  // --- API DELETE OPERATION ---
  const handleItemDelete = (endpoint, id) => {
    toast((t) => (
      <div className="flex flex-col gap-4 min-w-[300px] p-2">
        <div>
          <h3 className="font-bold text-slate-800">Confirm Deletion</h3>
          <p className="text-sm text-slate-600 mt-1">
            Are you sure? This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                  toast.success("Successfully deleted!");
                  fetchAllData();
                } else {
                  toast.error("Failed to delete record.");
                }
              } catch (err) {
                toast.error("An error occurred.");
              }
            }}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      style: { border: '1px solid #e2e8f0' } // Adds a subtle border to the toast
    });
  };
  const shiftProjectToCompleted = (proj) => {
    // Local state for the toast inputs
    let completionDate = new Date().toISOString().split('T')[0];
    let outcome = "";

    toast((t) => (
      <div className="space-y-3">
        <p className="font-bold text-sm">Finalize Project: {proj.title}</p>

        <input
          type="date"
          defaultValue={completionDate}
          onChange={(e) => completionDate = e.target.value}
          className="w-full border p-1.5 rounded text-xs"
        />

        <input
          type="text"
          placeholder="Outcome (e.g., 1 Patent)"
          onChange={(e) => outcome = e.target.value}
          className="w-full border p-1.5 rounded text-xs"
        />

        <div className="flex gap-2">
          <button
            onClick={() => {
              performCompletion(proj, completionDate, outcome);
              toast.dismiss(t.id);
            }}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs"
          >
            Confirm
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 px-3 py-1 rounded text-xs">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };
  // Function to process settings-panel password modifications via authenticated API channels
  const handleUpdatePassword = async (event, currentPassword, newPassword, confirmPassword) => {
    // 1. Structural Validation Guards
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long.');
    }

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const submitButton = event.target.querySelector('button[type="submit"]');

    // Prevent duplicate double-clicks
    submitButton.disabled = true;
    const originalText = submitButton.innerText;
    submitButton.innerText = "Updating...";

    try {
      const response = await fetch(`${API_BASE}/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          email: 'apel.research2024@gmail.com', // Primary target admin profile context
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Administrative password updated successfully!');
        event.target.reset(); // Safely flushes input state nodes clear
      } else {
        toast.error(data.message || 'Failed to update password configuration.');
      }
    } catch (err) {
      toast.error('Network failure connecting to authentication cluster services.');
    } finally {
      // Re-enable interactive layout elements
      submitButton.disabled = false;
      submitButton.innerText = originalText;
    }
  };
  const ongoingProjects = Array.isArray(projectsList) ? projectsList.filter(p => p.status === 'Ongoing') : [];
  const completedProjects = Array.isArray(projectsList) ? projectsList.filter(p => p.status === 'Completed') : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 relative z-0 pt-6">

      {/* Dashboard Section Subheader banner */}
      <div className="bg-white border-b border-slate-200 py-6 px-6 sm:px-8 shadow-sm rounded-xl max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0b1b3d]">APEL Database Control Room</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Add, manage, and track activites.</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              toast.success("Logged out successfully");
              navigate('/admin-login');
            }}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors w-fit"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* RESPONSIVE SUB-MENU CONTROL INTERFACE PANEL */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-2 lg:p-4 h-fit shadow-sm flex flex-row lg:flex-col overflow-x-auto whitespace-nowrap lg:overflow-x-visible lg:whitespace-normal space-x-2 lg:space-x-0 lg:space-y-1 scrollbar-hide">
            <button onClick={() => setActiveTab('scholars')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'scholars' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Manage Scholars ({scholarsList.length})
            </button>
            <button onClick={() => setActiveTab('ongoing-projects')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'ongoing-projects' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Ongoing Projects ({ongoingProjects.length})
            </button>
            <button onClick={() => setActiveTab('completed-projects')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'completed-projects' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Completed Projects ({completedProjects.length})
            </button>
            <button onClick={() => setActiveTab('achievements')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'achievements' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Achievements ({achievementsList.length})
            </button>
            <button onClick={() => setActiveTab('announcements')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'announcements' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Announcements ({announcements.length})
            </button>
            <button onClick={() => setActiveTab('vacancies')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'vacancies' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Add Vacancies ({vacancies.length})
            </button>
            <button onClick={() => setActiveTab('publications')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'publications' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Publications ({publications.length})
            </button>
            <button onClick={() => setActiveTab('UploadImages')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'UploadImages' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Upload Images
            </button>
            <button onClick={() => setActiveTab('ResetPassword')} className={`px-4 py-2.5 lg:py-3 rounded-lg text-[11px] lg:text-xs font-bold tracking-wide uppercase flex-shrink-0 text-center transition-all ${activeTab === 'ResetPassword' ? 'bg-[#0b1b3d] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              Reset Password
            </button>
          </div>

          {/* DYNAMIC FORM AND POOL REGISTRY FEED GROUPS */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">

            {/* 1. SCHOLARS */}
            {activeTab === 'scholars' && (
              <>
                {/* Form Panel: Add New Active Scholar or Legacy Alumnus */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm">
                  <form
                    onSubmit={(e) => handleFormSubmit(e, 'scholars', scholarForm, setScholarForm, initialScholarState)}
                    className="space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-2">
                      <h3 className="text-lg font-bold text-[#0b1b3d]">Register Lab Profile</h3>
                      <p className="text-xs text-slate-400 font-medium">Add a new active researcher or directly archive a past alumnus record.</p>
                    </div>

                    {/* Row 1: Full Name & Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                        <input type="text" value={scholarForm.name || ''} onChange={(e) => setScholarForm({ ...scholarForm, name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="e.g. Dr. Rohan Sharma" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Role / Designation</label>
                        <input type="text" value={scholarForm.role || ''} onChange={(e) => setScholarForm({ ...scholarForm, role: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="e.g. Ph.D. Scholar, PostDoc Fellow, M.Tech Intern" required />
                      </div>
                    </div>

                    {/* Row 2: Email Address & Scholar Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address</label>
                        <input type="email" value={scholarForm.email || ''} onChange={(e) => setScholarForm({ ...scholarForm, email: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="username@iitr.ac.in" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Scholar Status</label>
                        <select
                          value={scholarForm.status || 'Current'}
                          onChange={(e) => setScholarForm({
                            ...scholarForm,
                            status: e.target.value,
                            graduationYear: e.target.value === 'Current' ? '' : scholarForm.graduationYear
                          })}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors font-semibold text-slate-700 h-[38px]"
                        >
                          <option value="Current">🟢 Active Lab Researcher</option>
                          <option value="Alumni">🎓 Past Alumnus (Archived)</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Year Joined Laboratory & Year Left Laboratory */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Year Joined Laboratory</label>
                        <input type="number" value={scholarForm.joinedYear || new Date().getFullYear()} onChange={(e) => setScholarForm({ ...scholarForm, joinedYear: parseInt(e.target.value) || new Date().getFullYear() })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="YYYY" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                          Year Left Laboratory {scholarForm.status === 'Alumni' && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="number"
                          disabled={scholarForm.status !== 'Alumni'}
                          value={scholarForm.graduationYear || ''}
                          onChange={(e) => setScholarForm({ ...scholarForm, graduationYear: e.target.value })}
                          className={`px-3 py-2 border rounded-lg text-sm w-full transition-colors ${scholarForm.status === 'Alumni'
                            ? 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800'
                            : 'bg-slate-200/50 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          placeholder={scholarForm.status === 'Alumni' ? "2026" : "— Locked —"}
                          required={scholarForm.status === 'Alumni'}
                        />
                      </div>
                    </div>

                    {/* Row 4: LinkedIn & Profile Image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">LinkedIn Profile link (Optional)</label>
                        <input type="url" value={scholarForm.linkedinUrl || ''} onChange={(e) => setScholarForm({ ...scholarForm, linkedinUrl: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="https://linkedin.com/in/username" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Profile Image (Optional)</label>
                        <div className={`w-full bg-slate-50 border border-dashed rounded-lg p-2 text-center relative transition-all cursor-pointer group h-[38px] flex items-center justify-center ${scholarForm.imageFile ? "border-blue-400 bg-blue-50/20" : "border-slate-200 hover:border-slate-300"}`}>
                          {!scholarForm.imageFile ? (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => setScholarForm({ ...scholarForm, imageFile: e.target.files[0] })}
                              />
                              <p className="text-xs text-slate-500 font-medium select-none pointer-events-none">📸 Click to choose image file</p>
                            </>
                          ) : (
                            <div className="flex items-center justify-between w-full px-2">
                              <span className="text-xs font-semibold text-slate-700 truncate max-w-[75%] select-none pointer-events-none">
                                ✅ {scholarForm.imageFile.name || "Loaded Image Asset"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setScholarForm({ ...scholarForm, imageFile: null })}
                                className="relative z-20 text-[10px] text-red-600 font-bold uppercase hover:text-red-800 underline"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Domain Area Topic */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Primary Domain / Core Research Focus Topic</label>
                      <input type="text" value={scholarForm.researchTopic || ''} onChange={(e) => setScholarForm({ ...scholarForm, researchTopic: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. Wide Bandgap Semiconductor Inverters" required />
                    </div>

                    <button type="submit" disabled={loading} className="bg-[#0b1b3d] hover:bg-[#112754] text-white px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase w-full sm:w-auto shadow transition-all">{loading ? 'Publishing details...' : 'Add Scholar Profile'}</button>
                  </form>
                </div>

                {/* Management Panel: Categorized Roster Engine */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-100 gap-3">
                    <h4 className="text-sm font-bold text-[#0b1b3d] uppercase tracking-wide">
                      Active Lab Researchers ({scholarsList.length})
                    </h4>
                    <a
                      href={`${API_BASE}/scholars/alumni/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-500 hover:text-[#0b1b3d] inline-flex items-center gap-1 underline transition-colors"
                    >
                      📄 View Current Alumni PDF Roster
                    </a>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6">
                    {categorizedAdminScholars.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4">No active research records loaded in database pools.</p>
                    ) : (
                      categorizedAdminScholars.map((group) => (
                        <div key={group.id} className="space-y-2">
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">{group.label}</span>
                            <span className="text-[10px] font-extrabold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">{group.list.length}</span>
                          </div>

                          <div className="divide-y divide-slate-100 pl-1">
                            {group.list.map((scholar) => (
                              <div key={scholar._id} className="py-3.5 flex justify-between items-center text-sm gap-4">
                                <div className="min-w-0 flex-1 max-w-[45%] sm:max-w-[60%]">
                                  <div className="font-bold text-slate-800 truncate">{scholar.name}</div>
                                  <div className="text-xs text-slate-400 font-semibold truncate mt-0.5">
                                    <span className="text-[#0b1b3d] bg-slate-100 px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                                      {scholar.role}
                                    </span>
                                    {scholar.email} • Joined {scholar.joinedYear}
                                  </div>
                                  {scholar.researchTopic && (
                                    <div className="text-xs text-slate-500 mt-1 italic truncate font-medium">
                                      Topic: "{scholar.researchTopic}"
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleEditClick(scholar)}
                                    className="px-2.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors whitespace-nowrap"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsAlumnus(scholar._id)}
                                    className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors whitespace-nowrap"
                                  >
                                    Mark Alumnus
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleItemDelete('scholars', scholar._id)}
                                    className="border border-red-200 hover:bg-red-50 text-red-600 text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm whitespace-nowrap"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Live Modal Editor Interceptor Layer */}
                {isEditingScholar && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <h3 className="text-base font-bold text-[#0b1b3d]">Update Researcher Profile</h3>
                          <p className="text-xs text-slate-400">Modifying live database values for active profile record.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingScholar(false);
                            setScholarForm(initialScholarState);
                          }}
                          className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <form onSubmit={handleModalSubmit} className="space-y-4 text-left">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                            <input type="text" value={scholarForm.name || ''} onChange={(e) => setScholarForm({ ...scholarForm, name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]" required />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Role / Designation</label>
                            <input type="text" value={scholarForm.role || ''} onChange={(e) => setScholarForm({ ...scholarForm, role: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address</label>
                            <input type="email" value={scholarForm.email || ''} onChange={(e) => setScholarForm({ ...scholarForm, email: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]" required />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Status Class</label>
                            <select
                              value={scholarForm.status || 'Current'}
                              onChange={(e) => setScholarForm({
                                ...scholarForm,
                                status: e.target.value,
                                graduationYear: e.target.value === 'Current' ? '' : scholarForm.graduationYear
                              })}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white font-semibold text-slate-700 h-[38px] outline-none focus:border-[#0b1b3d]"
                            >
                              <option value="Current">🟢 Active Lab Researcher</option>
                              <option value="Alumni">🎓 Past Alumnus (Archived)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Year Joined Laboratory</label>
                            <input type="number" value={scholarForm.joinedYear || ''} onChange={(e) => setScholarForm({ ...scholarForm, joinedYear: parseInt(e.target.value) || new Date().getFullYear() })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]" required />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Year Left Laboratory</label>
                            <input
                              type="number"
                              disabled={scholarForm.status !== 'Alumni'}
                              value={scholarForm.graduationYear || ''}
                              onChange={(e) => setScholarForm({ ...scholarForm, graduationYear: e.target.value })}
                              className={`px-3 py-2 border rounded-lg text-sm w-full outline-none focus:border-[#0b1b3d] ${scholarForm.status === 'Alumni' ? 'bg-slate-50' : 'bg-slate-200/50 cursor-not-allowed text-slate-400'}`}
                              placeholder={scholarForm.status === 'Alumni' ? "2026" : "— Locked —"}
                              required={scholarForm.status === 'Alumni'}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">LinkedIn Link</label>
                            <input type="url" value={scholarForm.linkedinUrl || ''} onChange={(e) => setScholarForm({ ...scholarForm, linkedinUrl: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Swap Image (Optional)</label>
                            <div className={`w-full bg-slate-50 border border-dashed rounded-lg p-2 text-center relative h-[38px] flex items-center justify-center ${scholarForm.imageFile ? "border-blue-400 bg-blue-50/20" : "border-slate-200"}`}>
                              {/* 🔥 FIX: Look for either raw file binary OR an already existing image string coming from the backend */}
                              {!scholarForm.imageFile && !scholarForm.imageUrl && (
                                <>
                                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setScholarForm({ ...scholarForm, imageFile: e.target.files[0] })} />
                                  <p className="text-xs text-slate-500 font-medium select-none pointer-events-none">📸 Choose new file</p>
                                </>
                              )}
                              {(scholarForm.imageFile || scholarForm.imageUrl) && (
                                <div className="flex items-center justify-between w-full px-2">
                                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[70%]">
                                    ✅ {scholarForm.imageFile ? scholarForm.imageFile.name : "Existing Image Loaded"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setScholarForm({ ...scholarForm, imageFile: null, imageUrl: '' })}
                                    className="relative z-20 text-[10px] text-red-600 font-bold underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Core Research Focus Topic</label>
                          <input type="text" value={scholarForm.researchTopic || ''} onChange={(e) => setScholarForm({ ...scholarForm, researchTopic: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-[#0b1b3d]" required />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingScholar(false);
                              setScholarForm(initialScholarState);
                            }}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wide"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#0b1b3d] hover:bg-[#112754] text-white rounded-lg text-xs font-bold uppercase tracking-wide disabled:opacity-50"
                          >
                            {loading ? 'Saving adjustments...' : 'Save Profile Updates'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. ONGOING PROJECTS COMPONENT SHEET */}
            {activeTab === 'ongoing-projects' && (
              <>
                {/* Form Panel: Write or Modify Active Research Grants */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (editingId && editingType === 'ongoing') {
                        await submitProjectUpdate(e, 'ongoing');
                      } else {
                        await handleFormSubmit(e, 'projects', ongoingForm, setOngoingForm, initialOngoingState);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="border-b pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h3 className={`text-lg font-bold ${editingId && editingType === 'ongoing' ? 'text-blue-600' : 'text-amber-600'}`}>
                        {editingId && editingType === 'ongoing' ? 'Modify Project Parameters' : 'Log New Ongoing Research Project'}
                      </h3>
                      {editingId && editingType === 'ongoing' && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingType(null);
                            setOngoingForm(initialOngoingState);
                          }}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded cursor-pointer"
                        >
                          Cancel Edit Mode
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Project Title</label>
                      <input type="text" value={ongoingForm.title || ''} onChange={(e) => setOngoingForm({ ...ongoingForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="Full designation of sponsored grant architecture" required />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Principal Investigator</label>
                      <input type="text" value={ongoingForm.pi || ''} onChange={(e) => setOngoingForm({ ...ongoingForm, pi: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. Dr. Amit Kumar (PI)" required />
                    </div>

                    {/* Row 1: Commencement Date & Total Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Project Official Commencement Date</label>
                        <input type="date" value={ongoingForm.startDate ? ongoingForm.startDate.split('T')[0] : ''} onChange={(e) => setOngoingForm({ ...ongoingForm, startDate: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 focus:bg-white focus:outline-none transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Total Allocated Grant Budget</label>
                        <input type="text" value={ongoingForm.grantValue || ''} onChange={(e) => setOngoingForm({ ...ongoingForm, grantValue: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. ₹56.4 Lakhs" required />
                      </div>
                    </div>

                    {/* Row 2: Funding Agency */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Funding Agency</label>
                      <input type="text" value={ongoingForm.fundingAgency || ''} onChange={(e) => setOngoingForm({ ...ongoingForm, fundingAgency: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. DST-SERB, DRDO, ISRO" required />
                    </div>

                    {/* Document Selection Area */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold text-xs uppercase tracking-wide">
                        Select PDF Document {editingId && editingType === 'ongoing' && <span className="text-[10px] text-slate-400 font-normal normal-case">(Leave blank to keep existing file)</span>}
                      </label>

                      <div className={`w-full bg-white border border-dashed rounded-sm p-4 text-center relative transition-all cursor-pointer group ${ongoingForm.pdfFile ? "border-amber-400 bg-amber-50/30" : "border-slate-300 hover:border-slate-400"}`}>

                        {/* Always render the input so the event listener is always active */}
                        <input
                          type="file"
                          ref={fileInputRef} // Ensure you have this ref defined in your component
                          accept="application/pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setOngoingForm({ ...ongoingForm, pdfFile: e.target.files[0] });
                            }
                          }}
                        />

                        <div className="space-y-1 select-none pointer-events-none">
                          <span className="text-xl block">
                            {ongoingForm.pdfFile ? '✅' : '📄'}
                          </span>
                          <p className="text-xs font-semibold text-slate-700 truncate px-2">
                            {ongoingForm.pdfFile ? ongoingForm.pdfFile.name : (ongoingForm.existingPdfUrl || ongoingForm.pdfUrl ? "📄 Existing PDF Attached (Click to swap)" : "Click to select or drag PDF file")}
                          </p>

                          {/* Remove Button - Now correctly clears both state and browser input */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOngoingForm({ ...ongoingForm, pdfFile: null });
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="relative z-20 mt-2 text-[10px] text-red-600 font-bold uppercase hover:text-red-800 underline pointer-events-auto"
                          >
                            Remove File
                          </button>

                          {!ongoingForm.pdfFile && !ongoingForm.existingPdfUrl && !ongoingForm.pdfUrl && (
                            <p className="text-[10px] text-slate-400 font-normal">Only PDF documents allowed</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`text-white px-6 py-2.5 rounded-sm text-xs font-bold tracking-wide uppercase w-full shadow-sm transition-all cursor-pointer ${editingId && editingType === 'ongoing' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                    >
                      {loading ? 'Saving adjustments...' : (editingId && editingType === 'ongoing' ? 'Update Existing Grant Metrics' : 'Publish Active Grant File')}
                    </button>
                  </form>
                </div>

                {/* Trackers List View */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-amber-600 mb-4 uppercase tracking-wide">Active Trackers ({ongoingProjects.length})</h4>
                  <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-2">
                    {ongoingProjects.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4">No ongoing projects running inside active database pipelines.</p>
                    ) : (
                      ongoingProjects.map((proj) => {
                        const actualPdfUrl = proj.pdfUrl && typeof proj.pdfUrl === 'object' ? proj.pdfUrl.webViewLink : proj.pdfUrl;

                        return (
                          <div key={proj._id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">
                            <div className="max-w-full sm:max-w-[65%]">
                              <div className="font-bold text-slate-800 line-clamp-2">{proj.title}</div>
                              <div className="text-xs text-slate-400 mt-1 font-medium">
                                PI : <span className="text-slate-600 font-semibold">{proj.pi}</span> • Started: <span className="text-amber-600 font-bold">{proj.duration || 'Running'}</span>
                              </div>

                              <div className="text-xs font-medium text-emerald-600 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                                {proj.fundingAgency && (
                                  <span>Agency: <span className="font-semibold text-slate-700">{proj.fundingAgency}</span></span>
                                )}
                                {proj.fundingAgency && proj.grantValue && <span className="text-slate-300">•</span>}
                                {proj.grantValue && (
                                  <span>Budget Pool: <span className="font-semibold text-emerald-700">{proj.grantValue}</span></span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons Container */}
                            <div className="flex items-center flex-wrap gap-2 flex-shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                              {actualPdfUrl && (
                                <a
                                  href={actualPdfUrl.startsWith('http') ? actualPdfUrl : `${API_BASE.replace('/api', '')}${actualPdfUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all text-center"
                                >
                                  View Details
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => startProjectEdit(proj, 'ongoing')}
                                className="border border-blue-200 hover:bg-blue-50 text-blue-600 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => shiftProjectToCompleted(proj)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                              >
                                Mark Completed
                              </button>

                              <button
                                type="button"
                                onClick={() => handleItemDelete('projects', proj._id)}
                                className="border border-red-200 hover:bg-red-50 text-red-600 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 3. COMPLETED PROJECTS COMPONENT SHEET */}
            {activeTab === 'completed-projects' && (
              <>
                {/* Form Panel: Write or Modify Archived Historical Registries */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (editingId && editingType === 'completed') {
                        await submitProjectUpdate(e, 'completed');
                      } else {
                        await handleFormSubmit(e, 'projects', completedForm, setCompletedForm, initialCompletedState);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="border-b pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h3 className={`text-lg font-bold ${editingId && editingType === 'completed' ? 'text-blue-600' : 'text-green-700'}`}>
                        {editingId && editingType === 'completed' ? 'Modify Archived Project Parameters' : 'Log Past Completed Research Project'}
                      </h3>
                      {editingId && editingType === 'completed' && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingType(null);
                            setCompletedForm(initialCompletedState);
                          }}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
                        >
                          Cancel Edit Mode
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Project Title</label>
                      <input type="text" value={completedForm.title || ''} onChange={(e) => setCompletedForm({ ...completedForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="Full historical sponsored grant name" required />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Principal Investigator (PI) Name</label>
                      <input type="text" value={completedForm.pi || ''} onChange={(e) => setCompletedForm({ ...completedForm, pi: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="Investigating Officer Name" required />
                    </div>

                    {/* Row 1: Lifetime Duration & Grant Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Final Operation Lifetime Duration</label>
                        <input type="text" value={completedForm.duration || ''} onChange={(e) => setCompletedForm({ ...completedForm, duration: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="e.g. Jan 2021 - Apr 2025" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Total Allocated Grant Budget</label>
                        <input type="text" value={completedForm.grantValue || ''} onChange={(e) => setCompletedForm({ ...completedForm, grantValue: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="e.g. ₹56.4 Lakhs" required />
                      </div>
                    </div>

                    {/* Row 2: Funding Agency & Project Outcome */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Funding Agency</label>
                        <input type="text" value={completedForm.fundingAgency || ''} onChange={(e) => setCompletedForm({ ...completedForm, fundingAgency: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="e.g. DST-SERB, DRDO" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Project Outcome</label>
                        <input type="text" value={completedForm.outcome || ''} onChange={(e) => setCompletedForm({ ...completedForm, outcome: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors" placeholder="e.g. 2 Patents, 1 Prototype" required />
                      </div>
                    </div>

                    {/* Document Selection Area */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold text-xs uppercase tracking-wide">
                        Upload Project Report (PDF)
                      </label>

                      <div className={`w-full bg-white border border-dashed rounded-sm p-4 text-center relative transition-all cursor-pointer ${completedForm.pdfFile ? "border-emerald-400 bg-emerald-50/30" : "border-slate-300 hover:border-slate-400"}`}>

                        {/* 1. The input is ALWAYS rendered, just invisible. This ensures onChange always works. */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="application/pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setCompletedForm(prev => ({ ...prev, pdfFile: e.target.files[0] }));
                            }
                          }}
                        />

                        <div className="space-y-1 select-none">
                          <span className="text-xl block">
                            {completedForm.pdfFile ? '✅' : '📄'}
                          </span>
                          <p className="text-xs font-semibold text-slate-700 truncate px-2">
                            {completedForm.pdfFile
                              ? completedForm.pdfFile.name
                              : (completedForm.existingPdfUrl ? "📄 Existing Document Attached (Click to swap)" : "Click to select or drag PDF file")}
                          </p>

                          {/* 2. Remove button with explicit ref clearing */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCompletedForm(prev => ({ ...prev, pdfFile: null }));
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ""; // This forces the browser to reset
                              }
                            }}
                            className="relative z-20 mt-2 text-[10px] text-red-600 font-bold uppercase hover:text-red-800 underline"
                          >
                            Remove File
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full text-white py-3 rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${editingId && editingType === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-700 hover:bg-green-800'}`}
                    >
                      {loading ? 'Archiving modifications...' : (editingId && editingType === 'completed' ? 'Update Archived Record Metrics' : 'Publish Completed Log File')}
                    </button>
                  </form>
                </div>

                {/* List View Container */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-green-700 mb-4 uppercase tracking-wide">Archived Historical Registries ({completedProjects.length})</h4>
                  <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-2">
                    {completedProjects.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4">No completed project records registered inside database storage arrays.</p>
                    ) : (
                      completedProjects.map((proj) => {
                        // 🔥 FIX: Extract link path text values dynamically before standard checking 
                        const actualPdfUrl = proj.pdfUrl && typeof proj.pdfUrl === 'object' ? proj.pdfUrl.webViewLink : proj.pdfUrl;

                        return (
                          <div key={proj._id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">

                            <div className="max-w-full sm:max-w-[65%]">
                              <div className="font-bold text-slate-800 line-clamp-2">{proj.title}</div>
                              <div className="text-xs text-slate-400 mt-1 font-medium">
                                PI: <span className="text-slate-600 font-semibold">{proj.pi}</span> • Operational Track Timeline: <span className="text-emerald-700 font-bold">{proj.duration}</span>
                              </div>

                              <div className="text-xs font-medium text-emerald-600 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                                {proj.fundingAgency && (
                                  <span>Agency: <span className="font-semibold text-slate-700">{proj.fundingAgency}</span></span>
                                )}
                                {proj.fundingAgency && (proj.grantValue || proj.outcome) && <span className="text-slate-300">•</span>}
                                {proj.grantValue && (
                                  <span>Budget: <span className="font-semibold text-emerald-700">{proj.grantValue}</span></span>
                                )}
                                {proj.grantValue && proj.outcome && <span className="text-slate-300">•</span>}
                                {proj.outcome && (
                                  <span>Outcome: <span className="font-semibold text-blue-600">{proj.outcome}</span></span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center flex-wrap gap-2 flex-shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                              {actualPdfUrl && (
                                <a
                                  href={actualPdfUrl.startsWith('http') ? actualPdfUrl : `${API_BASE.replace('/api', '')}${actualPdfUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm border border-blue-200 text-center"
                                >
                                  View Details
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => startProjectEdit(proj, 'completed')}
                                className="border border-blue-200 hover:bg-blue-50 text-blue-600 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleItemDelete('projects', proj._id)}
                                className="border border-red-200 hover:bg-red-50 text-red-600 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
            {/* 4. ACHIEVEMENTS COMPONENT SHEET */}
            {activeTab === 'achievements' && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm">
                {/* Form Section */}
                <form
                  onSubmit={(e) => handleAchievementSubmit(e)}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-2">
                    <h3 className="text-lg font-bold text-[#0b1b3d]">Log Achievement / Grant</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Title</label>
                      <input
                        type="text"
                        placeholder="e.g. ANRF's MAHA EV Mission Grant"
                        value={achievementForm.title || ''}
                        onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-[#0b1b3d]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Year / Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 2025-2028"
                        value={achievementForm.year || ''}
                        onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-[#0b1b3d]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Category</label>
                      <select
                        value={achievementForm.category || 'Award'}
                        onChange={e => setAchievementForm({ ...achievementForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white font-semibold text-slate-700 h-[38px] outline-none focus:border-[#0b1b3d]"
                      >
                        <option value="Award">🏆 Award</option>
                        <option value="Grant">💰 Grant</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="bg-[#0b1b3d] hover:bg-[#112754] text-white px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase shadow transition-all w-full sm:w-auto">
                    Add Achievement Record
                  </button>
                </form>

                {/* Management List Section */}
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-bold text-[#0b1b3d] uppercase tracking-wide mb-4">
                    Logged Records ({achievementsList.length})
                  </h4>
                  <div className="space-y-3">
                    {achievementsList.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.category === 'Award' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {item.category}
                          </span>
                          <span className="text-sm font-medium text-slate-700">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-slate-400">{item.year}</span>
                          <button
                            onClick={() => handleItemDelete('achievements', item._id)}
                            className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* --- ANNOUNCEMENTS MODULE --- */}
            {activeTab === 'announcements' && (
              <div className="space-y-6">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center border-b pb-2 mb-5">
                    <h3 className="text-lg font-bold text-[#0b1b3d] tracking-wide">
                      {editingId ? 'Modify Announcement' : 'Post New Announcement'}
                    </h3>
                    {editingId && (
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setAnnouncementForm(initialAnnouncementState);
                        }}
                        className="text-[10px] text-slate-500 underline font-bold"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (editingId) {
                        // Replace with your actual update function name
                        await submitAnnouncementUpdate(e, editingId, announcementForm, setAnnouncementForm, initialAnnouncementState);
                      } else {
                        await handleFormSubmit(e, 'announcements', announcementForm, setAnnouncementForm, initialAnnouncementState);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Announcement Title</label>
                      <input type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. New Lab Equipment Arrival" required />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Description</label>
                      <textarea value={announcementForm.description} onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors h-24" placeholder="Full announcement details..." required />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Date</label>
                      <input
                        type="date"
                        value={announcementForm.date ? announcementForm.date.split('T')[0] : ''}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <button type="submit" className="bg-[#0b1b3d] hover:bg-[#112754] text-white px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase w-full shadow transition-all">
                      {editingId ? 'Update Announcement' : 'Publish Announcement'}
                    </button>
                  </form>
                </div>

                {/* List Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-bold text-[#0b1b3d] mb-4 uppercase tracking-wide">
                    Current Announcements ({announcements.length})
                  </h4>

                  <div className="divide-y divide-slate-100">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4">No active announcements.</p>
                    ) : (
                      announcements.map((item) => (
                        <div key={item._id} className="py-4 flex justify-between items-start gap-4">
                          <div>
                            <p className="font-bold text-sm text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-400 font-medium mt-1">
                              {new Date(item.date).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingId(item._id);
                                setAnnouncementForm({
                                  title: item.title,
                                  description: item.description,
                                  date: item.date
                                });
                              }}
                              className="border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleItemDelete('announcements', item._id)}
                              className="border border-red-200 hover:bg-red-50 text-red-600 text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- VACANCIES MODULE --- */}
            {activeTab === 'vacancies' && (
              <div className="space-y-6">

                {/* ADD JOB FORM */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                  <h3 className="text-lg font-bold text-[#0b1b3d] tracking-wide mb-6 border-b pb-2">Add New Opening</h3>
                  <form onSubmit={(e) => handleFormSubmit(e, 'vacancies', vacancyForm, setVacancyForm, initialVacancyState)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Position Title</label>
                      <input type="text" placeholder="Position Title" value={vacancyForm.title} onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Number of Slots</label>
                      <input type="text" placeholder="Number of Slots" value={vacancyForm.slots} onChange={(e) => setVacancyForm({ ...vacancyForm, slots: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none transition-all" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                        Project Name
                      </label>

                      <input
                        type="text"
                        placeholder="Project Name"
                        value={vacancyForm.project}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, project: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                        Qualification Requirements
                      </label>

                      <textarea
                        placeholder="Qualification Requirements"
                        value={vacancyForm.qualification}
                        onChange={(e) => setVacancyForm({ ...vacancyForm, qualification: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none transition-all"
                        rows="3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Stipend</label>
                      <input type="text" placeholder="Stipend" value={vacancyForm.stipend} onChange={(e) => setVacancyForm({ ...vacancyForm, stipend: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Deadline</label>
                      <input type="date" value={vacancyForm.deadline} onChange={(e) => setVacancyForm({ ...vacancyForm, deadline: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none transition-all" required />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Upload Details PDF
                      </label>

                      <div className={`w-full border border-dashed rounded-lg p-4 text-center relative transition-all cursor-pointer group ${vacancyForm.pdfFile
                        ? "border-purple-400 bg-purple-50/50"
                        : "bg-slate-50 border-slate-300 hover:border-purple-400 hover:bg-white"
                        }`}>

                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setVacancyForm({ ...vacancyForm, pdfFile: e.target.files[0] })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {/* Visual Content */}
                        <div className="space-y-1 select-none pointer-events-none">
                          <span className="text-xl block">
                            {vacancyForm.pdfFile ? '✅' : '📄'}
                          </span>
                          <p className="text-xs font-semibold text-slate-700 truncate px-2">
                            {vacancyForm.pdfFile ? vacancyForm.pdfFile.name : "Click or drag PDF to upload"}
                          </p>

                          {/* Optional: Add clear button if needed to stay perfectly aligned with previous logic */}
                          {vacancyForm.pdfFile && (
                            <p className="text-[10px] text-purple-600 font-bold uppercase mt-1">
                              Click to replace file
                            </p>
                          )}
                          {!vacancyForm.pdfFile && (
                            <p className="text-[10px] text-slate-400 font-normal">Only PDF documents allowed</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="md:col-span-2 bg-[#0b1b3d] hover:bg-[#112754] text-white py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide shadow transition-all">Publish Vacancy</button>
                  </form>
                </div>

                {/* LIST OF OPEN POSITIONS */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
                  {vacancies.map((job) => (
                    <div key={job._id} className="p-5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{job.title}</p>
                        <p className="text-sm text-slate-500">{job.project} • {job.slots} slots</p>
                        <p className="text-[10px] text-red-600 font-bold uppercase mt-1 tracking-wider">Deadline: {job.deadline}</p>
                      </div>
                      <div className="flex gap-2">
                        {job.pdfPath && <a href={`http://localhost:5000${job.pdfPath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs font-bold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">VIEW PDF</a>}
                        <button onClick={() => handleItemDelete('vacancies', job._id)} className="text-red-600 text-xs font-bold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">REMOVE</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/*--- Publications ---*/}
            {activeTab === 'publications' && (
              <>
                {/* Form Panel: Log New Entry */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm">
                  <form
                    onSubmit={(e) => handleFormSubmit(e, 'publications', publicationForm, setPublicationForm, initialPublicationState)}
                    className="space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-2">
                      <h3 className="text-lg font-bold text-[#0b1b3d]">Log Research Publication</h3>
                      <p className="text-xs text-slate-400 font-medium">Categorize and archive new academic or industrial contributions.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Publication / Paper Title</label>
                      <input
                        type="text"
                        value={publicationForm.title || ''}
                        onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors outline-none focus:border-[#0b1b3d]"
                        placeholder="e.g. High-Efficiency GaN Inverter Design for Electric Vehicles"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Authors List (In Order)</label>
                        <input
                          type="text"
                          value={publicationForm.authors || ''}
                          onChange={(e) => setPublicationForm({ ...publicationForm, authors: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors outline-none focus:border-[#0b1b3d]"
                          placeholder="e.g. Rohan Sharma, S. Belkhode, and Vinod Agarwal"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Journal / Conference / Institution (Venue)</label>
                        <input
                          type="text"
                          value={publicationForm.venue || ''}
                          onChange={(e) => setPublicationForm({ ...publicationForm, venue: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors outline-none focus:border-[#0b1b3d]"
                          placeholder="e.g. IEEE Transactions on Power Electronics / IIT Bombay"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Publication Type</label>
                        <select
                          value={publicationForm.type || 'Journal'}
                          onChange={(e) => setPublicationForm({ ...publicationForm, type: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors font-semibold text-slate-700 h-[38px] outline-none focus:border-[#0b1b3d]"
                        >
                          <option value="Journal">📕 Journal</option>
                          <option value="Conference">📘 Conference Proceeding</option>
                          <option value="Book Chapter">📖 Book Chapter</option>
                          <option value="Patent">📜 Patent Filing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Calendar Year</label>
                        <input
                          type="number"
                          value={publicationForm.year || new Date().getFullYear()}
                          onChange={(e) => setPublicationForm({ ...publicationForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors outline-none focus:border-[#0b1b3d]"
                          placeholder="YYYY"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Citation Details / Field Context</label>
                        <input
                          type="text"
                          value={publicationForm.detail || ''}
                          onChange={(e) => setPublicationForm({ ...publicationForm, detail: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors outline-none focus:border-[#0b1b3d]"
                          placeholder="vol.39 no.9 / Application filed on Jan. 6"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Reg / Patent / Document No.</label>
                        <input
                          type="text"
                          value={publicationForm.number || ''}
                          onChange={(e) => setPublicationForm({ ...publicationForm, number: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white transition-colors outline-none focus:border-[#0b1b3d]"
                          placeholder="Pat. No. 493290 / App. No."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Asset Repository Link (Optional)</label>
                      <input
                        type="url"
                        value={publicationForm.link || ''}
                        onChange={(e) => setPublicationForm({ ...publicationForm, link: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors outline-none focus:border-[#0b1b3d]"
                        placeholder="https://ieeexplore.ieee.org/document/..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#0b1b3d] hover:bg-[#112754] text-white px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase w-full sm:w-auto shadow transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Publishing details...' : 'Add Publication Record'}
                    </button>
                  </form>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="mb-6 pb-2 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-[#0b1b3d] uppercase tracking-wide">
                      Logged Lab Publications ({publications.length})
                    </h4>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6">
                    {publications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4">No publication entries found in database registry.</p>
                    ) : (
                      [
                        { id: 'Journal', name: 'Journals', accent: 'border-l-red-500 bg-red-50/30 text-red-800' },
                        { id: 'Conference', name: 'Conferences', accent: 'border-l-blue-500 bg-blue-50/30 text-blue-800' },
                        { id: 'Book Chapter', name: 'Book Chapters', accent: 'border-l-purple-500 bg-purple-50/30 text-purple-800' },
                        { id: 'Letter', name: 'Letters & Rapid Communications', accent: 'border-l-amber-500 bg-amber-50/30 text-amber-800' },
                        { id: 'Patent', name: 'Patents', accent: 'border-l-emerald-500 bg-emerald-50/30 text-emerald-800' }
                      ].map((category) => {
                        const filteredGroup = publications.filter(p => (p.type || 'Journal') === category.id);
                        if (filteredGroup.length === 0) return null;

                        return (
                          <div key={category.id} className="space-y-2">
                            {/* Category Group Section Header Banner */}
                            <div className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border-l-4 ${category.accent}`}>
                              {category.name} ({filteredGroup.length})
                            </div>

                            {/* List Container for this category */}
                            <div className="divide-y divide-slate-100 pl-2">
                              {filteredGroup.map((pub) => (
                                <div key={pub._id} className="py-3.5 flex justify-between items-start text-sm gap-4 group">
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-slate-800 leading-snug">"{pub.title}"</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">{pub.authors}</div>
                                    <div className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-2 flex-wrap">
                                      <span className="text-[#0b1b3d] bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        {pub.venue}
                                      </span>
                                      • <span>Year: {pub.year}</span>
                                      {pub.detail && (
                                        <>
                                          • <span className="italic text-slate-500">{pub.detail}</span>
                                        </>
                                      )}
                                      {pub.number && (
                                        <>
                                          • <span className="bg-slate-100 px-1 rounded text-slate-600 font-mono">{pub.number}</span>
                                        </>
                                      )}
                                      {pub.link && (
                                        <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1 font-bold">
                                          🔗 Link
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-shrink-0 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPub({ ...pub });
                                        setIsPubModalOpen(true);
                                      }}
                                      className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleItemDelete('publications', pub._id)}
                                      className="border border-red-100 bg-white hover:bg-red-50 text-red-600 text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Publication Edit Modal Workspace Overlay Container */}
                {isPubModalOpen && editingPub && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">

                      {/* Header Panel */}
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <h3 className="text-base font-bold text-[#0b1b3d]">Update Publication Log</h3>
                          <p className="text-xs text-slate-400">Modifying live database assets for this cataloged research item.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPubModalOpen(false);
                            setEditingPub(null);
                          }}
                          className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                        >
                          ✕ Close
                        </button>
                      </div>

                      {/* Self-Contained Intercept Pipeline */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setLoading(true);
                          try {
                            const editPayload = new FormData();
                            editPayload.append('type', editingPub.type || 'Journal');
                            editPayload.append('title', editingPub.title || '');
                            editPayload.append('authors', editingPub.authors || '');
                            editPayload.append('venue', editingPub.venue || '');
                            editPayload.append('year', editingPub.year || '');
                            editPayload.append('detail', editingPub.detail || '');
                            editPayload.append('number', editingPub.number || '');
                            editPayload.append('link', editingPub.link || '');

                            const response = await fetch(`${API_BASE}/publications/${editingPub._id}`, {
                              method: 'PUT',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'x-api-key': token
                              },
                              body: editPayload
                            });

                            const resData = await response.json();

                            if (response.ok || resData.success) {
                              toast.success(resData.message || 'Publication asset successfully synchronized.');
                              setIsPubModalOpen(false);
                              setEditingPub(null);
                              fetchAllData();
                            } else {
                              toast.error(resData.message || 'Server rejected publication record updates.');
                            }
                          } catch (err) {
                            console.error(err);
                            toast.error('Network failure connecting to remote database engine.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="space-y-4 text-left"
                      >
                        {/* Form Grid Row 1: Title */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Publication Title</label>
                          <input
                            type="text"
                            value={editingPub.title || ''}
                            onChange={(e) => setEditingPub({ ...editingPub, title: e.target.value })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]"
                            required
                          />
                        </div>

                        {/* Form Grid Row 2: Authors */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Authors List</label>
                          <input
                            type="text"
                            value={editingPub.authors || ''}
                            onChange={(e) => setEditingPub({ ...editingPub, authors: e.target.value })}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]"
                            placeholder="e.g. Jane Doe, John Smith"
                            required
                          />
                        </div>

                        {/* Form Grid Row 3: Venue and Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Journal / Conference Venue</label>
                            <input
                              type="text"
                              value={editingPub.venue || ''}
                              onChange={(e) => setEditingPub({ ...editingPub, venue: e.target.value })}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Type</label>
                            <select
                              value={editingPub.type || 'Journal'}
                              onChange={(e) => setEditingPub({ ...editingPub, type: e.target.value })}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white font-semibold text-slate-700 h-[38px] outline-none focus:border-[#0b1b3d]"
                            >
                              <option value="Journal">📑 Journal Article</option>
                              <option value="Conference">📢 Conference Proceeding</option>
                              <option value="Book Chapter">📖 Book Chapter</option>
                              <option value="Patent">📜 Patent Filing</option>
                            </select>
                          </div>
                        </div>

                        {/* Form Grid Row 4: Year and Tracking Reference */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Year</label>
                            <input
                              type="number"
                              value={editingPub.year || ''}
                              onChange={(e) => setEditingPub({ ...editingPub, year: e.target.value })}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Details</label>
                            <input
                              type="text"
                              value={editingPub.detail || ''}
                              onChange={(e) => setEditingPub({ ...editingPub, detail: e.target.value })}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]"
                              placeholder="Vol. 12, No. 4"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Reg / Patent / Document No.</label>
                            <input
                              type="text"
                              value={editingPub.number || ''}
                              onChange={(e) => setEditingPub({ ...editingPub, number: e.target.value })}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white outline-none focus:border-[#0b1b3d]"
                              placeholder="e.g. pp. 45-52"
                            />
                          </div>
                        </div>

                        {/* Form Grid Row 5: Document Link */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Link / URL</label>
                          <input
                            type="url"
                            value={editingPub.link || ''}
                            onChange={(e) => setEditingPub({ ...editingPub, link: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-[#0b1b3d]"
                            placeholder="https://doi.org/..."
                          />
                        </div>

                        {/* Action Controls Footer */}
                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsPubModalOpen(false);
                              setEditingPub(null);
                            }}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wide"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#0b1b3d] hover:bg-[#112754] text-white rounded-lg text-xs font-bold uppercase tracking-wide disabled:opacity-50"
                          >
                            {loading ? 'Saving adjustments...' : 'Save Publication Updates'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
            {activeTab === 'UploadImages' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Form Panel: Select and Stage New Assets */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm max-w-md mx-auto lg:mx-0">
                  <div className="border-b pb-3 mb-4">
                    <h3 className="text-lg font-bold text-[#0b1b3d]">Upload Gallery Media</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Add new facility photography directly to the homepage carousel feed.</p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await handleUpload();
                    }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="w-full">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Image File Source</label>
                        <div className={`h-44 w-full border border-dashed rounded-xl flex flex-col items-center justify-center p-4 relative group transition-all cursor-pointer ${imageForm.previewUrl ? 'border-blue-400 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                          {!imageForm.previewUrl ? (
                            <>
                              <input
                                type="file"
                                ref={galleryInputRef}
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                  const selectedFile = e.target.files[0];
                                  if (selectedFile) {
                                    setImageForm({
                                      file: selectedFile,
                                      previewUrl: URL.createObjectURL(selectedFile)
                                    });
                                  }
                                }}
                              />
                              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📸</span>
                              <p className="text-xs text-slate-500 font-semibold select-none pointer-events-none">Drop image or click here</p>
                              <p className="text-[10px] text-slate-400 select-none pointer-events-none mt-0.5">Supports: JPG, PNG, WEBP</p>
                            </>
                          ) : (
                            <div className="w-full h-full relative flex items-center justify-center">
                              <img src={imageForm.previewUrl} alt="Staged Preview" className="w-full h-full object-contain rounded-lg" />
                              <button
                                type="button"
                                onClick={() => {
                                  setImageForm({ file: null, previewUrl: '' });
                                  if (galleryInputRef.current) galleryInputRef.current.value = '';
                                }}
                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-md cursor-pointer z-20 transition-all"
                              >
                                ✕ Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading || !imageForm.file}
                          className="bg-[#0b1b3d] hover:bg-[#112754] text-white px-6 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase w-full shadow transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Processing Upload Stream...' : 'Publish to Public Slide Feed'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Management Panel: Active Media Inventory Map */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
                  <div className="pb-2 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-[#0b1b3d] uppercase tracking-wide">
                      Active Live Gallery Catalog ({photosList.length})
                    </h4>
                  </div>

                  {photosList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-xs">No images found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {photosList.map((photo, index) => (
                        <div
                          key={photo._id || `photo-${index}`}
                          className="border border-slate-100 rounded-xl bg-slate-50/50 p-3 flex flex-col justify-between group"
                        >
                          {/* Explicitly defined height for the container */}
                          <div className="w-full h-36 bg-slate-200 rounded-lg overflow-hidden relative border border-black">
                            <img
                              src={photo.url.includes('drive.google.com')
                                ? `https://lh3.googleusercontent.com/d/${photo.url.split('/d/')[1].split('/')[0]}`
                                : photo.url
                              }
                              alt={photo.caption || "Lab Asset"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.error("Image failed to load:", e.target.src);
                                // Remove the image element or set a placeholder
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>

                          <p className="text-[10px] text-slate-500 mt-2 truncate">
                            {photo.caption || "No caption"}
                          </p>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleDelete(photo._id || index)}
                              className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-md"
                            >
                              Delete Asset
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'ResetPassword' && (
              <div className="max-w-xl mx-auto bg-white p-6 shadow-md border border-slate-200/60 rounded-xl font-sans">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#0b1b3d]">Update Portal Password</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Modify the administrative account access credentials securely.
                  </p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    // Form extraction variables
                    const currentPassword = e.target.currentPassword.value;
                    const newPassword = e.target.newPassword.value;
                    const confirmPassword = e.target.confirmPassword.value;

                    // Execute centralized operation handler function
                    await handleUpdatePassword(e, currentPassword, newPassword, confirmPassword);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Current Password
                    </label>
                    <input
                      name="currentPassword"
                      type="password"
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <input
                      name="newPassword"
                      type="password"
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 text-sm font-semibold text-white bg-[#0b1b3d] hover:bg-[#112754] rounded-lg shadow transition-all cursor-pointer tracking-wide disabled:opacity-50"
                    >
                      Save Secure Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;