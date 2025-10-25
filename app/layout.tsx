import type { Metadata } from 'next';
import '../styles/globals.css';
import { cn } from '@/lib/utils';

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
        <a
          href="#main"
          className="skip-link fixed left-4 top-4 z-50 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Skip to content
        </a>
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white/90" />
          <div className="absolute inset-0 opacity-90">
            <div className="absolute -top-24 -left-40 h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(111,214,255,0.35),transparent_70%)]" />
            <div className="absolute top-1/3 right-[-20vw] h-[55vh] w-[55vw] rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.25),transparent_70%)]" />
            <div className="absolute bottom-[-10vh] left-[-10vw] h-[45vh] w-[50vw] rounded-full bg-[radial-gradient(closest-side,rgba(251,146,60,0.18),transparent_70%)]" />
          </div>
        </div>
        <main id="main" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
