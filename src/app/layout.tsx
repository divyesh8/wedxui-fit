import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WEDXUI Fit — Become the Main Character',
  description: 'A futuristic, AI-powered fitness platform. Train like the main character of your story. Built for warriors who refuse to settle.',
  keywords: ['fitness', 'AI coach', 'workout', 'gym', 'calisthenics', 'health', 'gamification', 'Gen Z'],
  authors: [{ name: 'WEDXUI Fit' }],
  creator: 'WEDXUI Fit',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wedxui.fit',
    siteName: 'WEDXUI Fit',
    title: 'WEDXUI Fit — Become the Main Character',
    description: 'Every rep writes your legend. Every set levels you up.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WEDXUI Fit',
    description: 'The fitness platform for Gen Z warriors.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-wed-black`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
