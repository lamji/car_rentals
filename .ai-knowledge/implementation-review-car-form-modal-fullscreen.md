Time: 10:18 PM

# Implementation Review - CarFormModal True Fullscreen

## Goal
Force the Admin Car Management modal to render as true fullscreen and remove width/height constraints.

## Flow Process
1. Identified current modal constraints in CarFormModal (h-[90vh] w-[95vw] max-w-[1400px]).
2. Replaced sizing with hard fullscreen overrides compatible with shared DialogContent defaults.
3. Ensured transform offsets are zeroed (	ranslate-x-0 translate-y-0) and viewport anchors are explicit (inset-0).

## Affected Files
- src/components/admin/cars/CarFormModal.tsx

## Verification
- Modal now uses viewport dimensions (w-screen h-screen) with no max width/height cap.
- Positioning is pinned to viewport edges and no center-shrink behavior remains.

## Risk Notes
- Low risk; scoped to className on modal container only.
