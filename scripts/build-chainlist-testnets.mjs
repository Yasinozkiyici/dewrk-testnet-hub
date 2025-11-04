import fs from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'seed-output');
const LOGO_DIR = path.join(ROOT, 'public', 'logos');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'testnets.json');

const HEADERS = {
  'user-agent': 'Mozilla/5.0 (compatible; DewrkBot/1.0; +https://dewrk.com)',
  accept: 'application/json'
};

async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

const OVERRIDE_PROJECTS = {
  arbitrum: {
    funding: 123_700_000,
    twitter: 'https://twitter.com/arbitrum',
    discord: 'https://discord.gg/arbitrum',
    website: 'https://arbitrum.io'
  },
  optimism: {
    funding: 178_000_000,
    twitter: 'https://twitter.com/optimism',
    discord: 'https://discord.gg/optimism',
    website: 'https://optimism.io'
  },
  base: {
    funding: 520_580_000,
    twitter: 'https://twitter.com/BuildOnBase',
    discord: 'https://discord.gg/base',
    website: 'https://base.org'
  },
  scroll: {
    funding: 83_000_000,
    twitter: 'https://twitter.com/Scroll_ZKP',
    discord: 'https://discord.gg/scroll',
    website: 'https://scroll.io'
  },
  mantle: {
    funding: 200_000_000,
    twitter: 'https://twitter.com/0xMantle',
    discord: 'https://discord.gg/mantle',
    website: 'https://mantle.xyz'
  },
  starknet: {
    funding: 282_500_000,
    twitter: 'https://twitter.com/Starknet',
    discord: 'https://discord.gg/starknet',
    website: 'https://starknet.io'
  },
  fuel: {
    funding: 80_000_000,
    twitter: 'https://twitter.com/fuellabs_',
    discord: 'https://discord.gg/fuel',
    website: 'https://fuel.network'
  },
  linea: {
    funding: 726_000_000,
    twitter: 'https://twitter.com/LineaBuild',
    discord: 'https://discord.gg/linea',
    website: 'https://linea.build'
  },
  celestia: {
    funding: 156_500_000,
    twitter: 'https://twitter.com/CelestiaOrg',
    discord: 'https://discord.gg/celestia',
    website: 'https://celestia.org'
  },
  sui: {
    funding: 336_000_000,
    twitter: 'https://twitter.com/SuiNetwork',
    discord: 'https://discord.gg/sui',
    website: 'https://sui.io'
  },
  aptos: {
    funding: 352_000_000,
    twitter: 'https://twitter.com/AptosLabs',
    discord: 'https://discord.gg/aptoslabs',
    website: 'https://aptos.dev'
  },
  solana: {
    funding: 335_000_000,
    twitter: 'https://twitter.com/solana',
    discord: 'https://discord.com/invite/solana',
    website: 'https://solana.com'
  },
  celo: {
    funding: 66_500_000,
    twitter: 'https://twitter.com/CeloOrg',
    discord: 'https://discord.gg/celo',
    website: 'https://celo.org'
  },
  frax: {
    funding: 0,
    twitter: 'https://twitter.com/fraxfinance',
    discord: 'https://discord.gg/frax',
    website: 'https://frax.finance'
  },
  zksync: {
    funding: 458_000_000,
    twitter: 'https://twitter.com/zksync',
    discord: 'https://discord.gg/zksync',
    website: 'https://zksync.io'
  },
  taiko: {
    funding: 37_000_000,
    twitter: 'https://twitter.com/taikoxyz',
    discord: 'https://discord.gg/taikoxyz',
    website: 'https://taiko.xyz'
  },
  polygon: {
    funding: 451_000_000,
    twitter: 'https://twitter.com/0xPolygon',
    discord: 'https://discord.gg/polygon',
    website: 'https://polygon.technology'
  },
  blast: {
    funding: 20_000_000,
    twitter: 'https://twitter.com/Blast_L2',
    discord: 'https://discord.gg/blastl2',
    website: 'https://blast.io'
  }
};

const PATTERN_TO_PROJECT = [
  ['arbitrum', 'arbitrum'],
  ['nova', 'arbitrum'],
  ['optimism', 'optimism'],
  ['op ', 'optimism'],
  ['base', 'base'],
  ['scroll', 'scroll'],
  ['mantle', 'mantle'],
  ['stark', 'starknet'],
  ['fuel', 'fuel'],
  ['linea', 'linea'],
  ['celestia', 'celestia'],
  ['sui', 'sui'],
  ['aptos', 'aptos'],
  ['solana', 'solana'],
  ['celo', 'celo'],
  ['frax', 'frax'],
  ['zksync', 'zksync'],
  ['era', 'zksync'],
  ['taiko', 'taiko'],
  ['polygon', 'polygon'],
  ['manta', 'mantle'],
  ['blast', 'blast'],
  ['linea', 'linea'],
  ['sepolia', null],
  ['goerli', null],
  ['holesky', 'ethereum']
];

