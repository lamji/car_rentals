# Coding Conventions — car_rentals

This document describes the coding conventions used in this repository. It is based on the current folder structure, tooling, and patterns already present in the codebase.

## Stack & Tooling

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict)
- **UI**: Tailwind CSS + shadcn/ui (Radix UI)
- **State**: Redux Toolkit (+ redux-persist)
- **Lint**: ESLint (Next.js core-web-vitals + TypeScript)

### Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`

ESLint is configured in `eslint.config.mjs` with the following warnings (not errors):
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unused-vars`
- `react/no-unescaped-entities`
- `react-hooks/exhaustive-deps`

## Project Structure

Primary directories under `src/`:

- `src/app/`
  - Next.js routes (App Router).
  - Each route uses a `page.tsx` and optional `layout.tsx`.
- `src/components/`
  - Reusable UI building blocks and feature components.
  - Subfolders used in this repo:
    - `ui/` (shadcn primitives)
    - `booking/`, `cars/`, `location/`, `search/`, `auth/` (feature folders)
- `src/hooks/`
  - Custom React hooks.
  - Contains `mock/` for mocked flows and `__tests__/` (currently empty).
- `src/lib/`
  - Shared logic and data:
    - `slices/` Redux slices
    - `store.ts` Redux store
    - `types.ts` root domain types
    - `types/` domain-specific types split by topic
- `src/utils/`
  - Utility functions (e.g. geocoding)
- `src/contexts/`
  - React contexts (e.g. geolocation)

## Naming Conventions

### Files & Folders

- **Components**: `PascalCase.tsx`
  - Example: `src/components/booking/BookingConfirmation.tsx`
- **Hooks**: `useSomething.ts`
  - Example: `src/hooks/useBookingPage.ts`
- **Types**:
  - General: `src/lib/types.ts`
  - Domain-specific: `src/lib/types/<domain>.ts` (e.g. `booking.ts`, `geolocation.ts`, `psgc.ts`)
- **Next routes**: `src/app/<route>/page.tsx`

### Symbols

- **React components**: `PascalCase`
- **Hooks**: `usePascalCase`
- **Types & Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`

## Imports

### Path Aliases

Use `@/*` imports (configured in `tsconfig.json`).

- Prefer: `import { X } from "@/components/..."`
- Avoid relative imports like `../../..` except within a tight local folder.

### Import Order

Use a consistent order:

1. React / Next imports
2. Third-party libraries
3. Absolute imports (`@/...`)
4. Relative imports (`./...`)
5. Type-only imports where possible (`import type { ... }`)

## React & Next.js Conventions

### Client Components

- Use `'use client'` only when needed (hooks, state, effects, browser APIs).
- Prefer server components by default, but this repo currently uses many client components.

### Component Design

- Keep pages/components **presentational** when possible.
- Put business logic, state, side effects, and handlers into hooks.
  - Example pattern: `src/app/.../page.tsx` consumes `src/hooks/useXxx.ts`.

### Hooks

- Prefer `useCallback` for event handlers passed to children.
- Prefer `useMemo` for derived values.
- Effects (`useEffect`) should:
  - Have correct dependency arrays.
  - Be split if they serve different responsibilities.

### Error Handling

- Prefer explicit error state and user-visible messages.
- Avoid swallowing errors silently.

## TypeScript Conventions

- Keep `strict: true` compatibility.
- Prefer `unknown` over `any`. If `any` is unavoidable, keep it localized and documented.
- Use `import type` for types.
- Prefer discriminated unions for variant data (e.g. pickup vs delivery).

## State Management

### Redux

- Slices live in `src/lib/slices/`.
- Prefer dispatching partial updates to slices where appropriate.
- Avoid duplicating source-of-truth state across local component state and Redux.

### Persistence

- If state needs persistence, use existing persistence hooks (e.g. `useBookingPersistence`).

## UI & Styling

- Use Tailwind CSS utility classes.
- Prefer shadcn/ui components from `src/components/ui/`.
- Keep className strings readable.

## Testing

This repository currently does not show a configured Jest/Vitest setup in the root.

- If tests are added, they should live alongside feature folders or in:
  - `src/hooks/__tests__/`
  - `src/components/<feature>/__tests__/`

## Linting & Quality Gates

Before pushing changes:

- Run `npm run lint`
- Run `npm run build`

If a change touches only a few files, it is acceptable to lint targeted paths:

- `npm run lint -- --fix <file1> <file2>`

## Code Review Checklist

- **Architecture**: UI separated from logic (hooks vs components/pages)
- **Types**: no unsafe casts; minimal `any`
- **Imports**: use `@/` alias; no unused imports
- **Effects**: dependencies correct; no redundant effects
- **UX**: loading/error states handled
- **Tooling**: lint/build pass
