"use client";

import { MessengerAlert, useMessengerDetection } from "@/components/ui/MessengerAlert";

export function MessengerAlertWrapper() {
  const { showAlert, setShowAlert } = useMessengerDetection();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <MessengerAlert
      isOpen={showAlert}
      onClose={() => setShowAlert(false)}
      currentUrl={currentUrl}
    />
  );
}
