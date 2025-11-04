/**
 * Field-level validation rules for admin forms
 * 
 * Provides reusable validation schemas and inline error handling.
 */

import { z } from 'zod';

/**
 * Testnet validation schema
 */
export const testnetCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  network: z.string().min(1, 'Network is required').max(100),
  status: z.enum(['LIVE', 'PAUSED', 'ENDED', 'UPCOMING']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  shortDescription: z.string().max(500, 'Description too long').optional(),
  description: z.string().optional(),
  estTimeMinutes: z.number().int().min(0).optional(),
  rewardType: z.string().max(100).optional(),
  rewardNote: z.string().max(500).optional(),
  totalRaisedUSD: z.number().min(0).optional(),
  kycRequired: z.boolean(),
  requiresWallet: z.boolean(),
  hasDashboard: z.boolean(),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  discordUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  dashboardUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  heroImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags'),
  categories: z.array(z.string().max(50)).max(10, 'Too many categories'),
  highlights: z.array(z.string().max(200)).max(10, 'Too many highlights'),
  prerequisites: z.array(z.string().max(200)).max(10, 'Too many prerequisites')
});

export const testnetUpdateSchema = testnetCreateSchema.partial();

/**
 * Field validation functions for inline errors
 */
export interface ValidationRule {
  validate: (value: any) => boolean | string;
  message: string;
}

export const fieldRules: Record<string, ValidationRule[]> = {
  name: [
    {
      validate: (v) => !!v || 'Name is required',
      message: 'Name is required'
    },
    {
      validate: (v) => (v?.length ?? 0) <= 200 || 'Name too long',
      message: 'Name must be less than 200 characters'
    }
  ],
  websiteUrl: [
    {
      validate: (v) => !v || /^https?:\/\/.+/i.test(v) || 'Invalid URL',
      message: 'Must be a valid URL'
    }
  ],
  totalRaisedUSD: [
    {
      validate: (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0) || 'Must be a positive number',
      message: 'Must be a positive number'
    }
  ],
  estTimeMinutes: [
    {
      validate: (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0) || 'Must be a positive number',
      message: 'Must be a positive number'
    }
  ]
};

/**
 * Validate a single field value
 */
export function validateField(fieldName: string, value: any): string | null {
  const rules = fieldRules[fieldName] ?? [];
  for (const rule of rules) {
    const result = typeof rule.validate === 'function' ? rule.validate(value) : rule.validate;
    if (result === false || typeof result === 'string') {
      return typeof result === 'string' ? result : rule.message;
    }
  }
  return null;
}

/**
 * Validate entire form object
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: z.ZodSchema<T>
): z.ZodError | null {
  try {
    schema.parse(data);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error;
    }
    return null;
  }
}

