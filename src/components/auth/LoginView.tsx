"use client";

import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useLogin } from "./hooks/useLogin";
import { AuthFeatures } from "./sub-components/AuthFeatures";

/**
 * Pure View component for the Login Page.
 * Logic is isolated in useLogin hook.
 */
export function LoginView() {
    const {
        showPassword,
        isForgotPasswordOpen,
        email,
        password,
        isSubmitting,
        togglePassword,
        handleOpenForgot,
        handleCloseForgot,
        setEmail,
        setPassword,
        onLoginSubmit,
        handleAutoFill,
    } = useLogin();

    return (
        <div className="mt-5 min-h-screen flex flex-col max-lg:w-full mx-auto" data-testid="login-page-container">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-9 sm:px-4 pb-4 sm:pb-8">
                <div className="w-full max-w-md space-y-6 sm:space-y-8">

                    {/* Welcome Section */}
                    <div className="text-center space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-center mb-2 sm:mb-3">
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/apple-touch-icon.png"
                                    alt="Car Rentals Logo"
                                    className="w-55 h-40 sm:w-40 sm:h-40"
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">
                            Sign in to continue your car rental experience
                        </p>
                    </div>

                    {/* Login Form */}
                    <form
                        className="space-y-4 sm:space-y-6"
                        onSubmit={onLoginSubmit}
                        data-testid="login-form"
                    >
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    data-testid="login-email-input"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    data-testid="login-password-input"
                                    className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={togglePassword}
                                    data-testid="login-toggle-password"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleOpenForgot}
                                data-testid="login-forgot-password-button"
                                className="text-xs sm:text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                            >
                                Forgot your password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            data-testid="login-submit-button"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
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
                            Create an account and start your journey with{" "}
                            <span className="font-semibold text-primary">Book a Ride</span>
                        </p>
                        <Link
                            href="/signup"
                            data-testid="login-signup-link"
                            className="inline-flex items-center justify-center w-full mt-3 sm:mt-4 bg-white border border-gray-300 text-gray-700 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Create Account
                        </Link>
                    </div>

                    {/* Demo Credentials Section */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3" data-testid="demo-credentials-container">
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">Developer Demo Access</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleAutoFill("admin")}
                                className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group"
                            >
                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Admin Account</p>
                                <p className="text-xs font-medium text-gray-900 truncate">admin@admin.com</p>
                                <p className="text-[10px] text-gray-500 mt-1 group-hover:text-blue-600 transition-colors">Click to auto-fill →</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleAutoFill("owner")}
                                className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group"
                            >
                                <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Owner Account</p>
                                <p className="text-xs font-medium text-gray-900 truncate">owner@owner.com</p>
                                <p className="text-[10px] text-gray-500 mt-1 group-hover:text-indigo-600 transition-colors">Click to auto-fill →</p>
                            </button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <AuthFeatures />
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
                onClose={handleCloseForgot}
            />
        </div>
    );
}
