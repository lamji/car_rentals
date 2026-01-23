"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ForgotPasswordOtpStepProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  error: string;
  isSubmitting: boolean;
  onVerify: () => void;
  onBack: () => void;
  onResend: () => void;
  onOtpSent?: () => void; // Callback to trigger countdown
}

const COUNTDOWN_DURATION = 5 * 60; // 5 minutes in seconds
const STORAGE_KEY = (email: string) => `otp_resend_timer_${email}`;

export function ForgotPasswordOtpStep({
  email,
  otp,
  setOtp,
  error,
  isSubmitting,
  onVerify,
  onBack,
  onResend,
  onOtpSent,
}: ForgotPasswordOtpStepProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);

  // Start countdown when OTP is sent
  const startCountdown = useCallback(() => {
    const timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY(email), JSON.stringify({ timestamp }));
    setTimeLeft(COUNTDOWN_DURATION);
    setIsCountdownActive(true);
  }, [email]);

  // Load saved countdown from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY(email));
    if (savedData) {
      try {
        const { timestamp } = JSON.parse(savedData);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);
        
        if (remaining > 0) {
          setTimeLeft(remaining);
          setIsCountdownActive(true);
        } else {
          localStorage.removeItem(STORAGE_KEY(email));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY(email));
      }
    } else if (onOtpSent) {
      // If no saved data and callback provided, start countdown
      onOtpSent();
      startCountdown();
    }
  }, [email, onOtpSent, startCountdown]);

  // Handle countdown timer
  useEffect(() => {
    if (!isCountdownActive || timeLeft <= 0) {
      if (timeLeft <= 0 && isCountdownActive) {
        setIsCountdownActive(false);
        localStorage.removeItem(STORAGE_KEY(email));
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsCountdownActive(false);
          localStorage.removeItem(STORAGE_KEY(email));
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountdownActive, timeLeft, email]);

  // Handle resend with countdown
  const handleResend = useCallback(() => {
    if (!isCountdownActive) {
      onResend();
      startCountdown();
    }
  }, [isCountdownActive, onResend, startCountdown]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const digits = React.useMemo(() => {
    const padded = otp.padEnd(6, " ");
    return padded.slice(0, 6).split("");
  }, [otp]);

  const updateDigit = (index: number, nextChar: string) => {
    const next = otp.split("");
    while (next.length < 6) next.push("");
    next[index] = nextChar;
    const joined = next.join("").slice(0, 6);
    setOtp(joined);
  };

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    updateDigit(index, char);
    if (char && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]?.trim()) {
        updateDigit(index, "");
        return;
      }
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        updateDigit(index - 1, "");
      }
    }

    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setOtp(pasted);
    const focusIndex = Math.min(5, pasted.length);
    inputsRef.current[focusIndex]?.focus();
  };

  const canVerify = otp.replace(/\D/g, "").length === 6;
  const canResend = !isCountdownActive && !isSubmitting;

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600 text-sm">
        Enter the 6-digit code sent to
        <span className="font-medium text-gray-900"> {email}</span>
      </p>

      <div className="flex items-center justify-center gap-2">
        {digits.map((d, i) => (
          <Input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={1}
            value={d.trim()}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="h-12 w-12 text-center text-lg font-semibold"
            disabled={isSubmitting}
          />
        ))}
      </div>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      <div className="space-y-2 pt-2">
        <Button
          onClick={onVerify}
          className="w-full"
          disabled={isSubmitting || !canVerify}
        >
          Verify OTP
        </Button>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1" 
            onClick={handleResend} 
            disabled={!canResend}
          >
            {isCountdownActive ? `Resend (${formatTime(timeLeft)})` : 'Resend'}
          </Button>
        </div>
      </div>
    </div>
  );
}
