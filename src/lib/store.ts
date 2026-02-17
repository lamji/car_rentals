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
import dataReducer from './slices/data';
import globalLoaderReducer from './slices/globalLoaderSlice';
import mapBoxReducer from './slices/mapBoxSlice';
import navigationReducer from './slices/navigationSlice';
import provincesReducer from './slices/provincesSlice';
import regionsReducer from './slices/regionsSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

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
  whitelist: ['selectedCar', 'bookingDetails', 'currentStep', 'isPaymentModalOpen', 'retryPayload'] // Persist all booking data including modal state and retry payload
};

// Persist config for mapBox slice (to save current address and saved addresses)
const mapBoxPersistConfig = {
  key: 'mapBox',
  storage,
  whitelist: ['current', 'savedAddresses'] // Persist current address and saved addresses list
};

// Persist config for auth slice (to save guest token across refreshes)
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['guestToken', 'guestId', 'authToken', 'user', 'role', 'isAuthenticated']
};

// Persist config for data slice (to save nearest garages and cars)
const dataPersistConfig = {
  key: 'data',
  storage,
  whitelist: ['nearestGarages', 'cars'] // Persist nearest garages and cars data
};

// Combine reducers
const rootReducer = combineReducers({
  regions: regionsReducer,
  provinces: provincesReducer,
  cities: citiesReducer,
  barangays: barangaysReducer,
  address: persistReducer(addressPersistConfig, addressReducer),
  booking: persistReducer(bookingPersistConfig, bookingReducer),
  data: persistReducer(dataPersistConfig, dataReducer),
  globalLoader: globalLoaderReducer,
  alerts: alertReducer,
  confirmation: confirmationReducer,
  mapBox: persistReducer(mapBoxPersistConfig, mapBoxReducer),
  navigation: navigationReducer,
  ui: uiReducer,
  auth: persistReducer(authPersistConfig, authReducer),
});

// Root persist config (optional - for entire store if needed)
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['address', 'booking', 'mapBox', 'data', 'auth'] // Persist address cache, booking data, mapBox addresses, data slice, and auth
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
