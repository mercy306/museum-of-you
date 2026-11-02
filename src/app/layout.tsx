import type { Metadata, Viewport } from 'next';
import { Cinzel, Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700', '900']
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic']
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'The Museum of You · A Curated Virtual Retrospective',
  description:
    'A luxury 3D interactive virtual museum dedicated to honoring memories, achievements, laughter, and an irreplaceable life journey.',
  openGraph: {
    title: 'The Museum of You · Virtual Birthday Exhibition',
    description: 'An immersive 3D luxury museum celebrating the extraordinary life and memories of someone special.',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#0c0c0e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${jakarta.variable} h-full antialiased selection:bg-[#C5A059]/30 selection:text-[#F3E5AB]`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0C] text-[#E8E4DA] font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
