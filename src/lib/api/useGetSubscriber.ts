import { useGetData } from 'plugandplay-react-query-hooks';

/**
 * Interface for subscription data
 */
interface SubscriptionData {
  id: string;
  subscriptionId: string;
  userId?: string;
  endpoint: string;
  userAgent?: string;
  createdAt: string;
  isActive: boolean;
}

/**
 * API response wrapper
 */
interface SubscriptionResponse {
  success: boolean;
  data: SubscriptionData[];
  message?: string;
}

/**
 * Custom hook to fetch all push notification subscriptions
 * Uses plugandplay-react-query-hooks for data fetching with React Query
 * 
 * @returns React Query result with subscription data
 */
export default function useGetSubscriber() {
  return useGetData<SubscriptionResponse>({
    baseUrl: '', // Empty since we're using relative URLs
    endpoint: '/api/subscriptions',
    options: {
      queryKey: ['subscriptions'],
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    }
  });
}
