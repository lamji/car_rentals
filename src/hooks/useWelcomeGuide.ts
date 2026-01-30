"use client";

import { useState, useEffect } from "react";
import { detectBrowser } from "../lib/utils/browserDetection";

/**
 * Hook to manage welcome guide state and visibility
 * Shows guide only on mobile devices and if not previously completed
 * @returns {Object} Welcome guide state and controls
 */
export function useWelcomeGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Check if welcome guide should be shown
     * Only show on mobile devices and if not previously completed
     * @returns {void}
     */
    const checkShouldShowGuide = () => {
      try {
        // Check if guide was already completed
        const completed = localStorage.getItem('car-rental-welcome-guide-completed');
        if (completed === 'true') {
          setShowGuide(false);
          setIsLoading(false);
          return;
        }

        // Detect if user is on mobile device
        const browserInfo = detectBrowser();
        const isMobile = browserInfo.isMobile;

        // Show guide only on mobile devices
        if (isMobile) {
          setShowGuide(true);
        } else {
          // For desktop users, mark as completed so they don't see it later on mobile
          localStorage.setItem('car-rental-welcome-guide-completed', 'true');
          setShowGuide(false);
        }
      } catch (error) {
        console.error('Error checking welcome guide status:', error);
        setShowGuide(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure proper hydration
    const timer = setTimeout(checkShouldShowGuide, 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle guide completion
   * Saves completion status to localStorage and hides guide
   * @returns {void}
   */
  const handleGuideComplete = () => {
    try {
      localStorage.setItem('car-rental-welcome-guide-completed', 'true');
      setShowGuide(false);
    } catch (error) {
      console.error('Error saving welcome guide completion:', error);
      setShowGuide(false);
    }
  };

  /**
   * Reset guide completion status (for testing/debugging)
   * @returns {void}
   */
  const resetGuide = () => {
    try {
      localStorage.removeItem('car-rental-welcome-guide-completed');
      const browserInfo = detectBrowser();
      if (browserInfo.isMobile) {
        setShowGuide(true);
      }
    } catch (error) {
      console.error('Error resetting welcome guide:', error);
    }
  };

  return {
    showGuide,
    isLoading,
    handleGuideComplete,
    resetGuide,
  };
}
