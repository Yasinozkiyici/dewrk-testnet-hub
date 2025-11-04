# Testnet Detail Page QA Checklist

## 🎯 Acceptance Criteria

### ✅ Data Integrity
- [ ] **API returns all required fields**: websiteUrl, githubUrl, twitterUrl, discordUrl, dashboardUrl, hasDashboard, totalRaisedUSD, discordRoles, gettingStarted[], tasks[], resources[], fundedBy[], fundingSummary[], tags[], highlights[], prerequisites[], estTimeMinutes, rewardType/rewardNote, kycRequired, requiresWallet, network, shortDescription, tasksCount
- [ ] **No duplicate data**: Funders, tasks, resources, and other arrays show unique entries only
- [ ] **Field name consistency**: Server and client use same field names (totalRaisedUSD vs totalRaisedUsd, etc.)
- [ ] **Null safety**: All fields handle null/undefined gracefully
- [ ] **Type safety**: Numbers are properly typed (not strings)

### ✅ Empty State Logic
- [ ] **Cards only render with content**: No phantom blank sections
- [ ] **Single empty state per section**: Never multiple placeholders
- [ ] **Proper empty state messages**: Clear, helpful messages for each section
- [ ] **Zero values render**: 0 totalRaisedUSD shows "Not disclosed", not hidden

### ✅ Cache & Performance
- [ ] **Cache tags work**: `revalidateTag('testnets')` and `revalidateTag(\`testnet:${slug}\`)` trigger updates
- [ ] **API caching**: `next: { tags: ['testnets', \`testnet:${slug}\`] }` works
- [ ] **Live updates**: Admin changes reflect immediately after revalidation

### ✅ UI/UX Standards
- [ ] **Dewrk visual language**: Small uppercase titles, tracking-wide, muted colors
- [ ] **Cards**: rounded-2xl, soft shadow, consistent padding
- [ ] **AA contrast**: All text meets accessibility standards
- [ ] **Progress bars**: Label (left), % (right), progress bar below
- [ ] **Mobile responsive**: Right sidebar stacks below main content
- [ ] **Keyboard navigation**: Focusable elements, ARIA labels

## 🧪 Test Scenarios

### 1. Complete Data Test
```bash
# Create testnet with all fields filled
# Expected: Every section visible, no empty states
```

### 2. Partial Data Test
```bash
# Remove some fields (e.g., no funders, no tasks)
# Expected: Cards disappear or show single empty state
```

### 3. Duplicate Data Test
```bash
# Add duplicate funders in database
# Expected: UI shows unique funders only
```

### 4. Cache Revalidation Test
```bash
# 1. Load page
# 2. Update testnet in admin
# 3. Check if changes appear
# Expected: Changes visible after revalidation
```

### 5. Edge Cases
```bash
# - totalRaisedUSD = 0 (should show "Not disclosed")
# - empty arrays (should show empty state)
# - null values (should not crash)
# - invalid JSON (should handle gracefully)
```

## 🔍 Debug Checklist

### API Response Check
```bash
# 1. Open Network tab in browser
# 2. Load testnet detail page
# 3. Check /api/testnets/[slug] response
# Expected: All fields present, proper types, no duplicates
```

### Field Name Mismatch Check
```bash
# 1. Compare API response field names with UI expectations
# 2. Look for: totalRaisedUsd vs totalRaisedUSD, funders vs fundedBy
# Expected: Exact matches
```

### Duplicate Data Check
```bash
# 1. Check if same funder appears multiple times
# 2. Check if same task appears multiple times
# 3. Look for join multiplication issues
# Expected: Each item appears once
```

### Cache Tag Check
```bash
# 1. Verify next: { tags: [...] } in fetch
# 2. Verify revalidateTag() calls in API
# Expected: Tags match between fetch and revalidation
```

### Empty State Check
```bash
# 1. Check if sections render when data is empty
# 2. Verify single empty state per section
# 3. Check if 0 values are hidden incorrectly
# Expected: Proper empty states, 0 values visible
```

## 🚀 Performance Tests

