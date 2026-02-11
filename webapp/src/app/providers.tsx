'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from '@/store';
import { setTheme } from '@/store/slices/themeSlice';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        dispatch(setTheme(savedTheme));
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
}
