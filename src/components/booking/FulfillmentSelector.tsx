"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FulfillmentState } from "@/lib/types";

export function FulfillmentSelector(props: {
  garageAddress?: string;
  value?: FulfillmentState;
  onChange: (next: FulfillmentState) => void;
}) {
  const type = props.value?.type ?? "pickup";

  return (
    <RadioGroup
      value={type}
      onValueChange={(v) => {
        if (v === "pickup") props.onChange({ type: "pickup" });
        else props.onChange({ type: "delivery", deliveryAddress: props.value?.type === "delivery" ? props.value.deliveryAddress : "" });
      }}
      className="grid gap-3"
    >
      <label className={cn("cursor-pointer", type === "pickup" && "ring-2 ring-primary rounded-lg")}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="pickup" id="pickup" />
              <div className="space-y-2">
                <div className="font-semibold">Pickup at Garage</div>
                <div className="text-sm text-muted-foreground">{props.garageAddress || "Garage address unavailable"}</div>
                <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">Map preview placeholder</div>
                <div className="text-sm">Bring valid ID. Arrive 15 mins early.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </label>

      <label className={cn("cursor-pointer", type === "delivery" && "ring-2 ring-primary rounded-lg")}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="delivery" id="delivery" />
              <div className="flex-1 space-y-2">
                <div className="font-semibold">Deliver to Me</div>
                <div className="text-sm text-muted-foreground">Delivery fee is mocked for MVP.</div>
                <Input
                  placeholder="Delivery address"
                  value={props.value?.type === "delivery" ? props.value.deliveryAddress : ""}
                  onChange={(e) => props.onChange({ type: "delivery", deliveryAddress: e.target.value })}
                />
                <div className="text-sm">Time window (optional): 9AM - 6PM</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </label>
    </RadioGroup>
  );
}
