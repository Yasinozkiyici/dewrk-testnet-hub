import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Status güncellemeleri yapılıyor...\n');
  
  const testnets = await prisma.testnet.findMany({
    orderBy: { updatedAt: 'desc' }
  });
  
  console.log(`📋 Toplam ${testnets.length} testnet bulundu\n`);
  
  let updated = 0;
  
  // İlk 20'sini UPCOMING yap (yeni başlayanlar)
  for (let i = 0; i < Math.min(20, testnets.length); i++) {
    if (testnets[i].status === 'LIVE') {
      await prisma.testnet.update({
        where: { id: testnets[i].id },
        data: { status: 'UPCOMING' }
      });
      console.log(`✅ ${testnets[i].name}: LIVE → UPCOMING`);
      updated++;
    }
  }
  
  // Son 10'unu ENDED yap (eski testnetler)
  for (let i = Math.max(0, testnets.length - 10); i < testnets.length; i++) {
    if (testnets[i].status === 'LIVE') {
      await prisma.testnet.update({
        where: { id: testnets[i].id },
        data: { status: 'ENDED' }
      });
      console.log(`✅ ${testnets[i].name}: LIVE → ENDED`);
      updated++;
    }
  }
  
  // Ortadakilerden bazılarını PAUSED yap (5-10 arası)
  const middleStart = Math.floor(testnets.length / 3);
  const middleEnd = Math.floor(testnets.length / 3) * 2;
  for (let i = middleStart; i < Math.min(middleStart + 5, middleEnd); i++) {
    if (testnets[i].status === 'LIVE') {
      await prisma.testnet.update({
        where: { id: testnets[i].id },
        data: { status: 'PAUSED' }
      });
      console.log(`✅ ${testnets[i].name}: LIVE → PAUSED`);
      updated++;
    }
  }
  
  console.log(`\n✅ Tamamlandı! ${updated} testnet status güncellendi.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
