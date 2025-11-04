import type { PrismaClient } from '@prisma/client';

type EcosystemSeed = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  networkType: string;
  logoUrl?: string;
  heroImageUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  githubUrl?: string;
  totalTestnets: number;
  totalFunding: number;
  activeTestnets: number;
  featured?: boolean;
  displayOrder?: number;
  metadata?: Record<string, unknown>;
};

const ECOSYSTEMS: EcosystemSeed[] = [
  {
    slug: 'ethereum-layer-2',
    name: 'Ethereum Layer 2',
    shortDescription: 'Optimistic and zk rollups secured by Ethereum mainnet.',
    description:
      'Ethereum Layer 2 ecosystems combine scalability with Ethereum security. Networks like Optimism, Base, Arbitrum, Mantle, Scroll, and Polygon zkEVM deliver low fees, fast confirmations, and strong tooling for builders pursuing consumer and DeFi use cases.',
    networkType: 'L2',
    websiteUrl: 'https://ethereum.org/en/developers/docs/scaling/',
    twitterUrl: 'https://twitter.com/ethereum',
    discordUrl: 'https://discord.gg/ethereum',
    githubUrl: 'https://github.com/ethereum',
    totalTestnets: 8,
    totalFunding: 10200000000,
    activeTestnets: 7,
    featured: true,
    displayOrder: 1,
    metadata: {
      topProjects: ['Base', 'Optimism', 'Arbitrum', 'zkSync Era', 'Mantle'],
      resources: ['https://community.optimism.io', 'https://docs.base.org', 'https://scroll.io/blog']
    }
  },
  {
    slug: 'cosmos-interchain',
    name: 'Cosmos Interchain',
    shortDescription: 'App-chain networks connected through IBC and shared security.',
    description:
      'The Cosmos ecosystem powers sovereign app-chains using the Cosmos SDK, Tendermint consensus, and Inter-Blockchain Communication (IBC). Builders experiment with shared security via the Cosmos Hub, consumer chains, and modular DA from Celestia.',
    networkType: 'AppChain',
    websiteUrl: 'https://cosmos.network',
    twitterUrl: 'https://twitter.com/cosmos',
    discordUrl: 'https://discord.gg/cosmosnetwork',
    githubUrl: 'https://github.com/cosmos',
    totalTestnets: 5,
    totalFunding: 2300000000,
    activeTestnets: 4,
    displayOrder: 2,
    metadata: {
      topProjects: ['Celestia', 'Neutron', 'Osmosis', 'Stride', 'Saga'],
      learning: ['https://tutorials.cosmos.network', 'https://ibcprotocol.org']
    }
  },
  {
    slug: 'solana-supernets',
    name: 'Solana High Performance',
    shortDescription: 'Monolithic high-throughput layer 1 optimized for consumer apps.',
    description:
      'Solana delivers web-scale performance with Sealevel parallel execution, local fee markets, and a growing focus on consumer and DeFi applications. The devnet ships bleeding-edge features like Firedancer, priority fees, and state compression.',
    networkType: 'L1',
    websiteUrl: 'https://solana.com',
    twitterUrl: 'https://twitter.com/solana',
    discordUrl: 'https://discord.gg/solana',
    githubUrl: 'https://github.com/solana-labs',
    totalTestnets: 3,
    totalFunding: 3350000000,
    activeTestnets: 2,
    displayOrder: 3,
    metadata: {
      topProjects: ['Solana Devnet', 'Helius', 'Jupiter', 'Backpack'],
      grants: ['https://solana.com/grants', 'https://solana.com/developers']
    }
  },
  {
    slug: 'move-alliance',
    name: 'Move Alliance',
    shortDescription: 'Move-language ecosystems led by Sui and Aptos.',
    description:
      'Move-based networks focus on safety, composability, and parallel execution. Sui and Aptos operate robust testnets with grants, hackathons, and accelerator programs tailored to Move developers building finance, gaming, and social products.',
    networkType: 'SmartContract',
    websiteUrl: 'https://move-language.github.io/move/',
    twitterUrl: 'https://twitter.com/MoveDevGuild',
    totalTestnets: 4,
    totalFunding: 736000000,
    activeTestnets: 4,
    displayOrder: 4,
    metadata: {
      topProjects: ['Sui', 'Aptos', 'Pontem Network', 'Aftermath Finance'],
      resources: ['https://docs.sui.io', 'https://aptos.dev']
    }
  },
  {
    slug: 'modular-rollups',
    name: 'Modular Rollups',
    shortDescription: 'Fuel, Celestia, and Frax building modular execution and data availability.',
    description:
      'Modular rollups separate execution, settlement, and data availability layers to accelerate experimentation. Fuel focuses on a parallel UTXO architecture, Celestia supplies data availability sampling, and Fraxtal aligns incentives with onchain liquidity.',
    networkType: 'Modular',
    websiteUrl: 'https://celestia.org',
    twitterUrl: 'https://twitter.com/CelestiaOrg',
    totalTestnets: 5,
    totalFunding: 685000000,
    activeTestnets: 4,
    displayOrder: 5,
    metadata: {
      topProjects: ['Fuel', 'Celestia', 'Fraxtal', 'Lyra', 'Dymension'],
      insights: ['https://fuel.network/blog', 'https://celestia.org/blog']
    }
  }
];

export async function seedEcosystems(prisma: PrismaClient) {
  await prisma.ecosystem.deleteMany();
  await prisma.ecosystem.createMany({
    data: ECOSYSTEMS.map((ecosystem) => ({
      ...ecosystem,
      metadata: ecosystem.metadata ?? {}
    }))
  });
}

export { ECOSYSTEMS };
