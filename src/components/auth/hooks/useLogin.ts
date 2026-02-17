"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setAuthSession } from "@/lib/slices/authSlice";
import { setAuthenticatedSession } from "@/lib/auth/session";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LoginResponseUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "owner" | "user" | "cashier" | "guest";
  mustResetPassword?: boolean;
  notificationId?: string | null;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: LoginResponseUser;
  message?: string;
}

/**
 * Hook to manage Login UI state and authentication orchestration
 */
export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !role) return;
    const destination = role === "owner" ? "/admin/cars" : "/admin";
    router.replace(destination);
  }, [isAuthenticated, role, router]);

  const togglePassword = () => setShowPassword((prev) => !prev);
  const handleOpenForgot = () => setIsForgotPasswordOpen(true);
  const handleCloseForgot = () => setIsForgotPasswordOpen(false);

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast("Email and password are required.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result?.success || !result?.token || !result?.user) {
        showToast(result?.message || "Login failed. Please try again.", "error");
        return;
      }

      if (result.user.role !== "admin" && result.user.role !== "owner") {
        showToast("This login is restricted to admin and owner accounts.", "error");
        return;
      }

      const normalizedUser = {
        id: result.user.id || result.user._id || "",
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        mustResetPassword: !!result.user.mustResetPassword,
        notificationId: result.user.notificationId || null,
      };

      dispatch(setAuthSession({ token: result.token, user: normalizedUser }));
      setAuthenticatedSession(result.token, normalizedUser.role, normalizedUser);

      if (normalizedUser.mustResetPassword) {
        showToast("Temporary password detected. Reset password immediately.", "warning");
      } else {
        showToast("Login successful.", "success");
      }

      router.replace(normalizedUser.role === "owner" ? "/admin/cars" : "/admin");
    } catch {
      showToast("Could not connect to authentication server.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoFill = (role: "admin" | "owner") => {
    if (role === "admin") {
      setEmail("admin@admin.com");
      setPassword("admin123");
    } else {
      setEmail("owner@owner.com");
      setPassword("owner123");
    }
  };

  return {
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
  };
}
