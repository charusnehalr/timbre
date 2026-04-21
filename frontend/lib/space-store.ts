import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SpaceState {
  activeSpaceId: string | null;
  setActiveSpaceId: (id: string) => void;
}

export const useSpaceStore = create<SpaceState>()(
  persist(
    (set) => ({
      activeSpaceId: null,
      setActiveSpaceId: (id) => set({ activeSpaceId: id }),
    }),
    { name: 'timbre-space' },
  ),
);
