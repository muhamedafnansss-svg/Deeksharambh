import { create } from 'zustand';

export const useCeremonyStore = create((set, get) => ({
  currentStage: 0,
  isAudioPlaying: true,
  showHUD: false,
  
  toggleHUD: () => set((state) => ({ showHUD: !state.showHUD })),
  toggleAudio: () => set((state) => ({ isAudioPlaying: !state.isAudioPlaying })),
  
  nextStage: () => set((state) => ({ currentStage: state.currentStage + 1 })),
  setStage: (stage) => set({ currentStage: stage }),
  resetCeremony: () => set({ currentStage: 0 })
}));
