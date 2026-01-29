# LocationPicker - Isolated Philippine Location Selection Component

A fully self-contained React component for Philippine location selection with PSGC API integration and browser geolocation support.

## Features

- **Fully Isolated**: No Redux or external state management dependencies
- **PSGC API Integration**: Philippine Standard Geographic Code API for accurate location data
- **Geolocation Support**: Browser geolocation with reverse geocoding (OpenStreetMap Nominatim)
- **Cascading Selection**: Region → Province → City/Municipality → Barangay
- **Type Safe**: Full TypeScript support
- **Customizable**: Configurable required fields, landmark input, and modal title

## Installation

Copy the `locationPicker` folder to your project. Requires:
- React 18+
- shadcn/ui components (Button, Input, Switch, Dialog)
- lucide-react icons

## Usage

```tsx
import { LocationModal } from '@/lib/npm-ready-stack/locationPicker';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocationSelect = (location: string, locationData?: LocationData) => {
    console.log('Selected:', location, locationData);
    setIsOpen(false);
  };

  return (
    <LocationModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onLocationSelect={handleLocationSelect}
      title="Select Pickup Location"
      showLandmark={true}
      required={{ region: true, province: true, city: true, barangay: true }}
    />
  );
}
```

## API Reference

### LocationModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Modal visibility |
| `onClose` | `() => void` | required | Close callback |
| `onLocationSelect` | `(location: string, data?: LocationData) => void` | required | Selection callback |
| `initialData` | `LocationData` | - | Pre-fill form data |
| `title` | `string` | "Select Location" | Modal title |
| `showLandmark` | `boolean` | `true` | Show landmark input |
| `required` | `object` | `{region:true,province:true,city:true,barangay:true}` | Required fields configuration |

### LocationData Interface

```typescript
interface LocationData {
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  landmark?: string;
}
```

## File Structure

```
locationPicker/
├── index.tsx           # Main exports
├── types.ts            # TypeScript interfaces
├── hooks/
│   ├── useGeolocation.ts    # Browser geolocation hook
│   └── usePSGCLocations.ts  # PSGC API hook
└── ui/
    └── LocationModal.tsx    # Main UI component
```

## Dependencies

Required shadcn/ui: `button`, `input`, `switch`, `dialog`
Required icons: `lucide-react`
