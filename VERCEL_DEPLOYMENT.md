# Vercel Deployment Guide — Dewrk.com

## 🚀 Hızlı Başlangıç

### 1. Vercel'e Proje Import Et

1. [Vercel Dashboard](https://vercel.com/dashboard)'a git
2. "Add New Project" → "Import Git Repository"
3. GitHub repository'sini seç: `Yasinozkiyici/dewrk-testnet-hub`
4. Framework Preset: **Next.js** (otomatik algılanır)
5. Root Directory: **/** (kök dizin)
6. Build Command: `pnpm build` (veya `npm run build`)
7. Output Directory: `.next` (otomatik)
8. Install Command: `pnpm install` (veya `npm install`)

### 2. Environment Variables (Zorunlu)

Vercel Dashboard → Settings → Environment Variables bölümünde aşağıdaki değişkenleri ekleyin:

#### Supabase Konfigürasyonu
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

#### Database URL (Supabase Pooler - Port 6543)
```bash
# Runtime bağlantısı için pooler kullan (6543)
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Direct connection (5432) - migrations için (GitHub Actions'ta kullanılır)
DIRECT_URL=postgresql://postgres.YOUR_PROJECT_ID:PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?sslmode=require
```

#### Next.js Konfigürasyonu
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

#### GitHub Secrets (CI/CD için)
GitHub Repository → Settings → Secrets → Actions bölümünde:

```bash
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_password
```

### 3. Build & Deployment Ayarları

#### vercel.json Yapılandırması
```json
{
  "version": 2,
  "name": "testnet-hub",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 4. Deployment Workflow

#### Otomatik Deployment
- **main** branch'e her push → Production deployment
- **Pull Request** → Preview deployment
- GitHub Actions workflow → DB migrations

#### Manuel Deployment
```bash
# Vercel CLI ile deploy
pnpm install -g vercel
vercel login
vercel --prod
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] GitHub'a tüm değişiklikler push edildi
- [ ] Environment variables Vercel'e eklendi
- [ ] Supabase migrations çalıştırıldı (GitHub Actions ile)
- [ ] Build local'de test edildi: `pnpm build`
- [ ] TypeScript hataları giderildi: `pnpm type-check`

### Post-Deployment
- [ ] Production URL'i test et: `/api/health`
- [ ] Testnets listesi çalışıyor: `/testnets`
- [ ] Admin panel erişilebilir: `/admin`
- [ ] Environment variables doğru yüklendi
- [ ] Vercel Logs kontrol edildi

## 🔧 Supabase Migration Workflow

### GitHub Actions ile Otomatik Migration

`.github/workflows/db-migrate.yml` workflow'u manuel olarak çalıştırın:

1. GitHub Repository → Actions
2. "DB Migrate (Supabase)" workflow'unu seç
3. "Run workflow" → "main" branch
4. Migration tamamlandıktan sonra Vercel redeploy yapın

### Migration Detayları
- Port: **5432** (direct connection, pooler değil)
- SSL: **required**
- Migration dosyaları: `supabase/migrations/*.sql`
- Hata durumunda: `ON_ERROR_STOP=1` ile fail

## 🌐 Domain Konfigürasyonu

### Custom Domain Ekle
1. Vercel Dashboard → Project Settings → Domains
2. Domain ekle: `dewrk.com`
3. DNS kayıtlarını ayarla (Vercel talimatlarına göre)
4. SSL otomatik etkinleştirilir

### DNS Ayarları
```
Type: CNAME
Name: www (veya @)
Value: cname.vercel-dns.com
```

## 🔍 Monitoring & Logs

### Vercel Analytics
- Otomatik olarak etkin
- Real-time metrics dashboard

### Error Monitoring (Sentry)
```bash
# Environment Variables
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_PROJECT=dewrk
SENTRY_ORG=your_org
```

### Vercel Logs
```bash
# CLI ile logs görüntüle
vercel logs your-deployment-url.vercel.app
```

## 🚨 Troubleshooting

### Build Hatası: "Module not found"
```bash
# Solution: Prisma client'ı generate et
pnpm prisma generate
pnpm build
```

### Database Connection Error
- `DATABASE_URL` pooler (6543) kullanıyor mu kontrol et
- SSL mode `require` olmalı
- Connection limit: `connection_limit=1`

### Environment Variables Yüklenmiyor
- Vercel Dashboard'dan kontrol et
- Redeploy yap (değişiklikler için)
- Preview vs Production environment'ları farklı

## 📊 Performance Optimization

### Edge Functions
- `/api/health` endpoint edge'de çalışıyor
- Middleware edge runtime kullanıyor

### Caching Strategy
- Static pages: ISR (Incremental Static Regeneration)
- API routes: `revalidateTag` ile cache invalidation
- Images: Next.js Image Optimization

### Database Connection Pooling
- Vercel Serverless: PgBouncer pooler (6543)
- Connection limit: 1 per function
- Transaction mode: Session

## 🔐 Security

### Environment Variables
- **Asla koda commitlenmez**
- GitHub Secrets kullan (CI/CD)
- Vercel Environment Variables (runtime)

### Headers (vercel.json)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: origin-when-cross-origin

### SSL/TLS
- Otomatik SSL sertifikası (Let's Encrypt)
- HTTPS zorunlu
- HSTS enabled

## 📝 Deployment Notları

### Prisma & Supabase
- Prisma schema Supabase'e uyumlu
- Migration'lar idempotent olmalı
- Breaking changes yasak (additive only)

### Next.js 14.2.15
- App Router kullanımda
- Server Components default
- TypedRoutes enabled

### Build Time
- Average: 2-3 dakika
- Cache enabled: 30-60 saniye

## 🎯 Post-Deploy Checklist

1. [ ] Health check: `https://your-domain.vercel.app/api/health`
2. [ ] Testnets API: `https://your-domain.vercel.app/api/testnets`
3. [ ] Admin panel: `https://your-domain.vercel.app/admin`
4. [ ] Test bir testnet oluştur
5. [ ] Lighthouse score kontrol et (>90)
6. [ ] Vercel Analytics'i kontrol et
7. [ ] Error tracking çalışıyor mu (Sentry)
8. [ ] Custom domain SSL aktif mi

## 📚 Kaynaklar

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase with Vercel](https://supabase.com/docs/guides/integrations/vercel)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**Son Güncelleme**: 25 Ekim 2025  
**Proje**: Dewrk.com — Web3 Testnet Directory  
**Tech Stack**: Next.js 14 + Supabase + Prisma + Vercel

