# 2026-02-17 FIX BookingModal FullscreenConsistency

## Issue
Booking modal shell was using a constrained layout while Car Management modal used true fullscreen overrides, causing inconsistent behavior.

## Solution
Updated BookingDetailsModal top-level DialogContent to match Car modal fullscreen override classes.

## Pitfalls
Shared DialogContent defaults center content and apply transform offsets; fullscreen layout requires explicit override classes.
