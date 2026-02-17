# 2026-02-17 - FEAT - AuthRole - AdminOwnerFlow

## Issue
- Admin routes were reachable without authenticated admin/owner session.
- Login page had no real backend auth integration.
- Role behavior was not enforced in frontend and backend.
- Admin was still able to approve/cancel bookings (should be blocked).
- Owner onboarding (temp password + email + reset handoff) was not implemented.

## Solution
1. Frontend session + route guards
- Added authenticated session fields in Redux auth slice (`authToken`, `user`, `role`, `isAuthenticated`).
- Implemented real login hook to call `POST /api/auth/login`.
- Added cookie + localStorage session sync utilities in `src/lib/auth/session.ts`.
- Added Next middleware (`car_rentals/middleware.ts`) to:
  - Redirect unauthenticated `/admin*` access to `/login`.
  - Redirect authenticated users away from `/login`.
  - Restrict owner admin routes to `/admin/cars`, `/admin/bookings`, `/admin/notifications`.

2. Frontend role UX
- Updated admin sidebar to be role-aware (`admin` vs `owner`) and added logout session cleanup.
- Switched admin API hooks from static env token to runtime token from auth session.
- Added managed cars endpoint usage in admin hooks/pages (`/api/cars/managed`).
- Blocked booking action buttons in UI when role is `admin` (view-only).
- Added booking realtime refetch listeners for `booking_status_updated` and `booking_created`.

3. Backend roles + onboarding
- Extended `User` model with `owner` role, `mustResetPassword`, and `notificationId`.
- Updated login response to return `id`, `role`, `mustResetPassword`, and `notificationId`.
- Reset password now clears `mustResetPassword`.
- Added owner onboarding utility:
  - Create/upgrade owner account
  - Temporary password issuance (when needed)
  - Owner onboarding email sender
- Car creation now enforces owner email and binds `owner.userId`/`owner.notificationId`.

4. Backend authorization + scoping
- Added `GET /api/cars/managed` for authenticated scoped car listings.
- Added update/delete car permission rules:
  - Admin can create cars.
  - Admin loses edit/delete control once owner has reset password.
  - Owner can manage only own cars.
- Added booking owner metadata (`ownerUserId`, `ownerNotificationId`) at creation.
- Enforced booking status update permission:
  - `admin` blocked from approve/cancel.
  - `owner` allowed only for own cars/bookings.
- Added booking Socket.IO emits on create/status update.

## Pitfalls / Notes
- `npm run lint` in `car_rentals` still fails due pre-existing repository-wide issues unrelated to this task (config/public/scripts lint errors).
- Backend files touched in `car_rental_service` pass `node --check`.
- Existing data without owner linkage may not be fully owner-scoped until records are updated or re-created with onboarding flow.
