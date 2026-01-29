"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600 text-sm">
        Set a new password for your account.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-black pr-10"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-black pr-10"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
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
