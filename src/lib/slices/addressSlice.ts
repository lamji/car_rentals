import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface CachedAddress {
  address: string;
  timestamp: number;
}

interface AddressState {
  cachedAddresses: Record<string, CachedAddress>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

const initialState: AddressState = {
  cachedAddresses: {},
  loading: {},
  errors: {},
};

// Create a key from coordinates for caching
const getCoordinateKey = (lat: number, lng: number): string => `${lat.toFixed(6)},${lng.toFixed(6)}`;

// Async thunk for fetching address with caching
export const fetchAddressFromCoordinates = createAsyncThunk(
  'address/fetchFromCoordinates',
  async ({ lat, lng }: { lat: number; lng: number }, { rejectWithValue }) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'CarRentalApp/1.0'
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || data.error) {
        throw new Error(data?.error || 'Invalid response from geocoding service');
      }

      // Build a readable address from the components
      const address = data.address || {};
      const components = [];
      
      // Add road/highway if available
      if (address.road || address.highway) {
        components.push(address.road || address.highway);
      }
      
      // Add town/city (truncate if too long)
      const town = address.town || address.city || address.village;
      if (town) {
        const truncatedTown = town.length > 15 ? town.substring(0, 15) + '...' : town;
        components.push(truncatedTown);
      }
      
      // Add province/state (truncate if too long)
      const state = address.state || address.province;
      if (state) {
        const truncatedState = state.length > 12 ? state.substring(0, 12) + '...' : state;
        components.push(truncatedState);
      }
      
      // Limit to maximum 3 components and join
      const finalComponents = components.slice(0, 3);
      
      return finalComponents.length > 0 ? finalComponents.join(', ') : 'Unknown Location';
    } catch (error) {
      console.warn('⚠️ Address fetch failed:', error instanceof Error ? error.message : 'Unknown error');
      return rejectWithValue('Location unavailable');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearAddressCache: (state) => {
      state.cachedAddresses = {};
      state.loading = {};
      state.errors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddressFromCoordinates.pending, (state, action) => {
        const key = getCoordinateKey(action.meta.arg.lat, action.meta.arg.lng);
        state.loading[key] = true;
        state.errors[key] = '';
      })
      .addCase(fetchAddressFromCoordinates.fulfilled, (state, action) => {
        const key = getCoordinateKey(action.meta.arg.lat, action.meta.arg.lng);
        state.loading[key] = false;
        state.cachedAddresses[key] = {
          address: action.payload,
          timestamp: Date.now(),
        };
      })
      .addCase(fetchAddressFromCoordinates.rejected, (state, action) => {
        const key = getCoordinateKey(action.meta.arg.lat, action.meta.arg.lng);
        state.loading[key] = false;
        state.errors[key] = action.payload as string || 'Failed to fetch address';
      });
  },
});

export const { clearAddressCache } = addressSlice.actions;
export default addressSlice.reducer;

// Selectors
export const selectCachedAddress = (state: { address: AddressState }, lat: number, lng: number) => {
  const key = getCoordinateKey(lat, lng);
  return state.address.cachedAddresses[key]?.address || null;
};

export const selectAddressLoading = (state: { address: AddressState }, lat: number, lng: number) => {
  const key = getCoordinateKey(lat, lng);
  return state.address.loading[key] || false;
};

export const selectAddressError = (state: { address: AddressState }, lat: number, lng: number) => {
  const key = getCoordinateKey(lat, lng);
  return state.address.errors[key] || null;
};
