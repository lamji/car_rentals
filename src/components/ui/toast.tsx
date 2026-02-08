"use client";

import { Check, X } from "lucide-react";

interface ToastProps {
    message: string;
    onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
    return (
        <div
            className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 opacity-100 translate-x-0"
        >
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">{message}</span>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="ml-2 text-gray-400 hover:text-white transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
