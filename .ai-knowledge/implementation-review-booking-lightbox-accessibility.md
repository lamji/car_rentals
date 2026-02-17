Time: 8:49 PM

# Implementation Review - Booking Lightbox Accessibility and Preview Sizing

## Goal
Fix Radix Dialog accessibility errors and improve the admin image lightbox preview size in booking details.

## Files Changed
- src/components/admin/Bookings/BookingDetailsModal.tsx

## Before vs After
- Before:
  - Nested lightbox DialogContent had no DialogTitle, triggering Radix a11y console error.
  - Lightbox image used src={viewImage || ''}, causing React/Next empty-src warning.
  - Lightbox viewport was constrained, resulting in a small preview.
- After:
  - Added hidden DialogTitle (sr-only) for the nested lightbox dialog.
  - Rendered <img> only when iewImage exists; removed empty-string src fallback.
  - Expanded dialog/container to near full viewport (98vw x 98vh) and made image fill container with object-contain.

## Key Logic Updates
- Guarded click handlers to open lightbox only if source image exists:
  - licenseImage
  - ltoPortalScreenshot
- Maintained existing UX behavior while removing runtime warnings.

## Validation
- Static verification in updated component confirms:
  - DialogTitle exists for lightbox content.
  - No empty string is passed to image src.
  - Preview sizing classes now use near-fullscreen dimensions.

## Risk Notes
- Low risk: changes are isolated to modal image-preview flow.
- If design wants even larger edge-to-edge view, reduce container padding from p-2 md:p-4.
