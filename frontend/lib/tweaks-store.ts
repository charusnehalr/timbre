import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ACCENT_PALETTES = {
  lime:   { accent: '#B4F24E', dim: '#7fae33', glow: 'rgba(180, 242, 78, 0.35)' },
  cyan:   { accent: '#4EE2F2', dim: '#33a9ae', glow: 'rgba(78, 226, 242, 0.35)' },
  violet: { accent: '#B48DFF', dim: '#7a5fbe', glow: 'rgba(180, 141, 255, 0.35)' },
  warm:   { accent: '#E8E5DE', dim: '#a8a59e', glow: 'rgba(232, 229, 222, 0.25)' },
} as const;

export type AccentKey = keyof typeof ACCENT_PALETTES;

interface TweaksState {
  accent: AccentKey;
  cursorEnabled: boolean;
  showMesh: boolean;
  setAccent: (a: AccentKey) => void;
  setCursorEnabled: (v: boolean) => void;
  setShowMesh: (v: boolean) => void;
}

export const useTweaksStore = create<TweaksState>()(
  persist(
    (set) => ({
      accent: 'lime',
      cursorEnabled: true,
      showMesh: true,
      setAccent: (accent) => set({ accent }),
      setCursorEnabled: (cursorEnabled) => set({ cursorEnabled }),
      setShowMesh: (showMesh) => set({ showMesh }),
    }),
    { name: 'timbre:tweaks' }
  )
);
