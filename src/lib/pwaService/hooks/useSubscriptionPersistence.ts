"use client";

import { useEffect, useState } from 'react';
import {
    getSubscriptionStatus,
    initializeSubscriptionPersistence,
    manualRefreshSubscription
} from '../subscription-persistence';

/**
 * Hook for managing persistent push subscriptions
 * Automatically handles subscription validation and renewal
 * @returns Subscription management functions and status
 */
export function useSubscriptionPersistence() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  /**
   * Update subscription status state
   */
  const updateStatus = async () => {
    try {
      const status = await getSubscriptionStatus();
      setIsSubscribed(status.subscribed);
      setSubscriptionId(status.subscriptionId);
      setIsValid(status.valid);
    } catch (error) {
      console.error('Failed to update subscription status:', error);
      setIsSubscribed(false);
      setSubscriptionId(null);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manually refresh subscription
   * @returns Promise<boolean> - Whether refresh was successful
   */
  const refreshSubscription = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await manualRefreshSubscription();
      if (success) {
        setLastRefresh(new Date());
        await updateStatus();
      }
      return success;
    } catch (error) {
      console.error('Manual subscription refresh failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initialize persistence system on mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize the persistence system
        await initializeSubscriptionPersistence();
        
        // Update initial status
        await updateStatus();
      } catch (error) {
        console.error('Failed to initialize subscription persistence:', error);
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  /**
   * Periodic status check (every 5 minutes)
   */
  useEffect(() => {
    const interval = setInterval(updateStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    // Status
    isSubscribed,
    subscriptionId,
    isValid,
    isLoading,
    lastRefresh,
    
    // Actions
    refreshSubscription,
    updateStatus
  };
}
