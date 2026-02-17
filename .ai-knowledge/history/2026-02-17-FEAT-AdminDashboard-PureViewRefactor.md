Time: 8:07 PM

# Issue: Admin Dashboard Code Smell (Logic/View Mixing)
- **Component**: `src/app/admin/page.tsx`
- **Problem**: UI logic, API calls, and state were heavily coupled, violating Clean Code and Senior Dev rules.

## Solution (2026-02-17)
- **Extracted Logic**: Created `useAdminDashboard` hook to handle all imperative code.
- **Pure View**: The component is now strictly declarative.
- **Reference**: See `useAdminDashboard.ts` for logic.

## Pitfalls to Avoid
- **Regression**: Do not add `useEffect` or `useState` back into `page.tsx` directly.
- **Standard**: Always import handlers from the `useAdminDashboard` hook.