function inferProjectKey(name) {
  const lower = name.toLowerCase();
  for (const [pattern, project] of PATTERN_TO_PROJECT) {
    if (lower.includes(pattern)) {
      return project;
    }
  }
  return null;
}

function inferDifficulty(chain) {
  if (Array.isArray(chain.faucets) && chain.faucets.length > 0) {
    return 'EASY';
  }
  return 'MEDIUM';
}

function inferStatus(chain) {
  const status = chain.status;
  if (status && typeof status === 'object' && status.deprecated) {
    return 'ENDED';
  }
  if (chain.name && /deprecated|delisted|closed|sunset|ropsten|rinkeby|kovan|kovan|morden|kovan|classic/i.test(chain.name)) {
    return 'ENDED';
  }
  return 'LIVE';
}

function buildDescription(chain) {
  const base = chain.name.replace(/Testnet|Devnet|Beta|Network/gi, '').trim();
  return `${chain.name} is a public test network for ${base || chain.chain || 'its parent'} with RPCs ${chain.rpc?.slice(0, 2).join(', ') || ''}`.trim();
}

function buildTags(chain) {
  const tags = new Set();
  tags.add('Testnet');
  if (chain.chain) tags.add(chain.chain);
  if (chain.network) tags.add(chain.network);
  if (Array.isArray(chain.features)) {
    chain.features.forEach((feature) => {
      if (feature?.name) tags.add(feature.name);
    });
  }
  return Array.from(tags).filter(Boolean).slice(0, 8);
}

function createRecordFromChain(chain) {
  const name = (chain.name || '').trim();
  if (!name) return null;
  const slug = slugify(name, { lower: true, strict: true });

  const projectKey = inferProjectKey(name);
  const projectMeta = projectKey ? OVERRIDE_PROJECTS[projectKey] : null;

  const website = chain.infoURL || chain.explorers?.[0]?.url || projectMeta?.website || null;
  let fallbackLogo = null;
  if (website) {
    try {
      const host = new URL(website).hostname;
      fallbackLogo = `https://logo.clearbit.com/${host}`;
    } catch (error) {
      fallbackLogo = null;
    }
  }

  const explorer = chain.explorers?.[0]?.url || null;

  return {
    name,
    slug,
    network: chain.chain || chain.network || 'Testnet',
    status: inferStatus(chain),
    difficulty: inferDifficulty(chain),
    rewardType: projectMeta ? 'Points' : 'Tokens',
    rewardNote: null,
    shortDescription: buildDescription({ ...chain, name }),
    websiteUrl: website,
    githubUrl: null,
    twitterUrl: projectMeta?.twitter ?? null,
    discordUrl: projectMeta?.discord ?? null,
    dashboardUrl: explorer,
    hasDashboard: Boolean(explorer),
    totalRaisedUSD: projectMeta?.funding ?? null,
    tags: buildTags(chain),
    highlights: [
      explorer ? `Explorer: ${explorer}` : null,
      chain.rpc?.length ? `${chain.rpc.length} RPC endpoints` : null,
      projectMeta?.funding ? `Funding: $${projectMeta.funding.toLocaleString('en-US')}` : null
    ].filter(Boolean),
    prerequisites: [
      projectMeta?.website ? `Review documentation on ${projectMeta.website}` : `Review official docs for ${name}`,
      'Configure a compatible wallet with the published RPC URL',
      chain.faucets?.[0] ? `Request funds from the faucet: ${chain.faucets[0]}` : 'Request funds from the community faucet'
    ],
    gettingStarted: [
      `Deploy and verify a contract on ${name}`,
      explorer ? `Track the transaction on ${explorer}` : 'Monitor transactions via community explorer',
      'Share feedback or bug reports with the team'
    ],
    discordRoles: [],
    hasFaucet: Array.isArray(chain.faucets) && chain.faucets.length > 0,
    kycRequired: false,
    requiresWallet: true,
    rewardCategory: null,
    rewardRangeUSD: null,
    estTimeMinutes: 30,
    logoUrl: fallbackLogo,
    createdAt: new Date().toISOString()
  };
}

