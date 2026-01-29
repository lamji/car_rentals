# Smart Alert Subscription PWA Package

A comprehensive Progressive Web App (PWA) subscription alert system that intelligently manages push notification subscriptions with device ID validation and Redux integration.

## 📁 Structure

```
smartAlertSubscriptionPwa/
├── bl/
│   └── useSmartSubscription.ts    # Business logic hook
├── ui/
│   └── SmartSubscriptionAlert.tsx # UI component
├── index.tsx                      # Main export file
└── README.md                      # This file
```

## 🚀 Features

- **Smart Device Detection**: Checks both local storage and database to prevent duplicate subscriptions
- **Permission Management**: Handles notification permission requests and status monitoring
- **Redux Integration**: Uses global alerts for user feedback
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Auto-retry**: Periodically checks for permission revocation and re-prompts
- **TypeScript Support**: Full type safety with proper interfaces

## 📦 Usage

### Basic Usage

```tsx
import { SmartSubscriptionAlert } from '@/lib/npmPackage/smartAlertSubscriptionPwa'

function Layout() {
  return (
    <div>
      <SmartSubscriptionAlert />
      {/* Your app content */}
    </div>
  )
}
```

### With Global Alert System

```tsx
import { SmartSubscriptionAlert } from '@/lib/npmPackage/smartAlertSubscriptionPwa'
import { useAlerts } from '@/hooks/useAlerts'

function SmartSubscriptionWrapper() {
  const alerts = useAlerts()

  const alertHandler = (alert) => {
    switch (alert.type) {
      case 'success':
        alerts.showSuccessAlert(alert.title, alert.message, alert.duration)
        break
      case 'error':
        alerts.showErrorAlert(alert.title, alert.message, alert.duration)
        break
      case 'warning':
        alerts.showWarningAlert(alert.title, alert.message, alert.duration)
        break
      case 'info':
        alerts.showInfoAlert(alert.title, alert.message, alert.duration)
        break
    }
  }

  return (
    <SmartSubscriptionAlert 
      config={{ alertHandler }} 
    />
  )
}

function Layout() {
  return (
    <div>
      <SmartSubscriptionWrapper />
      {/* Your app content */}
    </div>
  )
}
```

### Complete Implementation Example

Here's the complete implementation used in the Car Rentals application:

#### File: `src/components/ui/SmartSubscriptionAlertWrapper.tsx`

```tsx
'use client'

import { SmartSubscriptionAlert } from '@/lib/npmPackage/smartAlertSubscriptionPwa'
import { useAlerts } from '@/hooks/useAlerts'

/**
 * Wrapper component that provides the alert handler to SmartSubscriptionAlert
 * Uses the global alert system from useAlerts hook
 */
export function SmartSubscriptionAlertWrapper() {
  const alerts = useAlerts()

  // Create alert handler that maps to the global alert system
  const alertHandler = (alert: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }) => {
    switch (alert.type) {
      case 'success':
        alerts.showSuccessAlert(alert.title, alert.message, alert.duration)
        break
      case 'error':
        alerts.showErrorAlert(alert.title, alert.message, alert.duration)
        break
      case 'warning':
        alerts.showWarningAlert(alert.title, alert.message, alert.duration)
        break
      case 'info':
        alerts.showInfoAlert(alert.title, alert.message, alert.duration)
        break
    }
  }

  return (
    <SmartSubscriptionAlert 
      config={{
        alertHandler
      }} 
    />
  )
}
```

#### File: `src/app/layout.tsx` (Integration)

```tsx
import { SmartSubscriptionAlertWrapper } from "@/components/ui/SmartSubscriptionAlertWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <GeolocationWrapper>
            <LocationPermissionBanner />
            <SmartSubscriptionAlertWrapper />
            <InstallPrompt />
            <LayoutContent>
              {children}
            </LayoutContent>
            <PWAAutoLauncher />
          </GeolocationWrapper>
        </ReduxProvider>
      </body>
    </html>
  )
}
```

#### Key Implementation Details:

1. **Wrapper Component**: `SmartSubscriptionAlertWrapper` handles the integration
2. **Global Alert System**: Uses `useAlerts()` hook for Redux-based alerts
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Alert Mapping**: Maps package alert types to global alert functions
5. **Layout Integration**: Simple import and use in main layout

#### Benefits of This Approach:

