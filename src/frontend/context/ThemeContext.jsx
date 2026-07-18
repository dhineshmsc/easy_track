"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme';

const ColorModeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {}
});

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Default to dark mode if not set, or light mode
    if (typeof window !== 'undefined') {
      return localStorage.getItem('themeMode') || 'dark';
    }
    return 'dark';
  });

  const toggleColorMode = (newMode) => {
    const nextMode = newMode || (mode === 'light' ? 'dark' : 'light');
    setMode(nextMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', nextMode);
    }
  };

  const theme = getTheme(mode);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ColorModeContext);
