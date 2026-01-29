"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, MapPin } from "lucide-react";
import { useState } from "react";

interface MapLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapUrl: string;
  locationName: string;
}

export function MapLinkModal({
  isOpen,
  onClose,
  mapUrl,
  locationName,
}: MapLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(mapUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Open Location in Maps
          </DialogTitle>
          <DialogDescription>
            View &quot;{locationName}&quot; location on Google Maps
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Choose how you want to open the location:
            </p>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-xs font-mono break-all text-center">
                {mapUrl}
              </p>
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
