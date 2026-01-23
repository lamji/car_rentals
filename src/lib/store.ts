import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import regionsReducer from './slices/regionsSlice';
import provincesReducer from './slices/provincesSlice';
import citiesReducer from './slices/citiesSlice';
import barangaysReducer from './slices/barangaysSlice';
import addressReducer from './slices/addressSlice';
import bookingReducer from './slices/bookingSlice';
import globalLoaderReducer from './slices/globalLoaderSlice';
import alertReducer from './slices/alertSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Persist config for address slice only (to cache geocoded addresses)
const addressPersistConfig = {
  key: 'address',
  storage,
  whitelist: ['cache', 'lastFetchTime'] // Only persist cache and timestamps
};

// Persist config for booking slice (to save booking progress)
const bookingPersistConfig = {
  key: 'booking',
  storage,
  whitelist: ['selectedCar', 'bookingDetails', 'currentStep', 'isPaymentModalOpen'] // Persist all booking data including modal state
};

// Combine reducers
const rootReducer = combineReducers({
  regions: regionsReducer,
  provinces: provincesReducer,
  cities: citiesReducer,
  barangays: barangaysReducer,
  address: persistReducer(addressPersistConfig, addressReducer),
  booking: persistReducer(bookingPersistConfig, bookingReducer),
  globalLoader: globalLoaderReducer,
  alerts: alertReducer,
});

// Root persist config (optional - for entire store if needed)
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['address', 'booking'] // Persist address cache and booking data
};

export const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
