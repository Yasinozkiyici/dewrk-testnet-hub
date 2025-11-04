import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 PAUSED → TBA güncellemesi...\n');
  
  try {
    // Postgres enum sütununda PAUSED → TBA güncellemesi
    const result = await prisma.$executeRawUnsafe(`
      UPDATE "Testnet" SET status = 'TBA' WHERE status = 'PAUSED'
    `);
    console.log(`✅ ${result} testnet güncellendi: PAUSED → TBA\n`);
    
    // Doğrulama
    const tbaCount = await prisma.testnet.count({
      where: { status: 'TBA' }
    });
    console.log(`📊 TBA sayısı: ${tbaCount}\n`);
  } catch (err) {
    console.error('❌ Hata:', err.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
