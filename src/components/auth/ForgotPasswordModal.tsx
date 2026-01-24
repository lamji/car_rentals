"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Mail, X } from "lucide-react";
import { useForgotPasswordFlow } from "@/hooks/useForgotPasswordFlow";
import { ForgotPasswordEmailStep } from "@/components/auth/forgot-password/ForgotPasswordEmailStep";
import { ForgotPasswordOtpStep } from "@/components/auth/forgot-password/ForgotPasswordOtpStep";
import { ForgotPasswordNewPasswordStep } from "@/components/auth/forgot-password/ForgotPasswordNewPasswordStep";
import { ForgotPasswordModalProps } from "@/lib/types/auth";

export function ForgotPasswordModal({ isOpen, onClose, onShouldOpen }: ForgotPasswordModalProps) {
  const {
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
  } = useForgotPasswordFlow({ isOpen, onClose, onShouldOpen });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) return; // Prevent closing on outside click
    }}>
      <DialogContent className="px-9 w-screen h-screen max-w-none max-h-none sm:px-4 sm:max-w-md sm:h-auto sm:max-h-[90vh]">
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
            onBack={handleBackToEmail}
            onResend={handleResendOtp}
            onOtpSent={() => {
              // Countdown will be started automatically in OTP step
            }}
            expectedOtp={expectedOtp}
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
            onBack={handleBackToOtp}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
