/**
 * Extended seed data for Leaderboards, Ecosystems, Guides, and API endpoints
 * This file contains credible sample data for development and testing
 */

export const leaderboardSeed = [
  {
    slug: 'top-contributors-monthly',
    title: 'Top Contributors (Monthly)',
    description: 'Most active contributors this month',
    category: 'contributors',
    metricType: 'tasks_completed',
    period: 'monthly',
    isActive: true,
    featured: true,
    displayOrder: 1,
    entries: [
      {
        rank: 1,
        entityId: '0x1234...abcd',
        entityName: 'alice.eth',
        metricValue: 127,
        change: 15.3,
        metadata: { testnetsParticipated: 8, totalReward: 2500 }
      },
      {
        rank: 2,
        entityId: '0x5678...efgh',
        entityName: 'bob.testnet',
        metricValue: 98,
        change: 8.7,
        metadata: { testnetsParticipated: 6, totalReward: 1800 }
      },
      {
        rank: 3,
        entityId: '0x9abc...ijkl',
        entityName: 'charlie.eth',
        metricValue: 84,
        change: -2.1,
        metadata: { testnetsParticipated: 5, totalReward: 1500 }
      },
      {
        rank: 4,
        entityId: '0xdef0...mnop',
        entityName: 'diana.testnet',
        metricValue: 72,
        change: 12.5,
        metadata: { testnetsParticipated: 4, totalReward: 1200 }
      },
      {
        rank: 5,
        entityId: '0x1235...qrst',
        entityName: 'eve.eth',
        metricValue: 65,
        change: 5.2,
        metadata: { testnetsParticipated: 4, totalReward: 1100 }
      }
    ]
  },
  {
    slug: 'top-projects-funding',
    title: 'Top Projects by Funding',
    description: 'Highest funded testnet projects',
    category: 'projects',
    metricType: 'funding',
    period: 'all_time',
    isActive: true,
    featured: true,
    displayOrder: 2,
    entries: [
      {
        rank: 1,
        entityId: 'layerzero',
        entityName: 'LayerZero',
        entityImage: 'https://via.placeholder.com/40',
        metricValue: 2500000,
        change: 8.2,
        metadata: { testnetCount: 3, contributors: 12500 }
      },
      {
        rank: 2,
        entityId: 'zksync-era',
        entityName: 'zkSync Era',
        entityImage: 'https://via.placeholder.com/40',
        metricValue: 1800000,
        change: 12.5,
        metadata: { testnetCount: 2, contributors: 9800 }
      },
      {
        rank: 3,
        entityId: 'optimism',
        entityName: 'Optimism',
        entityImage: 'https://via.placeholder.com/40',
        metricValue: 1500000,
        change: -3.1,
        metadata: { testnetCount: 4, contributors: 8200 }
      }
    ]
  },
  {
    slug: 'top-ecosystems-testnets',
    title: 'Top Ecosystems by Testnets',
    description: 'Ecosystems with most active testnets',
    category: 'ecosystems',
    metricType: 'testnets_launched',
    period: 'all_time',
    isActive: true,
    featured: false,
    displayOrder: 3,
    entries: [
      {
        rank: 1,
        entityId: 'arbitrum',
        entityName: 'Arbitrum',
        entityImage: 'https://via.placeholder.com/40',
        metricValue: 18,
        change: 12.5,
        metadata: { activeTestnets: 12, totalFunding: 4200000 }
      },
      {
        rank: 2,
        entityId: 'base',
        entityName: 'Base',
        entityImage: 'https://via.placeholder.com/40',
        metricValue: 15,
        change: 20.0,
        metadata: { activeTestnets: 10, totalFunding: 3800000 }
      },
      {
        rank: 3,
        entityId: 'polygon',
        entityName: 'Polygon',
        entityImage: 'https://via.placeholder.com/40',
        metricValue: 12,
        change: 8.3,
        metadata: { activeTestnets: 8, totalFunding: 2900000 }
      }
    ]
  }
];

