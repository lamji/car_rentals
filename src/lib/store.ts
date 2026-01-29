import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import addressReducer from './slices/addressSlice';
import alertReducer from './slices/alertSlice';
import barangaysReducer from './slices/barangaysSlice';
import bookingReducer from './slices/bookingSlice';
import citiesReducer from './slices/citiesSlice';
import confirmationReducer from './slices/confirmationSlice';
import globalLoaderReducer from './slices/globalLoaderSlice';
import navigationReducer from './slices/navigationSlice';
import provincesReducer from './slices/provincesSlice';
import regionsReducer from './slices/regionsSlice';
import uiReducer from './slices/uiSlice';

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
  confirmation: confirmationReducer,
  navigation: navigationReducer,
  ui: uiReducer,
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
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'confirmation/openConfirmation'],
        ignoredPaths: ['confirmation.options.onConfirm'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
