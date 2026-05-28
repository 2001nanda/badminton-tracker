import { create } from 'zustand';

interface PlayerState {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  selectedPlayerId: string | null;
  setSelectedPlayerId: (id: string | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  showAddModal: false,
  setShowAddModal: (show) => set({ showAddModal: show }),
  selectedPlayerId: null,
  setSelectedPlayerId: (id) => set({ selectedPlayerId: id }),
}));
