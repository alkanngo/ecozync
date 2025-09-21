import { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit } from 'next/font/google';
import localFont from 'next/font/local';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { cn } from '@/utils/cn';
import { Analytics } from '@vercel/analytics/react';

import '@/styles/globals.css';

export const dynamic = 'force-dynamic';

const batamy = localFont({
  src: [
    {
      path: '../../public/fonts/Batamy.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Batamy.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-batamy',
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ecozync - Social Carbon Tracking PWA',
  description: 'Transform climate action into an engaging social experience. Track your carbon footprint, compete with friends, and offset your impact through our living interface PWA.',
  keywords: ['carbon tracking', 'climate action', 'social media', 'PWA', 'sustainability', 'carbon offset'],
  authors: [{ name: 'Ecozync Team' }],
  creator: 'Ecozync',
  publisher: 'Ecozync',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Ecozync - Social Carbon Tracking PWA',
    description: 'Transform climate action into an engaging social experience with our living interface design.',
    type: 'website',
    siteName: 'Ecozync',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Ecozync - Social Carbon Tracking PWA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecozync - Social Carbon Tracking PWA',
    description: 'Transform climate action into an engaging social experience.',
    images: ['/logo.png'],
  },
  manifest: '/manifest.json',
  robots: 'index, follow',
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0a1f1b',
    colorScheme: 'dark',
  }
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <body className={cn('font-sans antialiased bg-[#0a1f1b] text-[#f0fdf4]', batamy.variable, outfit.variable, jetbrainsMono.variable)}>
        <AuthProvider>
          <div className='m-auto flex h-full flex-col'>
              <AppBar />
              <main className='relative flex-1'>
                <div className='relative h-full'>{children}</div>
              </main>
              <Footer />
          </div>
              <Toaster />
              <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}

async function AppBar() {
  return (
    <header className='flex items-center justify-between py-8 lg:px-12 relative z-50 px-4 max-w-[1440px] flex-grow-0 w-full mx-auto'>
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-accent-green/10 border border-accent-green flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse">
          <Leaf className="w-4 h-4 text-accent-green" />
        </div>
        <span className="text-3xl font-semibold text-white">ecozync</span>
      </Link>

      <div className="flex items-center gap-3">
        {/* Mobile/Tablet: Show sparkle symbol */}
        <div className="block">
          <div className="w-10 h-10 rounded-full bg-accent-green/10  flex items-center justify-center">
            <span className="text-accent-green font-bold text-4xl">✦</span>
          </div>
        </div>
        
        {/* Desktop: Show buttons */}
        <div className="hidden items-center gap-3">
          <Link
            href="/login"
            className="px-7 py-3.5 rounded-full font-outfit text-[15px] bg-white/[0.03] text-text-primary border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/calculator"
            className="px-7 py-3.5 rounded-full font-outfit text-[15px] bg-accent-green text-primary-dark hover:bg-accent-green/90 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-6 lg:px-12 mt-auto relative z-10 px-4 max-w-[1440px] flex-grow-0 w-full mx-auto">
      <div className="flex justify-between items-center text-xs text-text-secondary font-mono">
        <span>© {new Date().getFullYear()} <span>ecozync</span></span>  
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
