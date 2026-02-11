"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { openConfirmation, closeConfirmation, setConfirming, getConfirmationCallbacks } from "@/lib/slices/confirmationSlice";
import type { ConfirmationOptions } from "@/lib/slices/confirmationSlice";

export function useConfirmation() {
  const dispatch = useAppDispatch();
  const { isOpen, options, isConfirming } = useAppSelector((state) => state.confirmation);

  const showConfirmation = useCallback(
    (options: ConfirmationOptions) => {
      dispatch(openConfirmation(options));
    },
    [dispatch]
  );

  const hideConfirmation = useCallback(() => {
    dispatch(closeConfirmation());
  }, [dispatch]);

  const confirm = useCallback(async () => {
    const callbacks = getConfirmationCallbacks();
    if (!callbacks?.onConfirm) return;

    try {
      dispatch(setConfirming(true));
      await callbacks.onConfirm();
      dispatch(closeConfirmation());
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      dispatch(setConfirming(false));
    }
  }, [dispatch]);

  const cancel = useCallback(() => {
    const callbacks = getConfirmationCallbacks();
    callbacks?.onCancel?.();
    dispatch(closeConfirmation());
  }, [dispatch]);

  return {
    isOpen,
    options,
    isConfirming,
    showConfirmation,
    hideConfirmation,
    confirm,
    cancel,
  };
}
