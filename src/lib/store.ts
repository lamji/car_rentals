import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import regionsReducer from './slices/regionsSlice';
import provincesReducer from './slices/provincesSlice';
import citiesReducer from './slices/citiesSlice';
import barangaysReducer from './slices/barangaysSlice';
import addressReducer from './slices/addressSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Persist config for address slice only (to cache geocoded addresses)
const addressPersistConfig = {
  key: 'address',
  storage,
  whitelist: ['cache', 'lastFetchTime'] // Only persist cache and timestamps
};

// Combine reducers
const rootReducer = combineReducers({
  regions: regionsReducer,
  provinces: provincesReducer,
  cities: citiesReducer,
  barangays: barangaysReducer,
  address: persistReducer(addressPersistConfig, addressReducer),
});

// Root persist config (optional - for entire store if needed)
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['address'] // Only persist address cache
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
