export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Status = 'LIVE' | 'PAUSED' | 'ENDED' | 'UPCOMING';

export type DiscordRole = {
  role: string;
  requirement?: string | null;
  perks?: string | null;
};

export type Socials = {
  websiteUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
};

export type TestnetListItem = {
  slug: string;
  name: string;
  network?: string | null;
  status?: string | null;
  difficulty?: string | null;
  estTimeMinutes?: number | null;
  rewardType?: string | null;
  rewardNote?: string | null;
  kycRequired?: boolean | null;
  tags?: string[] | null;
  tasksCount?: number | null;
  updated?: string | null;
  totalRaisedUSD?: number | null;
  hasDashboard?: boolean | null;
  logoUrl?: string | null;
};

export type TestnetDetail = {
  slug: string;
  name: string;
  network?: string | null;
  status?: string | null;
  difficulty?: string | null;
  estTimeMinutes?: number | null;
  rewardType?: string | null;
  rewardNote?: string | null;
  kycRequired?: boolean | null;
  requiresWallet?: boolean | null;
  tags?: string[] | null;
  categories?: string[] | null;
  highlights?: string[] | null;
  prerequisites?: string[] | null;
  gettingStarted?: Array<{ title?: string; body?: string; url?: string }> | null;
  socials?: Socials | null;
  dashboardUrl?: string | null;
  hasDashboard?: boolean | null;
  totalRaisedUSD?: number | null;
  discordRoles?: DiscordRole[] | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  tasksCount?: number | null;
  updated?: string | null;
  created?: string | null;
};
