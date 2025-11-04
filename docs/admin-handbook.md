# Admin Panel Handbook

## Overview

The Dewrk admin panel provides a unified interface for managing testnets, ecosystems, leaderboards, guides, and scheduled automation. This handbook covers usage, best practices, and troubleshooting.

## Control Center at a Glance

- **Dashboard Metrics** – Total resources plus last refresh timestamp across the platform.
- **Tabs** – Switch between Testnets, Ecosystems, Leaderboard, Guides, System, and Health sections.
- **Password Gate** – Production environments require the `NEXT_PUBLIC_ADMIN_PASS` passphrase (stored in session storage after success).
- **Roles** – Buttons that mutate state are disabled for `viewer` role accounts.

## Navigation

### Sidebar Structure

- **Dashboard** - Overview of recent activity and statistics
- **Content** (expandable)
  - Testnets - Manage testnet listings
  - Leaderboards - Configure leaderboard entries
  - Ecosystems - Manage ecosystem pages
  - Guides - Edit guides and documentation
  - API Docs - Manage API endpoint documentation
- **Users** - User management and roles
- **Activity** - Audit log of all changes
- **Settings** - Site configuration and integrations

### Breadcrumbs

Breadcrumbs show your current location in the admin hierarchy:
- Format: `Admin > Section > Resource > Action`
- Click any breadcrumb to navigate back

## Content Management

### Editing Testnets

1. Open the **Testnets** tab in the control center.
2. Select the row you want to edit – the inline form populates beneath the table.
3. Update key fields (name, status, reward type, funding) and click **Save**.
4. Reset resets the form to the currently selected record.

### Editing Ecosystems

1. Switch to the **Ecosystems** tab.
2. Pick an ecosystem card to load its metrics into the inline form.
3. Adjust network type, funding totals, or active counts and save.

### Updating Leaderboard Entries

1. Use the **Leaderboard** tab to review top builders.
2. Adjust point totals via the numeric input and hit **Save** per row.
3. The change column is automatically updated via the refresh job.

### Guides Editor

1. Open the **Guides** tab and choose a markdown file from the select menu.
2. Edit raw markdown in the left textarea; the right column renders a live preview.
3. Save writes to `content/guides/<slug>.md` and revalidates the guides cache.

### Validation Rules

- **Name**: Required, max 200 characters
- **Network**: Required, max 100 characters
- **URLs**: Must be valid HTTP/HTTPS URLs
- **Numbers**: Must be positive (0 or greater)
- **Tags/Categories**: Max 20 tags, max 10 categories

## Permissions

### Roles

- **Admin**: Full access to all features.
- **Editor**: Can edit records but cannot trigger cron jobs.
- **Viewer**: Read-only; save/refresh buttons are disabled.

Buttons automatically disable based on the current role (derived from `NEXT_PUBLIC_ADMIN_ROLE`).

## Activity Log

### Viewing Activity

Navigate to **Activity** to see:
- Who made changes
- What was changed
- When it was changed
- Field-level diffs (when available)

### Filtering

Use filters to:
- Filter by resource type (testnets, users, etc.)
- Filter by action (create, update, delete)
- Search by resource name or user

## Best Practices

### Before Saving

1. Review preview panel to ensure changes look correct
2. Check for validation errors (shown in red)
3. Test URLs by clicking them in preview

### After Saving

- Changes revalidate caches for the relevant tag (testnets, ecosystems, leaderboard, guides).
- The weekly cron job updates derived metrics each Sunday 02:00 UTC; you can re-run it manually from the **System** tab.

## Troubleshooting

### "Access Denied"

- Check that you're logged in
- Verify your role has required permissions
- Contact an admin if issues persist

### Validation Errors

- Red text below fields indicates the issue
- Fix errors before saving
- Some fields have character limits

### Changes Not Appearing

- Wait a few seconds for cache invalidation
- Hard refresh the public page (Cmd+Shift+R / Ctrl+Shift+R)
- Check Activity Log to confirm save succeeded

## Scheduled Refresh Job

- The `/api/jobs/refresh` endpoint runs every Sunday 02:00 UTC (configured in `vercel.json`).
- Manual trigger available via **System → 🔄 Trigger Refresh**.
- Output is appended to `data/update.log` and surfaced in the Health tab.

### Preview Not Updating

- Preview updates automatically as you type
- If stuck, try clicking away and back to the field
- Check browser console for JavaScript errors

## Keyboard Shortcuts

- `Cmd/Ctrl + S` - Save changes (when form is focused)
- `Esc` - Close modals/drawers
- `Tab` - Navigate between fields

## Support

For issues or questions:
1. Check this handbook
2. Review Activity Log for error context
3. Contact development team with:
   - What you were trying to do
   - What error message appeared (if any)
   - Screenshot of the issue
