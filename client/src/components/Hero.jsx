// src/components/Hero.jsx
import React from 'react';
import labBgImage from '../assets/HomeImage.webp';
const Hero = () => {
  const researchTags = [
    "Power Converters",
    "EV Charging Systems",
    "SiC / GaN Devices",
    "Wireless Power Transfer",
    "Motor Drives"
  ];

  return (
    <div 
      className="w-full text-white font-sans relative overflow-hidden border-b-4 border-[#d4af37] bg-cover bg-center"
      style={{ backgroundImage: `url(${labBgImage})` }}
    >
      {/* 2. Color Overlay Layer: This blurs/darkens the image so white text pops perfectly */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d2a5e]/90 to-[#15428a]/85 mix-blend-multiply z-0"></div>

      {/* 3. Subtle Technical Blueprint Dot Grid (Optional, kept from your original code) */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] z-0"></div>

      {/* Content Container (Needs relative z-10 to sit cleanly on top of overlays) */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        
        {/* Department / Institution Label */}
        <p className="text-[#d4af37] uppercase text-[11px] sm:text-xs font-bold tracking-widest mb-3">
          Department of Electrical Engineering • IIT Roorkee
        </p>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-[40px] font-serif font-bold tracking-wide leading-tight mb-1">
          Applied Power Electronics Lab
        </h1>
        
        {/* Subtitle */}
        <h2 className="text-lg sm:text-xl text-slate-300 font-sans font-normal tracking-wide mb-6">
          (APEL) — IIT Roorkee
        </h2>

        {/* Core Vision Description */}
        <p className="max-w-3xl text-xs sm:text-sm md:text-[15px] text-slate-200 leading-relaxed font-normal mb-8 text-justify">
          Advancing the frontiers of power electronics through rigorous research in high-efficiency converters, 
          EV charging infrastructure, wide bandgap semiconductor devices, and renewable energy integration.
        </p>

        {/* Research Tags Container */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {researchTags.map((tag, index) => (
            <div 
              key={index} 
              className="border border-white/30 hover:border-white bg-white/5 hover:bg-white/10 text-[11px] sm:text-xs px-3 py-1.5 rounded-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              {tag}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Hero;