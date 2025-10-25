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
npm run test:schemas
# Runs testnet-detail.test.ts
```

### API Tests
```bash
npm run test:api
# Runs api-testnet-detail.test.ts
```

### E2E Tests
```bash
npm run test:e2e:detail
# Runs Playwright tests for detail page
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

