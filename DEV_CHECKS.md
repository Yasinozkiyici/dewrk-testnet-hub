# Dev Checks (Admin/API)

1) Uygulamayı 3001 portunda çalıştırın:

pnpm dev -- -p 3001

2) Tüm fetch() çağrıları göreli URL kullanır ("/api/..."). İstekler mevcut origin'e gider (dev'de 3001).

3) Tek Prisma şeması: `testnet-hub/prisma/schema.prisma`.

4) Tek `DATABASE_URL`: `testnet-hub/.env` veya `.env.local`.

5) Health route: GET `/api/health` -> `{ ok: true, ts }` (200).

Not: Landing/listing/detail UI'larında görsel değişiklik yapılmaz.

