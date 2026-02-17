# 🏗️ Project Architecture Map

## 🎯 Application Purpose
- A modern car rental booking application focused on the Philippine market, featuring a comprehensive PSGC-based geographic selection system.
- **Core Functionality**: Progressive location selection (Region to Barangay stage), car fleet browsing with filtering, multi-step secure booking flow, and fulfillment management (pickup/delivery).

## 🛠️ Technology Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript.
- **State Management**: Redux Toolkit (used for location caching and booking state).
- **Server State**: React Query (TanStack Query) for API data fetching.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **Utilities**: Axios (API client), date-fns (date manipulation).
- **Other**: Mapbox GL (maps), socket.io-client (real-time features), next-pwa (PWA support).

## 📍 Key Entry Points
- Frontend: `src/app/page.tsx`
- Admin Dashboard: `src/app/admin/`
- AI Assistant Handlers: `src/app/api/ai-chat`
- External Backend: `car_rental_service/` (Primary Node.js/Express service on port 5000)

## 🧠 Business Logic & Flows
- **API Standards**: All data fetching and mutations MUST use `plugandplay-react-query-hooks`. Custom hooks for specific entities should be created in `src/lib/api/` (e.g., `useGetCars.ts`, `usePostCar.ts`). Manual `fetch` calls are forbidden in components.

- **Booking Flow**: `src/components/booking/` -> `src/hooks/useBookingDetails.ts` -> Redux/API.
- **Location Selector**: `src/components/location/` -> `src/hooks/useReduxPSGCLocations.ts` -> PSGC API.
- **Data Layer**: Redux stores in `src/lib/store.ts`, slices in `src/lib/slices/`.
- **Car Lifecycle**: 
    - **Registration**: Cars are added via the Admin Dashboard. Required fields include model details, owner info, garage location, and tiered pricing (1h, 12h, 24h, Daily).
    - **Hold Status**: `isOnHold: boolean`. Used to temporarily block a car for booking (e.g., during payment processing or maintenance). If `true`, the car is filtered out of live results or marked as unavailable.
    - **Availability**: Managed via `unavailableDates` array. Real-time updates triggered via Socket.IO (`car_hold_status_updated`).
- **Backend Delegation**: Core entities (Cars, Bookings, Payments, Subscriptions, Cloudinary) are managed by the `car_rental_service` backend. The frontend communicates directly with this service via `NEXT_PUBLIC_API_URL`, bypassing Next.js API routes (except for AI Chatbot logic).

## ⚠️ Known Patterns & Constraints
- **Global Hooks**: Many components use hooks from `src/hooks/` instead of local directory hooks.
- **JSX Logic**: Some components contain significant conditional logic within the JSX blocks (violates new `code-structure-policy`).
- **Testing**: `jest` and `react-testing-library` are present but components currently lack mandatory `data-testid` attributes.
