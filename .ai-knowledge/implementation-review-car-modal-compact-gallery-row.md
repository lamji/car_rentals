Time: 10:31 PM

# Implementation Review - CarFormModal Thumbnail Compaction and One-Row Gallery

## Goal
Reduce image upload/preview footprint and place the 4 car image slots in one horizontal row for consistency and denser admin layout.

## Flow Process
1. Added a compact variant to ImageUpload with smaller preview height, icon size, spacing, and button sizing.
2. Applied compact mode to all four image slots in CarFormModal.
3. Reduced URL input sizes for image fields.
4. Changed gallery grid to grid-cols-1 md:grid-cols-2 xl:grid-cols-4 so desktop shows one row of 4 slots.
5. Reduced primary preview thumbnail dimensions via smaller card padding and bounded preview area.

## Affected Files
- src/components/ui/image-upload.tsx
- src/components/admin/cars/CarFormModal.tsx

## Verification
- Lint check completed for both modified files.
- Gallery now resolves to four columns on wide screens and stays responsive on smaller breakpoints.

## Risk Notes
- Low risk; compact mode is opt-in and only used by this modal currently.
