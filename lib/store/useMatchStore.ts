import { create } from 'zustand';

interface MatchState {
  lastMatchId: string | null;
  setLastMatchId: (id: string | null) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  lastMatchId: null,
  setLastMatchId: (id) => set({ lastMatchId: id }),
  isSubmitting: false,
  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
}));
