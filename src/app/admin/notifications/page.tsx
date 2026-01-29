/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { NotificationsTable } from "@/components/admin/NotificationsTable";
import useGetSubscriber from "@/lib/api/useGetSubscriber";
import { hideLoader, showLoader } from "@/lib/slices/globalLoaderSlice";
import { useAppDispatch } from "@/lib/store";
import { Bell } from "lucide-react";
import { useEffect, useMemo } from "react";
import { showAlert } from "../../../lib/slices/alertSlice";

/**
 * Admin Portal for Push Notification Management with TanStack Table
 * Displays all subscriptions in a table with individual send actions
 */
export default function NotificationAdminPage() {
  const dispatch = useAppDispatch();

  // Use plugandplay-react-query-hooks for data fetching
  const {
    data: subscriptionData,
    isLoading,
    error,
    refetch,
  } = useGetSubscriber();

  // Handle loading state with global loader
  useEffect(() => {
    if (isLoading) {
      dispatch(showLoader("Loading subscriptions..."));
    } else {
      dispatch(hideLoader());
    }
  }, [isLoading, dispatch]);

  // Handle error state with alert
  useEffect(() => {
    if (error) {
      dispatch(
        showAlert({
          type: "error",
          title: "Error",
          message: "Failed to load subscriptions. Please try again.",
          duration: 5000,
        }),
      );
      console.error("Failed to load subscriptions:", error);
    }
  }, [error, dispatch]);

  // Format subscription data for the table
  const subscriptions = useMemo(() => {
    if (!subscriptionData?.success || !subscriptionData?.data) {
      return [];
    }

    return subscriptionData.data.map((sub: any) => ({
      id: sub._id,
      subscriptionId: sub.subscriptionId,
      userId: sub.userId,
      endpoint: sub.endpoint,
      userAgent: sub.userAgent,
      createdAt: new Date(sub.createdAt).toLocaleString(),
      isActive: sub.isActive,
    }));
  }, [subscriptionData]);

  // Handle refresh - now uses React Query refetch
  const handleRefresh = () => {
    refetch();
  };

  /**
   * Delete a subscription
   */
  async function deleteSubscription(subscriptionId: string) {
    try {
      const response = await fetch(
        `/api/subscriptions?subscriptionId=${subscriptionId}`,
        {
          method: "DELETE",
        },
      );
      const result = await response.json();

      if (result.success) {
        handleRefresh(); // Refresh the table using React Query refetch
      }
    } catch (_error) {
      // Error will be handled by the NotificationsTable component
      console.error("Failed to delete subscription:", _error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">
            Push Notification Admin
          </h1>
        </div>
        <p className="text-gray-600">
          Manage push subscriptions and send targeted notifications
        </p>
      </div>

      {/* Notifications Table */}
      <NotificationsTable
        subscriptions={subscriptions}
        onRefresh={handleRefresh}
        onDelete={deleteSubscription}
      />
    </div>
  );
}
