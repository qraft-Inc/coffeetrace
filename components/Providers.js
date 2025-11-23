'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import ThemeFAB from './ThemeFAB';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <ThemeFAB />
      </ThemeProvider>
    </SessionProvider>
  );
}
