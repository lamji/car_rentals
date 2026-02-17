"use client";

import { useAppSelector } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * AdminGuard Component
 * Protects admin routes by checking authentication and role.
 * Redirects unauthorized users to the login page.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, role, authToken } = useAppSelector((state) => state.auth);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // 1. Initial Quick Check: If we already have everything in Redux, let them in.
        const hasAccess = isAuthenticated && (role === "admin" || role === "owner");

        if (hasAccess) {
            console.log("✅ AdminGuard: Authorized immediately via Redux.");
            setIsChecking(false);
            return;
        }

        // 2. Hydration Polling: Check localStorage if Redux is empty (Next.js Hydration)
        const checkHydration = () => {
            const persistedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            // If there's absolutely no token in Redux OR localStorage, it's a hard FAIL.
            if (!authToken && !persistedToken) {
                console.warn("🚫 AdminGuard: No token found. Redirecting to login.");
                router.replace("/login");
                return;
            }

            // If we have a token but role is missing, wait for Redux to hydrate.
            // We give it a small window.
        };

        const timer = setTimeout(() => {
            // Final verdict after 800ms
            const finalCheck = isAuthenticated && (role === "admin" || role === "owner");

            if (!finalCheck) {
                console.warn("🚫 AdminGuard: Verification timeout. Redirecting to login.");
                router.replace("/login");
            } else {
                setIsChecking(false);
            }
        }, 800); // Increased to 800ms for slower systems

        checkHydration();

        return () => clearTimeout(timer);
    }, [isAuthenticated, role, authToken, router]);

    if (isChecking) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 bg-opacity-90 backdrop-blur-sm fixed inset-0 z-[9999]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                            Securing Dashboard
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                            Verifying credentials and permissions...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
