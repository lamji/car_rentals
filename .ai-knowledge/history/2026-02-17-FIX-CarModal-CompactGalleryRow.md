# 2026-02-17 FIX CarModal CompactGalleryRow

## Issue
Car Management modal image upload area was too large and gallery slots were not displayed in a single row on desktop.

## Solution
Added compact mode to ImageUpload and applied it to the 4 gallery inputs. Updated grid to xl:grid-cols-4 for one-row desktop layout and reduced preview/input sizing.

## Pitfalls
ImageUpload had fixed large preview dimensions, so a reusable opt-in compact variant was required instead of per-instance CSS hacks.