export const ecosystemSeed = [
  {
    slug: 'arbitrum',
    name: 'Arbitrum',
    shortDescription: 'Ethereum Layer 2 scaling solution with optimistic rollups',
    description:
      'Arbitrum is a leading Ethereum Layer 2 solution that enables fast, low-cost transactions while maintaining Ethereum security. The ecosystem hosts numerous testnet programs for developers and contributors.',
    networkType: 'L2',
    logoUrl: 'https://via.placeholder.com/100',
    websiteUrl: 'https://arbitrum.io',
    twitterUrl: 'https://twitter.com/arbitrum',
    discordUrl: 'https://discord.gg/arbitrum',
    githubUrl: 'https://github.com/offchainlabs',
    totalTestnets: 18,
    totalFunding: 4200000,
    activeTestnets: 12,
    featured: true,
    displayOrder: 1
  },
  {
    slug: 'base',
    name: 'Base',
    shortDescription: 'Coinbase\'s Ethereum L2 built for the next generation of dApps',
    description:
      'Base is an Ethereum Layer 2 solution incubated by Coinbase, designed to make on-chain the next online and onboard over 1 billion users into the crypto economy.',
    networkType: 'L2',
    logoUrl: 'https://via.placeholder.com/100',
    websiteUrl: 'https://base.org',
    twitterUrl: 'https://twitter.com/base',
    discordUrl: 'https://discord.gg/base',
    githubUrl: 'https://github.com/base-org',
    totalTestnets: 15,
    totalFunding: 3800000,
    activeTestnets: 10,
    featured: true,
    displayOrder: 2
  },
  {
    slug: 'polygon',
    name: 'Polygon',
    shortDescription: 'Ethereum scaling platform connecting multiple chains',
    description:
      'Polygon is a protocol and framework for building and connecting Ethereum-compatible blockchain networks, offering multiple scaling solutions.',
    networkType: 'Sidechain',
    logoUrl: 'https://via.placeholder.com/100',
    websiteUrl: 'https://polygon.technology',
    twitterUrl: 'https://twitter.com/0xPolygon',
    discordUrl: 'https://discord.gg/polygon',
    githubUrl: 'https://github.com/maticnetwork',
    totalTestnets: 12,
    totalFunding: 2900000,
    activeTestnets: 8,
    featured: true,
    displayOrder: 3
  },
  {
    slug: 'optimism',
    name: 'Optimism',
    shortDescription: 'Low-cost, lightning-fast Ethereum L2',
    description:
      'Optimism is an Ethereum Layer 2 solution that provides instant transactions and scalable smart contracts with minimal gas fees.',
    networkType: 'L2',
    logoUrl: 'https://via.placeholder.com/100',
    websiteUrl: 'https://optimism.io',
    twitterUrl: 'https://twitter.com/optimismFND',
    discordUrl: 'https://discord.gg/optimism',
    githubUrl: 'https://github.com/ethereum-optimism',
    totalTestnets: 10,
    totalFunding: 2500000,
    activeTestnets: 6,
    featured: false,
    displayOrder: 4
  },
  {
    slug: 'scroll',
    name: 'Scroll',
    shortDescription: 'EVM-equivalent zkRollup on Ethereum',
    description:
      'Scroll is a zkRollup that provides native EVM-equivalent scaling for Ethereum, enabling seamless migration of existing dApps.',
    networkType: 'Rollup',
    logoUrl: 'https://via.placeholder.com/100',
    websiteUrl: 'https://scroll.io',
    twitterUrl: 'https://twitter.com/Scroll_ZKP',
    discordUrl: 'https://discord.gg/scroll',
    githubUrl: 'https://github.com/scroll-tech',
    totalTestnets: 8,
    totalFunding: 1800000,
    activeTestnets: 5,
    featured: false,
    displayOrder: 5
  },
  {
    slug: 'zksync',
    name: 'zkSync Era',
    shortDescription: 'Scalable, secure, and user-centric zkRollup',
    description:
      'zkSync Era is a ZK rollup that scales Ethereum with advanced cryptographic proof systems, maintaining security and decentralization.',
    networkType: 'Rollup',
    logoUrl: 'https://via.placeholder.com/100',
    websiteUrl: 'https://zksync.io',
    twitterUrl: 'https://twitter.com/zksync',
    discordUrl: 'https://discord.gg/zksync',
    githubUrl: 'https://github.com/matter-labs',
    totalTestnets: 7,
    totalFunding: 2200000,
    activeTestnets: 4,
    featured: false,
    displayOrder: 6
  }
];

