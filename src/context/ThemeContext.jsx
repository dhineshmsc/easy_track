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
    return localStorage.getItem('themeMode') || 'dark';
  });

  const toggleColorMode = (newMode) => {
    const nextMode = newMode || (mode === 'light' ? 'dark' : 'light');
    setMode(nextMode);
    localStorage.setItem('themeMode', nextMode);
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
