import React from 'react';
import { ThemeContextProvider } from '../frontend/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import '../index.css';

export const metadata = {
  title: 'Easy Track',
  description: 'Your Productivity Partner',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeContextProvider>
          <Toaster position="top-right" />
          {children}
        </ThemeContextProvider>
      </body>
    </html>
  );
}
