"use client";

import React from "react";
import { useResetPassword } from "@/lib/api/useResetPassword";
import { useAlerts } from "@/hooks/useAlerts";
import { useResponseValidator } from "@/hooks/useResponseValidator";

type Step = "email" | "otp" | "password";

type UseForgotPasswordFlowArgs = {
  isOpen: boolean;
  onClose: () => void;
  onShouldOpen?: () => void;
};

const MODAL_STATE_KEY = "forgot_password_modal_state";
const COUNTDOWN_KEY_PREFIX = "otp_resend_timer_";
const OTP_STATUS_KEY = "otp_session_status";

export function useForgotPasswordFlow({ isOpen, onClose, onShouldOpen }: UseForgotPasswordFlowArgs) {
  const [step, setStep] = React.useState<Step>("email");
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

  React.useEffect(() => {
    const otpStatus = localStorage.getItem(OTP_STATUS_KEY);
    if (!otpStatus) return;

    try {
      const status = JSON.parse(otpStatus);
      const elapsed = Math.floor((Date.now() - status.timestamp) / 1000);

      if (elapsed < 10 * 60) {
        setEmail(status.email);
        setStep(status.step);
        setExpectedOtp(status.expectedOtp);

        if (!isOpen && onShouldOpen) {
          onShouldOpen();
        }
      } else {
        localStorage.removeItem(OTP_STATUS_KEY);
      }
    } catch {
      localStorage.removeItem(OTP_STATUS_KEY);
    }
  }, [isOpen, onShouldOpen]);

  const hasActiveCountdown = React.useCallback(() => {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(COUNTDOWN_KEY_PREFIX));
    return keys.some((key) => {
      try {
        const { timestamp } = JSON.parse(localStorage.getItem(key) || "{}");
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        return 5 * 60 - elapsed > 0;
      } catch {
        return false;
      }
    });
  }, []);

  React.useEffect(() => {
    if (!hasActiveCountdown()) return;

    const savedState = localStorage.getItem(MODAL_STATE_KEY);
    if (!savedState) return;

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
      localStorage.removeItem(MODAL_STATE_KEY);
    }
  }, [hasActiveCountdown]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (!(step === "otp" || step === "password")) return;

    const state = {
      step,
      email,
      otp,
      expectedOtp,
      password,
      confirmPassword,
      error,
    };

    localStorage.setItem(MODAL_STATE_KEY, JSON.stringify(state));
  }, [isOpen, step, email, otp, expectedOtp, password, confirmPassword, error]);

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
        progressIntervalMs: 400,
      });

      if (response.success) {
        setExpectedOtp(response.otpCode);
        setOtp("");
        setStep("otp");

        const otpStatus = {
          email,
          step: "otp",
          timestamp: Date.now(),
          expectedOtp: response.otpCode,
        };
        localStorage.setItem(OTP_STATUS_KEY, JSON.stringify(otpStatus));
      } else {
        setError(response.message);
        showAlertByStatusCode(response.statusCode || 500, response.message);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to send reset email. Please try again.");
      showErrorAlert("Network Error", "Failed to send reset email. Please try again.");
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

        const otpStatus = {
          email,
          step: "password",
          timestamp: Date.now(),
          expectedOtp,
        };
        localStorage.setItem(OTP_STATUS_KEY, JSON.stringify(otpStatus));

        showSuccessAlert("OTP Verified", "You can now set a new password.", 3000);
      } else {
        setError(response.message);
        showAlertByStatusCode(response.statusCode || 500, response.message);
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
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
    } catch (err) {
      console.error("Reset password error:", err);
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
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend code. Please try again.");
      showErrorAlert("Network Error", "Failed to resend code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setError("");
    setOtp("");
    setStep("email");
  };

  const handleBackToOtp = () => {
    setError("");
    setStep("otp");
  };

  const handleClose = () => {
    localStorage.removeItem(MODAL_STATE_KEY);
    localStorage.removeItem(OTP_STATUS_KEY);

    setStep("email");
    setEmail("");
    setOtp("");
    setExpectedOtp(undefined);
    setPassword("");
    setConfirmPassword("");
    setError("");

    onClose();
  };

  return {
    step,
    email,
    otp,
    expectedOtp,
    password,
    confirmPassword,
    isSubmitting,
    error,
    dialogTitle,
    setEmail,
    setOtp,
    setPassword,
    setConfirmPassword,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleResendOtp,
    handleBackToEmail,
    handleBackToOtp,
    handleClose,
  };
}
