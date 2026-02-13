import { useCallback, useState } from "react";

/**
 * Hook to manage the fullscreen payment checkout modal state.
 */
export function usePaymentCheckout() {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const openCheckout = useCallback((url: string) => {
    setCheckoutUrl(url);
    setIsCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setCheckoutUrl(null);
    setIsCheckoutOpen(false);
  }, []);

  return {
    checkoutUrl,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
  };
}