export const guideSeed = [
  {
    slug: 'getting-started-testnets',
    title: 'Getting Started with Testnets',
    excerpt:
      'Learn the fundamentals of participating in testnet programs, from wallet setup to claiming rewards.',
    content: `# Getting Started with Testnets

Welcome to the world of testnets! This guide will walk you through everything you need to know to start participating in testnet programs and earning rewards.

## Prerequisites

- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Basic understanding of blockchain concepts
- Willingness to learn and contribute

## Step 1: Set Up Your Wallet

First, you'll need a Web3-compatible wallet. MetaMask is the most popular choice.

1. Download MetaMask extension for your browser
2. Create a new wallet or import an existing one
3. Secure your seed phrase in a safe place
4. Add testnet networks to your wallet

## Step 2: Find Testnets

Browse our directory to find testnets that match your interests:

- Check the **difficulty** level (Easy, Medium, Hard)
- Review **estimated time** requirements
- Look at **rewards** offered
- Verify **KYC requirements**

## Step 3: Complete Tasks

Most testnets have multiple tasks:

1. **Setup tasks**: Connect wallet, join Discord, follow socials
2. **Technical tasks**: Deploy contracts, interact with dApps
3. **Community tasks**: Create content, invite friends

## Step 4: Track Progress

Use our dashboard to track your progress across testnets:

- View completed tasks
- Monitor pending rewards
- Check leaderboard rankings

## Tips for Success

- Start with easier testnets to build confidence
- Join community Discord servers for support
- Keep your wallet secure and never share your private key
- Be patient - some rewards take time to distribute

## Need Help?

If you get stuck, check out our troubleshooting guide or reach out to the community on Discord.

Happy testing! 🚀`,
    author: 'Dewrk Team',
    category: 'getting_started',
    tags: ['beginner', 'wallet', 'setup'],
    featured: true,
    published: true,
    publishedAt: new Date('2024-01-15'),
    views: 1250,
    readingTime: 8,
    seoTitle: 'Getting Started with Testnets - Complete Guide',
    seoDescription: 'Learn how to participate in testnet programs and earn rewards with our step-by-step guide.',
    displayOrder: 1
  },
  {
    slug: 'maximizing-testnet-rewards',
    title: 'Maximizing Your Testnet Rewards',
    excerpt:
      'Advanced strategies for completing more tasks, qualifying for bonuses, and maximizing your earnings.',
    content: `# Maximizing Your Testnet Rewards

Once you're comfortable with testnets, it's time to optimize your strategy for maximum rewards.

## Strategy 1: Focus on High-Value Testnets

Not all testnets are created equal. Prioritize:

- Projects with **higher funding** (better reward pools)
- **Active communities** (faster support, better networking)
- **Clear task requirements** (less ambiguity, fewer disputes)

## Strategy 2: Batch Your Activities

Save time by doing similar tasks together:

1. **Setup day**: Set up all wallets, join all Discords
2. **Technical day**: Complete all deployment tasks
3. **Community day**: Create content, share on socials

## Strategy 3: Track Everything

Keep detailed records:

- Screenshots of completed tasks
- Transaction hashes
- Discord join dates
- Social media post links

## Strategy 4: Build Your Reputation

Long-term contributors earn more:

- Consistent participation across testnets
- Quality contributions over quantity
- Helpful community member reputation

## Common Mistakes to Avoid

- ❌ Not reading task requirements carefully
- ❌ Missing deadlines
- ❌ Not completing bonus tasks
- ❌ Ignoring community guidelines

## Reward Types

Different testnets offer different rewards:

- **Token airdrops**: Most common, distributed post-launch
- **NFT rewards**: Unique collectibles for early contributors
- **Direct payments**: Rare, but highest value
- **Governance rights**: Long-term value for DAO participants

## Timing Matters

Some testnets have limited slots:

- Apply early for better chances
- Complete tasks before deadlines
- Participate during bonus periods

## Final Tips

- Diversify across multiple testnets
- Don't put all eggs in one basket
- Stay updated on reward distribution schedules
- Be patient - rewards can take months

Good luck maximizing your rewards! 💰`,
    author: 'Advanced Contributor',
    category: 'advanced',
    tags: ['advanced', 'strategy', 'rewards'],
    featured: true,
    published: true,
    publishedAt: new Date('2024-02-01'),
    views: 890,
    readingTime: 12,
    seoTitle: 'Maximizing Testnet Rewards - Advanced Strategies',
    seoDescription: 'Learn advanced strategies to maximize your testnet earnings and optimize your participation.',
    displayOrder: 2
  },
  {
    slug: 'troubleshooting-common-issues',
    title: 'Troubleshooting Common Issues',
    excerpt:
      'Solutions to the most common problems testnet participants face, from wallet connection issues to reward claims.',
    content: `# Troubleshooting Common Issues

Encountering problems? This guide covers solutions to the most common issues.

## Wallet Connection Issues

### Problem: Wallet won't connect to testnet

**Solutions:**
1. Clear browser cache and cookies
2. Update MetaMask to latest version
3. Manually add network RPC details
4. Try different browser
5. Disable other wallet extensions temporarily

### Problem: Wrong network selected

**Solutions:**
1. Click network dropdown in wallet
2. Select correct testnet network
3. Verify chain ID matches requirements
4. Add network manually if not visible

## Task Completion Issues

### Problem: Task marked incomplete despite completion

**Solutions:**
1. Take screenshots as proof
2. Check task requirements carefully
3. Verify all steps completed
4. Contact project team via Discord
5. Submit support ticket with evidence

### Problem: Discord invite expired

**Solutions:**
1. Request new invite from project website
2. Check project's Twitter for latest invites
3. Contact community managers
4. Try alternative invite links

## Reward Claim Issues

### Problem: Rewards not showing in wallet

**Solutions:**
1. Verify reward distribution date
2. Check if you completed all requirements
3. Add token contract address manually
4. Contact project support
5. Verify wallet address used

### Problem: Claim transaction failing

**Solutions:**
1. Ensure sufficient gas on correct network
2. Check if claiming period has ended
3. Verify you're on correct network
4. Try increasing gas limit
5. Check project status page for issues

## Network-Specific Issues

### Problem: High gas fees

**Solutions:**
1. Use Layer 2 solutions when possible
2. Time transactions during low activity
3. Consider batching multiple actions
4. Use gas estimation tools

### Problem: Slow transaction confirmation

**Solutions:**
1. Increase gas price (if customizable)
2. Wait for network congestion to clear
3. Check network status pages
4. Consider using testnet faucets

## General Troubleshooting Steps

1. **Refresh and restart**: Often solves UI issues
2. **Clear cache**: Removes stale data
3. **Check documentation**: Official guides have answers
4. **Ask community**: Discord/Social media support
5. **Submit ticket**: For persistent issues

## Getting Help

- 💬 Discord: Join project Discord servers
- 📧 Email: Contact project support teams
- 🐦 Twitter: Tag projects for quick responses
- 📚 Docs: Read official documentation

Remember: Most issues are solvable with patience and persistence! 🔧`,
    author: 'Dewrk Support',
    category: 'troubleshooting',
    tags: ['troubleshooting', 'support', 'faq'],
    featured: false,
    published: true,
    publishedAt: new Date('2024-02-15'),
    views: 1560,
    readingTime: 10,
    seoTitle: 'Testnet Troubleshooting Guide',
    seoDescription: 'Solutions to common testnet issues including wallet problems, task completion, and reward claims.',
    displayOrder: 3
  }
];

