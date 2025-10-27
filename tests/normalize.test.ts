import { describe, expect, it } from 'vitest';
import { normalizeTestnetDetail, normalizeGettingStarted, normalizeDiscordRoles } from '@/components/testnets/normalize';

describe('testnet normalization', () => {
  it('normalizes string-based getting started steps', () => {
    const steps = normalizeGettingStarted(['Install deps', 'Submit PR']);
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({ title: 'Step 1', body: 'Install deps', url: undefined });
    expect(steps[1].title).toBe('Step 2');
  });

  it('parses JSON getting started payload', () => {
    const payload = JSON.stringify([
      { title: 'Clone repo', body: 'Use git clone', url: 'https://example.com/guide' },
      { body: 'Run tests' }
    ]);
    const steps = normalizeGettingStarted(payload);
    expect(steps[0]).toEqual({ title: 'Clone repo', body: 'Use git clone', url: 'https://example.com/guide' });
    expect(steps[1].title).toBe('Step 2');
  });

  it('normalizes discord roles with optional fields', () => {
    const roles = normalizeDiscordRoles([
      { role: 'Contributor', requirement: 'Ship 1 PR', perks: 'Discord badge' },
      { role: 'Observer' }
    ]);
    expect(roles).toHaveLength(2);
    expect(roles[0]).toEqual({ role: 'Contributor', requirement: 'Ship 1 PR', perks: 'Discord badge' });
    expect(roles[1]).toEqual({ role: 'Observer', requirement: undefined, perks: undefined });
  });

  it('normalizes detail record and strips invalid values', () => {
    const detail = normalizeTestnetDetail({
      slug: 'demo',
      name: 'Demo Testnet',
      status: 'LIVE',
      difficulty: 'MEDIUM',
      gettingStarted: ['Install wallet'],
      discordRoles: [{ role: 'Contributor', requirement: 'Apply' }],
      tasks: [{ title: 'Submit transaction', reward: '50 points' }]
    });

    expect(detail.slug).toBe('demo');
    expect(detail.gettingStarted).toHaveLength(1);
    expect(detail.discordRoles[0].requirement).toBe('Apply');
    expect(detail.tasks[0].title).toBe('Submit transaction');
  });
});
