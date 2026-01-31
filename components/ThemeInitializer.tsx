'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/useThemeStore';

export default function ThemeInitializer() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Sincronizza il tema con il tag HTML della pagina
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null; // Non renderizza nulla, agisce solo sul DOM
}
