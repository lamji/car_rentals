# Atomic History - Admin Users Page Fix

**Date**: 2026-02-18
**Context**: Admin reported being redirected to the homepage when clicking "Users" in the sidebar.

## Problem
The `/admin/users/page.tsx` file was missing from the project. Consequently, clicking the "Users" link triggered the `src/app/not-found.tsx` handler, which is configured to immediately redirect all 404 errors to the homepage (`/`).

## Solution
1. **Created Users Page**: Implemented `src/app/admin/users/page.tsx` with a standard admin layout (Table, Search, Stats placeholder).
2. **Design Consistency**: Followed the Shadcn + Lucide pattern used in `subscriptions` and `cars` pages.
3. **Guard Alignment**: The new route falls under the `/admin/:path*` matcher in `middleware.ts`, ensuring it remains protected.

## Verification
- Navigate to `/admin/users` manually or via sidebar.
- Redirect to homepage should no longer occur.
