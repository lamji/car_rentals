# Changelog

> **Maintenance Protocol (AI Directive)**:
> 1. **Size Limit**: If this file exceeds **500 lines**, create `CHANGELOG-<Year>.md` in this folder.
> 2. **Archival**: Move all completed versions prior to the current month into the archive file.
> 3. **Context**: Keep only `[Unreleased]` and the current active month in this main file.

All notable changes to the `car_rentals` project will be documented in this file.

## [Unreleased]

- Fixed: TypeScript build errors in `MOCK_CARS` data and `useNearestGarage` hook navigation logic.

## [2026-02-18]

### Fixed
- **Admin Users**: Resolved a critical navigation bug where clicking "Users" redirected admins to the homepage. Created the missing `src/app/admin/users/page.tsx` and restored the management dashboard.
- **Build System**: Resolved production build blockers by synchronizing mock data with current `Car` type schema.
- **Geolocation**: Hardened `useNearestGarage` hook to handle edge cases where car coordinates might be missing, preventing haversine calculation errors.
- **Environment**: Fixed `EPERM` lock issues during `next build` by identifying and clearing locked `.next` trace files.

### Changed
- **Admin Management**: Integrated Mapbox Autocomplete for garage address selection in the Car Management modal. This ensures accurate address data and automatically captures geographical coordinates for distance calculations.
- **Login UI**: Refactored the login page to a "Pure Input" focus. Removed logo, marketing features, and external links to create a distraction-free authentication interface with simplified sample credential buttons.


- Changed: Car Management modal now uses borderless thumbnail styling for a more premium look.

- Fixed: Car Management modal now uses compact thumbnail uploads and one-row 4-image gallery layout on desktop.

- Fixed: Booking modal (BookingDetailsModal) now matches Car Management modal fullscreen shell for consistent viewport behavior.

- Fixed: Admin Car Management modal (`CarFormModal`) now renders true fullscreen with viewport-anchored dialog overrides.

## [2026-02-17]

### Fixed
- **Admin Dashboard**: Refactored `AdminDashboard` page to be a "Pure View" component. Extracted logic to `useAdminDashboard` hook.
- **Booking Explorer**: 
    - Updated `BookingDetailsModal` to use Shadcn Fullscreen pattern.
    - Fixed "Image Lightbox" bug where preview was small/constrained. Switched to aggressive CSS overrides (`!w-screen !h-screen`) on a nested Dialog to force fullscreen display.
- **Knowledge System**:
    - Extracted Architecture documentation from `main-strict-rules.md` to `.agent/knowledge/chat-system-architecture.md` to save tokens.
    - Added Timestamp requirements to knowledge artifacts.
    - **Car Management**:
        - Redesigned **CarFormModal** with "Booking Explorer" aesthetics (Fullscreen, Dark Header, Card Layout).
        - Integrated missing `PATCH /hold-status` API (via `useUpdateHoldStatus`) to ensure side-effects trigger correctly.
        - Added support for 4 thumbnail images (Main, Side, Interior, Rear) in the Basic Info tab.
        - **Cloudinary Integration**: Updated `useUploadImage` to return `publicId`. Integrated `ImageUpload` component in CarFormModal to capture and store image IDs.
        - **Data Schema**: Updated `Car` Model and Validators to support `imagePublicIds` for better asset management (Deletions/Updates).

### Added
- **Protocols**: Added `AGENT.md` with Tiered Loading Strategy for rules.
- **Documentation**: Created `implementation-review-admin-dashboard.md` to track refactoring progress.

### Changed
- **Folder Structure**: Moved `BookingDetailsModal` to `src/components/admin/Bookings/` to comply with folder discipline rules.




