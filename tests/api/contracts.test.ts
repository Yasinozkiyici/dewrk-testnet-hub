import { describe, expect, test } from 'vitest';
import {
  testnetListResponseSchema,
  testnetDetailResponseSchema,
  difficultyEnum,
  statusEnum
} from '@/lib/zod';

const baseTestnet = {
  id: 'test-1',
  name: 'Sample Network',
  slug: 'sample-network',
  network: 'SampleNet',
  status: statusEnum.Enum.LIVE,
  difficulty: difficultyEnum.Enum.MEDIUM,
  shortDescription: 'A concise blurb.',
  logoUrl: 'https://example.com/logo.svg',
  estTimeMinutes: 120,
  rewardType: 'USDC',
  rewardNote: 'Distributed monthly.',
  kycRequired: true,
  requiresWallet: true,
  tags: ['layer2', 'ecosystem'],
  tasksCount: 3,
  updatedAt: new Date().toISOString(),
  hasDashboard: true,
  totalRaisedUSD: '2500000',
  dashboardUrl: 'https://example.com/dashboard',
  websiteUrl: 'https://example.com',
  githubUrl: 'https://github.com/example',
  twitterUrl: 'https://twitter.com/example',
  discordUrl: 'https://discord.gg/example'
};

describe('API contract schemas', () => {
  test('list response matches schema', () => {
    const payload = {
      items: [baseTestnet],
      page: 1,
      pageSize: 20,
      total: 1
    };

    expect(() => testnetListResponseSchema.parse(payload)).not.toThrow();
  });

  test('detail response matches schema', () => {
    const detailPayload = {
      ...baseTestnet,
      heroImageUrl: 'https://example.com/hero.png',
      highlights: ['Weekly calls'],
      prerequisites: ['Basic Solidity'],
      gettingStarted: ['Clone repo', 'Run tests'],
      discordRoles: [
        {
          role: 'Contributor',
          requirement: 'Complete onboarding',
          perks: 'Community access'
        }
      ]
    };

    expect(() => testnetDetailResponseSchema.parse(detailPayload)).not.toThrow();
  });
});
