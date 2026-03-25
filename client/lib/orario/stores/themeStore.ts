import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (
    theme === "system" &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const isDark = resolveTheme(theme) === "dark";
  document.documentElement.classList.toggle("dark", isDark);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: "orario-theme-storage",
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? "system");
      },
    }
  )
);

if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = () => {
    const theme = useThemeStore.getState().theme;
    if (theme === "system") {
      applyTheme(theme);
    }
  };

  syncSystemTheme();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", syncSystemTheme);
  } else {
    mediaQuery.addListener(syncSystemTheme);
  }
}
