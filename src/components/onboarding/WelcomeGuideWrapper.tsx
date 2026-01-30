"use client";

import { useEffect } from "react";
import { useWelcomeGuide } from "../../hooks/useWelcomeGuide";
import { WelcomeGuide } from "./WelcomeGuide";

/**
 * Client wrapper component for WelcomeGuide
 * Handles welcome guide state management and conditional rendering
 * Also manages hiding navigation during onboarding
 * @returns {JSX.Element | null} WelcomeGuide component or null
 */
export function WelcomeGuideWrapper() {
  const { showGuide, isLoading, handleGuideComplete } = useWelcomeGuide();

  // Hide/show navigation based on onboarding state
  useEffect(() => {
    const body = document.body;
    if (showGuide && !isLoading) {
      // Hide navigation when onboarding is active
      body.classList.add("onboarding-active");
    } else {
      // Show navigation when onboarding is not active
      body.classList.remove("onboarding-active");
    }

    // Cleanup on unmount
    return () => {
      body.classList.remove("onboarding-active");
    };
  }, [showGuide, isLoading]);

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Only render guide if it should be shown
  if (!showGuide) {
    return null;
  }

  return (
    <WelcomeGuide isVisible={showGuide} onComplete={handleGuideComplete} />
  );
}