export const apiEndpointSeed = [
  {
    path: '/api/testnets',
    method: 'GET',
    title: 'List Testnets',
    description: 'Retrieve a list of all testnets with optional filtering',
    category: 'testnets',
    authRequired: false,
    rateLimit: 60,
    version: 'v1',
    deprecated: false,
    exampleRequest: `curl -X GET "https://api.dewrk.com/api/testnets?status=LIVE&network=Arbitrum" \\
  -H "Accept: application/json"`,
    exampleResponse: `{
  "items": [
    {
      "id": "testnet-id",
      "slug": "layerzero-testnet",
      "name": "LayerZero Testnet",
      "network": "Arbitrum",
      "status": "LIVE",
      "totalRaisedUSD": 500000,
      "tasksCount": 12
    }
  ]
}`,
    displayOrder: 1
  },
  {
    path: '/api/testnets/[slug]',
    method: 'GET',
    title: 'Get Testnet Details',
    description: 'Retrieve detailed information about a specific testnet',
    category: 'testnets',
    authRequired: false,
    rateLimit: 60,
    version: 'v1',
    deprecated: false,
    exampleRequest: `curl -X GET "https://api.dewrk.com/api/testnets/layerzero-testnet" \\
  -H "Accept: application/json"`,
    exampleResponse: `{
  "id": "testnet-id",
  "slug": "layerzero-testnet",
  "name": "LayerZero Testnet",
  "network": "Arbitrum",
  "status": "LIVE",
  "description": "Full testnet description...",
  "tasks": [...],
  "gettingStarted": [...]
}`,
    displayOrder: 2
  },
  {
    path: '/api/leaderboards',
    method: 'GET',
    title: 'List Leaderboards',
    description: 'Get all active leaderboards with their top entries',
    category: 'leaderboards',
    authRequired: false,
    rateLimit: 30,
    version: 'v1',
    deprecated: false,
    exampleRequest: `curl -X GET "https://api.dewrk.com/api/leaderboards" \\
  -H "Accept: application/json"`,
    exampleResponse: `{
  "items": [
    {
      "id": "leaderboard-id",
      "title": "Top Contributors",
      "entries": [...]
    }
  ]
}`,
    displayOrder: 3
  },
  {
    path: '/api/ecosystems',
    method: 'GET',
    title: 'List Ecosystems',
    description: 'Retrieve all blockchain ecosystems and their statistics',
    category: 'ecosystems',
    authRequired: false,
    rateLimit: 30,
    version: 'v1',
    deprecated: false,
    exampleRequest: `curl -X GET "https://api.dewrk.com/api/ecosystems?featured=true" \\
  -H "Accept: application/json"`,
    exampleResponse: `{
  "items": [
    {
      "id": "ecosystem-id",
      "name": "Arbitrum",
      "totalTestnets": 18,
      "activeTestnets": 12,
      "totalFunding": 4200000
    }
  ]
}`,
    displayOrder: 4
  },
  {
    path: '/api/guides',
    method: 'GET',
    title: 'List Guides',
    description: 'Get published guides with filtering options',
    category: 'guides',
    authRequired: false,
    rateLimit: 30,
    version: 'v1',
    deprecated: false,
    exampleRequest: `curl -X GET "https://api.dewrk.com/api/guides?category=getting_started" \\
  -H "Accept: application/json"`,
    exampleResponse: `{
  "items": [
    {
      "id": "guide-id",
      "title": "Getting Started with Testnets",
      "excerpt": "...",
      "readingTime": 8
    }
  ]
}`,
    displayOrder: 5
  },
  {
    path: '/api/admin/testnets/upsert',
    method: 'POST',
    title: 'Create or Update Testnet',
    description: 'Admin endpoint for creating or updating testnet data',
    category: 'admin',
    authRequired: true,
    rateLimit: 10,
    version: 'v1',
    deprecated: false,
    exampleRequest: `curl -X POST "https://api.dewrk.com/api/admin/testnets/upsert" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "New Testnet", "slug": "new-testnet", ...}'`,
    exampleResponse: `{
  "success": true,
  "data": {
    "id": "new-testnet-id",
    "slug": "new-testnet"
  }
}`,
    displayOrder: 6
  }
];

