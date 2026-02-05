import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Car } from '@/lib/types';

export interface NearestGarageResult {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
  available: boolean;
}

interface DataState {
  cars: Car[];
  nearestGarages:any;
  radius: number;
  loading: boolean;
}

const initialState: DataState = {
  cars: [],
  nearestGarages: [],
  radius: 25,
  loading: false,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setCars: (state, action: PayloadAction<Car[]>) => {
      state.cars = action.payload;
    },
    setNearestGarage: (state, action: PayloadAction<any>) => {
      state.nearestGarages = action.payload;
    },
    clearNearestGarage: (state) => {
      state.nearestGarages = [];
    },
    setRadius: (state, action: PayloadAction<number>) => {
      state.radius = action.payload;
    },
    setLoadingState: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCars, setNearestGarage, clearNearestGarage, setRadius, setLoadingState } = dataSlice.actions;

export default dataSlice.reducer;