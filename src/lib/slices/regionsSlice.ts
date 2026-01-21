import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// PSGC Region types
export interface PSGCRegion {
  psgc_id: string;
  name: string;
  correspondence_code: string;
  geographic_level: 'Reg';
  old_names: string;
  city_class: string;
  income_classification: string;
  urban_rural: string;
  population: string;
  status: string;
}

interface RegionsState {
  regions: PSGCRegion[];
  filteredRegions: PSGCRegion[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp for cache validation
}

const initialState: RegionsState = {
  regions: [],
  filteredRegions: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch all regions
export const fetchRegions = createAsyncThunk(
  'regions/fetchRegions',
  async (_, { rejectWithValue }) => {
    console.log('🚀 fetchRegions thunk called');
    try {
      const url = 'https://psgc.rootscratch.com/region';
      console.log('📡 Fetching regions from:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Received data:', data);
      console.log('📊 Data length:', Array.isArray(data) ? data.length : 'Not an array');
      
      return data as PSGCRegion[];
    } catch (error) {
      console.error('❌ fetchRegions error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch regions');
    }
  }
);

const regionsSlice = createSlice({
  name: 'regions',
  initialState,
  reducers: {
    filterRegions: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase().trim();
      console.log('🔍 Redux filterRegions called with query:', query);
      console.log('📊 Total regions before filter:', state.regions.length);
      
      if (!query) {
        state.filteredRegions = state.regions;
        console.log('📝 Empty query, showing all regions:', state.filteredRegions.length);
        return;
      }

      state.filteredRegions = state.regions.filter(region =>
        region.name.toLowerCase().includes(query) ||
        region.correspondence_code.toLowerCase().includes(query)
      );
      
      console.log('📝 Filtered regions result:', state.filteredRegions.length);
      console.log('📝 Filtered region names:', state.filteredRegions.map(r => r.name));
    },
    clearFilteredRegions: (state) => {
      state.filteredRegions = state.regions;
    },
    resetRegions: (state) => {
      state.regions = [];
      state.filteredRegions = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegions.pending, (state) => {
        console.log('⏳ fetchRegions pending - setting loading to true');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        console.log('✅ fetchRegions fulfilled - received', action.payload.length, 'regions');
        state.loading = false;
        state.regions = action.payload;
        state.filteredRegions = action.payload; // Initialize filtered regions with all regions
        state.lastFetched = Date.now();
        state.error = null;
        console.log('📊 Updated Redux state:', {
          regionsCount: state.regions.length,
          filteredRegionsCount: state.filteredRegions.length,
          loading: state.loading,
          error: state.error
        });
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        console.log('❌ fetchRegions rejected:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        state.regions = [];
        state.filteredRegions = [];
      });
  },
});

export const { filterRegions, clearFilteredRegions, resetRegions } = regionsSlice.actions;
export default regionsSlice.reducer;

// Selectors
export const selectAllRegions = (state: { regions: RegionsState }) => state.regions.regions;
export const selectFilteredRegions = (state: { regions: RegionsState }) => state.regions.filteredRegions;
export const selectRegionsLoading = (state: { regions: RegionsState }) => state.regions.loading;
export const selectRegionsError = (state: { regions: RegionsState }) => state.regions.error;
export const selectRegionsLastFetched = (state: { regions: RegionsState }) => state.regions.lastFetched;

// Optional: Cache validation helper
export const selectShouldRefetchRegions = (state: { regions: RegionsState }, cacheTimeMs: number = 24 * 60 * 60 * 1000) => {
  const { lastFetched, regions } = state.regions;
  if (!lastFetched || regions.length === 0) return true;
  return Date.now() - lastFetched > cacheTimeMs;
};
