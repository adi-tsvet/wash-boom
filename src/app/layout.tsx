// app/layout.tsx or RootLayout.tsx
'use client'; // Ensure this is a Client Component

import { SessionProvider } from 'next-auth/react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Wash-BooM</title>
        <meta name="description" content="Manage washroom usage efficiently." />
      </head>
      <body>
        {/* Wrap everything in the SessionProvider */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
