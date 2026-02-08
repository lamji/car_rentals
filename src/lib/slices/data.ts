/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  cars: any;
  nearestGarages:any;
  radius: number;
  loading: boolean;
  allCars:any,
  recalCulate: boolean
}

const initialState: DataState = {
  cars: {},
  nearestGarages: [],
  radius: 25,
  loading: false,
  allCars:[],
  recalCulate: false
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setCars: (state, action: PayloadAction< any>) => {
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
    setAllCars:(state, action: PayloadAction<any>) => {
      state.allCars = action.payload;
    },
    setRecalCulate:(state) => {
      state.recalCulate = !state.recalCulate;
    }
  },
});

export const { setCars, setNearestGarage, clearNearestGarage, setRadius, setLoadingState, setAllCars, setRecalCulate } = dataSlice.actions;

export default dataSlice.reducer;