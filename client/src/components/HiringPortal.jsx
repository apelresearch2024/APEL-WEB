// src/components/HiringPortal.jsx
import React, { useState, useEffect } from 'react';
import { Briefcase, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const HiringPortal = () => {
  // Local state management for open roles
  const [vacancies, setVacancies] = useState([]);
  const [vacanciesLoading, setVacanciesLoading] = useState(true);

  // Form input state configurations
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contact: '',
    vacancyId: '', // Captures target MongoDB Object ID directly
    statement: ''
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Native data acquisition on initial component mounting frame
  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        setVacanciesLoading(true);
        const res = await fetch(`${API_BASE}/vacancies`);
        const result = await res.json();
        if (result.success) {
          setVacancies(result.data || []);
        }
      } catch (err) {
        console.error("Vacancies query breakdown:", err);
        // ✅ FIXED: Separated message payload into a valid template string context
        toast.error(`Error querying open vacancies: ${err.message || err}`);
      } finally {
        setVacanciesLoading(false);
      }
    };

    fetchVacancies();
  }, [API_BASE]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');

    if (!selectedFile) {
      setResumeFile(null);
      return;
    }

    // Explicit PDF format verification rule
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setFileError("Invalid format. Please upload your resume strictly in PDF format.");
      setResumeFile(null);
      e.target.value = ""; 
      return;
    }

    // 5MB payload safety threshold constraint
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5MB limit. Please compress your PDF resume.");
      setResumeFile(null);
      e.target.value = "";
      return;
    }

    setResumeFile(selectedFile);
  };

  // Standard vanilla fetch form dispatcher action
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setFileError("Please upload your PDF resume to complete the submission step.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    // Packing multipart data structures securely
    const payload = new FormData();
    payload.append('fullName', formData.fullName);
    payload.append('email', formData.email);
    payload.append('contact', formData.contact);
    payload.append('vacancyId', formData.vacancyId);
    payload.append('statement', formData.statement);
    payload.append('resume', resumeFile); 

    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        body: payload // Browser handles boundary headers automatically
      });
      
      const result = await res.json();
      
      if (res.ok || result.success) {
        setIsSubmitted(true);
        setFormData({ fullName: '', email: '', contact: '', vacancyId: '', statement: '' });
        setResumeFile(null);
        
        // ✅ CLEANUP: Explicitly reset the native file DOM input reference value
        const uploader = document.getElementById('resume-uploader');
        if (uploader) uploader.value = '';

        // Clean error feedback states upon routing success
        setSubmitError('');
        setFileError('');
        toast.success("Application package uploaded successfully!");
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        // Capture specific failure feedback strings straight from backend middlewares
        throw new Error(result.message || 'The server rejected submission parameters.');
      }
    } catch (err) {
      console.error("Form submission trace error:", err);
      // ✅ FIXED: Removed object passing parameter syntax causing native toast runtime crashes
      toast.error(`Submission processing failure: ${err.message || err}`);
      setSubmitError(err.message || 'System unable to route application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 font-sans antialiased min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-6 pt-10">

        {/* --- PORTAL HEADER PANEL --- */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Briefcase size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#0b1b3d] tracking-tight">Hiring Portal</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Current research and project openings at APEL, IIT Roorkee
              </p>
            </div>
          </div>
          <div className="h-px bg-slate-200 mt-6 w-full" />
        </div>

        {/* --- SELECTION DESK GRID SYSTEM --- */}
        <div className={`grid grid-cols-1 ${(!vacanciesLoading && vacancies.length > 0) ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-8 items-start`}>

          {/* LEFT COLUMN: LIVE ROLES FEED */}
          <div className="lg:col-span-2 space-y-6">
            {vacanciesLoading ? (
              <div className="bg-white border border-slate-200 rounded-sm p-12 text-center shadow-sm text-slate-400">
                <Loader2 className="animate-spin mx-auto text-[#0b1b3d]" size={32} />
                <p className="text-sm mt-2 font-medium">Querying open lab vacancies...</p>
              </div>
            ) : vacancies.length > 0 ? (
              vacancies.map((job) => (
                <div key={job._id} className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                  <div className="bg-[#0b1b3d] text-white px-5 py-3 flex justify-between items-center select-none">
                    <h3 className="font-sans font-bold text-[14px] sm:text-base tracking-wide">{job.title}</h3>
                    <span className="text-xs font-semibold tracking-wider text-amber-400 bg-white/10 px-2.5 py-0.5 rounded-sm">
                      {job.slots} Slots
                    </span>
                  </div>

                  <div className="p-5 space-y-3.5 text-xs sm:text-[13.5px] leading-relaxed text-slate-600 font-normal">
                    <div><strong className="text-slate-900 font-semibold">Project: </strong>{job.project}</div>
                    <div><strong className="text-slate-900 font-semibold">Qualification: </strong>{job.qualification}</div>
                    <div><strong className="text-slate-900 font-semibold">Stipend: </strong>{job.stipend}</div>
                    <div className="pt-1">
                      <strong className="text-slate-900 font-semibold">Application Deadline: </strong>
                      <span className="text-red-600 font-bold tracking-wide">{job.deadline}</span>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, vacancyId: job._id }))}
                        className="bg-[#0b1b3d] hover:bg-[#15428a] text-white text-[11px] sm:text-xs font-semibold px-4 py-2 rounded-sm transition-colors"
                      >
                        Select Position
                      </button>
                      {job.pdfPath && (
                        <a
                          href={job.pdfPath}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] sm:text-xs font-semibold px-4 py-2 rounded-sm transition-colors"
                        >
                          View Details
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-200 rounded-sm p-12 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-400">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#0b1b3d]">No Open Positions</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Currently, there are no active research openings. Please check back later.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: QUICK SUBMISSION CARD CONTAINER */}
          {!vacanciesLoading && vacancies.length > 0 && (
            <div className="space-y-6">
              <div className="bg-[#ebf1f9]/50 border border-slate-200 rounded-sm p-5 shadow-sm">
                <h4 className="text-[#0b1b3d] font-serif font-bold text-base mb-4 tracking-wide pb-1.5 border-b border-slate-200">
                  Quick Application
                </h4>

                {isSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 text-xs sm:text-sm text-center font-medium my-4">
                    🎉 Application data and your PDF resume have been safely submitted into the lab tracking repository!
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-[13px]">

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-800 outline-none focus:border-[#0b1b3d] transition-colors"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-800 outline-none focus:border-[#0b1b3d] transition-colors"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">Contact Number</label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXXXXXXX"
                        className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-800 outline-none focus:border-[#0b1b3d] transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">Position Applying For</label>
                      <select
                        name="vacancyId"
                        value={formData.vacancyId}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-2 text-slate-800 outline-none focus:border-[#0b1b3d]"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select position</option>
                        {vacancies.map((job) => (
                          <option key={job._id} value={job._id}>{job.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">
                        Upload Resume Portfolio <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="w-full bg-white border border-dashed border-slate-300 hover:border-slate-400 rounded-sm p-4 text-center relative transition-all">
                        <input
                          type="file"
                          id="resume-uploader"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          required={!resumeFile}
                          disabled={isSubmitting}
                        />
                        <div className="space-y-1 select-none">
                          <span className="text-xl block">📄</span>
                          <p className="text-xs font-semibold text-slate-700">
                            {resumeFile ? resumeFile.name : "Click to select or drag PDF file"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            Only PDF documents allowed up to 5MB size limit
                          </p>
                        </div>
                      </div>

                      {fileError && (
                        <p className="text-[11px] text-red-600 font-bold mt-1 tracking-wide animate-pulse">
                          ⚠️ {fileError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-bold">Brief Statement (max 200 words)</label>
                      <textarea
                        name="statement"
                        value={formData.statement}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Describe your research interest and relevant experience..."
                        className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-slate-800 outline-none focus:border-[#0b1b3d] transition-colors resize-none font-normal leading-normal"
                        disabled={isSubmitting}
                      />
                    </div>

                    {submitError && (
                      <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 p-2.5 rounded-sm">
                        {submitError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0b1b3d] hover:bg-[#15428a] text-white text-xs font-bold tracking-wide py-2.5 rounded-sm transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={14} /> Processing Dossier...
                        </>
                      ) : (
                        "Submit Application Data"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HiringPortal;