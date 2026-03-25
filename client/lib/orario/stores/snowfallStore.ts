import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SnowfallState {
  enabled: boolean;
  enableSnowfall: () => void;
  disableSnowfall: () => void;
  toggleSnowfall: () => void;
}

export const useSnowfallStore = create<SnowfallState>()(
  persist(
    (set) => ({
      enabled: false,
      enableSnowfall: () => set({ enabled: true }),
      disableSnowfall: () => set({ enabled: false }),
      toggleSnowfall: () => set((state) => ({ enabled: !state.enabled })),
    }),
    {
      name: "orario-snowfall-storage",
    }
  )
);
