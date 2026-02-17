# 2026-02-17 FIX CarModal ThumbnailBorderless

## Issue
Thumbnail sections in Car Management modal looked heavy due to visible borders.

## Solution
Removed border styling from compact ImageUpload cards and the main car thumbnail preview card. Replaced with subtle background + shadow for premium appearance.

## Pitfalls
Non-compact upload styling is still used elsewhere, so border removal was limited to compact variant to avoid global UI drift.
