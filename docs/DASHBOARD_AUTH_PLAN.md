# Dashboard Auth & Session Handling Plan

Bu dokümantasyon dashboard user view için auth/session handling ve role-based access control planını açıklar.

## Mevcut Durum

### ✅ Tamamlananlar

1. **Auth System (`lib/auth.ts`)**
   - `getServerSession()` - Supabase session yönetimi
   - `getCurrentUser()` - Current user bilgisi
   - `hasRole()` - Role kontrolü
   - `isAdmin()`, `isContributor()` - Helper fonksiyonlar
   - Mock user support (development)

2. **Role-based Guards (`lib/auth-guards.ts`)**
   - `requireRole()` - Role-based guard
   - `requireAdmin()` - Admin guard
   - `requireContributor()` - Contributor guard
   - `requireAuth()` - Authenticated user guard
   - Route handler wrapper'lar: `withAdmin()`, `withContributor()`, `withAuth()`

3. **Dashboard Page (`app/dashboard/page.tsx`)**
   - Layout ve widget structure
   - Auth check ve redirect

4. **Dashboard Widgets**
   - `TasksWidget` - User task'ları (mock data)
   - `ApiKeyWidget` - API key yönetimi (mock data)
   - `RecentActivityWidget` - Recent activity feed (mock data)

5. **Dashboard API Routes**
   - `/api/dashboard/tasks` - Tasks endpoint (TODO: real implementation)
   - `/api/dashboard/api-keys` - API keys endpoint (TODO: real implementation)
   - `/api/dashboard/activity` - Activity endpoint (TODO: real implementation)

---

## Supabase Auth Audit

### Mevcut Yapı

**Supabase Client Setup:**
- `lib/supabase.ts` - Server-side client (service role)
- `lib/supabase-client.ts` - Client-side client (anon key)

**Session Handling:**
- Server-side: `getServerSession()` - cookies'den session okuma
- Client-side: `getClientSession()` - browser session

**Sorunlar:**
1. ❌ Cookie handling eksik - Next.js cookies() doğru şekilde kullanılmıyor
2. ❌ Role management eksik - User table ile bağlantı yok
3. ❌ JWT verification eksik - middleware'de basit kontrol var

### İyileştirmeler Gerekli

1. **Cookie Handling:**
   ```typescript
   // TODO: Proper cookie handling from Next.js request
   import { cookies } from 'next/headers';
   import { createServerClient } from '@supabase/ssr';
   
   export async function getServerSession() {
     const cookieStore = cookies();
     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name: string) {
             return cookieStore.get(name)?.value;
           },
           set(name: string, value: string, options: any) {
             cookieStore.set(name, value, options);
           },
           remove(name: string, options: any) {
             cookieStore.delete(name);
           }
         }
       }
     );
     const { data: { session } } = await supabase.auth.getSession();
     return session;
   }
   ```

2. **Role Management:**
   - User table'a `role` column ekle
   - Auth.users metadata'dan role al veya User table'dan join et
   - Admin/contributor/viewer rolleri yönet

3. **JWT Verification:**
   - Middleware'de JWT verify et
   - Role bilgisini JWT'den oku

---

## Role-based Guards

### Guard Types

1. **Admin Guard (`requireAdmin`)**
   - Admin role gerekli
   - Admin panel, user management, content management

2. **Contributor Guard (`requireContributor`)**
   - Contributor veya admin
   - Dashboard, task management, API key management

3. **Viewer Guard (`requireAuth`)**
   - Authenticated user
   - Public dashboard, profile viewing

### Usage Examples

```typescript
// Route handler with admin guard
export const GET = withAdmin(async (req, user) => {
  // user is guaranteed to be admin
  return NextResponse.json({ data: 'admin only' });
});

// Route handler with contributor guard
export const POST = withContributor(async (req, user) => {
  // user is contributor or admin
  return NextResponse.json({ data: 'contributor data' });
});

// Server component guard
const { user, redirect } = await serverGuard('admin');
if (redirect) {
  redirect(redirect);
}
```

---

## Widget Set

### 1. Tasks Widget (`TasksWidget`)

**Purpose:** User'ın testnet task'larını göster

**Mock Data:** ✅ Var
**Real API:** ❌ TODO

**Features:**
- Completed tasks
- Pending tasks
- Task status (completed/pending/failed)
- Testnet bilgisi
- Reward bilgisi

**TODO:**
- [ ] Create TaskCompletion table
- [ ] Link tasks with user progress
- [ ] Real API endpoint: `GET /api/dashboard/tasks`
- [ ] Filter by status
- [ ] Pagination

---

### 2. API Key Widget (`ApiKeyWidget`)

**Purpose:** User'ın API key'lerini yönet

**Mock Data:** ✅ Var
**Real API:** ❌ TODO

**Features:**
- API key listesi
- Key reveal/hide
- Copy to clipboard
- Rate limit gösterimi
- Usage tracking

**TODO:**
- [ ] Create ApiKey table
- [ ] Secure key generation
- [ ] Real API endpoint: `GET /api/dashboard/api-keys`
- [ ] Real API endpoint: `POST /api/dashboard/api-keys`
- [ ] Key revocation
- [ ] Key regeneration

---

### 3. Recent Activity Widget (`RecentActivityWidget`)

**Purpose:** User'ın son aktivitelerini göster

**Mock Data:** ✅ Var
**Real API:** ❌ TODO

**Features:**
- Activity timeline
- Task completions
- API calls
- Login events

**TODO:**
- [ ] Create ActivityLog table
- [ ] Track user activities
- [ ] Real API endpoint: `GET /api/dashboard/activity`
- [ ] Activity filtering
- [ ] Activity pagination

