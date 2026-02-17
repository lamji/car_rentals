"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/components/providers/ToastProvider';
import { getRuntimeToken } from '@/lib/auth/session';
import { useAppSelector } from '@/lib/store';

interface UpdateHoldStatusPayload {
    id: string;
    isOnHold: boolean;
    holdReason?: string;
}

const useUpdateHoldStatus = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const authToken = useAppSelector((state) => state.auth.authToken);
    const token = getRuntimeToken(authToken);

    return useMutation({
        mutationFn: async ({ id, isOnHold, holdReason }: UpdateHoldStatusPayload) => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const url = `${baseUrl}/api/cars/${id}/hold-status`;
            const { data } = await axios.patch(url, { isOnHold, holdReason }, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
            showToast("Vehicle hold status updated successfully", "success");
        },
        onError: (error: unknown) => {
            console.error("Failed to update hold status:", error);
            const message: string =
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not update hold status"
                    : "Could not update hold status";
            showToast(message, "error");
        }
    });
};

export default useUpdateHoldStatus;
