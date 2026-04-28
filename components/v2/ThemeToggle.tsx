'use client';

import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    
    // Apply theme to document
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Prevent hydration mismatch by not rendering the icon until client-side theme is determined
  if (theme === null) {
    return (
      <div className="size-10 flex items-center justify-center rounded-lg bg-[#f1f4f2] dark:bg-[#2a3a2f]">
        <div className="size-4 animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <button 
      onClick={toggleTheme}
      className={`size-10 flex items-center justify-center rounded-lg bg-[#f1f4f2] dark:bg-[#2a3a2f] text-[#121714] dark:text-white hover:bg-primary/20 transition-all duration-300 group`}
      aria-label="Toggle Theme"
    >
      <span className="material-symbols-outlined transition-transform duration-500 group-hover:rotate-12">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
