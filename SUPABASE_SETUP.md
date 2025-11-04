# 🚀 Supabase Kurulum Rehberi

## 1️⃣ Supabase Projesi Oluştur

1. https://supabase.com/dashboard adresine git
2. "New Project" butonuna tıkla
3. Proje bilgilerini doldur:
   - **Name**: dewrk-testnet-hub
   - **Database Password**: Güçlü bir şifre oluştur (kaydet!)
   - **Region**: Yakın bir bölge seç (örn: Europe West)
4. "Create new project" butonuna tıkla (2-3 dakika sürer)

---

## 2️⃣ Supabase Bilgilerini Al

### A) API Credentials (Settings → API)

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# anon/public key (reveal butonuna tıkla)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...

# service_role key (reveal butonuna tıkla) - GİZLİ TUT!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
```

### B) Database Connection (Settings → Database)

**Connection String** bölümünden:

**Transaction pooler (Port 6543) - Vercel için:**
```bash
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Session pooler (Port 6543) - Alternatif:**
```bash
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Direct connection (Port 5432) - Migration için:**
```bash
DIRECT_URL=postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require
```

⚠️ `[YOUR-PASSWORD]` yerine 1. adımda oluşturduğunuz şifreyi yazın!

### C) JWT Secret (Settings → API → JWT Settings)

```bash
# "reveal" butonuna tıklayın
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
```

---

## 3️⃣ Local .env Dosyası Oluştur

Proje kök dizininde `.env` dosyası oluştur:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Database (Supabase Postgres)
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:4000"
PORT=4000
NODE_ENV=development
```

---

## 4️⃣ Vercel Environment Variables Ekle

Vercel Dashboard → Settings → Environment Variables:

1. Yukarıdaki tüm değişkenleri ekle
2. **Environment** seçenekleri:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
3. **Save** butonuna tıkla

---

## 5️⃣ Veritabanı Migration Çalıştır

### Supabase'e Migration Uygula

```bash
# Local'den Supabase'e bağlan
pnpm prisma migrate deploy

# Veya SQL Editor'dan manuel çalıştır
# supabase/migrations/*.sql dosyalarını SQL Editor'a yapıştır
```

### Seed Verilerini Yükle

```bash
pnpm db:seed
```

---

## 6️⃣ Vercel'e Redeploy

```bash
# 1. Git push (otomatik deploy tetikler)
git add .
git commit -m "feat: Add Supabase environment variables"
git push origin main

# 2. Veya Vercel Dashboard'dan manuel deploy
Vercel Dashboard → Deployments → Redeploy
```

---

## ✅ Test Et

### Local Test
```bash
pnpm dev
# http://localhost:4000/api/health
# http://localhost:4000/testnets
```

### Production Test
```bash
# https://your-domain.vercel.app/api/health
# https://your-domain.vercel.app/testnets
```

---

## 🚨 Troubleshooting

### "Connection refused" hatası
- Database URL'in doğru olduğundan emin ol
- Şifrede özel karakterler varsa URL encode et (%20, %21 vb.)
- Port 6543 (pooler) kullanıldığından emin ol

### "Invalid JWT" hatası
- SUPABASE_JWT_SECRET doğru mu kontrol et
- Vercel'de environment variables güncellendikten sonra redeploy yap

### Migration hataları
- Direct connection (5432) kullan, pooler değil
- SSL mode `require` olmalı
- `psql` komutu: `-p 5432` (pooler değil)

---

## 📚 Kaynaklar

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Not**: Varsayılan kurulum Supabase (Postgres) içindir. Yalnızca lokal prototipleme için `DATABASE_URL="file:./prisma/dev.db"` tanımlayarak SQLite kullanabilirsin; ancak production ve paylaşılan ortamlar Supabase bağlantısı gerektirir.
