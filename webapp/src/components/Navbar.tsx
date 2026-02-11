'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme } from '@/store/slices/themeSlice';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-border bg-primary-bg/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 logo cursor-pointer hover:scale-110 hover:rotate-6 transition-transform">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center font-mono font-bold text-lg sm:text-xl text-[#0a0a0a]">
              TA
            </div>
            <span className="font-mono font-bold text-lg sm:text-xl hidden sm:inline">
              svir AI
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-border flex items-center justify-center hover:border-accent hover:scale-110 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
