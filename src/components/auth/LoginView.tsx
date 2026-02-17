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
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                        <p className="text-sm text-gray-500">
                            Enter your credentials to access your dashboard
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
                                    placeholder="admin@admin.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    data-testid="login-email-input"
                                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    data-testid="login-password-input"
                                    className="w-full pl-9 sm:pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                                className="text-xs sm:text-sm text-primary hover:underline transition-colors font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            data-testid="login-submit-button"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-all shadow-sm active:scale-[0.98]"
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    {/* Demo Credentials Section */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3" data-testid="demo-credentials-container">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sample Credentials</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleAutoFill("admin")}
                                className="text-left p-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-xs transition-all group"
                            >
                                <p className="text-[9px] font-bold text-blue-600 uppercase mb-0.5">Admin</p>
                                <p className="text-[11px] font-medium text-gray-700 truncate">admin@admin.com</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleAutoFill("owner")}
                                className="text-left p-2.5 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:shadow-xs transition-all group"
                            >
                                <p className="text-[9px] font-bold text-indigo-600 uppercase mb-0.5">Owner</p>
                                <p className="text-[11px] font-medium text-gray-700 truncate">owner@owner.com</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="py-6 px-4 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                    © 2024 Book a Ride. System Interface.
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
