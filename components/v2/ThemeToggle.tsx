'use client';

import React, { useEffect, useState } from 'react';
import { useHydrated } from '@/hooks/useHydrated';

type Theme = 'light' | 'dark';

const getSavedTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
};

const ThemeToggle = () => {
  const hydrated = useHydrated();
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

  };

  if (!hydrated) {
    return (
      <div className="flex size-9 items-center justify-center rounded-lg bg-[#f1f4f2] dark:bg-[#2a3a2f] sm:size-10">
        <div className="size-4 animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="group flex size-9 items-center justify-center rounded-lg bg-[#f1f4f2] text-[#121714] transition-all duration-300 hover:bg-primary/20 dark:bg-[#2a3a2f] dark:text-white sm:size-10"
      aria-label="Toggle Theme"
    >
      <span className="material-symbols-outlined transition-transform duration-500 group-hover:rotate-12">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
