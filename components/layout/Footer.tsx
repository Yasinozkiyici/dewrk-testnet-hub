'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const footerLinks = {
  product: [
    { label: 'Testnets', href: '/testnets' },
    { label: 'About', href: '/about' }
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API', href: '/api/docs' }
  ],
  community: [
    { label: 'Twitter', href: 'https://twitter.com/dewrk', external: true },
    { label: 'GitHub', href: 'https://github.com/dewrk', external: true },
    { label: 'Discord', href: 'https://discord.gg/dewrk', external: true }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' }
  ]
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/30 bg-white/40 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center transition hover:opacity-80"
            >
              <Image src="/logo.svg" alt="Dewrk" width={100} height={32} className="h-8 w-auto" />
            </Link>
            <p className="mt-3 text-xs text-[var(--text-3)] leading-relaxed">
              Curated directory of web3 testnets and contribution paths.
            </p>
            {/* Social Links */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://twitter.com/dewrk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/60 text-[var(--text-3)] transition hover:border-[var(--mint)]/40 hover:bg-[var(--mint)]/10 hover:text-[var(--ink-1)]"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/dewrk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/60 text-[var(--text-3)] transition hover:border-[var(--mint)]/40 hover:bg-[var(--mint)]/10 hover:text-[var(--ink-1)]"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://discord.gg/dewrk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-white/60 text-[var(--text-3)] transition hover:border-[var(--mint)]/40 hover:bg-[var(--mint)]/10 hover:text-[var(--ink-1)]"
                aria-label="Discord"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink-1)]">Product</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--text-3)] transition hover:text-[var(--ink-1)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink-1)]">Resources</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--text-3)] transition hover:text-[var(--ink-1)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink-1)]">Community</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--text-3)] transition hover:text-[var(--ink-1)]"
                    >
                      {link.label}
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-xs text-[var(--text-3)] transition hover:text-[var(--ink-1)]"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/30 pt-8 sm:flex-row">
          <p className="text-xs text-[var(--text-3)]">
            © {currentYear} Dewrk. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-[var(--text-3)] transition hover:text-[var(--ink-1)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

