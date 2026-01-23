"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordNewPasswordStepProps {
  password: string;
  confirmPassword: string;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  error: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function ForgotPasswordNewPasswordStep({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  error,
  isSubmitting,
  onSubmit,
  onBack,
}: ForgotPasswordNewPasswordStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600 text-sm">
        Set a new password for your account.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-2 pt-2">
          <Button onClick={onSubmit} className="w-full" disabled={isSubmitting}>
            Reset Password
          </Button>
          <Button type="button" variant="outline" onClick={onBack} className="w-full" disabled={isSubmitting}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