- **🔗 Seamless Integration**: Works with existing global alert system
- **📦 Package Independence**: Package remains framework-agnostic
- **🧪 Testable**: Easy to mock alerts in unit tests
- **🔄 Maintainable**: Clear separation of concerns
- **📱 Mobile Ready**: Maintains all mobile PWA features
- **⚙️ Configurable**: Can be adapted for different alert systems

This implementation demonstrates how to integrate the SmartSubscriptionAlert package with any existing alert system while maintaining the package's independence and flexibility.

### Advanced Usage

```tsx
import { useSmartSubscription, SmartSubscriptionAlertUI } from '@/lib/npmPackage/smartAlertSubscriptionPwa'

function CustomAlert() {
  const {
    showSubscriptionPrompt,
    isChecking,
    isSubscribing,
    handleSubscribe,
    handleDismiss
  } = useSmartSubscription()

  return (
    <SmartSubscriptionAlertUI
      showSubscriptionPrompt={showSubscriptionPrompt}
      isChecking={isChecking}
      isSubscribing={isSubscribing}
      onSubscribe={handleSubscribe}
      onDismiss={handleDismiss}
    />
  )
}
```

### Custom API Endpoints

```tsx
import { useSmartSubscription } from '@/lib/npmPackage/smartAlertSubscriptionPwa'

function CustomEndpointsAlert() {
  const subscription = useSmartSubscription({
    endpoints: {
      checkDevice: '/api/v2/subscriptions/check-device',
      subscribe: '/api/v2/pwa/subscribe'
    }
  })

  // Use subscription state as needed
  return <SmartSubscriptionAlertUI {...subscription} />
}
```

### Environment-based Configuration

```tsx
// In your app configuration
const config = {
  endpoints: {
    checkDevice: process.env.NEXT_PUBLIC_SUBSCRIPTION_CHECK_API || '/api/subscriptions/check-device',
    subscribe: process.env.NEXT_PUBLIC_PWA_SUBSCRIBE_API || '/api/pwa/subscribe'
  }
}

function AppAlert() {
  return <SmartSubscriptionAlert config={config} />
}
```

## 📋 Full Sample Implementation

### Step 1: Environment Configuration

Create or update your `.env.local` file:

```env
# API Endpoints for Smart Subscription
NEXT_PUBLIC_SUBSCRIPTION_CHECK_API=https://api.yourapp.com/v2/subscriptions/check-device
NEXT_PUBLIC_PWA_SUBSCRIBE_API=https://api.yourapp.com/v2/pwa/subscribe

# Optional: Override for different environments
# NEXT_PUBLIC_SUBSCRIPTION_CHECK_API=http://localhost:3000/api/subscriptions/check-device
# NEXT_PUBLIC_PWA_SUBSCRIBE_API=http://localhost:3000/api/pwa/subscribe
```

### Step 2: Configuration File

Create `src/lib/subscriptionConfig.ts`:

```tsx
import { SmartSubscriptionConfig } from '@/lib/npmPackage/smartAlertSubscriptionPwa'

/**
 * Smart subscription configuration with external API endpoints
 */
export const subscriptionConfig: SmartSubscriptionConfig = {
  endpoints: {
    checkDevice: process.env.NEXT_PUBLIC_SUBSCRIPTION_CHECK_API || '/api/subscriptions/check-device',
    subscribe: process.env.NEXT_PUBLIC_PWA_SUBSCRIBE_API || '/api/pwa/subscribe'
  }
}

/**
 * Development-specific configuration
 */
export const devSubscriptionConfig: SmartSubscriptionConfig = {
  endpoints: {
    checkDevice: 'http://localhost:3001/api/subscriptions/check-device',
    subscribe: 'http://localhost:3001/api/pwa/subscribe'
  }
}

/**
 * Production-specific configuration
 */
export const prodSubscriptionConfig: SmartSubscriptionConfig = {
  endpoints: {
    checkDevice: 'https://api.carrentals.com/v2/subscriptions/check-device',
    subscribe: 'https://api.carrentals.com/v2/pwa/subscribe'
  }
}
```

### Step 3: Application Layout Integration

Update your `src/app/layout.tsx`:

```tsx
import { SmartSubscriptionAlert } from '@/lib/npmPackage/smartAlertSubscriptionPwa'
import { subscriptionConfig } from '@/lib/subscriptionConfig'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <GeolocationWrapper>
            <LocationPermissionBanner />
            
            {/* Smart Subscription Alert with external endpoints */}
            <SmartSubscriptionAlert config={subscriptionConfig} />
            
            <InstallPrompt />
            <LayoutContent>
              {children}
            </LayoutContent>
            <PWAAutoLauncher />
          </GeolocationWrapper>
        </ReduxProvider>
      </body>
    </html>
  )
}
```

