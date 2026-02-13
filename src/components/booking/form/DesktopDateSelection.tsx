"use client";

import { Calendar } from 'lucide-react';
import { InlineDatePickerField } from '@/components/ui/InlineDatePickerField';

interface DesktopDateSelectionProps {
  bookingDetails: {
    startDate?: string;
    endDate?: string;
  };
  onStartDateSelect: (date: Date) => void;
  onEndDateClick: (date: Date) => void;
  getEndDateMinDate: (startDate?: string) => Date | undefined;
  disabledStartDates?: string[];
  disabledEndDates?: string[];
  onOpen?: (openCalendar: () => void) => void;
}

export function DesktopDateSelection({ 
  bookingDetails, 
  onStartDateSelect, 
  onEndDateClick, 
  getEndDateMinDate,
  disabledStartDates = [],
  disabledEndDates = [],
  onOpen,
}: DesktopDateSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InlineDatePickerField
        label="Start Date"
        selectedDate={bookingDetails.startDate ? new Date(bookingDetails.startDate) : undefined}
        onDateSelect={onStartDateSelect}
        disabledDates={disabledStartDates.map((d) => new Date(d))}
        icon={Calendar}
        onOpen={onOpen}
      />

      <InlineDatePickerField
        label="End Date"
        selectedDate={bookingDetails.endDate ? new Date(bookingDetails.endDate) : undefined}
        onDateSelect={onEndDateClick}
        disabled={!bookingDetails.startDate}
        minDate={getEndDateMinDate(bookingDetails.startDate)}
        disabledDates={disabledEndDates.map((d) => new Date(d))}
        icon={Calendar}
        onOpen={onOpen}
      />
    </div>
  );
}
