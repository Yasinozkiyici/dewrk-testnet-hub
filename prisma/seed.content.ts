import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type BackfillItem = {
  name: string
  slug: string
  status?: string
  network?: string
  shortDescription?: string
  difficulty?: 'EASY'|'MEDIUM'|'HARD'
  estTimeMinutes?: number
  rewardType?: 'NONE'|'POINTS'|'TOKEN'|'NFT'|'BADGE'
  rewardNote?: string
  kycRequired?: boolean
  requiresWallet?: boolean
  tags?: string[]
  highlights?: string[]
  prerequisites?: string[]
  gettingStarted?: { title: string; body?: string; link?: string }[]
  docsUrl?: string
  explorerUrl?: string
  faucetUrl?: string
}

const items: BackfillItem[] = [
  {
    name: 'Polygon zkEVM Testnet',
    slug: 'polygon-zkevm',
    status: 'ACTIVE',
    network: 'Polygon',
    shortDescription: 'zkEVM deneyimi: düşük ücret, yüksek uyumluluk.',
    difficulty: 'MEDIUM',
    estTimeMinutes: 45,
    rewardType: 'POINTS',
    rewardNote: 'Topluluk puanları ve rozetler.',
    kycRequired: false,
    requiresWallet: true,
    tags: ['layer2','zk','evm','polygon'],
    highlights: ['Düşük ücret','Yüksek uyumluluk'],
    prerequisites: ['Cüzdan kurulu','Biraz faucet tokenı'],
    gettingStarted: [
      { title: 'Cüzdan oluştur', body: 'Metamask veya benzeri', link: 'https://metamask.io' },
      { title: 'Ağı ekle', body: 'RPC ve chain id bilgilerini ekle' },
      { title: 'Faucet al', body: 'Küçük miktar test tokenı', link: 'https://faucet.example.com' },
    ],
    docsUrl: 'https://docs.polygon.technology/',
    explorerUrl: 'https://explorer.zkevm-test.net',
    faucetUrl: 'https://faucet.polygon.technology/',
  },
  {
    name: 'Base Sepolia',
    slug: 'base-sepolia',
    status: 'ACTIVE',
    network: 'Ethereum',
    shortDescription: 'Base L2 test ağı üzerinde basit katılım.',
    difficulty: 'EASY',
    estTimeMinutes: 20,
    rewardType: 'BADGE',
    rewardNote: 'Katılım rozeti.',
    kycRequired: false,
    requiresWallet: true,
    tags: ['layer2','ethereum','op-stack'],
    highlights: ['Kolay başlangıç','Hızlı finalite'],
    prerequisites: ['Sepolia test ETH'],
    gettingStarted: [
      { title: 'Ağı cüzdana ekle' },
      { title: 'Faucet al', link: 'https://sepoliafaucet.com' },
    ],
    docsUrl: 'https://docs.base.org/',
    explorerUrl: 'https://sepolia.basescan.org',
    faucetUrl: 'https://www.alchemy.com/faucets/ethereum-sepolia',
  },
]

async function main() {
  for (const item of items) {
    await prisma.testnet.upsert({
      where: { slug: item.slug },
      create: {
        name: item.name,
        slug: item.slug,
        status: (item.status ?? 'ACTIVE') as any,
        network: item.network ?? '',
        shortDescription: item.shortDescription,
        difficulty: item.difficulty ?? 'MEDIUM',
        estTimeMinutes: item.estTimeMinutes,
        rewardType: item.rewardType,
        rewardNote: item.rewardNote,
        kycRequired: item.kycRequired ?? false,
        requiresWallet: item.requiresWallet ?? true,
        tags: item.tags ?? [],
        highlights: item.highlights ?? [],
        prerequisites: item.prerequisites ?? [],
        gettingStarted: item.gettingStarted ?? [],
      },
      update: {
        name: item.name,
        status: (item.status ?? 'ACTIVE') as any,
        network: item.network,
        shortDescription: item.shortDescription,
        difficulty: item.difficulty,
        estTimeMinutes: item.estTimeMinutes,
        rewardType: item.rewardType,
        rewardNote: item.rewardNote,
        kycRequired: item.kycRequired ?? false,
        requiresWallet: item.requiresWallet ?? true,
        tags: item.tags ?? [],
        highlights: item.highlights ?? [],
        prerequisites: item.prerequisites ?? [],
        gettingStarted: item.gettingStarted ?? [],
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    // eslint-disable-next-line no-console
    console.log('Seed content backfilled.')
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

