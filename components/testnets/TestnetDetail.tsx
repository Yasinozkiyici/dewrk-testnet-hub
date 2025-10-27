'use client';

import {
  ArrowUpRight,
  ExternalLink,
  Globe,
  Github,
  MessageCircle,
  Shield,
  ShieldCheck,
  Twitter,
  Wallet
} from 'lucide-react';
import { formatTimeMinutes, formatUpdatedAt, formatUSD, safeUrl } from '@/lib/format';
import { DIFFICULTY_VARIANTS, NA_CHIP_CLASS, STATUS_VARIANTS, TAG_CHIP_CLASS, cn } from '@/lib/ui';
import type { TestnetDetailRecord } from './types';
import { ProjectLogo } from './ProjectLogo';

interface TestnetDetailProps {
  testnet: TestnetDetailRecord;
  variant?: 'drawer' | 'page';
}

const SOCIAL_ICONS = {
  website: Globe,
  github: Github,
  twitter: Twitter,
  discord: MessageCircle
} as const;

export function TestnetDetail({ testnet, variant = 'page' }: TestnetDetailProps) {
  const status = testnet.status ?? 'UPCOMING';
  const difficulty = testnet.difficulty ?? 'MEDIUM';
  const funding = formatUSD(testnet.totalRaisedUSD);
  const estTime = formatTimeMinutes(testnet.estTimeMinutes);
  const updated = formatUpdatedAt(testnet.updatedAt);
  const kycLabel = testnet.kycRequired ? 'KYC required' : 'No KYC';
  const walletLabel = testnet.requiresWallet ? 'Wallet required' : 'Wallet optional';
  const tasksCount = typeof testnet.tasksCount === 'number' ? testnet.tasksCount : testnet.tasks.length;

  const hasHighlights = Array.isArray(testnet.highlights) && testnet.highlights.length > 0;
  const hasPrerequisites = Array.isArray(testnet.prerequisites) && testnet.prerequisites.length > 0;
  const hasSocials = Boolean(
    testnet.socials.website || testnet.socials.github || testnet.socials.twitter || testnet.socials.discord
  );

  return (
    <div className={cn('flex flex-col gap-6', variant === 'drawer' ? 'pb-10' : 'pb-16')}>
      <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-1 items-start gap-4">
            <ProjectLogo
              name={testnet.name}
              slug={testnet.slug}
              logoUrl={testnet.logoUrl}
              websiteUrl={testnet.socials.website}
              githubUrl={testnet.socials.github}
              size={64}
              roundedClassName="rounded-2xl"
            />
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-[var(--ink-1)]">{testnet.name}</h1>
                {testnet.network && <span className={TAG_CHIP_CLASS}>{testnet.network}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={STATUS_VARIANTS[status] ?? STATUS_VARIANTS.UPCOMING}>{status}</span>
                <span className={DIFFICULTY_VARIANTS[difficulty] ?? DIFFICULTY_VARIANTS.MEDIUM}>{difficulty}</span>
                <span className={TAG_CHIP_CLASS}>{kycLabel}</span>
                <span className={TAG_CHIP_CLASS}>{walletLabel}</span>
              </div>
            </div>
          </div>
          {testnet.hasDashboard && testnet.dashboardUrl && (
            <a
              href={safeUrl(testnet.dashboardUrl) ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--ink-1)] shadow-sm transition hover:border-white/70 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            >
              Open dashboard <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>

        {testnet.shortDescription && (
          <p className="mt-4 text-sm text-[var(--ink-2)]">{testnet.shortDescription}</p>
        )}
        {Array.isArray(testnet.tags) && testnet.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {testnet.tags.map((tag) => (
              <span key={tag} className={TAG_CHIP_CLASS}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-4 text-xs text-[var(--ink-3)] sm:grid-cols-2">
          <MetaStat label="Estimated time" value={estTime === 'N/A' ? null : estTime} />
          <MetaStat
            label="Reward"
            value={testnet.rewardType ?? null}
            helper={testnet.rewardNote ?? undefined}
          />
          <MetaStat label="Tasks" value={tasksCount ? `${tasksCount}` : null} />
          <MetaStat label="Updated" value={updated.iso ? updated.relative : null} title={updated.iso} />
        </div>
      </section>

      {(hasHighlights || hasPrerequisites) && (
        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
          <div className="grid gap-6 md:grid-cols-2">
            {hasHighlights && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink-1)]">Highlights</h2>
                <ul className="mt-3 space-y-2 text-sm text-[var(--ink-2)]">
                  {testnet.highlights!.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--mint)]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasPrerequisites && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink-1)]">Prerequisites</h2>
                <ul className="mt-3 space-y-2 text-sm text-[var(--ink-2)]">
                  {testnet.prerequisites!.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--mint)]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {( !funding.isEmpty || hasSocials || (testnet.hasDashboard && testnet.dashboardUrl) ) && (
        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--ink-3)]">Total raised</p>
              {funding.isEmpty ? (
                <span className={NA_CHIP_CLASS}>N/A</span>
              ) : (
                <p className="text-xl font-semibold text-[var(--ink-1)]">{funding.display}</p>
              )}
            </div>
            {testnet.dashboardUrl && testnet.hasDashboard && (
              <a
                href={safeUrl(testnet.dashboardUrl) ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--ink-1)] transition hover:border-white/70 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              >
                Open dashboard <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>

          {hasSocials && (
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--ink-2)]">
              {(['website', 'github', 'twitter', 'discord'] as const).map((key) => {
                const href = testnet.socials[key];
                if (!href) return null;
                const Icon = SOCIAL_ICONS[key];
                const label = key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold text-[var(--ink-2)] transition hover:border-white/60 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </a>
                );
              })}
            </div>
          )}
        </section>
      )}

      {testnet.gettingStarted.length > 0 && (
        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
          <h2 className="text-sm font-semibold text-[var(--ink-1)]">Getting started</h2>
          <ol className="mt-4 space-y-4 text-sm text-[var(--ink-2)]">
            {testnet.gettingStarted.map((step, index) => (
              <li key={`${step.title}-${index}`} className="flex gap-3">
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mint)]/70 text-xs font-semibold text-[var(--ink-1)]">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-[var(--ink-1)]">{step.title}</p>
                  {step.body && <p>{step.body}</p>}
                  {step.url && (
                    <a
                      href={safeUrl(step.url) ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ink-2)]"
                    >
                      View guide <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {testnet.discordRoles.length > 0 && (
        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
          <h2 className="text-sm font-semibold text-[var(--ink-1)]">Discord roles</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/40">
            <table className="w-full border-collapse text-sm text-[var(--ink-2)]">
              <thead className="bg-white/80 text-xs uppercase tracking-wide text-[var(--ink-3)]">
                <tr>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Requirement</th>
                  <th className="px-4 py-3 text-left">Perks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/30">
                {testnet.discordRoles.map((role) => (
                  <tr key={role.role}>
                    <td className="px-4 py-3 font-semibold text-[var(--ink-1)]">{role.role}</td>
                    <td className="px-4 py-3">{role.requirement ?? '—'}</td>
                    <td className="px-4 py-3">{role.perks ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {testnet.tasks.length > 0 && (
        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
          <h2 className="text-sm font-semibold text-[var(--ink-1)]">Tasks</h2>
          <ul className="mt-4 space-y-4 text-sm text-[var(--ink-2)]">
            {testnet.tasks.map((task) => (
              <li key={task.id ?? task.title} className="rounded-2xl border border-white/30 bg-white/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[var(--ink-1)]">{task.title}</p>
                  {task.reward && <span className={TAG_CHIP_CLASS}>Reward: {task.reward}</span>}
                </div>
                {task.description && <p className="mt-2 text-[var(--ink-2)]">{task.description}</p>}
                {task.url && (
                  <a
                    href={safeUrl(task.url) ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--ink-2)]"
                  >
                    Open task <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function MetaStat({
  label,
  value,
  helper,
  title
}: {
  label: string;
  value: string | null;
  helper?: string;
  title?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[var(--ink-3)]">{label}</p>
      {value ? (
        <p className="text-sm font-semibold text-[var(--ink-1)]" title={title}>
          {value}
        </p>
      ) : (
        <span className={NA_CHIP_CLASS}>N/A</span>
      )}
      {helper && <p className="mt-1 text-[var(--ink-3)]">{helper}</p>}
    </div>
  );
}
