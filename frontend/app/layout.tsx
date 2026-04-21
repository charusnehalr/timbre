import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist' });
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'timbre — write in your voice',
  description: 'A personal voice AI that makes everything you write sound like you.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
