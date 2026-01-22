import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// PSGC Barangay types
export interface PSGCBarangay {
  psgc_id: string;
  name: string;
  correspondence_code: string;
  geographic_level: 'Bgy';
  old_names: string;
  city_class: string;
  income_classification: string;
  urban_rural: string;
  population: string;
  status: string;
}

interface BarangaysState {
  barangays: PSGCBarangay[];
  filteredBarangays: PSGCBarangay[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp for cache validation
}

const initialState: BarangaysState = {
  barangays: [],
  filteredBarangays: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch barangays for a specific city
export const fetchBarangaysByCity = createAsyncThunk(
  'barangays/fetchBarangaysByCity',
  async (cityPsgcId: string, { rejectWithValue }) => {
    console.log('🚀 fetchBarangaysByCity thunk called with cityPsgcId:', cityPsgcId);
    try {
      // Correct PSGC API endpoints using id= parameter
      const endpoints = [
        `https://psgc.rootscratch.com/barangay?id=${cityPsgcId}`,
        `https://psgc.rootscratch.com/barangay?city=${cityPsgcId}`,
        `https://psgc.rootscratch.com/municipal-city?id=${cityPsgcId}`,
      ];
      
      let response;
      let workingUrl = '';
      
      for (const url of endpoints) {
        console.log('📡 Trying endpoint:', url);
        try {
          const testResponse = await fetch(url);
          console.log('📡 Response status for', url, ':', testResponse.status);
          if (testResponse.ok) {
            response = testResponse;
            workingUrl = url;
            console.log('✅ Working endpoint found:', workingUrl);
            break;
          }
        } catch (err) {
          console.log('❌ Endpoint failed:', url, err);
          continue;
        }
      }
      
      if (!response) {
        throw new Error('No working endpoint found for barangays API');
      }
      
      const data = await response.json();
      console.log('📊 Barangays data received from', workingUrl, ':', data);
      console.log('📊 Number of barangays:', Array.isArray(data) ? data.length : 'Not an array');
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching barangays:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch barangays');
    }
  }
);

const barangaysSlice = createSlice({
  name: 'barangays',
  initialState,
  reducers: {
    filterBarangays: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase().trim();
      console.log('🔍 Redux filterBarangays called with query:', query);
      console.log('📊 Total barangays before filter:', state.barangays.length);
      
      if (!query) {
        state.filteredBarangays = state.barangays;
        console.log('📝 Empty query, showing all barangays:', state.filteredBarangays.length);
        return;
      }

      state.filteredBarangays = state.barangays.filter(barangay =>
        barangay.name.toLowerCase().includes(query) ||
        barangay.correspondence_code.toLowerCase().includes(query)
      );
      
      console.log('📝 Filtered barangays result:', state.filteredBarangays.length);
      console.log('📝 Filtered barangay names:', state.filteredBarangays.map(b => b.name));
    },
    clearFilteredBarangays: (state) => {
      state.filteredBarangays = state.barangays;
    },
    resetBarangays: (state) => {
      state.barangays = [];
      state.filteredBarangays = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBarangaysByCity.pending, (state) => {
        console.log('🔄 fetchBarangaysByCity pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarangaysByCity.fulfilled, (state, action) => {
        console.log('✅ fetchBarangaysByCity fulfilled');
        state.loading = false;
        state.barangays = action.payload;
        state.filteredBarangays = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchBarangaysByCity.rejected, (state, action) => {
        console.log('❌ fetchBarangaysByCity rejected');
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { filterBarangays, clearFilteredBarangays, resetBarangays } = barangaysSlice.actions;

// Selectors
export const selectAllBarangays = (state: { barangays: BarangaysState }) => state.barangays.barangays;
export const selectFilteredBarangays = (state: { barangays: BarangaysState }) => state.barangays.filteredBarangays;
export const selectBarangaysLoading = (state: { barangays: BarangaysState }) => state.barangays.loading;
export const selectBarangaysError = (state: { barangays: BarangaysState }) => state.barangays.error;
export const selectBarangaysLastFetched = (state: { barangays: BarangaysState }) => state.barangays.lastFetched;

export default barangaysSlice.reducer;
