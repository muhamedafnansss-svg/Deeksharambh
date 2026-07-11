import React from 'react';
import { useCeremonyStore } from '../store/useCeremonyStore';

export default function OperatorHUD() {
  const { showHUD, currentStage, isAudioPlaying } = useCeremonyStore();

  if (!showHUD) return null;

  return (
    <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-md text-white p-6 rounded-xl border border-white/10 shadow-2xl w-80 font-ui text-sm">
      <h2 className="text-gold-royal font-bold text-lg mb-4 tracking-wider">OPERATOR HUD</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-white/60">Current Stage</span>
          <span className="font-mono">{currentStage}</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-white/60">Audio Engine</span>
          <span className={isAudioPlaying ? "text-green-400" : "text-red-400"}>
            {isAudioPlaying ? "PLAYING" : "MUTED"}
          </span>
        </div>

        <div className="pt-2">
          <p className="text-white/40 text-xs mb-2 uppercase tracking-widest">Controls</p>
          <ul className="space-y-1 text-white/70 text-xs font-mono">
            <li>[SPACE] / [RIGHT] - Next Stage</li>
            <li>[H] - Toggle HUD</li>
            <li>[M] - Toggle Audio</li>
            <li>[R] - Reset Ceremony</li>
            <li>[F] - Fullscreen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
