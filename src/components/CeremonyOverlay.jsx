import React, { useEffect, useState } from 'react';
import { useCeremonyStore } from '../store/useCeremonyStore';
import { motion, AnimatePresence } from 'framer-motion';

export const WORDS = [
  "Wisdom",
  "Discovery",
  "Innovation & Technology",
  "Excellence",
  "Sustainability",
  "Harmony",
  "Justice"
];

export default function CeremonyOverlay() {
  const { currentStage, nextStage } = useCeremonyStore();

  // Wait for tree to grow before allowing clicks
  const [canClick, setCanClick] = useState(true);
  
  // Loading dots state
  const [dots, setDots] = useState("");

  // Mobile layout detection
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animate loading dots during initialization
  useEffect(() => {
    if (currentStage === 0) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? "" : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentStage]);

  // Auto-advance only the initialization and countdown sequence
  useEffect(() => {
    // Only auto-advance stages 1, 2, 3 (Countdown)
    if (currentStage >= 1 && currentStage < 4) {
      const delay = 1200; // Countdown: 1.2s per number

      const timer = setTimeout(() => {
        nextStage();
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (currentStage === 4) {
      // Lock clicking while the tree skeletal structure completely grows (approx 7.5s)
      setCanClick(false);
      const timer = setTimeout(() => setCanClick(true), 7500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, nextStage]);

  // Handle manual clicks (keyboard, PPT clicker, or mouse) to advance the stage if allowed
  useEffect(() => {
    const handleAdvance = () => {
      if (currentStage === 0) {
        // Start the ceremony from initialization screen
        nextStage();
      } else if (canClick && currentStage >= 4 && currentStage < 13) {
        // Advance through words
        nextStage();
      }
    };

    const handleKeyDown = (e) => {
      // Common keys for advancing: Space, Right/Down Arrows, PageDown, Enter, 'N' (Next)
      const advanceKeys = [' ', 'ArrowRight', 'PageDown', 'Enter', 'ArrowDown', 'n', 'N'];
      if (advanceKeys.includes(e.key)) {
        handleAdvance();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleAdvance);
    window.addEventListener('touchstart', handleAdvance);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleAdvance);
      window.removeEventListener('touchstart', handleAdvance);
    };
  }, [currentStage, canClick, nextStage]);

  // Words follow a strict left-to-right arc. Mobile gets a tighter, taller arc to fit the portrait screen.
  const WORD_POSITIONS = isMobile ? [
    { top: "60%", left: "15%", whiteSpace: "nowrap" },  // 1. Wisdom
    { top: "45%", left: "22%", whiteSpace: "nowrap" }, // 2. Discovery
    { top: "30%", left: "35%", whiteSpace: "nowrap" }, // 3. Innovation & Technology
    { top: "18%", left: "50%", whiteSpace: "nowrap" },  // 4. Excellence (Apex)
    { top: "30%", left: "65%", whiteSpace: "nowrap" }, // 5. Sustainability
    { top: "45%", left: "78%", whiteSpace: "nowrap" }, // 6. Harmony
    { top: "60%", left: "85%", whiteSpace: "nowrap" }, // 7. Justice
  ] : [
    { top: "60%", left: "8%", whiteSpace: "nowrap" },  
    { top: "35%", left: "20%", whiteSpace: "nowrap" }, 
    { top: "18%", left: "33%", whiteSpace: "nowrap" }, 
    { top: "5%", left: "50%", whiteSpace: "nowrap" },  
    { top: "18%", left: "67%", whiteSpace: "nowrap" }, 
    { top: "35%", left: "80%", whiteSpace: "nowrap" }, 
    { top: "55%", left: "88%", whiteSpace: "nowrap" }, 
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
      <AnimatePresence>
        
        {currentStage === 0 && (
          <motion.div
            key="init"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="text-white/80 text-3xl font-subtitle tracking-widest drop-shadow-lg"
          >
            Initializing{dots}
          </motion.div>
        )}

        {currentStage === 1 && (
          <motion.div
            key="cd-3"
            initial={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="text-gold-royal text-9xl font-values font-bold drop-shadow-[0_0_50px_rgba(212,175,55,1)]"
          >
            3
          </motion.div>
        )}

        {currentStage === 2 && (
          <motion.div
            key="cd-2"
            initial={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="text-gold-royal text-9xl font-values font-bold drop-shadow-[0_0_50px_rgba(212,175,55,1)]"
          >
            2
          </motion.div>
        )}

        {currentStage === 3 && (
          <motion.div
            key="cd-1"
            initial={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 2, filter: 'blur(30px)' }}
            transition={{ duration: 0.8 }}
            className="text-ivory-warm text-9xl font-values font-bold drop-shadow-[0_0_80px_rgba(255,255,255,1)]"
          >
            1
          </motion.div>
        )}

        {/* Stage 5 to 11: Words Revealing & Staying on Screen */}
        {WORDS.map((word, index) => {
          const triggerStage = 5 + index;
          if (currentStage >= triggerStage && currentStage < 12) {
            return (
              <motion.div
                key={`word-${index}`}
                initial={{ opacity: 0, scale: 0.5, filter: 'blur(15px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(15px)' }}
                transition={{ duration: currentStage >= 12 ? 0.3 : 1.5, ease: "easeOut" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center text-gold-glow text-[10px] sm:text-base md:text-2xl lg:text-3xl font-values font-bold tracking-widest drop-shadow-[0_0_20px_rgba(243,198,35,1)] leading-snug"
                style={WORD_POSITIONS[index]}
              >
                {word}
              </motion.div>
            );
          }
          return null;
        })}

        {/* Stage 12: Finale */}
        {currentStage >= 12 && (
          <>
            <motion.div
              key="brand-mark"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              className="absolute top-4 left-4 md:top-10 md:left-10 flex items-center gap-3 md:gap-[18px] z-20"
            >
              <img
                src="/pure_crest_transparent.png"
                alt="Institute Logo"
                className="w-[50px] md:w-[78px] h-auto"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))'
                }}
              />
              <div className="flex flex-col">
                <h3 
                  className="text-[#F5EFE4] text-[18px] md:text-[30px] font-bold m-0 leading-none"
                  style={{ letterSpacing: '2px', fontFamily: '"Cinzel", "Cormorant Garamond", serif' }}
                >
                  YENEPOYA
                </h3>
                <p 
                  className="text-[10px] md:text-[13px] leading-[1.3] md:leading-[1.45] text-white/80 mt-1 md:mt-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Institute of Arts,<br />
                  Science, Commerce &<br />
                  Management
                </p>
              </div>
            </motion.div>
            <motion.div
              key="finale"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="absolute top-[20%] md:top-[8%] flex flex-col items-center w-full px-4"
            >
              <h1 className="text-ivory-warm text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-title font-bold tracking-tight drop-shadow-[0_0_50px_rgba(212,175,55,1)] text-center">
                DEEKSHARAMBHA
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                className="text-white text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-title font-bold tracking-widest drop-shadow-[0_0_50px_rgba(255,255,255,0.8)] mt-2"
              >
                2026
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 3 }}
                className="text-ivory-warm/90 text-sm sm:text-xl md:text-3xl font-subtitle italic mt-4 md:mt-6 tracking-widest drop-shadow-lg text-center"
              >
                A New Chapter Begins
              </motion.p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
