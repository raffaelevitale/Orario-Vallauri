'use client';

import { useThemeStore } from '@/lib/orario/stores/themeStore';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
    );
  }

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Chiaro';
      case 'dark':
        return 'Scuro';
      case 'system':
        return 'Sistema';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all"
      title={`Tema: ${getLabel()}`}
    >
      <span className="text-sm">{getIcon()}</span>
      <span className="text-xs font-medium text-gray-900 dark:text-white hidden sm:inline">
        {getLabel()}
      </span>
    </button>
  );
}
