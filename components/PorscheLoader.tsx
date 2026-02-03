import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FRAMES = [
  "https://tailormate.ai/tmcars/images/loader/1.png",
  "https://tailormate.ai/tmcars/images/loader/2.png",
  "https://tailormate.ai/tmcars/images/loader/3.png",
  "https://tailormate.ai/tmcars/images/loader/4.png",
  "https://tailormate.ai/tmcars/images/loader/5.png",
  "https://tailormate.ai/tmcars/images/loader/6.png",
  "https://tailormate.ai/tmcars/images/loader/7.png",
  "https://tailormate.ai/tmcars/images/loader/8.png",
];

const PorscheLoader: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  // 1. Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = FRAMES.length;

    FRAMES.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      // Handle error case to avoid blocking
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
    });
  }, []);

  // 2. Animation Loop
  useEffect(() => {
    if (!imagesLoaded) return;

    // Frame rotation speed (ms)
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % FRAMES.length);
    }, 120); 

    return () => clearInterval(interval);
  }, [imagesLoaded]);

  // 3. Loading Progress Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete && onComplete(), 500);
          return 100;
        }
        // Random increment for realistic feel
        const diff = Math.random() * 15;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Safely return null if images aren't ready to prevent layout shift or errors
  if (!imagesLoaded) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Container for the 360 Image - SIGNIFICANTLY SMALLER SIZE */}
      <div className="relative w-full max-w-[180px] aspect-video flex items-center justify-center mb-2">
        {FRAMES.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`Loader Frame ${index}`}
            className={`absolute w-full h-auto object-contain transition-opacity duration-0 ${
              index === currentFrame && imagesLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
                // Force images to white wireframe style
                filter: 'brightness(0) invert(1)', 
                mixBlendMode: 'screen' 
            }} 
          />
        ))}
        
        {/* Refined Glow effect behind car */}
        <div className="absolute inset-0 bg-white/5 blur-[30px] rounded-full opacity-20 animate-pulse pointer-events-none"></div>
      </div>

      {/* Loading Text & Bar - Narrower to match new scale */}
      <div className="mt-4 w-48 flex flex-col items-center">
        <div className="w-full h-[1px] bg-white/10 relative overflow-hidden mb-3">
          <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-white h-full"
            style={{ width: `${progress}%` }}
            layoutId="loaderBar"
          />
        </div>
        <div className="flex justify-between w-full text-[9px] uppercase tracking-[0.3em] text-gray-500 font-medium">
          <span>TM Cars</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default PorscheLoader;