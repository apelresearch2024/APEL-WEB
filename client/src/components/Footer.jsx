
import React from 'react';
import { LuChevronRight } from 'react-icons/lu';

const Footer = () => {
  return (
    <footer className="w-full bg-[#0b1b3d] text-white border-t border-slate-800 font-sans text-xs sm:text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        
        {/* Column 1: Lab Label */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-sm sm:text-base tracking-wide text-white">Applied Power Electronics Lab</h4>
          <div className="text-slate-400 space-y-1 font-light leading-relaxed text-[13px]">
            <p>Department of Electrical Engineering</p>
            <p>IIT Roorkee — 247 667</p>
            <p>Uttarakhand, India</p>
          </div>
        </div>

        {/* Column 2: Contact Information */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-sm sm:text-base tracking-wide text-white">Contact</h4>
          <div className="text-slate-400 space-y-1 font-light text-[13px]">
            <p className="hover:text-white cursor-pointer transition-colors">satish.belkhode[at]ee.iitr.ac.in</p>
            <p>+91-1332285843</p>
            <p>Room 215, EE Dept. Block</p>
          </div>
        </div>

        {/* Column 3: Quick Links */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-sm sm:text-base tracking-wide text-white">Quick Links</h4>
          <div className="text-slate-400 space-y-2 font-light text-[13px]">
            <a href="https://iitr.ac.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-white transition-colors">
              <LuChevronRight className="text-slate-500 text-xs" /> <span>IIT Roorkee Official Website</span>
            </a>
            <a href="https://ee.iitr.ac.in/" className="flex items-center space-x-1 hover:text-white cursor-pointer transition-colors">
              <LuChevronRight className="text-slate-500 text-xs" /> <span>EE Department</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;