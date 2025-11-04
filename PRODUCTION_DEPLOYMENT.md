# Production Database Deployment Rehberi

Bu rehber, local veritabanındaki verileri production'a (Vercel/Supabase) aktarmak için adım adım talimatlar içerir.

## Sorun
Production veritabanında veriler görünmüyor çünkü:
1. Prisma migration'ları production'a uygulanmamış
2. Seed data production'a yüklenmemiş

## Çözüm

### Yöntem 1: API Endpoint ile Deployment (Önerilen)

Bu yöntem Vercel üzerinden direkt çalışır ve güvenli bir şekilde deployment yapar.

#### Adımlar:

1. **Environment Variable Ekle**
   Vercel Dashboard → Settings → Environment Variables:
   - `ADMIN_SECRET`: Güçlü bir secret key (örn: `openssl rand -hex 32` ile oluştur)

2. **API Endpoint'i Çağır**
   ```bash
   curl -X POST https://dewrk-testnet-hub.vercel.app/api/admin/deploy-db \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     -d '{"action": "migrate"}'
   ```

   Veya migration + seed birlikte:
   ```bash
   curl -X POST https://dewrk-testnet-hub.vercel.app/api/admin/deploy-db \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     -d '{}'
   ```

3. **Sonuçları Kontrol Et**
   Response'da şunları kontrol et:
   - `migration.success`: true olmalı
   - `seed.success`: true olmalı
   - `verification.testnetCount`: 0'dan büyük olmalı

### Yöntem 2: Script ile Deployment (Local)

Bu yöntem local makinenizden çalışır ve production veritabanına bağlanır.

#### Adımlar:

1. **Environment Variables Ayarla**
   `.env` dosyanızda şunlar olmalı:
   ```bash
   DIRECT_URL="postgresql://postgres:***@db.xxx.supabase.co:5432/postgres?sslmode=require"
   DATABASE_URL="postgresql://postgres.vuczvmlkmtsewpbjfwar:***@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```

2. **Script'i Çalıştır**
   ```bash
   pnpm db:deploy-production
   ```

3. **Sonuçları Kontrol Et**
   Script otomatik olarak şunları gösterir:
   - Migration durumu
   - Seed durumu
   - Veritabanı doğrulama sonuçları

### Yöntem 3: Manuel Migration (En Güvenli)

Eğer API veya script çalışmazsa, manuel olarak yapabilirsiniz:

#### Adımlar:

1. **Prisma Migration'ları Uygula**
   ```bash
   # DIRECT_URL kullanarak migration yap
   DIRECT_URL="postgresql://postgres:***@db.xxx.supabase.co:5432/postgres?sslmode=require" \
   pnpm prisma migrate deploy
   ```

2. **Prisma Client Generate Et**
   ```bash
   pnpm prisma generate
   ```

3. **Seed Data Yükle**
   ```bash
   # DIRECT_URL kullanarak seed yap
   DIRECT_URL="postgresql://postgres:***@db.xxx.supabase.co:5432/postgres?sslmode=require" \
   pnpm db:seed
   ```

4. **Doğrula**
   ```bash
   # Debug endpoint'i kontrol et
   curl https://dewrk-testnet-hub.vercel.app/api/debug/db
   ```

## Önemli Notlar

1. **DIRECT_URL Kullan**: Migration ve seed işlemleri için her zaman `DIRECT_URL` (port 5432) kullanılmalı. Pooler (port 6543) migration'lar için uygun değil.

2. **Seed Dosyası**: `seed-output/testnets.json` dosyası production'a deploy edilmeli veya seed script'in erişebileceği bir yerde olmalı.

3. **Timeout**: Seed işlemi uzun sürebilir (2-3 dakika). API endpoint'te timeout 3 dakika olarak ayarlanmıştır.

4. **Güvenlik**: API endpoint'i `ADMIN_SECRET` ile korunmalı. Production'da açık bırakmayın.

## Troubleshooting

### "Table Testnet does not exist" hatası
- Prisma migration'ları uygulanmamış demektir
- `pnpm prisma migrate deploy` çalıştırın

### "seed-output/testnets.json not found" hatası
- Seed dosyası production'a deploy edilmemiş
- Dosyayı git'e ekleyin veya seed script'i güncelleyin

### "Connection timeout" hatası
- DIRECT_URL'in doğru olduğundan emin olun
- Supabase firewall ayarlarını kontrol edin

### "Migration already applied" uyarısı
- Bu normal, migration zaten uygulanmış demektir
- Seed işlemini devam ettirebilirsiniz

## Başarı Kriterleri

Deployment başarılı sayılır eğer:
- ✅ `testnetCount > 0`
- ✅ `ecosystemCount > 0` (veya en azından 0 değil)
- ✅ `/api/debug/db` endpoint'i pozitif sayılar gösteriyor
- ✅ `/testnets` sayfası testnet listesi gösteriyor

