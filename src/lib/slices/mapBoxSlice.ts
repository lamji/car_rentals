import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Position {
  lat: number;
  lng: number;
}

interface MapboxAddress {
  position: Position | null;
  address: string | null;
  accuracy: number | null;
  formattedAddress: string | null;
  region?: string;
  province?: string;
  city?: string;
  municipality?: string;
  barangay?: string;
  landmark?: string;
  distanceCharge?: {
    distance: number;
    price: number;
  };
}

interface MapBoxState {
  current: MapboxAddress;
  savedAddresses: MapboxAddress[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MapBoxState = {
  current: {
    position: null,
    address: null,
    accuracy: null,
    formattedAddress: null,
  },
  savedAddresses: [],
  isLoading: false,
  error: null,
};

export const mapBoxSlice = createSlice({
  name: "mapbox",
  initialState,
  reducers: {
    /**
     * Set current address from mapbox
     * @param state - Redux state
     * @param action - Payload containing address string
     */
    setCurrentAddress: (state, action: PayloadAction<string>) => {
      state.current.address = action.payload;
    },

    setDistanceCharge: (
      state,
      action: PayloadAction<{ distance: number; price: number }>,
    ) => {
      state.current.distanceCharge = action.payload;
    },

    /**
     * Set position from mapbox geolocation
     * @param state - Redux state
     * @param action - Payload containing position data
     */
    setPosition: (state, action: PayloadAction<Position>) => {
      state.current.position = action.payload;
    },

    /**
     * Set reverse geocoded address
     * @param state - Redux state
     * @param action - Payload containing address string
     */
    setAddress: (state, action: PayloadAction<string>) => {
      state.current.address = action.payload;
    },

    /**
     * Set formatted address with all components
     * @param state - Redux state
     * @param action - Payload containing formatted address and location details
     */
    setFormattedAddress: (
      state,
      action: PayloadAction<{
        formattedAddress: string;
        region?: string;
        province?: string;
        city?: string;
        municipality?: string;
        barangay?: string;
        landmark?: string;
      }>,
    ) => {
      state.current.formattedAddress = action.payload.formattedAddress;
      state.current.region = action.payload.region;
      state.current.province = action.payload.province;
      state.current.city = action.payload.city;
      state.current.municipality = action.payload.municipality;
      state.current.barangay = action.payload.barangay;
      state.current.landmark = action.payload.landmark;
    },

    /**
     * Set accuracy of current position
     * @param state - Redux state
     * @param action - Payload containing accuracy value
     */
    setAccuracy: (state, action: PayloadAction<number>) => {
      state.current.accuracy = action.payload;
    },

    /**
     * Save current address to saved addresses list
     * @param state - Redux state
     */
    saveCurrentAddress: (state) => {
      if (
        state.current.formattedAddress &&
        !state.savedAddresses.some(
          (addr) => addr.formattedAddress === state.current.formattedAddress,
        )
      ) {
        state.savedAddresses.push({ ...state.current });
      }
    },

    /**
     * Remove address from saved addresses
     * @param state - Redux state
     * @param action - Payload containing formatted address to remove
     */
    removeSavedAddress: (state, action: PayloadAction<string>) => {
      state.savedAddresses = state.savedAddresses.filter(
        (addr) => addr.formattedAddress !== action.payload,
      );
    },

    /**
     * Clear all saved addresses
     * @param state - Redux state
     */
    clearSavedAddresses: (state) => {
      state.savedAddresses = [];
    },

    /**
     * Set loading state
     * @param state - Redux state
     * @param action - Payload containing loading boolean
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Set error message
     * @param state - Redux state
     * @param action - Payload containing error message
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * Clear current address
     * @param state - Redux state
     */
    clearCurrentAddress: (state) => {
      state.current = {
        position: null,
        address: null,
        accuracy: null,
        formattedAddress: null,
      };
    },

    /**
     * Reset mapbox state to initial state
     * @param state - Redux state
     */
    resetMapBox: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentAddress,
  setPosition,
  setAddress,
  setFormattedAddress,
  setAccuracy,
  setDistanceCharge,
  saveCurrentAddress,
  removeSavedAddress,
  clearSavedAddresses,
  setLoading,
  setError,
  clearCurrentAddress,
  resetMapBox,
} = mapBoxSlice.actions;

export default mapBoxSlice.reducer;
