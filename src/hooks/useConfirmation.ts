"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { openConfirmation, closeConfirmation, setConfirming } from "@/lib/slices/confirmationSlice";
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
    if (!options?.onConfirm) return;

    try {
      dispatch(setConfirming(true));
      await options.onConfirm();
      dispatch(closeConfirmation());
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      dispatch(setConfirming(false));
    }
  }, [options, dispatch]);

  const cancel = useCallback(() => {
    options?.onCancel?.();
    dispatch(closeConfirmation());
  }, [options, dispatch]);

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
