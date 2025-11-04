export interface TestnetListRow {
  id: string;
  name: string;
  slug: string;
  network?: string | null;
  status?: 'LIVE' | 'TBA' | 'ENDED' | 'UPCOMING';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  shortDescription?: string | null;
  logoUrl?: string | null;
  estTimeMinutes?: number | null;
  rewardType?: string | null;
  rewardNote?: string | null;
  rewardCategory?: string | null;
  rewardRangeUSD?: number | string | null;
  hasFaucet?: boolean | null;
  kycRequired?: boolean | null;
  requiresWallet?: boolean | null;
  tags?: string[] | null;
  tasksCount?: number | null;
  discordRolesCount?: number | null;
  updatedAt?: string | null;
  startDate?: string | null;
  hasDashboard?: boolean | null;
  totalRaisedUSD?: number | string | null;
  dashboardUrl?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
}

export interface GettingStartedItem {
  title: string;
  body?: string;
  url?: string;
}

export interface DiscordRoleItem {
  role: string;
  requirement?: string;
  perks?: string;
}

export interface DetailTask {
  id?: string;
  title: string;
  description?: string;
  url?: string;
  reward?: string;
  order?: number;
}

export interface TestnetDetailRecord {
  id?: string;
  slug: string;
  name: string;
  network?: string | null;
  status?: 'LIVE' | 'TBA' | 'ENDED' | 'UPCOMING';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  shortDescription?: string | null;
  description?: string | null;
  tags?: string[] | null;
  categories?: string[] | null;
  highlights?: string[] | null;
  prerequisites?: string[] | null;
  estTimeMinutes?: number | string | null;
  rewardType?: string | null;
  rewardNote?: string | null;
  rewardCategory?: string | null;
  rewardRangeUSD?: number | string | null;
  hasFaucet?: boolean | null;
  startDate?: string | null;
  kycRequired?: boolean | null;
  requiresWallet?: boolean | null;
  totalRaisedUSD?: number | string | null;
  hasDashboard?: boolean | null;
  dashboardUrl?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  tasksCount?: number | null;
  updatedAt?: string | null;
  socials: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
  };
  gettingStarted: GettingStartedItem[];
  discordRoles: DiscordRoleItem[];
  tasks: DetailTask[];
}
