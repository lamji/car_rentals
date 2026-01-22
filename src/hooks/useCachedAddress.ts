import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { fetchAddressFromCoordinates, selectCachedAddress, selectAddressLoading, selectAddressError } from '@/lib/slices/addressSlice';

export const useCachedAddress = (coordinates: { lat: number; lng: number } | null) => {
  const dispatch = useAppDispatch();
  
  // Get cached data from Redux
  const cachedAddress = useAppSelector(
    (state) => coordinates ? selectCachedAddress(state, coordinates.lat, coordinates.lng) : null
  );
  const isLoading = useAppSelector(
    (state) => coordinates ? selectAddressLoading(state, coordinates.lat, coordinates.lng) : false
  );
  const error = useAppSelector(
    (state) => coordinates ? selectAddressError(state, coordinates.lat, coordinates.lng) : null
  );

  useEffect(() => {
    if (coordinates && !cachedAddress && !isLoading && !error) {
      // Only fetch if we don't have cached data and aren't already loading
      dispatch(fetchAddressFromCoordinates({ lat: coordinates.lat, lng: coordinates.lng }));
    }
  }, [coordinates, cachedAddress, isLoading, error, dispatch]);

  return {
    address: cachedAddress || (coordinates ? 'Loading location...' : 'No coordinates'),
    isLoading,
    error,
  };
};
