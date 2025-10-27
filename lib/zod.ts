import { z } from 'zod';

export const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
export const statusEnum = z.enum(['LIVE', 'PAUSED', 'ENDED', 'UPCOMING']);

const urlField = z.string().url().min(1);

export const discordRoleSchema = z.object({
  role: z.string().min(1),
  requirement: z.string().min(1).optional(),
  perks: z.string().min(1).optional()
});

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  url: z.string().url().optional(),
  reward: z.string().optional(),
  order: z.number().int().optional()
});

export const taskResponseSchema = taskSchema.extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const testnetBaseSchema = z.object({
  // Required fields
  name: z.string().min(2, "Name must be at least 2 characters"),
  network: z.string().min(2, "Network must be at least 2 characters"),
  status: statusEnum.default('UPCOMING'),
  difficulty: difficultyEnum,
  estTimeMinutes: z.number().int().positive("Estimated time must be a positive number").optional(),
  
  // Optional reward fields
  rewardType: z.string().optional(),
  rewardNote: z.string().optional(),
  
  // Boolean flags
  kycRequired: z.boolean().default(false),
  requiresWallet: z.boolean().default(true),
  
  // Image URLs
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  heroImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  
  // Social links
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  discordUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  
  // Dashboard
  dashboardUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  hasDashboard: z.boolean().default(false),
  
  // Funding
  totalRaisedUSD: z.number().min(0, "Amount must be 0 or greater").optional(),
  
  // Array fields
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  gettingStarted: z
    .array(
      z.union([
        z.string(),
        z.object({
          title: z.string().optional(),
          body: z.string().optional(),
          url: z.string().url().optional()
        })
      ])
    )
    .default([]),
  discordRoles: z.array(discordRoleSchema).default([]),
  
  // Optional description
  shortDescription: z.string().optional(),
});

export const testnetCreateSchema = testnetBaseSchema.extend({
  tasks: z.array(taskSchema).optional()
});

export const testnetUpdateSchema = testnetBaseSchema.partial().extend({
  tasks: z.array(taskSchema).optional()
});

export const testnetListQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  status: statusEnum.optional(),
  difficulty: difficultyEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export type TestnetPayload = z.infer<typeof testnetCreateSchema>;
export type TestnetUpdatePayload = z.infer<typeof testnetUpdateSchema>;

export const testnetListItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable().optional(),
  network: z.string().nullable().optional(),
  status: statusEnum,
  difficulty: difficultyEnum.nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  estTimeMinutes: z.number().nullable().optional(),
  rewardType: z.string().nullable().optional(),
  rewardNote: z.string().nullable().optional(),
  kycRequired: z.boolean(),
  tags: z.array(z.string()),
  websiteUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  twitterUrl: z.string().nullable().optional(),
  discordUrl: z.string().nullable().optional(),
  dashboardUrl: z.string().nullable().optional(),
  tasksCount: z.number(),
  updatedAt: z.string(),
  hasDashboard: z.boolean(),
  totalRaisedUSD: z.union([z.number(), z.string()]).nullable().optional(),
  socials: z
    .object({
      twitter: z.string().optional(),
      discord: z.string().optional(),
      github: z.string().optional(),
      website: z.string().optional()
    })
    .optional()
});

export const paginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number()
});

export const testnetListResponseSchema = z.object({
  items: z.array(testnetListItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number()
});

export const testnetDetailSchema = testnetListItemSchema.extend({
  heroImageUrl: z.string().nullable().optional(),
  highlights: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  gettingStarted: z.array(z.string()).optional(),
  discordRoles: z.array(discordRoleSchema).optional(),
  tasks: z.array(taskResponseSchema).optional()
});

export const testnetDetailResponseSchema = testnetDetailSchema;

// User schemas
export const userCreateSchema = z.object({
  walletAddress: z.string().min(42).max(42),
  email: z.string().email().optional(),
  favorites: z.array(z.string()).default([]),
  progress: z.record(z.any()).optional()
});

export const userUpdateSchema = userCreateSchema.partial();

export const userSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
  email: z.string().nullable().optional(),
  favorites: z.array(z.string()),
  progress: z.record(z.any()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type UserPayload = z.infer<typeof userCreateSchema>;
export type UserUpdatePayload = z.infer<typeof userUpdateSchema>;
export type User = z.infer<typeof userSchema>;
