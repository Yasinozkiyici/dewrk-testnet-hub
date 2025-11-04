import '../styles/globals.css';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { KeyboardShortcutsHelp } from '@/components/layout/KeyboardShortcutsHelp';
import { ReferralTracker } from '@/components/analytics/ReferralTracker';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Dewrk Testnet Hub',
  description: 'Curated directory of web3 testnets and contribution paths.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-[var(--bg-soft)] text-[var(--ink-1)] antialiased',
          'relative flex min-h-screen flex-col'
        )}
      >
        <AuthProvider>
        <Script id="twitter-pixel" strategy="afterInteractive">
          {`
  !function(e,t,n,s,u,a){
    e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
    },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
    a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))
  }(window,document,'script');
  twq('config','o0abcd');
          `}
        </Script>
        <a
          href="#main"
          className="skip-link fixed left-4 top-4 z-50 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white opacity-0 transition-opacity duration-150 focus:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Skip to content
        </a>
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/75 to-white/95" />
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -top-24 -left-40 h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(111,214,255,0.25),transparent_75%)] blur-3xl" />
            <div className="absolute top-1/3 right-[-20vw] h-[55vh] w-[55vw] rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.18),transparent_75%)] blur-3xl" />
            <div className="absolute bottom-[-10vh] left-[-10vw] h-[45vh] w-[50vw] rounded-full bg-[radial-gradient(closest-side,rgba(251,146,60,0.12),transparent_75%)] blur-3xl" />
          </div>
        </div>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <KeyboardShortcutsHelp />
        <ReferralTracker />
        </AuthProvider>
      </body>
    </html>
  );
}
