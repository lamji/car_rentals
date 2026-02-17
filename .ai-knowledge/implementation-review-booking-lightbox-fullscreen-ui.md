Time: 8:59 PM

# Implementation Review - Booking Lightbox Fullscreen Backdrop and Close Button

## Goal
Fix fullscreen image modal usability by ensuring a visible backdrop and a reliably visible close button.

## Flow Process
1. Reworked nested lightbox DialogContent to occupy the full viewport using w-screen h-screen and reset transform offsets.
2. Added an internal dark backdrop layer (g-black/85) for stronger visual focus and contrast.
3. Repositioned close button to 	op-4 right-4 with higher z-index and visible styling.
4. Preserved image preview quality using centered container and object-contain at full available height/width.
5. Added click-outside behavior on backdrop/container while preventing image click from closing via stopPropagation.

## Affected Files
- src/components/admin/Bookings/BookingDetailsModal.tsx

## Verification
- Visual behavior expectations after patch:
  - Fullscreen image view fills viewport.
  - Backdrop is clearly visible behind image.
  - X close button remains visible at top-right.
  - Clicking outside image closes modal; clicking image does not.

## Risk Notes
- Low risk; changes are isolated to nested image lightbox rendering and interaction behavior.
