import { create } from 'zustand';

interface AppState {
  selectedPlayer: string | null;
  setSelectedPlayer: (playerId: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedPlayer: null,
  setSelectedPlayer: (playerId) => set({ selectedPlayer: playerId }),
}));
