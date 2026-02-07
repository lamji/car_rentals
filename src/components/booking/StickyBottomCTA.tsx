"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

export function StickyBottomCTA(props: {
  label: string;
  total: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 p-4">
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-lg font-semibold">{formatCurrency(props.total)}</div>
        </div>
        <Button disabled={props.disabled} onClick={props.onClick} className="min-w-40">
          {props.label}
        </Button>
      </div>
    </div>
  );
}
