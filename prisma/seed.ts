import { PrismaClient, Difficulty, Status } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  await prisma.testnet.deleteMany();
  await prisma.user.deleteMany();

  const entries = [
    {
      name: 'Citrea',
      network: 'Bitcoin L2',
      status: Status.LIVE,
      difficulty: Difficulty.MEDIUM,
      shortDescription: 'Bitcoin L2 ZK rollup testnet program',
      heroImageUrl: null,
      logoUrl: '/logos/citrea.svg',
      estTimeMinutes: 25,
      rewardType: 'Points',
      rewardNote: 'Early supporter rewards and exclusive access',
      kycRequired: false,
      requiresWallet: true,
      tags: ['L2', 'ZK', 'Bitcoin'],
      categories: ['Infrastructure', 'ZK'],
      highlights: ['Bitcoin security', 'ZK rollup technology', 'Early access'],
      prerequisites: ['Basic Bitcoin knowledge', 'Wallet setup'],
      gettingStarted: [
        'Connect your wallet to Citrea testnet',
        'Complete getting started tasks',
        'Explore the Citrea ecosystem'
      ],
      websiteUrl: 'https://citrea.xyz',
      githubUrl: 'https://github.com/citrea-xyz',
      twitterUrl: 'https://x.com/citrea_xyz',
      discordUrl: 'https://discord.gg/citrea',
      dashboardUrl: 'https://testnet.citrea.xyz',
      hasDashboard: true,
      totalRaisedUSD: 5000000,
      discordRoles: [
        {
          role: 'Early Supporter',
          requirement: 'Join Discord and complete onboarding',
          perks: 'Exclusive badge and early access'
        }
      ],
      tasks: [
        {
          title: 'Getting Started',
          url: 'https://docs.citrea.xyz/start',
          reward: '100 Points'
        },
        {
          title: 'Complete first transaction',
          url: 'https://testnet.citrea.xyz',
          reward: '250 Points'
        }
      ]
    },
    {
      name: 'Aurora Builders Program',
      network: 'Aurora',
      status: Status.LIVE,
      difficulty: Difficulty.MEDIUM,
      shortDescription: 'Deploy EVM compatible contracts and ship infra tooling on Aurora.',
      heroImageUrl: null,
      logoUrl: '/logos/aurora.svg',
      estTimeMinutes: 180,
      rewardType: 'USDC',
      rewardNote: 'Monthly evaluation based on contribution impact.',
      kycRequired: false,
      requiresWallet: true,
      tags: ['ecosystem', 'evm', 'grants'],
      categories: ['DeFi', 'Infrastructure'],
      highlights: ['Weekly office hours', 'Preferred access to Aurora Ventures'],
      prerequisites: ['Solidity experience', 'Familiarity with Aurora CLI'],
      gettingStarted: [
        'Clone the starter repo and install dependencies.',
        'Deploy contract using Aurora CLI to testnet.',
        'Submit a progress report via the dashboard.'
      ],
      websiteUrl: 'https://aurora.dev',
      githubUrl: 'https://github.com/aurora-is-near',
      twitterUrl: 'https://x.com/auroraisnear',
      discordUrl: 'https://discord.gg/aurora',
      dashboardUrl: 'https://dashboard.aurora.dev',
      hasDashboard: true,
      totalRaisedUSD: 2500000,
      discordRoles: [
        {
          role: 'Aurora Builder',
          requirement: 'Complete at least one milestone',
          perks: 'Private research drops'
        }
      ],
      tasks: [
        {
          title: 'Deploy starter contract',
          url: 'https://docs.aurora.dev/deploy',
          reward: '50 USDC'
        },
        {
          title: 'Submit onboarding form',
          reward: 'Access to mentors'
        }
      ]
    },
    {
      name: 'Celestia Data Availability Quest',
      network: 'Celestia',
      status: Status.UPCOMING,
      difficulty: Difficulty.HARD,
      shortDescription: 'Benchmark modular rollup integrations with Celestia DA.',
      logoUrl: '/logos/celestia.svg',
      estTimeMinutes: 360,
      rewardType: 'TIA',
      rewardNote: 'Tiered based on throughput benchmarks.',
      kycRequired: false,
      requiresWallet: true,
      tags: ['research', 'rollups'],
      categories: ['Infrastructure'],
      highlights: ['Hardware credits', 'Research grants'],
      prerequisites: ['Rust experience', 'Celestia light node setup'],
      gettingStarted: [
        'Provision a light node using the scripts provided.',
        'Record benchmark metrics and push to the shared repo.'
      ],
      websiteUrl: 'https://celestia.org',
      githubUrl: 'https://github.com/celestiaorg',
      twitterUrl: 'https://x.com/CelestiaOrg',
      discordUrl: 'https://discord.gg/bRyq6EK4',
      hasDashboard: false,
      totalRaisedUSD: 4200000,
      discordRoles: [
        {
          role: 'DA Researcher',
          requirement: 'Publish throughput results',
          perks: 'Co-author research blogposts'
        }
      ],
      tasks: [
        {
          title: 'Sync light node',
          reward: 'Role eligibility'
        },
        {
          title: 'Run benchmark suite',
          reward: '500 TIA stipend'
        }
      ]
    },
    {
      name: 'ZkSync Contributors',
      network: 'ZkSync',
      status: Status.LIVE,
      difficulty: Difficulty.EASY,
      shortDescription: 'Create educational content and tooling for zkSync Era testnet.',
      logoUrl: '/logos/zksync.svg',
      estTimeMinutes: 90,
      rewardType: 'Points',
      rewardNote: 'Redeemable for swag and event invites.',
      kycRequired: true,
      requiresWallet: true,
      tags: ['education', 'content'],
      categories: ['Community'],
      highlights: ['Content amplification', 'Travel grants'],
      prerequisites: ['Publish one tutorial'],
      gettingStarted: [
        'Draft an outline and submit for approval.',
        'Record or write the tutorial and share assets.'
      ],
      websiteUrl: 'https://zksync.io',
      twitterUrl: 'https://x.com/zksync',
      discordUrl: 'https://discord.gg/zksync',
      dashboardUrl: 'https://contributors.zksync.io',
      hasDashboard: true,
      totalRaisedUSD: 1800000,
      discordRoles: [],
      tasks: [
        {
          title: 'Submit tutorial outline',
          reward: 'Review within 48h'
        },
        {
          title: 'Publish tutorial',
          reward: 'Content Pioneer role'
        }
      ]
    }
  ];

  for (const entry of entries) {
    const { tasks, discordRoles, ...testnetData } = entry;
    const slug = slugify(entry.name, { lower: true, strict: true });

    const created = await prisma.testnet.create({
      data: {
        ...testnetData,
        slug,
        discordRoles: discordRoles ?? undefined
      }
    });

    if (tasks?.length) {
      for (const [order, task] of tasks.entries()) {
        await prisma.task.create({
          data: {
            ...task,
            order,
            testnetId: created.id
          }
        });
      }
      await prisma.testnet.update({
        where: { id: created.id },
        data: {
          tasksCount: await prisma.task.count({ where: { testnetId: created.id } })
        }
      });
    }
  }

  // Create sample users
  const users = [
    {
      walletAddress: '0x1234567890123456789012345678901234567890',
      email: 'user1@example.com',
      favorites: ['aurora-builders-program', 'zksync-contributors'],
      progress: {
        'aurora-builders-program': {
          completedTasks: 1,
          totalTasks: 2,
          lastActivity: new Date().toISOString()
        }
      }
    },
    {
      walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      email: 'user2@example.com',
      favorites: ['celestia-data-availability-quest'],
      progress: {
        'celestia-data-availability-quest': {
          completedTasks: 2,
          totalTasks: 3,
          lastActivity: new Date().toISOString()
        }
      }
    }
  ];

  for (const userData of users) {
    await prisma.user.create({
      data: userData
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
