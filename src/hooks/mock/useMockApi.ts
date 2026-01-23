import { useAppDispatch } from '@/lib/store';
import { showLoader, hideLoader } from '@/lib/slices/globalLoaderSlice';

export interface MockApiOptions {
  timeoutMs?: number;
  progressIntervalMs?: number;
  loaderMessage?: string;
}

export function useMockApi() {
  const dispatch = useAppDispatch();

  const simulateApiCall = async <T>(
    options: MockApiOptions = {},
    responseGenerator: () => T
  ): Promise<T> => {
    const {
      timeoutMs = 2000,
      progressIntervalMs = 400,
      loaderMessage = 'Processing...'
    } = options;

    // Show global loader
    dispatch(showLoader(loaderMessage));

    const startedAt = Date.now();

    await new Promise<void>((resolve) => {
      let intervalId: ReturnType<typeof setInterval> | undefined;

      if (progressIntervalMs > 0) {
        intervalId = setInterval(() => {
          const elapsed = Date.now() - startedAt;
          const pct = Math.min(100, Math.round((elapsed / timeoutMs) * 100));
          
          // Update loader message with progress
          dispatch(showLoader(`${loaderMessage} ${pct}%`));
        }, progressIntervalMs);
      }

      setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        
        // Hide global loader
        dispatch(hideLoader());
        
        resolve();
      }, timeoutMs);
    });

    // Generate and return the response
    return responseGenerator();
  };

  return { simulateApiCall };
}
