import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'corporate' | 'luxury';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'corporate',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'corporate' ? 'luxury' : 'corporate' 
      })),
    }),
    {
      name: 'conan-theme-storage',
    }
  )
);
