import { useCallback } from "react";
import { registerNotification } from "webtonative";

/**
 * Custom hook for registering push notifications using webtonative
 * Returns a function that can be called on click to register notifications
 * Alerts the received keys in JSON format
 * @returns {Function} Function to trigger notification registration
 */
export default function useRgisterNotification() {
  /**
   * Function to register for push notifications and handle callback
   * Alerts the received notification keys in JSON format
   * @returns {void} No return value - handles side effects only
   */
  const handleRegisterNotification = useCallback(() => {
    registerNotification({
      callback: function (data) {
        // Alert the received data in JSON format
        alert(JSON.stringify(data, null, 2));
      },
    });
  }, []);

  return handleRegisterNotification;
}
