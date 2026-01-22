import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// PSGC City types
export interface PSGCCity {
  psgc_id: string;
  name: string;
  correspondence_code: string;
  geographic_level: 'City';
  old_names: string;
  city_class: string;
  income_classification: string;
  urban_rural: string;
  population: string;
  status: string;
}

interface CitiesState {
  cities: PSGCCity[];
  filteredCities: PSGCCity[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp for cache validation
}

const initialState: CitiesState = {
  cities: [],
  filteredCities: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch cities for a specific province
export const fetchCitiesByProvince = createAsyncThunk(
  'cities/fetchCitiesByProvince',
  async (provincePsgcId: string, { rejectWithValue }) => {
    console.log('🚀 fetchCitiesByProvince thunk called with provincePsgcId:', provincePsgcId);
    try {
      // Correct PSGC API endpoints using id= parameter
      const endpoints = [
        `https://psgc.rootscratch.com/municipal-city?id=${provincePsgcId}`,
        `https://psgc.rootscratch.com/municipal-city?province=${provincePsgcId}`,
        `https://psgc.rootscratch.com/province?id=${provincePsgcId}`,
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
        throw new Error('No working endpoint found for cities API');
      }
      
      const data = await response.json();
      console.log('📊 Cities data received from', workingUrl, ':', data);
      console.log('📊 Number of cities:', Array.isArray(data) ? data.length : 'Not an array');
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching cities:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cities');
    }
  }
);

const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    filterCities: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase().trim();
      console.log('🔍 Redux filterCities called with query:', query);
      console.log('📊 Total cities before filter:', state.cities.length);
      
      if (!query) {
        state.filteredCities = state.cities;
        console.log('📝 Empty query, showing all cities:', state.filteredCities.length);
        return;
      }

      state.filteredCities = state.cities.filter(city =>
        city.name.toLowerCase().includes(query) ||
        city.correspondence_code.toLowerCase().includes(query)
      );
      
      console.log('📝 Filtered cities result:', state.filteredCities.length);
      console.log('📝 Filtered city names:', state.filteredCities.map(c => c.name));
    },
    clearFilteredCities: (state) => {
      state.filteredCities = state.cities;
    },
    resetCities: (state) => {
      state.cities = [];
      state.filteredCities = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCitiesByProvince.pending, (state) => {
        console.log('🔄 fetchCitiesByProvince pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCitiesByProvince.fulfilled, (state, action) => {
        console.log('✅ fetchCitiesByProvince fulfilled');
        state.loading = false;
        state.cities = action.payload;
        state.filteredCities = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchCitiesByProvince.rejected, (state, action) => {
        console.log('❌ fetchCitiesByProvince rejected');
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { filterCities, clearFilteredCities, resetCities } = citiesSlice.actions;

// Selectors
export const selectAllCities = (state: { cities: CitiesState }) => state.cities.cities;
export const selectFilteredCities = (state: { cities: CitiesState }) => state.cities.filteredCities;
export const selectCitiesLoading = (state: { cities: CitiesState }) => state.cities.loading;
export const selectCitiesError = (state: { cities: CitiesState }) => state.cities.error;
export const selectCitiesLastFetched = (state: { cities: CitiesState }) => state.cities.lastFetched;

export default citiesSlice.reducer;