### Step 4: Environment-specific Usage

For different environments, create a configuration hook:

```tsx
// src/hooks/useSubscriptionConfig.ts
import { useMemo } from 'react'
import { SmartSubscriptionConfig } from '@/lib/npmPackage/smartAlertSubscriptionPwa'

export function useSubscriptionConfig(): SmartSubscriptionConfig {
  return useMemo(() => {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging'
    
    if (isDevelopment) {
      return {
        endpoints: {
          checkDevice: 'http://localhost:3001/api/subscriptions/check-device',
          subscribe: 'http://localhost:3001/api/pwa/subscribe'
        }
      }
    }
    
    if (isStaging) {
      return {
        endpoints: {
          checkDevice: 'https://staging-api.carrentals.com/v2/subscriptions/check-device',
          subscribe: 'https://staging-api.carrentals.com/v2/pwa/subscribe'
        }
      }
    }
    
    // Production
    return {
      endpoints: {
        checkDevice: process.env.NEXT_PUBLIC_SUBSCRIPTION_CHECK_API || 'https://api.carrentals.com/v2/subscriptions/check-device',
        subscribe: process.env.NEXT_PUBLIC_PWA_SUBSCRIBE_API || 'https://api.carrentals.com/v2/pwa/subscribe'
      }
    }
  }, [])
}
```

### Step 5: Dynamic Configuration Usage

```tsx
// src/components/SmartSubscriptionWrapper.tsx
'use client'

import { SmartSubscriptionAlert } from '@/lib/npmPackage/smartAlertSubscriptionPwa'
import { useSubscriptionConfig } from '@/hooks/useSubscriptionConfig'

export function SmartSubscriptionWrapper() {
  const config = useSubscriptionConfig()
  
  return <SmartSubscriptionAlert config={config} />
}
```

### Step 6: Custom Implementation with Error Handling

```tsx
// src/components/CustomSmartSubscription.tsx
'use client'

import { useSmartSubscription, SmartSubscriptionAlertUI } from '@/lib/npmPackage/smartAlertSubscriptionPwa'
import { useState, useEffect } from 'react'

export function CustomSmartSubscription() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading')
  
  const config = {
    endpoints: {
      checkDevice: 'https://api.carrentals.com/v2/subscriptions/check-device',
      subscribe: 'https://api.carrentals.com/v2/pwa/subscribe'
    }
  }
  
  const subscription = useSmartSubscription(config)
  
  // Check API availability
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('https://api.carrentals.com/health')
        setApiStatus(response.ok ? 'online' : 'offline')
      } catch {
        setApiStatus('offline')
      }
    }
    
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])
  
  if (apiStatus === 'offline') {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-60 md:left-auto md:right-4 md:max-w-md">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Connection issues - subscription features temporarily unavailable
          </p>
        </div>
      </div>
    )
  }
  
  return <SmartSubscriptionAlertUI {...subscription} />
}
```

### Step 7: Testing with Mock Endpoints

```tsx
// src/components/TestSmartSubscription.tsx
'use client'

import { useSmartSubscription, SmartSubscriptionAlertUI } from '@/lib/npmPackage/smartAlertSubscriptionPwa'

export function TestSmartSubscription() {
  const testConfig = {
    endpoints: {
      checkDevice: 'https://jsonplaceholder.typicode.com/posts/1', // Mock endpoint
      subscribe: 'https://jsonplaceholder.typicode.com/posts' // Mock endpoint
    }
  }
  
  const subscription = useSmartSubscription(testConfig)
  
  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900">Testing Mode</h4>
        <p className="text-sm text-blue-700">
          Using mock endpoints: {testConfig.endpoints.checkDevice}
        </p>
      </div>
      <SmartSubscriptionAlertUI {...subscription} />
    </div>
  )
}
```

## 🧩 Components

### `useSmartSubscription()` Hook

Business logic hook that manages:
- Device ID generation and validation
- Local storage and database synchronization
- Notification permission handling
- Subscription process management
- Redux alert integration

**Returns:**
```tsx
{
  showSubscriptionPrompt: boolean,
  isChecking: boolean,
  isSubscribing: boolean,
  handleSubscribe: () => void,
  handleDismiss: () => void
}
```

