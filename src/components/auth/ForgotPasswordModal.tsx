"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Mail, X } from "lucide-react";
import { useResetPassword } from "@/lib/api/useResetPassword";
import { useAlerts } from "@/hooks/useAlerts";
import { useResponseValidator } from "@/hooks/useResponseValidator";
import { ForgotPasswordEmailStep } from "@/components/auth/forgot-password/ForgotPasswordEmailStep";
import { ForgotPasswordOtpStep } from "@/components/auth/forgot-password/ForgotPasswordOtpStep";
import { ForgotPasswordNewPasswordStep } from "@/components/auth/forgot-password/ForgotPasswordNewPasswordStep";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShouldOpen?: () => void; // Callback to notify parent to open modal
}

const MODAL_STATE_KEY = 'forgot_password_modal_state';
const COUNTDOWN_KEY_PREFIX = 'otp_resend_timer_';
const OTP_STATUS_KEY = 'otp_session_status';

export function ForgotPasswordModal({ isOpen, onClose, onShouldOpen }: ForgotPasswordModalProps) {
  const [step, setStep] = React.useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [expectedOtp, setExpectedOtp] = React.useState<string | undefined>(undefined);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const { sendResetPasswordOTP, verifyResetPasswordOTP, resetPassword } = useResetPassword();
  const { showAlertByStatusCode } = useResponseValidator();
  const { showSuccessAlert, showErrorAlert } = useAlerts();

  // Check if there's an active OTP session on mount
  React.useEffect(() => {
    const otpStatus = localStorage.getItem(OTP_STATUS_KEY);
    if (otpStatus) {
      try {
        const status = JSON.parse(otpStatus);
        const elapsed = Math.floor((Date.now() - status.timestamp) / 1000);
        
        // Check if OTP session is still valid (within 10 minutes)
        if (elapsed < 10 * 60) {
          setEmail(status.email);
          setStep(status.step);
          setExpectedOtp(status.expectedOtp);
          
          // Notify parent to open modal if it's not already open
          if (!isOpen && onShouldOpen) {
            onShouldOpen();
          }
        } else {
          // Clear expired OTP session
          localStorage.removeItem(OTP_STATUS_KEY);
        }
      } catch {
        localStorage.removeItem(OTP_STATUS_KEY);
      }
    }
  }, [isOpen, onClose, onShouldOpen]);

  // Check if there's an active countdown for any email
  const hasActiveCountdown = React.useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(COUNTDOWN_KEY_PREFIX));
    return keys.some(key => {
      try {
        const { timestamp } = JSON.parse(localStorage.getItem(key) || '{}');
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        return (5 * 60) - elapsed > 0; // 5 minutes
      } catch {
        return false;
      }
    });
  }, []);

  // Load saved modal state on mount
  React.useEffect(() => {
    if (hasActiveCountdown()) {
      const savedState = localStorage.getItem(MODAL_STATE_KEY);
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setStep(state.step || "email");
          setEmail(state.email || "");
          setOtp(state.otp || "");
          setExpectedOtp(state.expectedOtp);
          setPassword(state.password || "");
          setConfirmPassword(state.confirmPassword || "");
          setError(state.error || "");
        } catch {
          // Clear corrupted state
          localStorage.removeItem(MODAL_STATE_KEY);
        }
      }
    }
  }, [hasActiveCountdown]);

  // Save modal state when it changes
  React.useEffect(() => {
    if (isOpen && (step === "otp" || step === "password")) {
      const state = {
        step,
        email,
        otp,
        expectedOtp,
        password,
        confirmPassword,
        error
      };
      localStorage.setItem(MODAL_STATE_KEY, JSON.stringify(state));
    }
  }, [isOpen, step, email, otp, expectedOtp, password, confirmPassword, error]);

  // Clear modal state when modal is closed or countdown expires
  React.useEffect(() => {
    if (!isOpen || (!hasActiveCountdown() && step === "email")) {
      localStorage.removeItem(MODAL_STATE_KEY);
    }
  }, [isOpen, step, hasActiveCountdown]);

  const dialogTitle =
    step === "email"
      ? "Enter Email for Password Reset"
      : step === "otp"
        ? "Enter OTP Code"
        : "Set New Password";

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await sendResetPasswordOTP({ 
        email: email,
        timeoutMs: 2000,
        progressIntervalMs: 400
      });

      if (response.success) {
        setExpectedOtp(response.otpCode);
        setOtp("");
        setStep("otp");
        
        // Save OTP session status
        const otpStatus = {
          email,
          step: "otp",
          timestamp: Date.now(),
          expectedOtp: response.otpCode
        };
        localStorage.setItem(OTP_STATUS_KEY, JSON.stringify(otpStatus));
      } else {
        setError(response.message);
        showAlertByStatusCode(response.statusCode || 500, response.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError("Failed to send reset email. Please try again.");
      
      // Show global error alert
      showErrorAlert(
        "Network Error",
        "Failed to send reset email. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await verifyResetPasswordOTP({
        email,
        otp,
        expectedOtp,
        timeoutMs: 1200,
        progressIntervalMs: 300,
      });

      if (response.success) {
        setStep("password");
        
        // Update OTP session status to password step
        const otpStatus = {
          email,
          step: "password",
          timestamp: Date.now(),
          expectedOtp
        };
        localStorage.setItem(OTP_STATUS_KEY, JSON.stringify(otpStatus));
        
        showSuccessAlert("OTP Verified", "You can now set a new password.", 3000);
      } else {
        setError(response.message);
        showAlertByStatusCode(response.statusCode || 500, response.message);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError("Failed to verify code. Please try again.");
      showErrorAlert("Network Error", "Failed to verify code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (isSubmitting) return;

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      showErrorAlert("Missing Password", "Please enter and confirm your new password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      showErrorAlert("Password Mismatch", "Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await resetPassword({
        email,
        otp,
        newPassword: password,
        timeoutMs: 1500,
        progressIntervalMs: 300,
      });

      if (response.success) {
        showSuccessAlert("Password Updated", "Your password has been reset successfully.", 4000);
        handleClose();
      } else {
        setError(response.message);
        showAlertByStatusCode(response.statusCode || 500, response.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError("Failed to reset password. Please try again.");
      showErrorAlert("Network Error", "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await sendResetPasswordOTP({
        email,
        timeoutMs: 1200,
        progressIntervalMs: 300,
      });

      if (response.success) {
        setExpectedOtp(response.otpCode);
        setOtp("");
        showSuccessAlert("OTP Resent", `A new code has been sent to ${email}`, 4000);
      } else {
        setError(response.message);
        showAlertByStatusCode(response.statusCode || 500, response.message);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError("Failed to resend code. Please try again.");
      showErrorAlert("Network Error", "Failed to resend code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clear modal state and OTP session from localStorage
    localStorage.removeItem(MODAL_STATE_KEY);
    localStorage.removeItem(OTP_STATUS_KEY);
    
    // Reset all state
    setStep("email");
    setEmail("");
    setOtp("");
    setExpectedOtp(undefined);
    setPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) return; // Prevent closing on outside click
    }}>
      <DialogContent className="sm:max-w-md">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-1 rounded-full bg-white hover:bg-gray-100 transition-colors border border-gray-200 z-50"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        <DialogHeader>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            Reset Your Password
          </div>
        </DialogHeader>

        <VisuallyHidden.Root>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </VisuallyHidden.Root>

        {step === "email" && (
          <ForgotPasswordEmailStep
            email={email}
            setEmail={setEmail}
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleSendOtp}
          />
        )}

        {step === "otp" && (
          <ForgotPasswordOtpStep
            email={email}
            otp={otp}
            setOtp={setOtp}
            error={error}
            isSubmitting={isSubmitting}
            onVerify={handleVerifyOtp}
            onBack={() => {
              setError("");
              setOtp("");
              setStep("email");
            }}
            onResend={handleResendOtp}
            onOtpSent={() => {
              // Countdown will be started automatically in OTP step
            }}
          />
        )}

        {step === "password" && (
          <ForgotPasswordNewPasswordStep
            password={password}
            confirmPassword={confirmPassword}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleResetPassword}
            onBack={() => {
              setError("");
              setStep("otp");
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
