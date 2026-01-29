"use client";

import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = React.useState(false);

  return (
    <div className="mt-5 min-h-screen flex flex-col max-lg:w-full mx-auto">
      {/* Header */}
    

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-9 sm:px-4 pb-4 sm:pb-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- Using img tag for logo display */}
                <img
                  src="/apple-touch-icon.png"
                  alt="Car Rentals Logo"
                  className="w-32 h-32 sm:w-40 sm:h-40"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Welcome Back</h2>
            <p className="text-sm sm:text-base text-gray-600">Sign in to continue your car rental experience</p>
          </div>

          {/* Login Form */}
          <form className="space-y-4 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-xs sm:text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-linear-to-br from-blue-50 via-white to-indigo-50 text-gray-500">
                New to Book a Ride?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Create an account and start your journey with{' '}
              <span className="font-semibold text-primary">Book a Ride</span>
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center w-full mt-3 sm:mt-4 bg-white border border-gray-300 text-gray-700 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4">
            <div className="text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <Car className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Wide Selection</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <svg className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-600">Easy Booking</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <svg className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-600">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-3 sm:py-4 px-4 text-center">
        <p className="text-xs text-gray-500">
          © 2024 Book a Ride. All rights reserved.
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
