import React, { useEffect, useRef } from 'react';
import { useCeremonyStore } from '../store/useCeremonyStore';
import { TreeEngine } from '../engine/TreeEngine';

export default function CeremonyCanvas() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  
  const { toggleHUD, toggleAudio, nextStage, resetCeremony, currentStage } = useCeremonyStore();

  // Initialize Canvas and Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      if (engineRef.current) {
        engineRef.current.resize(canvas.width, canvas.height, dpr);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    engineRef.current = new TreeEngine(canvas, dpr);
    engineRef.current.start();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  // Sync Store Stage with Engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setStage(currentStage);
    }
  }, [currentStage]);

  // Keyboard Controller Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'h':
        case 'H':
          toggleHUD();
          break;
        case 'm':
        case 'M':
          toggleAudio();
          break;
        case ' ':
        case 'ArrowRight':
          // Lock progression during Stage 4 until the tree is fully grown (approx 7.5s)
          if (currentStage === 4 && engineRef.current && engineRef.current.getStageTime(4) < 7.5) {
            break; 
          }
          if (currentStage >= 4 && currentStage < 12) {
            nextStage();
          }
          break;
        case 'r':
        case 'R':
          resetCeremony();
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
          } else {
            document.exitFullscreen();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHUD, toggleAudio, nextStage, resetCeremony]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full block"
      style={{ background: 'linear-gradient(to bottom, #111 0%, #1a1a1a 100%)' }} // Placeholder dark sky
    />
  );
}
