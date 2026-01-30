"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X } from "lucide-react";

/**
 * Type definition for SmartSubscriptionAlertUI component props
 */
export interface SmartSubscriptionAlertUIProps {
  showSubscriptionPrompt: boolean;
  isChecking: boolean;
  isSubscribing: boolean;
  onSubscribe: () => void;
  onDismiss: () => void;
}

/**
 * Smart subscription alert UI component
 * Renders the subscription prompt with proper styling and responsive design
 * @param {Object} props - Component props
 * @param {boolean} props.showSubscriptionPrompt - Whether to show the alert
 * @param {boolean} props.isChecking - Whether subscription status is being checked
 * @param {boolean} props.isSubscribing - Whether subscription process is in progress
 * @param {Function} props.onSubscribe - Handler for subscribe button click
 * @param {Function} props.onDismiss - Handler for dismiss button click
 */
export function SmartSubscriptionAlertUI({
  showSubscriptionPrompt,
  isChecking,
  isSubscribing,
  onSubscribe,
  onDismiss,
}: SmartSubscriptionAlertUIProps) {
  // Don't render anything while checking or if alert shouldn't be shown
  if (isChecking || !showSubscriptionPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-60 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-primary/20 bg-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">Stay Updated</h3>
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDismiss}
                  className="px-3"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Get instant notifications about your bookings, special offers,
                and important updates.
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={onSubscribe}
                  disabled={isSubscribing}
                  className="flex-1"
                  size="sm"
                >
                  {isSubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Subscribing...
                    </>
                  ) : (
                    "Enable Notifications"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
