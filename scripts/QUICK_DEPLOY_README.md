# Production Database Quick Deploy

Bu script production veritabanına migration ve seed yapar.

## Kullanım

```bash
# DIRECT_URL environment variable ile
DIRECT_URL="postgresql://postgres:***@db.xxx.supabase.co:5432/postgres?sslmode=require" \
pnpm db:quick-deploy

# Veya DIRECT_URL'i parametre olarak geçir
pnpm db:quick-deploy "postgresql://postgres:***@db.xxx.supabase.co:5432/postgres?sslmode=require"
```

## DIRECT_URL Nasıl Bulunur?

1. Supabase Dashboard → Settings → Database → Connection String
2. "Direct connection" seçeneğini seç
3. Port: 5432 olmalı (pooler değil!)
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require`

## Alternatif: Debug Endpoint'ten Al

```bash
curl https://dewrk-testnet-hub.vercel.app/api/debug/db | jq '.database.directUrl'
```

Not: Şifre maskelenmiş olacak, gerçek şifreyi Supabase Dashboard'dan almanız gerekiyor.

