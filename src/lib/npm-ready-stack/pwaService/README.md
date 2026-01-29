# PWA Service

Isolated PWA functionality for Car Rentals application.

## Features

- **Push Notifications**: Subscribe, unsubscribe, and send push notifications
- **Install Prompt**: Show installation instructions for PWA (iOS and Android)
- **Service Worker**: Custom service worker for push notification handling

## Setup

### 1. Generate VAPID Keys

Install web-push globally and generate keys:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

### 2. Add Environment Variables

Create a `.env.local` file with your VAPID keys:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. Update Email in Actions

Edit `src/lib/pwaService/actions.ts` and update the email address:

```typescript
webpush.setVapidDetails(
  'mailto:your-email@example.com',  // Update this
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
```

## Usage

### Import Components

```tsx
import { PushNotificationManager, InstallPrompt } from '@/lib/pwaService'

export default function SettingsPage() {
  return (
    <div>
      <PushNotificationManager />
      <InstallPrompt />
    </div>
  )
}
```

### Import Utilities

```tsx
import { isPushNotificationSupported, isIOSDevice } from '@/lib/pwaService'

if (isPushNotificationSupported()) {
  // Enable push notification features
}
```

### Server Actions

```tsx
import { subscribeUser, unsubscribeUser, sendNotification } from '@/lib/pwaService/actions'

// Subscribe user
await subscribeUser(subscription)

// Send notification
await sendNotification('Hello from Car Rentals!')
```

## File Structure

```
src/lib/pwaService/
├── index.ts                 # Main exports
├── types.ts                 # TypeScript types
├── utils.ts                 # Utility functions
├── actions.ts               # Server actions for push
├── README.md                # This file
└── components/
    ├── index.ts             # Component exports
    ├── PushNotificationManager.tsx
    └── InstallPrompt.tsx

public/
└── push-sw.js               # Service worker for push notifications
```

## Production Notes

- In production, store subscriptions in a database instead of in-memory
- The service worker (`push-sw.js`) handles incoming push events
- VAPID keys must be kept secret (private key should never be exposed)