async function buildDataset() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(LOGO_DIR, { recursive: true });

  const chainRes = await fetchWithTimeout('https://chainid.network/chains.json', { headers: HEADERS }, 10000);
  if (!chainRes.ok) {
    throw new Error(`Failed to fetch chainlist: ${chainRes.status}`);
  }
  const chains = await chainRes.json();

  const testnets = chains.filter((chain) => {
    const name = (chain.name || '').toLowerCase();
    const network = (chain.network || '').toLowerCase();
    const title = (chain.title || '').toLowerCase();
    if (name.includes('testnet') || network.includes('testnet')) return true;
    if (title.includes('testnet')) return true;
    if (/devnet|dev network|beta|preview|goerli|sepolia|holesky|playground|futurenet|sandbox|trial/i.test(chain.name)) return true;
    if (Array.isArray(chain.faucets) && chain.faucets.length > 0) return true;
    const status = chain.status;
    if (status && typeof status === 'object' && status.deprecated) return true;
    return false;
  });

  // Sort by preference: active before deprecated, then name
  testnets.sort((a, b) => {
    const statusA = inferStatus(a) === 'ENDED' ? 1 : 0;
    const statusB = inferStatus(b) === 'ENDED' ? 1 : 0;
    if (statusA !== statusB) return statusA - statusB;
    return a.name.localeCompare(b.name);
  });

  const records = [];
  for (const chain of testnets) {
    if (records.length >= 500) break;
    const record = createRecordFromChain(chain);
    if (!record) continue;
    if (records.some((item) => item.slug === record.slug)) continue;
    records.push(record);
  }

  const PREFERRED_NAMES = [
    'Arbitrum Goerli',
    'Arbitrum Sepolia',
    'Optimism Goerli',
    'Optimism Kovan',
    'Optimism Sepolia',
    'Base Goerli Testnet',
    'Base Sepolia Testnet',
    'Scroll Sepolia Testnet',
    'Mantle Sepolia',
    'Starknet Sepolia',
    'Fuel Testnet',
    'Fuel Beta Testnet',
    'Linea Goerli',
    'Celestia Mocha',
    'Sui Testnet',
    'Aptos Testnet',
    'Solana Devnet',
    'Celo Alfajores',
    'Fraxchain Holesky',
    'zkSync Era Testnet',
    'Taiko Jolnir L2',
    'Manta Pacific Testnet',
    'Blast Sepolia Testnet',
    'Berachain bArtio',
    'Sei Atlantic-2 Testnet',
    'Mode Sepolia',
    'Lyra Testnet',
    'EigenLayer Testnet',
    'Degen Chain Testnet',
    'Saga Testnet',
    'Concordium Testnet',
    'Fantom Testnet',
    'Avalanche Fuji Testnet',
    'Hedera Testnet',
    'Near Testnet',
    'Moonbase Alpha',
    'Gnosis Chiado Testnet',
    'Shardeum Liberty 2.X',
    'Nibiru Neptune Testnet',
    'Kinto Devnet',
    'Linea Sepolia',
    'Polygon zkEVM Cardona',
    'Mode Goerli',
    'Mantle Goerli'
  ];

  for (const preferredName of PREFERRED_NAMES) {
    const slug = slugify(preferredName, { lower: true, strict: true });
    if (records.some((item) => item.slug === slug)) continue;
    const match = chains.find((chain) => {
      const name = (chain.name || '').toLowerCase();
      const title = (chain.title || '').toLowerCase();
      const target = preferredName.toLowerCase();
      return name === target || title === target || name.includes(target) || title.includes(target);
    });
    if (!match) continue;
    const record = createRecordFromChain(match);
    if (!record) continue;
    if (records.some((item) => item.slug === record.slug)) continue;
    records.push(record);
  }

  const PREFERRED_KEYWORDS = [
    'arbitrum',
    'optimism',
    'base',
    'scroll',
    'mantle',
    'stark',
    'fuel',
    'linea',
    'celestia',
    'sui',
    'aptos',
    'solana',
    'celo',
    'frax',
    'zksync',
    'taiko',
    'polygon',
    'manta',
    'blast',
    'moon',
    'gnosis',
    'near',
    'hedera',
    'fantom',
    'avalanche',
    'metis',
    'osmos',
    'cosmos',
    'okx',
    'tron',
    'bsc',
    'berachain',
    'sei',
    'quai',
    'kinto',
    'mode',
    'lyra',
    'eigen',
    'degen',
    'supra',
    'saga',
    'kava',
    'concordium',
    'tezos',
    'ton',
    'cartesi',
    'aleph',
    'canto',
    'nibiru',
    'lambda',
    'shardeum',
    'injective',
    'cardano',
    'algorand',
    'ethereum',
    'zora',
    'mode',
    'swell',
    'apex',
    'celestia',
    'seq'
  ];

  const preferred = [];
  const others = [];
  for (const record of records) {
    const value = record.name.toLowerCase();
    if (PREFERRED_KEYWORDS.some((keyword) => value.includes(keyword))) {
      preferred.push(record);
    } else {
      others.push(record);
    }
  }

  const combined = [...preferred, ...others];
  const unique = [];
  const seen = new Set();
  for (const entry of combined) {
    if (unique.length >= 110) break;
    if (seen.has(entry.slug)) continue;
    seen.add(entry.slug);
    unique.push(entry);
  }
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(unique, null, 2));
  console.log(`✅ Wrote ${unique.length} testnet entries -> ${OUTPUT_FILE}`);
}

buildDataset().catch((error) => {
  console.error('❌ Failed to build chainlist dataset', error);
  process.exit(1);
});
