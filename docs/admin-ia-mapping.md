# Admin Panel Information Architecture Mapping

## Current Structure (as of analysis)

### Routes (`app/admin/`)
- ✅ `/admin` - Main admin page with testnet list sidebar + editor
  - `page.tsx` - Server component with auth check + testnet list
  - `Editor.tsx` - Client component with form + preview

### Components (`components/admin/`)
- ✅ `TestnetForm.tsx` - Testnet editing form
- ✅ `TestnetPreview.tsx` - Live preview component
- ✅ `types.ts` - TypeScript types for admin forms

### Missing Sections
- ❌ `/admin/users` - User management (create, edit, delete, roles)
- ❌ `/admin/content` - Content sections management
  - ❌ `/admin/content/testnets` - Dedicated testnet list
  - ❌ `/admin/content/leaderboards` - Leaderboard management
  - ❌ `/admin/content/ecosystems` - Ecosystem management
  - ❌ `/admin/content/guides` - Guide management
  - ❌ `/admin/content/api-endpoints` - API endpoint docs management
- ❌ `/admin/settings` - Global settings (site config, integrations)
- ❌ `/admin/activity` - Activity log (audit trail)
- ❌ `/admin/dashboard` - Admin dashboard overview (stats, recent changes)

### Current Navigation
- Sidebar: Testnet list only
- No breadcrumbs
- No multi-section navigation
- No role-based UI filtering

## Proposed Navigation Layout

### Low-Fidelity Wireframe Notes

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Dewrk Admin" | User Menu | Settings Icon     │
└─────────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────────┐
│          │ Breadcrumbs: Admin > Content > Testnets      │
│ Sidebar  ├──────────────────────────────────────────────┤
│          │ Main Content Area                             │
│ [Tabs]   │ - Form Sections                              │
│          │ - Form Fields                                │
│ Content  │ - Action Buttons                             │
│ - Testnets│                                              │
│ - Leaderboards│                                          │
│ - Ecosystems│                                            │
│ - Guides │                                              │
│ - API Docs│                                              │
│          │                                              │
│ Users    │ Preview Panel (right side)                   │
│ - List   │ - Live preview                              │
│ - Roles  │ - Formatted output                          │
│          │                                              │
│ Activity │                                              │
│ - Log    │                                              │
│ - Filters│                                              │
│          │                                              │
│ Settings │                                              │
│ - Site   │                                              │
│ - Integrations│                                         │
│          │                                              │
│ Dashboard│                                              │
│ - Stats  │                                              │
│ - Recent │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Navigation Structure

1. **Sidebar Tabs** (vertical, sticky)
   - Content (expandable)
     - Testnets
     - Leaderboards
     - Ecosystems
     - Guides
     - API Docs
   - Users
     - List
     - Roles & Permissions
   - Activity
     - Log
     - Filters
   - Settings
     - Site Config
     - Integrations
   - Dashboard (overview)

2. **Breadcrumbs** (horizontal, below header)
   - Format: `Admin > Section > Resource > Action`
   - Examples:
     - `Admin > Content > Testnets`
     - `Admin > Content > Testnets > Ethereum Testnet`
     - `Admin > Users > Create New`

3. **Quick Actions** (header)
   - Search bar
   - Notifications
   - User menu
   - Settings shortcut

## Implementation Plan

1. Create `AdminLayout` component with sidebar + breadcrumbs
2. Create route structure under `app/admin/`
3. Refactor existing editor into reusable form sections
4. Add missing CRUD pages
5. Implement permissions layer
6. Add activity logging