### Load Time
```bash
# 1. Measure page load time
# 2. Check API response time
# 3. Verify cache effectiveness
# Expected: < 2s load time, < 500ms API response
```

### Memory Usage
```bash
# 1. Check for memory leaks
# 2. Verify proper cleanup
# Expected: Stable memory usage
```

## 🔧 Automation Scripts

### Schema Validation
```bash
pnpm test:schemas
# Runs testnet-detail.test.ts
```

### API Tests
```bash
pnpm test:api
# Runs all API contract tests in tests/api/
```

### E2E Tests
```bash
pnpm test:e2e
# Runs all Playwright tests
```

### Smoke Tests
```bash
pnpm test:e2e:smoke
# Runs critical smoke tests for deployment verification
```

### Admin Tests
```bash
pnpm test:e2e:admin
# Runs admin action tests
```

---

## 🚀 Deployment & Smoke Test Steps

### Pre-Deployment Checklist

- [ ] **Database Migrations**
  ```bash
  # Local: Run migrations
  pnpm db:migrate
  
  # Production: Deploy migrations
  pnpm db:migrate:deploy
  ```

- [ ] **Environment Variables**
  ```bash
  # Verify all required env vars are set:
  # - NEXT_PUBLIC_SUPABASE_URL
  # - NEXT_PUBLIC_SUPABASE_ANON_KEY
  # - SUPABASE_SERVICE_ROLE_KEY
  # - DATABASE_URL
  # - SENTRY_DSN (optional)
  ```

- [ ] **Build Verification**
  ```bash
  # Run production build
  pnpm build
  
  # Check for build errors
  # TypeScript errors should be 0
  ```

### Post-Deployment Smoke Tests

#### 1. Health Check
```bash
curl https://your-domain.com/api/health
# Expected: {"ok":true,"status":"ok"}
```

#### 2. API Endpoints
```bash
# Testnets list
curl https://your-domain.com/api/testnets
# Expected: {"items":[...]}

# Testnet detail
curl https://your-domain.com/api/testnets/[any-slug]
# Expected: {...testnet data...} or 404

# Hero endpoints
curl https://your-domain.com/api/hero/summary
curl https://your-domain.com/api/hero/trending
curl https://your-domain.com/api/hero/gainers
```

#### 3. Critical Pages
```bash
# Homepage
curl -I https://your-domain.com/
# Expected: 200 OK

# Testnets page
curl -I https://your-domain.com/testnets
# Expected: 200 OK

# Admin page (should redirect or require auth)
curl -I https://your-domain.com/admin
# Expected: 200 OK or 401/403
```

#### 4. Playwright Smoke Tests
```bash
# Run automated smoke tests
pnpm test:e2e:smoke

# Tests cover:
# - Homepage loads
# - Testnet list loads
# - Testnet detail opens
# - API endpoints respond
# - No critical JavaScript errors
```

#### 5. Admin Actions Test
```bash
# Run admin critical actions test
pnpm test:e2e:admin

# Tests cover:
# - Create testnet
# - Update testnet
# - Cache invalidation
# - Error handling
# - Validation
```

### Manual Smoke Test Checklist

1. **Homepage**
   - [ ] Page loads without errors
   - [ ] Hero section visible
   - [ ] Testnet table visible
   - [ ] Filters work
   - [ ] No console errors

2. **Testnet Detail**
   - [ ] Click testnet row → drawer opens
   - [ ] Drawer content loads
   - [ ] Scroll works in drawer
   - [ ] Close button works

3. **Navigation**
   - [ ] All nav links work
   - [ ] URL changes correctly
   - [ ] Back button works

4. **Admin Panel** (if accessible)
   - [ ] Admin page loads
   - [ ] Form renders
   - [ ] Create testnet works
   - [ ] Update testnet works
   - [ ] Preview updates

5. **API Endpoints**
   - [ ] `/api/testnets` returns data
   - [ ] `/api/testnets/[slug]` returns detail
   - [ ] `/api/health` returns ok
   - [ ] Error responses have proper status codes

### Automated Test Coverage

