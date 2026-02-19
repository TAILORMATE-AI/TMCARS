import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  stockCount: number;
}

const Hero: React.FC<HeroProps> = () => {
  const navigate = useNavigate();

  // "Beveled" Shape for the Obsidian Theme
  // Cut corners: Top-Left and Bottom-Right
  const clipPathValue = "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)";

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <header className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center font-sans bg-[#020202]">

      {/* Layer 0: Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          src="https://zabrdslxbnfhcnqxbvzz.supabase.co/storage/v1/object/public/images/tm-cars-header.webp"
          alt="TM CARS Showroom"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Layer 1a: Bottom Fade Gradient Overlay (Full Height) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-[#020202] z-[1] pointer-events-none" />

      {/* Layer 1b: Top Fade Gradient Overlay (50% Size) */}
      {/* Opacity lowered to 80% on mobile (lowered by 20%), 100% on desktop */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#020202] to-transparent z-[1] pointer-events-none opacity-80 md:opacity-100" />

      {/* Layer 2: Atmospheric Mist (Subtle Living Glow) */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] bg-white/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-2 mix-blend-overlay"
      />

      {/* Layer 3: Centered Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 max-w-[1400px] mx-auto mt-0">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-12 bg-gradient-to-r from-gray-200 via-white to-gray-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] pb-4 px-2"
        >
          De juiste match<br className="hidden md:block" /> voor elke weg,<br className="hidden md:block" /> voor elk budget
        </motion.h1>

        {/* OBSIDIAN TECH CTA BUTTON */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          onClick={() => navigate('/collectie')}
          className="relative group cursor-pointer border-none outline-none bg-transparent p-0"
        >
          <div className="relative">
            {/* 1. Outer Border Layer (The White Outline) */}
            <div
              className="absolute inset-0 bg-white/30 transition-colors duration-500 ease-out group-hover:bg-white"
              style={{ clipPath: clipPathValue }}
            />

            {/* 2. Inner Glass Layer (Inset 1px to create border effect) */}
            <div
              className="absolute inset-[1px] bg-black/40 backdrop-blur-md transition-colors duration-500 ease-out group-hover:bg-white"
              style={{ clipPath: clipPathValue }}
            />

            {/* 3. Text Content Layer (Defines size) */}
            <div className="relative px-12 py-5 z-10 flex items-center justify-center">
              <span className="text-[0.7rem] font-bold text-white tracking-[0.25em] uppercase select-none transition-colors duration-500 ease-out group-hover:text-black">
                Bekijk onze wagens
              </span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, x: "-50%" }}
        animate={{ opacity: 1, y: [0, 10, 0], x: "-50%" }}
        transition={{ delay: 2.5, duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 text-white/50 z-20 cursor-pointer hover:text-white transition-colors p-4"
        onClick={handleScrollDown}
      >
        <ChevronDown size={32} />
      </motion.div>
    </header>
  );
};

export default Hero;