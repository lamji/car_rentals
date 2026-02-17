# 🔌 Direct Backend Service Integration

## 🏗️ Architecture Pattern
The application uses a **Direct Service Architecture**. Frontend components and hooks communicate directly with the `car_rental_service` backend (port 5000) for all core business logic and data persistence. 

Next.js API routes are **NOT** used as a proxy for these services, reducing latency and overhead.

## 🔗 Integrated Services
The following entities are managed directly by the `car_rental_service` backend:

| Entity | Backend Endpoint (Port 5000) |
|--------|-----------------------------|
| Cars | `/api/cars/*` |
| Bookings | `/api/bookings/*` |
| Payments | `/api/payments/*` |
| Subscriptions | `/api/subscriptions/*` |
| Cloudinary | `/api/cloudinary/*` |

## 🛠️ Implementation Details

### Direct API Calls
Hooks in `src/lib/api/` and PWA services in `src/lib/npm-ready-stack/` target the environment variable `process.env.NEXT_PUBLIC_API_URL` directly:
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/validate`, { ... });
```

### AI Bot Exception
The AI Assistant (`/api/ai-chat/*`) remains within the Next.js application layer. It handles intent classification, chat completions (via Groq), and special frontend actions (like sudo login/logout) before calling backend services for data when needed.

## 🚨 Guidelines for New Features
1. **Schema**: Define the MongoDB schema in `car_rental_service/models/`.
2. **Backend Route**: Implement the logic in `car_rental_service/routes/`.
3. **Frontend Hook**: Create/Update a React Query hook in `src/lib/api/` using `plugandplay-react-query-hooks` that points directly to the backend URL.
4. **Environment**: Ensure CORS is enabled on the backend for the frontend origin.
