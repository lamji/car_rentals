import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// PSGC Province types
export interface PSGCProvince {
  psgc_id: string;
  name: string;
  correspondence_code: string;
  geographic_level: 'Prov';
  old_names: string;
  city_class: string;
  income_classification: string;
  urban_rural: string;
  population: string;
  status: string;
}

interface ProvincesState {
  provinces: PSGCProvince[];
  filteredProvinces: PSGCProvince[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp for cache validation
}

const initialState: ProvincesState = {
  provinces: [],
  filteredProvinces: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch provinces for a specific region
export const fetchProvincesByRegion = createAsyncThunk(
  'provinces/fetchProvincesByRegion',
  async (regionPsgcId: string, { rejectWithValue }) => {
    console.log('🚀 fetchProvincesByRegion thunk called with regionPsgcId:', regionPsgcId);
    try {
      // Correct PSGC API endpoints using id= parameter
      const endpoints = [
        `https://psgc.rootscratch.com/province?region=${regionPsgcId}`,
        `https://psgc.rootscratch.com/provinces?region=${regionPsgcId}`,
        `https://psgc.rootscratch.com/region?id=${regionPsgcId}`,
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
        throw new Error('No working endpoint found for provinces API');
      }
      
      const data = await response.json();
      console.log('📊 Provinces data received from', workingUrl, ':', data);
      console.log('📊 Number of provinces:', Array.isArray(data) ? data.length : 'Not an array');
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching provinces:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch provinces');
    }
  }
);

const provincesSlice = createSlice({
  name: 'provinces',
  initialState,
  reducers: {
    filterProvinces: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase().trim();
      console.log('🔍 Redux filterProvinces called with query:', query);
      console.log('📊 Total provinces before filter:', state.provinces.length);
      
      if (!query) {
        state.filteredProvinces = state.provinces;
        console.log('📝 Empty query, showing all provinces:', state.filteredProvinces.length);
        return;
      }

      state.filteredProvinces = state.provinces.filter(province =>
        province.name.toLowerCase().includes(query) ||
        province.correspondence_code.toLowerCase().includes(query)
      );
      
      console.log('📝 Filtered provinces result:', state.filteredProvinces.length);
      console.log('📝 Filtered province names:', state.filteredProvinces.map(p => p.name));
    },
    clearFilteredProvinces: (state) => {
      state.filteredProvinces = state.provinces;
    },
    resetProvinces: (state) => {
      state.provinces = [];
      state.filteredProvinces = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvincesByRegion.pending, (state) => {
        console.log('🔄 fetchProvincesByRegion pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvincesByRegion.fulfilled, (state, action) => {
        console.log('✅ fetchProvincesByRegion fulfilled');
        state.loading = false;
        state.provinces = action.payload;
        state.filteredProvinces = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchProvincesByRegion.rejected, (state, action) => {
        console.log('❌ fetchProvincesByRegion rejected');
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { filterProvinces, clearFilteredProvinces, resetProvinces } = provincesSlice.actions;

// Selectors
export const selectAllProvinces = (state: { provinces: ProvincesState }) => state.provinces.provinces;
export const selectFilteredProvinces = (state: { provinces: ProvincesState }) => state.provinces.filteredProvinces;
export const selectProvincesLoading = (state: { provinces: ProvincesState }) => state.provinces.loading;
export const selectProvincesError = (state: { provinces: ProvincesState }) => state.provinces.error;
export const selectProvincesLastFetched = (state: { provinces: ProvincesState }) => state.provinces.lastFetched;

export default provincesSlice.reducer;
