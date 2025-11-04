import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type FooterLink = {
  label: string;
  href: Route | string;
  external?: boolean;
};

const PRODUCT_LINKS: FooterLink[] = [
  { label: 'Testnets', href: '/testnets' },
  { label: 'Ecosystems', href: '/ecosystems' },
  { label: 'API', href: '/api', external: true },
  { label: 'Dashboard', href: '/dashboard' }
];

const RESOURCES_LINKS: FooterLink[] = [
  { label: 'Learn', href: '/learn' },
  { label: 'Guides', href: '/guides' },
  { label: 'Status', href: '/status', external: true }
];

const COMMUNITY_LINKS: FooterLink[] = [
  { label: 'Discord', href: 'https://discord.gg/dewrk', external: true },
  { label: 'Twitter', href: 'https://twitter.com/dewrk', external: true },
  { label: 'GitHub', href: 'https://github.com/dewrk', external: true }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/30 bg-white/60 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--ink-1)]">
              Product
            </h3>
            <nav aria-label="Product links" className="flex flex-col gap-2">
              {PRODUCT_LINKS.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--ink-1)]">
              Resources
            </h3>
            <nav aria-label="Resources links" className="flex flex-col gap-2">
              {RESOURCES_LINKS.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--ink-1)]">
              Community
            </h3>
            <nav aria-label="Community links" className="flex flex-col gap-2">
              {COMMUNITY_LINKS.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-[var(--ink-3)]">
              <Image
                src="/logo.svg"
                alt="Dewrk"
                width={128}
                height={64}
                className="h-8 w-16"
              />
              <span className="text-xs">© {new Date().getFullYear()}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-[var(--ink-3)]">
              <a
                href="/terms"
                className="transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              >
                Terms
              </a>
              <a
                href="/privacy"
                className="transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              >
                Privacy
              </a>
              <a
                href="/cookies"
                className="transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ label, href, external }: FooterLink) {
  const content = (
    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--ink-2)] transition hover:text-[var(--ink-1)]">
      {label}
      {external && <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />}
    </span>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href as Route}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
    >
      {content}
    </Link>
  );
}