#### API Tests (Vitest)
- [x] `/api/testnets` - GET endpoint
- [x] `/api/testnets/[slug]` - GET endpoint
- [x] `/api/admin/testnets/upsert` - POST endpoint
- [x] `/api/health` - GET endpoint
- [x] `/api/hero/summary` - GET endpoint
- [x] `/api/hero/trending` - GET endpoint
- [x] `/api/hero/gainers` - GET endpoint

#### E2E Tests (Playwright)
- [x] Critical smoke tests
- [x] Admin actions flow
- [x] Testnet detail drawer
- [x] Error handling

### Test Commands

```bash
# Run all API tests
pnpm test:api

# Run all E2E tests
pnpm test:e2e

# Run only smoke tests
pnpm test:e2e tests/e2e/smoke-critical.spec.ts

# Run only admin tests
pnpm test:e2e tests/e2e/admin-critical.spec.ts

# Run with coverage
pnpm test:api --coverage

# Run in watch mode
pnpm test:api --watch
```

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Run API Tests
  run: pnpm test:api

- name: Run Smoke Tests
  run: pnpm test:e2e:smoke

- name: Run Admin Tests
  run: pnpm test:e2e:admin
```

## 🎛️ Admin Panel Regression Tests

### Admin Navigation
- [ ] Sidebar navigation works (all sections accessible)
- [ ] Breadcrumbs show correct path
- [ ] Active section highlighted in sidebar
- [ ] Collapsible sections expand/collapse correctly

### Content Management
- [ ] Create new testnet succeeds
- [ ] Edit existing testnet works
- [ ] Live preview updates in real-time
- [ ] Save button shows loading state
- [ ] Success toast appears after save
- [ ] Undo option works (within 5 seconds)
- [ ] Form validation shows inline errors
- [ ] Invalid URLs show error message

### Permissions
- [ ] Admin role sees all actions
- [ ] Editor role cannot delete
- [ ] Viewer role sees read-only UI
- [ ] Buttons hidden for unauthorized actions

### Activity Log
- [ ] Activity log page loads
- [ ] Filters work (resource type, action)
- [ ] Search filters results
- [ ] Recent activity shows on dashboard

### Error Handling
- [ ] Network errors show user-friendly message
- [ ] Validation errors prevent save
- [ ] 404 redirects gracefully
- [ ] Rate limiting shows appropriate message

### Regression Steps

1. **Admin Navigation**
   ```bash
   # Navigate through all admin sections
   # Verify sidebar highlights active section
   # Check breadcrumbs update correctly
   ```

2. **Content CRUD**
   ```bash
   # Create → Edit → Delete testnet
   # Verify each operation works
   # Check activity log records changes
   ```

3. **Permissions**
   ```bash
   # Switch user roles (if possible)
   # Verify UI adapts to role
   # Test unauthorized action prevention
   ```

4. **Validation**
   ```bash
   # Submit form with invalid data
   # Verify inline errors appear
   # Fix errors and verify save succeeds
   ```

5. **Undo/Restore**
   ```bash
   # Save a change
   # Click undo within 5 seconds
   # Verify change is reverted
   ```

## 📊 Success Metrics

- [ ] **Zero console errors**: No JavaScript errors in browser console
- [ ] **100% field coverage**: All admin-filled fields render
- [ ] **Zero duplicates**: No duplicate data in any section
- [ ] **Proper empty states**: Clear messaging for missing data
- [ ] **Fast loading**: < 2s initial load, < 500ms API response
- [ ] **Accessibility**: Passes axe-core audit
- [ ] **Mobile friendly**: Works on all screen sizes

## 🐛 Common Issues & Solutions

### Issue: Fields not rendering
**Solution**: Check API response, verify field names match

### Issue: Duplicate data
**Solution**: Check uniqBy function, verify database joins

### Issue: Cache not updating
**Solution**: Verify revalidateTag calls, check tag names

### Issue: Empty states showing when data exists
**Solution**: Check null safety, verify array length checks

### Issue: 0 values hidden
**Solution**: Use explicit checks, not truthy checks for numbers

