import React, { useState, useEffect } from 'react';
import { LuMapPin, LuMail, LuPhone, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import piImage from '../assets/APEL_PI.jpeg';
import toast from 'react-hot-toast';

const HomeContent = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Gallery Dynamic State Setup
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const navigate = useNavigate();

  // 1. Fetch Live Image Gallery from Backend
  useEffect(() => {
    const fetchLiveGallery = async () => {
      try {
        const res = await fetch(`${API_BASE}/photos`);
        const result = await res.json();

        if (result.success && result.data.length > 0) {
          const processedPhotos = result.data.map(img => ({
            ...img,
            // Only prepend API_BASE if it's a relative path (doesn't start with http)
            url: img.url.startsWith('http')
              ? img.url
              : `${API_BASE.replace('/api', '')}${img.url}`
          }));
          setPhotos(processedPhotos);
        }
      } catch (err) {
        console.error("Could not fetch media library.");
      } finally {
        setLoadingPhotos(false);
      }
    };
    fetchLiveGallery();
  }, [API_BASE]);

  // 2. Fetch Announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_BASE}/announcements`);
        const result = await res.json();
        if (result.success) {
          setAnnouncements(result.data || []);
        }
      } catch (err) {
        toast.error('Unable to load announcements.');
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    fetchAnnouncements();
  }, [API_BASE]);

  // 3. Automatic Image Carousel Timer (Every 5 seconds)
  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [photos]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % photos.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="w-full bg-white text-slate-800 font-sans antialiased flex flex-col min-h-screen">

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-14 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">

          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-2 space-y-8">

            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-[#0b1b3d] border-b-2 border-slate-100 pb-3">
                About the Lab
              </h3>

              <div className="text-sm md:text-[14.5px] text-slate-600 leading-relaxed space-y-5 text-justify font-normal">
                <p>
                  The Applied Power Electronics Laboratory (APEL) at IIT Roorkee is a premier research group under the
                  Department of Electrical Engineering, led by <strong className="text-slate-900 font-semibold">Prof. Satish Shamsunder Belkhode</strong>.
                  Founded in 2024, the lab has grown into one of India's foremost institutions for research in switched-mode power conversion,
                  resonant converters, and electric vehicle power electronics.
                </p>
                <p>
                  The Applied Power Electronics Lab (APEL) at IIT Roorkee focuses on the design, control, and implementation of high-efficiency power electronic systems. Our work spans EV charging infrastructure (V2G/V2H), wide-bandgap device-based converters, advanced gate drivers, BMS power stages, and grid-interactive renewable energy systems. We aim to bridge cutting-edge research with industrial applications for real-world impact.
                </p>
              </div>
            </div>

            {/* Dynamic Image Slideshow Container */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#bfa15f]">
                Laboratory Gallery & Facilities
              </h4>

              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-900 rounded-lg overflow-hidden group border border-slate-200/60 shadow-md">
                {loadingPhotos ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 bg-slate-50 italic">
                    Loading facility assets...
                  </div>
                ) : photos.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 bg-slate-50 italic">
                    No facility media uploaded yet.
                  </div>
                ) : (
                  <>
                    <img
                      src={photos[currentSlide].url.includes('drive.google.com')
                        // Corrected: Use ${} for template literal interpolation
                        ? `https://lh3.googleusercontent.com/d/${photos[currentSlide].url.split('/d/')[1].split('/')[0]}=w800`
                        : photos[currentSlide].url
                      }
                      alt="APEL Laboratory Facility"
                      // Keep object-cover to ensure it fills the container
                      // Keep object-center so the middle of the photo is always visible
                      className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/800x400?text=Image+Load+Error";
                      }}
                    />

                    {/* Left/Right Directional Controls */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 cursor-pointer"
                        >
                          <LuChevronLeft size={18} />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 cursor-pointer"
                        >
                          <LuChevronRight size={18} />
                        </button>

                        {/* Navigation Dots */}
                        <div className="absolute bottom-4 right-4 flex space-x-1.5 bg-slate-900/40 backdrop-blur-xs px-2.5 py-1.5 rounded-full z-10">
                          {photos.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlide(index)}
                              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Laboratory Location Footer */}
            <div className="flex items-start space-x-2.5 text-xs md:text-sm text-slate-500 font-normal pt-2 border-t border-slate-100">
              <LuMapPin className="text-[#15428a] text-lg flex-shrink-0 mt-0.5" />
              <span>Room 215, Power Electronics Lab Block, Department of Electrical Engineering, IIT Roorkee — 247 667, Uttarakhand, India</span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="space-y-8">

            {/* 1. Principal Investigator Box */}
            <div className="bg-[#f4f6f9] border border-slate-200/60 p-5 rounded-sm">
              <h4 className="text-[#0b1b3d] font-serif font-bold text-base mb-4 tracking-wide">
                Principal Investigator
              </h4>
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start space-y-4 sm:space-y-0 lg:space-y-4 xl:space-y-0 sm:space-x-5 lg:space-x-0 xl:space-x-5">
                <img
                  src={piImage}
                  alt="Prof. Satish Belkhode"
                  className="w-24 h-24 object-cover rounded-sm border border-slate-200 flex-shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <h5 className="text-base font-bold text-slate-900 leading-tight truncate">Prof. Satish S. Belkhode</h5>
                  <p className="text-xs text-slate-500 font-medium">Assistant Professor, Dept. of Electrical Engineering</p>
                  <p className="text-[11px] text-slate-400 leading-tight">B.Tech (COEP) • M.Tech (NITW) • Ph.D. (IIT Bombay)</p>

                  <div className="flex flex-col space-y-1 pt-2 text-slate-600 text-xs font-normal">
                    <a href="mailto:satish.belkhode@ee.iitr.ac.in" className="flex items-center space-x-1.5 hover:text-[#15428a] group transition-colors">
                      <LuMail className="text-slate-400 group-hover:text-[#15428a] flex-shrink-0" />
                      <span className="truncate text-[11.5px]">satish.belkhode[at]ee.iitr.ac.in</span>
                    </a>
                    <div className="flex items-center space-x-1.5">
                      <LuPhone className="text-slate-400 flex-shrink-0" />
                      <span className="text-[11.5px]">+91-1332285843</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Announcements Feed */}
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-[#0b1b3d] border-b-2 border-slate-100 pb-3">
                Announcements & News
              </h3>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[380px] pr-2 space-y-1 scrollbar-thin">
                {loadingAnnouncements ? (
                  <p className="text-sm text-slate-500 italic">Loading updates...</p>
                ) : announcements.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2">No new announcements at this time.</p>
                ) : (
                  announcements.map((item) => (
                    <div key={item._id} className="py-3.5 first:pt-0 last:pb-4 group">
                      <span className="text-[11px] font-bold text-[#bfa15f] tracking-wider uppercase block mb-1">
                        {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <p className="text-xs md:text-[13.5px] text-slate-600 font-normal leading-normal group-hover:text-[#15428a] cursor-pointer transition-all">
                        <strong className="text-slate-800">{item.title}:</strong> {item.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* View All Announcements Button */}
              <button
                onClick={() => navigate('/announcements')}
                className="w-full border border-slate-700 hover:bg-slate-50 text-xs font-medium text-[#0b1b3d] py-2.5 rounded-sm transition-all tracking-wide cursor-pointer"
              >
                View All Announcements
              </button>
            </div>

          </div> {/* End Right Column */}

        </div>
      </div>

    </div>
  );
};

export default HomeContent;