# 🚀 Testnet Hub Deployment Guide

Bu dokümantasyon, Testnet Hub projesinin Vercel'de nasıl deploy edileceğini açıklar.

## 📋 Ön Gereksinimler

### 1. Vercel Hesabı
- [Vercel](https://vercel.com) hesabı oluşturun
- GitHub repository'sini Vercel'e bağlayın

### 2. Environment Variables
Aşağıdaki environment variable'ları Vercel dashboard'unda ayarlayın:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Storage (Cloudflare R2 / AWS S3)
STORAGE_REGION=auto
STORAGE_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=your-access-key-id
STORAGE_SECRET_ACCESS_KEY=your-secret-access-key
STORAGE_BUCKET_NAME=your-bucket-name
STORAGE_PUBLIC_URL=https://your-cdn-url.com

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Monitoring (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Cron Jobs
CRON_SECRET=your-cron-secret-key

# Feature Flags
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_REDIS_URL=https://your-redis-url.upstash.io
FEATURE_FLAGS_REDIS_TOKEN=your-redis-token
```

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)
1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Database URL'ini kopyalayın
4. Prisma migration'larını çalıştırın:

```bash
# Local'de migration oluşturun
npx prisma migrate dev --name init

# Production'da deploy edin
npx prisma migrate deploy
```

### Option 2: Neon
1. [Neon](https://neon.tech) hesabı oluşturun
2. Yeni database oluşturun
3. Connection string'i kopyalayın
4. Migration'ları deploy edin

### Option 3: Vercel Postgres
1. Vercel dashboard'unda Postgres add-on'u ekleyin
2. Connection string'i otomatik olarak alın
3. Migration'ları deploy edin

## 🔐 Authentication Setup

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) hesabı oluşturun
2. OAuth 2.0 credentials oluşturun
3. Authorized redirect URIs'ye ekleyin:
   - `https://your-domain.vercel.app/api/auth/callback/google`

### GitHub OAuth
1. GitHub Settings > Developer settings > OAuth Apps
2. Yeni OAuth App oluşturun
3. Authorization callback URL:
   - `https://your-domain.vercel.app/api/auth/callback/github`

## 📁 Storage Setup

### Cloudflare R2 (Recommended)
1. [Cloudflare R2](https://developers.cloudflare.com/r2/) hesabı oluşturun
2. Bucket oluşturun
3. API tokens oluşturun
4. CORS ayarlarını yapılandırın

### AWS S3
1. [AWS S3](https://aws.amazon.com/s3/) hesabı oluşturun
2. Bucket oluşturun
3. IAM user oluşturun
4. Permissions ayarlayın

## 🔴 Redis Setup

### Upstash (Recommended)
1. [Upstash](https://upstash.com) hesabı oluşturun
2. Redis database oluşturun
3. REST API URL ve token'ı alın

## 📊 Monitoring Setup

### Sentry
1. [Sentry](https://sentry.io) hesabı oluşturun
2. Yeni proje oluşturun
3. DSN'i kopyalayın
4. Environment variable'ları ayarlayın

## 🚀 Deployment Steps

### 1. Repository Setup
```bash
# Repository'yi clone edin
git clone https://github.com/your-username/testnet-hub.git
cd testnet-hub

# Dependencies'leri yükleyin
pnpm install
```

### 2. Vercel Deployment
```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Deploy edin
vercel

# Production'a deploy edin
vercel --prod
```

### 3. Database Migration
```bash
# Production database'e migrate edin
npx prisma migrate deploy
```

### 4. Cron Jobs Setup
Vercel dashboard'unda cron jobs'ları otomatik olarak ayarlanacak:
- Directory Metrics: Her 30 dakikada bir
- Health Check: Her 5 dakikada bir
- Status Update: Her saatte bir
- Data Cleanup: Günlük saat 02:00'da

## 🔧 Post-Deployment

### 1. Admin User Oluşturma
```bash
# Admin user oluşturmak için seed script'i çalıştırın
pnpm db:seed
```

### 2. Feature Flags
Admin panelinden feature flag'leri yönetin:
- `/admin/feature-flags`

### 3. Health Check
- Ana sayfa: `https://your-domain.vercel.app`
- Health endpoint: `https://your-domain.vercel.app/api/health`

## 📈 Monitoring

### 1. Sentry Dashboard
- Error tracking
- Performance monitoring
- User feedback

### 2. Vercel Analytics
- Page views
- Performance metrics
- User behavior

### 3. Database Monitoring
- Connection pool status
- Query performance
- Storage usage

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check DATABASE_URL format
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
```

#### 2. OAuth Redirect Mismatch
- OAuth provider'da redirect URI'yi kontrol edin
- NEXTAUTH_URL environment variable'ını kontrol edin

#### 3. Storage Upload Failed
- Storage credentials'leri kontrol edin
- CORS ayarlarını kontrol edin
- Bucket permissions'ları kontrol edin

#### 4. Redis Connection Failed
- UPSTASH_REDIS_REST_URL'i kontrol edin
- UPSTASH_REDIS_REST_TOKEN'i kontrol edin

### Debug Commands
```bash
# Check environment variables
vercel env ls

# View logs
vercel logs

# Check database connection
npx prisma db pull
```

## 📞 Support

Sorunlar için:
1. GitHub Issues: [Repository Issues](https://github.com/your-username/testnet-hub/issues)
2. Documentation: [UI-FREEZE.md](./UI-FREEZE.md)
3. Vercel Support: [Vercel Help Center](https://vercel.com/help)

---

**Not**: Bu deployment guide UI-Freeze prensiplerini koruyarak hazırlanmıştır. Tüm sistemler production-ready durumdadır.

