import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SnowfallState {
    isEnabled: boolean;
    toggleSnowfall: () => void;
    enableSnowfall: () => void;
}

export const useSnowfallStore = create<SnowfallState>()(
    persist(
        (set) => ({
            isEnabled: false,
            toggleSnowfall: () => set((state) => ({ isEnabled: !state.isEnabled })),
            enableSnowfall: () => set({ isEnabled: true }),
        }),
        {
            name: 'snowfall-storage',
        }
    )
);
