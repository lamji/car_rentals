"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { showConfirmation, confirmations } from "@/lib/confirmation";
import { useConfirmation } from "@/hooks/useConfirmation";

/**
 * Example component showing how to use the global confirmation modal.
 * You can use either the global function or the hook.
 */
export function ConfirmationExample() {
  const { showConfirmation: showConfirmWithHook } = useConfirmation();

  // Example 1: Using the global function
  const handleDeleteWithGlobal = () => {
    showConfirmation({
      title: "Delete Item",
      message: "Are you sure you want to delete this item? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        console.log("Item deleted!");
        // Add your delete logic here
      },
      onCancel: () => {
        console.log("Delete cancelled");
      },
    });
  };

  // Example 2: Using predefined confirmations
  const handleSaveWithPredefined = () => {
    confirmations.save("Document", async () => {
      console.log("Document saved!");
      // Add your save logic here
    });
  };

  // Example 3: Using the hook
  const handleLogoutWithHook = () => {
    showConfirmWithHook({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      variant: "default",
      onConfirm: async () => {
        console.log("Logged out!");
        // Add your logout logic here
      },
    });
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-medium">Confirmation Modal Examples</h3>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="destructive" onClick={handleDeleteWithGlobal}>
          Delete Item (Global Function)
        </Button>
        
        <Button variant="default" onClick={handleSaveWithPredefined}>
          Save Document (Predefined)
        </Button>
        
        <Button variant="outline" onClick={handleLogoutWithHook}>
          Logout (Hook)
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>• Global function: Use anywhere, even outside React components</p>
        <p>• Predefined: Convenient shortcuts for common actions</p>
        <p>• Hook: Use inside React components for TypeScript support</p>
      </div>
    </div>
  );
}
