"use client";

import { useState, useEffect } from "react";

const OTP_STATUS_KEY = 'otp_session_status';

export function useOtpSession() {
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    const checkOtpSession = () => {
      const otpStatus = localStorage.getItem(OTP_STATUS_KEY);
      if (otpStatus) {
        try {
          const status = JSON.parse(otpStatus);
          const elapsed = Math.floor((Date.now() - status.timestamp) / 1000);
          
          // Check if OTP session is still valid (within 10 minutes)
          if (elapsed < 10 * 60) {
            setHasActiveSession(true);
            return true;
          } else {
            // Clear expired OTP session
            localStorage.removeItem(OTP_STATUS_KEY);
            setHasActiveSession(false);
            return false;
          }
        } catch {
          localStorage.removeItem(OTP_STATUS_KEY);
          setHasActiveSession(false);
          return false;
        }
      }
      setHasActiveSession(false);
      return false;
    };

    // Check on mount
    checkOtpSession();

    // Check periodically (every 30 seconds)
    const interval = setInterval(checkOtpSession, 30000);

    return () => clearInterval(interval);
  }, []);

  const clearOtpSession = () => {
    localStorage.removeItem(OTP_STATUS_KEY);
    setHasActiveSession(false);
  };

  return {
    hasActiveSession,
    clearOtpSession
  };
}
