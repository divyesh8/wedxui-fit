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
  title: 'WEDXUI FIT — AI-Powered Fitness Intelligence',
  description: 'Training and nutrition engineered for you. WEDXUI FIT reasons through your physique goal, equipment, recovery, and lifestyle — then explains every decision it makes.',
  keywords: ['fitness', 'AI coach', 'workout', 'gym', 'calisthenics', 'nutrition', 'training plan', 'health'],
  authors: [{ name: 'WEDXUI FIT' }],
  creator: 'WEDXUI FIT',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wedxui.fit',
    siteName: 'WEDXUI FIT',
    title: 'WEDXUI FIT — AI-Powered Fitness Intelligence',
    description: 'Every exercise chosen for a reason. Every plan built for you.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WEDXUI FIT',
    description: 'AI-powered training and nutrition that explains itself.',
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
