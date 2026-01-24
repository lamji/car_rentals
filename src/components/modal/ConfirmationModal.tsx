"use client";

import React from "react";
import { useConfirmation } from "@/hooks/useConfirmation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ConfirmationModal() {
  const { isOpen, options, isConfirming, confirm, cancel } = useConfirmation();

  const handleConfirm = async () => {
    await confirm();
  };

  const handleCancel = () => {
    cancel();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && cancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {options?.title || "Confirm Action"}
            {options?.variant === "destructive" && (
              <Badge variant="destructive">Destructive</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isConfirming ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Processing...</span>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              {options?.message || "Are you sure you want to proceed?"}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isConfirming}
          >
            {options?.cancelText || "Cancel"}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isConfirming}
            variant={options?.variant === "destructive" ? "destructive" : "default"}
          >
            {isConfirming ? "Processing..." : (options?.confirmText || "Confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
