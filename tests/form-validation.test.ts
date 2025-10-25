import { describe, it, expect, vi } from 'vitest';
import { testnetCreateSchema, testnetUpdateSchema } from '@/lib/zod';

describe('Form Validation Unit Tests', () => {
  describe('testnetCreateSchema', () => {
    it('should validate valid testnet data', () => {
      const validData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        shortDescription: 'A test testnet',
        estTimeMinutes: 120,
        rewardType: 'ETH',
        kycRequired: false,
        requiresWallet: true,
        tags: ['defi', 'nft'],
        categories: ['Community'],
        highlights: ['Great rewards'],
        prerequisites: ['Wallet setup'],
        gettingStarted: ['Connect wallet'],
        websiteUrl: 'https://example.com',
        twitterUrl: 'https://twitter.com/example',
        hasDashboard: true,
        dashboardUrl: 'https://dashboard.example.com',
        totalRaisedUSD: 1000000,
        discordRoles: [
          {
            role: 'Contributor',
            requirement: 'Complete tasks',
            perks: 'Early access'
          }
        ],
        tasks: [
          {
            title: 'Complete task 1',
            description: 'Do something',
            url: 'https://task.example.com',
            reward: '100 ETH',
            order: 0
          }
        ]
      };

      const result = testnetCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM'
        // Missing name
      };

      const result = testnetCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('name'))).toBe(true);
      }
    });

    it('should reject invalid status', () => {
      const invalidData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'INVALID_STATUS',
        difficulty: 'MEDIUM'
      };

      const result = testnetCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid difficulty', () => {
      const invalidData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'INVALID_DIFFICULTY'
      };

      const result = testnetCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative estTimeMinutes', () => {
      const invalidData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        estTimeMinutes: -10
      };

      const result = testnetCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid URLs', () => {
      const invalidData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        websiteUrl: 'not-a-url',
        twitterUrl: 'invalid-url'
      };

      const result = testnetCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid URLs', () => {
      const validData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        websiteUrl: 'https://example.com',
        twitterUrl: 'https://twitter.com/example',
        githubUrl: 'https://github.com/example',
        discordUrl: 'https://discord.gg/example'
      };

      const result = testnetCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate tasks array', () => {
      const validData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        tasks: [
          {
            title: 'Task 1',
            description: 'Description 1',
            url: 'https://task1.example.com',
            reward: '100 ETH',
            order: 0
          },
          {
            title: 'Task 2',
            description: 'Description 2',
            order: 1
          }
        ]
      };

      const result = testnetCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject tasks without title', () => {
      const invalidData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        tasks: [
          {
            description: 'Description without title',
            order: 0
          }
        ]
      };

      const result = testnetCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate discord roles', () => {
      const validData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        discordRoles: [
          {
            role: 'Contributor',
            requirement: 'Complete 5 tasks',
            perks: 'Early access to features'
          },
          {
            role: 'Moderator',
            requirement: 'Help community',
            perks: 'Special badge'
          }
        ]
      };

      const result = testnetCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject discord roles without role name', () => {
      const invalidData = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        discordRoles: [
          {
            requirement: 'Complete tasks',
            perks: 'Early access'
          }
        ]
      };

      const result = testnetCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('testnetUpdateSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        name: 'Updated Testnet Name',
        status: 'PAUSED'
      };

      const result = testnetUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate empty update (no changes)', () => {
      const validData = {};

      const result = testnetUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid field types', () => {
      const invalidData = {
        name: 123, // Should be string
        estTimeMinutes: 'not-a-number', // Should be number
        kycRequired: 'yes' // Should be boolean
      };

      const result = testnetUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate array fields', () => {
      const validData = {
        tags: ['defi', 'nft', 'gaming'],
        categories: ['Community', 'Gaming'],
        highlights: ['Great rewards', 'Easy to use'],
        prerequisites: ['Wallet setup', 'Basic knowledge'],
        gettingStarted: ['Connect wallet', 'Start tasks']
      };

      const result = testnetUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate social links update', () => {
      const validData = {
        websiteUrl: 'https://updated-example.com',
        twitterUrl: 'https://twitter.com/updated-example'
      };

      const result = testnetUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate tasks update', () => {
      const validData = {
        tasks: [
          {
            title: 'Updated Task 1',
            description: 'Updated description',
            url: 'https://updated-task.example.com',
            reward: '200 ETH',
            order: 0
          }
        ]
      };

      const result = testnetUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate discord roles update', () => {
      const validData = {
        discordRoles: [
          {
            role: 'Updated Contributor',
            requirement: 'Complete 10 tasks',
            perks: 'VIP access'
          }
        ]
      };

      const result = testnetUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings correctly', () => {
      const data = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        shortDescription: '',
        rewardType: '',
        tags: [],
        categories: [],
        highlights: [],
        prerequisites: [],
        gettingStarted: []
      };

      const result = testnetCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle null/undefined values', () => {
      const data = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        shortDescription: undefined, // undefined is fine
        heroImageUrl: undefined,
        logoUrl: undefined,
        estTimeMinutes: undefined,
        rewardType: undefined,
        rewardNote: undefined
      };

      const result = testnetCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      const data = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        shortDescription: longString,
        rewardNote: longString
      };

      const result = testnetCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle large numbers', () => {
      const data = {
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        estTimeMinutes: 999999,
        totalRaisedUSD: 999999999999
      };

      const result = testnetCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