---

## Veritabanı Şeması (Gelecek)

### Yeni Tablolar

```sql
-- API Keys table
CREATE TABLE IF NOT EXISTS "ApiKey" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "key" TEXT NOT NULL UNIQUE,
  "rateLimit" INTEGER NOT NULL DEFAULT 100,
  "requestsUsed" INTEGER NOT NULL DEFAULT 0,
  "lastUsed" DATETIME,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Task Completion table
CREATE TABLE IF NOT EXISTS "TaskCompletion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "testnetId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "completedAt" DATETIME,
  "metadata" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE,
  FOREIGN KEY ("testnetId") REFERENCES "Testnet"("id") ON DELETE CASCADE
);

-- Activity Log table
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "metadata" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- User role column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'viewer';
```

---

## Live API Implementation TODO

### 1. Tasks API (`/api/dashboard/tasks`)

**TODO:**
```typescript
// Real implementation needed:
const tasks = await prisma.task.findMany({
  where: {
    taskCompletions: {
      some: { userId: user.id }
    }
  },
  include: {
    testnet: { select: { name: true, slug: true } }
  }
});
```

**Markers:** ✅ TODO comments in code

---

### 2. API Keys API (`/api/dashboard/api-keys`)

**TODO:**
```typescript
// Real implementation needed:
const apiKeys = await prisma.apiKey.findMany({
  where: { userId: user.id, isActive: true }
});

// Key generation:
const apiKey = generateSecureKey(); // crypto.randomBytes
await prisma.apiKey.create({ data: { userId, key: hash(apiKey), ... } });
```

**Markers:** ✅ TODO comments in code

---

### 3. Activity API (`/api/dashboard/activity`)

**TODO:**
```typescript
// Real implementation needed:
const activities = await prisma.activityLog.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' },
  take: limit
});
```

**Markers:** ✅ TODO comments in code

---

## Güvenlik Kontrolleri

### ✅ Yapılanlar

1. **Route Guards:** ✅ Tüm dashboard API'leri `withAuth()` ile korumalı
2. **Role Checks:** ✅ Role-based access kontrolü
3. **Mock Data:** ✅ Development için güvenli mock data

### ❌ Eksikler

1. **API Key Security:**
   - [ ] Keys hash'lenmeli (bcrypt/argon2)
   - [ ] Rate limiting middleware
   - [ ] Key rotation support

2. **Session Security:**
   - [ ] CSRF protection
   - [ ] Session timeout
   - [ ] Secure cookie flags

3. **Data Validation:**
   - [ ] Input validation (Zod schemas)
   - [ ] SQL injection prevention (Prisma)
   - [ ] XSS prevention

---

## Test Senaryoları

### 1. Auth Flow

```
User visits /dashboard
  ↓
getCurrentUser() called
  ↓
If no session → redirect to /login
  ↓
If session → load dashboard
  ↓
Widgets fetch data (mock/real)
```

### 2. Role-based Access

```
Admin → Full access (admin panel, dashboard)
Contributor → Dashboard, tasks, API keys
Viewer → Dashboard (read-only)
```

### 3. Widget Loading

```
Dashboard page loads
  ↓
Widgets fetch from API
  ↓
If API returns empty → show empty state
  ↓
If API returns data → render widget
```

---

## Migration Checklist

- [x] Auth system (`lib/auth.ts`)
- [x] Role-based guards (`lib/auth-guards.ts`)
- [x] Dashboard page (`app/dashboard/page.tsx`)
- [x] Dashboard layout (`components/dashboard/DashboardLayout.tsx`)
- [x] Tasks widget (`components/dashboard/widgets/TasksWidget.tsx`)
- [x] API Key widget (`components/dashboard/widgets/ApiKeyWidget.tsx`)
- [x] Activity widget (`components/dashboard/widgets/RecentActivityWidget.tsx`)
- [x] Dashboard API routes (skeleton with TODO)
- [x] Admin guard updates
- [ ] Real Supabase session handling
- [ ] User role column in database
- [ ] ApiKey table creation
- [ ] TaskCompletion table creation
- [ ] ActivityLog table creation
- [ ] Real API implementations
- [ ] API key generation & hashing
- [ ] Rate limiting
- [ ] CSRF protection

---

## Next Steps

1. **Supabase Auth Setup:**
   - Install `@supabase/ssr` for proper cookie handling
   - Update `getServerSession()` implementation
   - Configure auth middleware

2. **Database Migrations:**
   - Add role column to User table
   - Create ApiKey table
   - Create TaskCompletion table
   - Create ActivityLog table

3. **Real API Implementation:**
   - Implement `/api/dashboard/tasks` with real data
   - Implement `/api/dashboard/api-keys` with key management
   - Implement `/api/dashboard/activity` with activity tracking

4. **Security Hardening:**
   - API key hashing
   - Rate limiting
   - CSRF protection
   - Input validation

5. **Testing:**
   - Auth flow tests
   - Role-based access tests
   - Widget loading tests
   - API endpoint tests

---

## Kullanım Notları

### Development Mode

- Mock user otomatik olarak döner (Supabase yapılandırılmamışsa)
- Tüm widget'lar mock data ile çalışır
- Guard'lar development'da bypass edilir (gerekirse)

### Production Mode

- Gerçek Supabase auth gerekli
- Session cookie'lerinden okunur
- Role-based access zorunlu
- API key'ler hash'lenir ve güvenli saklanır

---

## İletişim & Destek

Auth/session soruları için:
- Dokümantasyon: `docs/DASHBOARD_AUTH_PLAN.md`
- Kod referansları: `lib/auth.ts`, `lib/auth-guards.ts`

