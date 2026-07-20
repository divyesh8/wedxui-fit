import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';
import { ServiceWorkerRegistrar } from '@/components/providers/sw-register';

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
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'WEDXUI FIT',
    statusBarStyle: 'black-translucent',
  },
};

// Separate export per Next 14. viewportFit:'cover' is what lets the app draw
// into the notch/home-indicator area so env(safe-area-inset-*) has an effect.
export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
            <ServiceWorkerRegistrar />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
