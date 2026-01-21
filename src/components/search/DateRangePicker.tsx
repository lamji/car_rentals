"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { parseIsoDate, toIsoDateString } from "@/lib/date";

// Simple tooltip component to avoid import issues
const SimpleTooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export function DateRangePicker(props: {
  startDate: string;
  endDate: string;
  onChange: (next: { startDate: string; endDate: string }) => void;
  className?: string;
  unavailableDates?: string[]; // Add unavailable dates prop
}) {
  const start = React.useMemo(() => parseIsoDate(props.startDate), [props.startDate]);
  const end = React.useMemo(() => parseIsoDate(props.endDate), [props.endDate]);
  const [tempStart, setTempStart] = React.useState(start);
  const [tempEnd, setTempEnd] = React.useState(end);
  const [isOpen, setIsOpen] = React.useState(false);

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date) => {
    if (!date || !props.unavailableDates) return false;
    const dateStr = date.toISOString().split('T')[0];
    return props.unavailableDates.includes(dateStr);
  };

  // Custom day component to handle unavailable dates
  const DayComponent = (dayProps: any) => {
    const { date, modifiers } = dayProps;
    if (!date) return <td {...dayProps} />;
    
    const dateStr = date.toISOString().split('T')[0];
    const isUnavailable = props.unavailableDates?.includes(dateStr) || false;
    
    // Debug logging
    if (dateStr === "2026-01-18") {
      console.log("Debug - Jan 18, 2026:", {
        dateStr,
        unavailableDates: props.unavailableDates,
        isUnavailable,
        modifiers,
        allProps: dayProps
      });
    }
    
    return (
      <td
        {...dayProps}
        className={cn(
          isUnavailable && "bg-red-100 text-red-800 line-through",
          dayProps.className
        )}
        style={{
          opacity: isUnavailable ? 0.7 : 1,
          cursor: isUnavailable ? "not-allowed" : "pointer"
        }}
      >
        {date.getDate()}
      </td>
    );
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
    // Also notify parent component of the clear
    props.onChange({
      startDate: "",
      endDate: "",
    });
  };

  const handleConfirm = () => {
    if (tempStart && tempEnd) {
      props.onChange({
        startDate: toIsoDateString(tempStart),
        endDate: toIsoDateString(tempEnd),
      });
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStart(start);
    setTempEnd(end);
  };

  const handleSelect = (range: any) => {
    const from = range?.from;
    const to = range?.to;
    if (from && to) {
      setTempStart(from);
      setTempEnd(to);
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal border-input", !start && "text-muted-foreground", props.className)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {start && end ? (
              <span>
                {format(start, "MMM d")} - {format(end, "MMM d")}
              </span>
            ) : (
              <span>Select dates</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw]">
          <DialogTitle>Select Rental Dates</DialogTitle>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Choose your pickup and return dates</p>
            </div>
            
            <div className="flex justify-center">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={tempStart && tempEnd ? { from: tempStart, to: tempEnd } : undefined}
                onSelect={handleSelect}
                initialFocus
                className="rounded-md border"
                disabled={(date: Date) => {
                  if (!date || !props.unavailableDates) return false;
                  const dateStr = date.toISOString().split('T')[0];
                  return props.unavailableDates.includes(dateStr);
                }}
                modifiers={{
                  unavailable: props.unavailableDates?.map(date => new Date(date)) || []
                }}
                modifiersStyles={{
                  unavailable: {
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    textDecoration: 'line-through',
                    opacity: 0.7,
                    pointerEvents: 'none',
                    cursor: 'not-allowed !important'
                  }
                }}
                components={{
                  Day: (dayProps: any) => {
                    const { date, modifiers, disabled } = dayProps;
                    if (!date) return <td {...dayProps} />;
                    
                    const dateStr = date.toISOString().split('T')[0];
                    const isUnavailable = props.unavailableDates?.includes(dateStr) || false;
                    
                    // Debug logging
                    if (date.getDate() === 18 && date.getMonth() === 0) { // January 18th
                      console.log("Debug - Jan 18, 2026:", {
                        dateStr,
                        unavailableDates: props.unavailableDates,
                        isUnavailable,
                        disabled,
                        modifiers,
                        allProps: dayProps
                      });
                    }
                    
                    const dayContent = (
                      <td
                        {...dayProps}
                        className={cn(
                          isUnavailable && "!bg-red-100 !text-red-800 line-through cursor-not-allowed",
                          !isUnavailable && "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          dayProps.className
                        )}
                      >
                        {date.getDate()}
                      </td>
                    );
                    
                    if (isUnavailable) {
                      return (
                        <SimpleTooltip content="Not available">
                          {dayContent}
                        </SimpleTooltip>
                      );
                    }
                    
                    return dayContent;
                  }
                }}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-4">
              <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto">
                Clear
              </Button>
              <Button onClick={handleConfirm} disabled={!tempStart || !tempEnd} className="w-full sm:w-auto">
                Confirm Dates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