### `SmartSubscriptionAlertUI` Component

Pure UI component that renders the subscription prompt.

**Props:**
```tsx
interface SmartSubscriptionAlertUIProps {
  showSubscriptionPrompt: boolean
  isChecking: boolean
  isSubscribing: boolean
  onSubscribe: () => void
  onDismiss: () => void
}
```

## 🔧 Dependencies

- React 18+
- Redux Toolkit
- shadcn/ui components
- Lucide React icons
- Device ID utility (`@/lib/utils/deviceId`)

## 🌐 API Integration

The package requires the following API endpoints to be implemented in your application:

### Required Endpoints

- `POST /api/subscriptions/check-device` - Check device subscription status
  - **Request**: `{ deviceId: string }`
  - **Response**: `{ success: boolean, isSubscribed: boolean, subscriptionId?: string }`

- `POST /api/pwa/subscribe` - Subscribe to push notifications
  - **Request**: `{ subscription: PushSubscription, deviceId: string, userAgent: string }`
  - **Response**: `{ success: boolean, subscriptionId: string, message?: string }`

### Configuration

Both API endpoints and alert handlers are configurable for maximum flexibility:

1. **Environment Variables**: Store endpoints in `.env.local`
   ```env
   NEXT_PUBLIC_SUBSCRIPTION_CHECK_API=/api/subscriptions/check-device
   NEXT_PUBLIC_PWA_SUBSCRIBE_API=/api/pwa/subscribe
   ```

2. **Configuration Object**: Pass endpoints and alert handler as props
   ```tsx
   useSmartSubscription({
     endpoints: {
       checkDevice: '/api/subscriptions/check-device',
       subscribe: '/api/pwa/subscribe'
     },
     alertHandler: (alert) => {
       // Custom alert implementation
       toast(alert.title, { description: alert.message })
     }
   })
   ```

3. **Global Config**: Set endpoints at application level
   ```tsx
   configureSmartSubscription({
     apiEndpoints: {
       checkDevice: '/api/v2/subscriptions/check',
       subscribe: '/api/v2/pwa/subscribe'
     },
     alertHandler: customAlertSystem
   })
   ```

4. **Different Alert Systems**: Compatible with various UI libraries
   ```tsx
   // React Hot Toast
   import toast from 'react-hot-toast'
   
   useSmartSubscription({
     alertHandler: (alert) => {
       toast[alert.type](alert.message, { 
         duration: alert.duration 
       })
     }
   })
   
   // Chakra UI
   import { useToast } from '@chakra-ui/react'
   
   function MyComponent() {
     const toast = useToast()
     
     const subscription = useSmartSubscription({
       alertHandler: (alert) => {
         toast({
           title: alert.title,
           description: alert.message,
           status: alert.type,
           duration: alert.duration
         })
       }
     })
   }
   
   // Material-UI
   import { useSnackbar } from 'notistack'
   
   function MyComponent() {
     const { enqueueSnackbar } = useSnackbar()
     
     const subscription = useSmartSubscription({
       alertHandler: (alert) => {
         enqueueSnackbar(alert.message, {
           variant: alert.type,
           autoHideDuration: alert.duration
         })
       }
     })
   }
   ```

## 📱 Mobile Features

- **Z-index Management**: Appears above mobile navigation (z-60)
- **Responsive Layout**: Full width on mobile, fixed width on desktop
- **Touch-friendly**: Proper button sizing and spacing

## 🔔 Notification Flow

1. **Check Status**: Validates local storage and database
2. **Request Permission**: Prompts user for notification access
3. **Subscribe**: Creates push subscription with device ID
4. **Store Data**: Saves subscription locally and in database
5. **Monitor**: Periodically checks for permission changes

## 🎨 Styling

- Uses Tailwind CSS for styling
- Integrates with shadcn/ui design system
- Responsive breakpoints: `md:` for desktop
- Color scheme: Primary theme colors with semantic variants

## 🚨 Error Handling

- Graceful fallbacks for unsupported browsers
- Redux alerts for user feedback
- Detailed console logging for debugging
- Network error handling with retry logic

## 🔄 Auto-launch Support

Works with PWA auto-launch system to automatically open the app after installation on supported platforms.

## 📝 TypeScript

Full TypeScript support with:
- Proper interface definitions
- Type-safe props
- JSDoc documentation
- ESLint compliance
