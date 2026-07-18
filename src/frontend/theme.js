import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#0a84ff' : '#0066cc', // Apple blue
        dark: isDark ? '#0070e0' : '#005bb5',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0c0c0e' : '#f5f5f7', // Pure dark gray background vs light gray
        paper: isDark ? '#1c1c1e' : '#ffffff',   // Paper background
      },
      text: {
        primary: isDark ? '#ffffff' : '#1d1d1f',
        secondary: isDark ? '#8e8e93' : '#86868b',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)'
              : '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.04)',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            }
          },
          contained: {
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }
          }
        }
      }
    }
  });
};

// Default export compatibility for pages that still import appleTheme directly
const defaultTheme = getTheme('dark');
export default defaultTheme;
