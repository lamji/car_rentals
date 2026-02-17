# 2026-02-17 FIX CarFormModal Fullscreen

## Issue
Admin Car Management modal was not true fullscreen. It was constrained by h-[90vh] w-[95vw] max-w-[1400px].

## Solution
Replaced constrained sizing with explicit fullscreen dialog overrides:
- !fixed !inset-0
- !w-screen !h-screen
- !max-w-none !max-h-none
- !translate-x-0 !translate-y-0

## Pitfalls
- Shared DialogContent has default center/transform styles, so fullscreen classes must explicitly override those defaults.
