Time: 8:44 PM

# Issue: Lightbox Focus & Size Bug
- **Component**: `src/components/admin/Bookings/BookingDetailsModal.tsx`
- **Problem**: 
    1. **Focus Trap**: The custom lightbox `div` was rendered *outside* the Shadcn Radix Portal, making clicks "fall through" to the blocked modal beneath.
    2. **Scaling**: The image preview was constrained to the parent `DialogContent` max-width, appearing tiny.

## Solution (2026-02-17)
- **Fix 1 (Render)**: Replaced the raw CSS `div` with a *nested* `<Dialog>` component. This creates a proper stack context and handles focus correctly.
- **Fix 2 (CSS Force)**: Applied aggressive `!important` classes:
  - `!max-w-[100vw]`
  - `!h-[100vh]` 
  - `!fixed`
  - `!z-[200]`
  - To break out of Shadcn's restrictive defaults.

## Pitfalls to Avoid
- **Regression**: Do not revert to a simple `div` overlay. It breaks accessibility and focus management.
- **Regression**: Do not remove the `!important` width/height overrides or Shadcn will clamp the image size.
