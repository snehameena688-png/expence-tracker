import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AccentColor, FontSize, ThemeConfig, ThemeMode } from '../models/theme';

interface ThemeContextType extends ThemeConfig {
  setMode: (mode: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleMode: () => void;
}

const THEME_STORAGE_KEY = 'expansion_tracker_theme_v1';

const defaultTheme: ThemeConfig = {
  mode: 'light',
  fontSize: 'medium',
  accentColor: '#007AFF',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        return { ...defaultTheme, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load theme preferences', e);
    }
    return defaultTheme;
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save theme preferences', e);
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', config.mode);
    root.setAttribute('data-font-size', config.fontSize);
    root.style.setProperty('--color-primary', config.accentColor);
  }, [config]);

  const setMode = (mode: ThemeMode) => setConfig((prev) => ({ ...prev, mode }));
  const setFontSize = (fontSize: FontSize) => setConfig((prev) => ({ ...prev, fontSize }));
  const setAccentColor = (accentColor: AccentColor) => setConfig((prev) => ({ ...prev, accentColor }));
  const toggleMode = () => setConfig((prev) => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));

  return (
    <ThemeContext.Provider value={{ ...config, setMode, setFontSize, setAccentColor, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
