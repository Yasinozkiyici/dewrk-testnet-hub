const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Helper: ensure project exists
  async function ensureProject(name, website) {
    let project = await prisma.project.findFirst({ where: { name } });
    if (!project) {
      project = await prisma.project.create({
        data: { name, website }
      });
    }
    return project;
  }

  const projects = [
    { name: 'ZK Nova', website: 'https://zknova.io' },
    { name: 'Orbit L2', website: 'https://orbitl2.xyz' },
    { name: 'Solara', website: 'https://solara.org' },
    { name: 'CosmosX', website: 'https://cosmosx.zone' },
    { name: 'LineaLab', website: 'https://linealab.dev' },
  ];

  const ensured = {};
  for (const p of projects) {
    ensured[p.name] = await ensureProject(p.name, p.website);
  }

  // 12 demo testnets with varied status/difficulty/incentivized/kyc and endsAt
  const now = Date.now();
  const days = (n) => n * 24 * 60 * 60 * 1000;
  const demoTestnets = [
    { id: 'zknova-alpha', title: 'ZK Nova Alpha', project: 'ZK Nova', status: 'ACTIVE', difficulty: 'MEDIUM', incentivized: true, kyc: false, endsAt: new Date(now + days(3)) },
    { id: 'zknova-beta', title: 'ZK Nova Beta', project: 'ZK Nova', status: 'UPCOMING', difficulty: 'EASY', incentivized: false, kyc: false, endsAt: new Date(now + days(10)) },
    { id: 'orbit-phase1', title: 'Orbit Phase 1', project: 'Orbit L2', status: 'ACTIVE', difficulty: 'HARD', incentivized: true, kyc: true, endsAt: new Date(now + days(7)) },
    { id: 'orbit-phase2', title: 'Orbit Phase 2', project: 'Orbit L2', status: 'ENDED', difficulty: 'MEDIUM', incentivized: false, kyc: true, endsAt: new Date(now - days(1)) },
    { id: 'solara-devnet', title: 'Solara Devnet', project: 'Solara', status: 'ACTIVE', difficulty: 'EASY', incentivized: false, kyc: false, endsAt: null },
    { id: 'solara-testnet', title: 'Solara Public Testnet', project: 'Solara', status: 'UPCOMING', difficulty: 'MEDIUM', incentivized: true, kyc: false, endsAt: new Date(now + days(21)) },
    { id: 'cosmosx-itn', title: 'CosmosX ITN', project: 'CosmosX', status: 'ACTIVE', difficulty: 'HARD', incentivized: true, kyc: true, endsAt: new Date(now + days(14)) },
    { id: 'cosmosx-qa', title: 'CosmosX QA', project: 'CosmosX', status: 'ENDED', difficulty: 'EASY', incentivized: false, kyc: false, endsAt: new Date(now - days(5)) },
    { id: 'linealab-l2', title: 'LineaLab L2', project: 'LineaLab', status: 'ACTIVE', difficulty: 'MEDIUM', incentivized: true, kyc: false, endsAt: new Date(now + days(5)) },
    { id: 'linealab-zk', title: 'LineaLab ZK Rollup', project: 'LineaLab', status: 'UPCOMING', difficulty: 'HARD', incentivized: false, kyc: true, endsAt: new Date(now + days(30)) },
    { id: 'orbit-zkevm', title: 'Orbit zkEVM', project: 'Orbit L2', status: 'ACTIVE', difficulty: 'MEDIUM', incentivized: true, kyc: false, endsAt: new Date(now + days(9)) },
    { id: 'zknova-itn', title: 'ZK Nova Incentivized ITN', project: 'ZK Nova', status: 'ACTIVE', difficulty: 'HARD', incentivized: true, kyc: true, endsAt: new Date(now + days(12)) },
  ];

  // Upsert testnets and a couple of sample tasks per testnet
  for (const t of demoTestnets) {
    const project = ensured[t.project];
    await prisma.testnet.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        status: t.status,
        incentivized: t.incentivized,
        difficulty: t.difficulty,
        endsAt: t.endsAt,
        projectId: project.id,
      },
      create: {
        id: t.id,
        title: t.title,
        status: t.status,
        incentivized: t.incentivized,
        difficulty: t.difficulty,
        endsAt: t.endsAt,
        projectId: project.id,
      },
    });

    // Ensure 2 example tasks exist (idempotent)
    await prisma.task.upsert({
      where: { id: `${t.id}-task-1` },
      update: {},
      create: {
        id: `${t.id}-task-1`,
        title: 'Get test tokens from faucet',
        bodyMd: 'Open faucet and request tokens.',
        testnetId: t.id,
      },
    });
    await prisma.task.upsert({
      where: { id: `${t.id}-task-2` },
      update: {},
      create: {
        id: `${t.id}-task-2`,
        title: 'Bridge or swap once',
        bodyMd: 'Use the bridge or DEX to make one transaction.',
        testnetId: t.id,
      },
    });
  }

  console.log('Seed completed (demo data upserted)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


