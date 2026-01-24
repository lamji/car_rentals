"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { removeAlert } from "@/lib/slices/alertSlice";
import type { Alert } from "@/lib/slices/alertSlice";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export function AlertModal() {
  const dispatch = useDispatch();
  const alerts = useSelector((state: RootState) => state.alerts.alerts);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-blue-200';
    }
  };

  const getButtonColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  React.useEffect(() => {
    alerts.forEach((alert: Alert) => {
      if (alert.duration && alert.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeAlert(alert.id));
        }, alert.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [alerts, dispatch]);

  if (alerts.length === 0) return null;

  // Show only the most recent alert
  const latestAlert = alerts[alerts.length - 1];

  return (
    <Dialog open={true} onOpenChange={() => dispatch(removeAlert(latestAlert.id))}>
      <DialogContent className={`sm:max-w-md border ${getBorderColor(latestAlert.type)}`}>
        {/* Accessibility: VisuallyHidden title and description */}
        <VisuallyHidden.Root>
          <DialogTitle>{latestAlert.title || 'Alert'}</DialogTitle>
          <DialogDescription>{latestAlert.message}</DialogDescription>
        </VisuallyHidden.Root>
        
        <div className="relative">
          {/* Alert Content */}
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(latestAlert.type)}`}>
              {getIcon(latestAlert.type)}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {latestAlert.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {latestAlert.message}
              </p>

              {/* Action Button (if provided) */}
              {latestAlert.action && (
                <Button
                  onClick={latestAlert.action.onClick}
                  className={`w-full ${getButtonColor(latestAlert.type)} text-white`}
                >
                  {latestAlert.action.label}
                </Button>
              )}

              {/* Default Close Button (if no action provided) */}
              {!latestAlert.action && (
                <Button
                  onClick={() => dispatch(removeAlert(latestAlert.id))}
                  className={`w-full ${getButtonColor(latestAlert.type)} text-white`}
                >
                  OK
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
