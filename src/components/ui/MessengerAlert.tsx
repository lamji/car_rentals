"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, AlertTriangle } from "lucide-react";

interface MessengerAlertProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
}

export function MessengerAlert({ isOpen, onClose, currentUrl }: MessengerAlertProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Open in Browser for Best Experience
          </DialogTitle>
          <DialogDescription>
            This app works best in a proper web browser. Some features may not work correctly in messaging apps.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              For the best experience, please open this link in your preferred browser:
            </p>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-xs font-mono break-all text-center">{currentUrl}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyUrl}
            className="w-full sm:w-auto"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy URL"}
          </Button>
          
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to detect if app is opened in messaging app
export function useMessengerDetection() {
  const [isInMessenger, setIsInMessenger] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkIfInMessenger = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const messengerIndicators = [
        'messenger',
        'instagram', 
        'fbav', // Facebook App
        'line',
        'telegram',
        'whatsapp',
        'fb_iab', // Facebook In-App Browser
        'fban', // Facebook Ads
        'twitter',
        'snapchat'
      ];

      // Check user agent for messaging app indicators
      const hasMessengerUA = messengerIndicators.some(indicator => userAgent.includes(indicator));
      
      // Check for common in-app browser characteristics
      const hasInAppBrowserFeatures = (
        !window.opener || // In-app browsers often don't have window.opener
        window.name === '_blank' ||
        !!(window as unknown as { webkit?: { messageHandlers?: unknown } }).webkit?.messageHandlers || // Some in-app browsers use this
        !(window as unknown as { chrome?: unknown }).chrome || // Missing Chrome features
        !(window as unknown as { sidebar?: unknown }).sidebar // Missing Firefox features
      );

      // Check if we're in a limited environment
      const hasLimitedFeatures = (
        !navigator.permissions || // Some in-app browsers limit permissions
        !navigator.geolocation ||
        !window.localStorage
      );

      setIsInMessenger(hasMessengerUA || (hasInAppBrowserFeatures && hasLimitedFeatures));
      
      // Show alert if detected
      if (hasMessengerUA || (hasInAppBrowserFeatures && hasLimitedFeatures)) {
        setShowAlert(true);
      }
    };

    checkIfInMessenger();
  }, []);

  return { isInMessenger, showAlert, setShowAlert };
}
