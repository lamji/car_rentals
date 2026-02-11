"use client";

import { Clock, AlertCircle } from 'lucide-react';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { format } from 'date-fns';

interface DesktopTimeSelectionProps {
  bookingDetails: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  };
  generateTimeOptions: () => { displayTime: string; value: string; hour: number }[];
  isTimeInPast: (time: string) => boolean;
  isEndTimeInPast: (time: string) => boolean;
  isEndTimeDisabled: (
    endTime: string,
    startTime: string | undefined,
    startDate: string | undefined,
    endDate: string | undefined
  ) => boolean;
  isStartTimeDisabled: (
    startTime: string,
    startDate: string | undefined,
    endDate: string | undefined
  ) => boolean;
  formatTimeDisplay: (time: string) => string;
  disabled?: boolean;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function DesktopTimeSelection({
  bookingDetails,
  generateTimeOptions,
  isTimeInPast,
  isEndTimeInPast,
  isEndTimeDisabled,
  isStartTimeDisabled,
  formatTimeDisplay,
  disabled = false,
  onStartTimeChange,
  onEndTimeChange
}: DesktopTimeSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <TimePickerField
          label="Start Time"
          selectedTime={bookingDetails.startTime}
          onTimeSelect={onStartTimeChange}
          icon={Clock}
          timeOptions={generateTimeOptions()}
          isTimeInPast={isTimeInPast}
          disabled={disabled}
        />
        {bookingDetails.startDate && bookingDetails.startTime && isTimeInPast(bookingDetails.startTime) && (
          <div className="text-red-600 text-xs mt-1 bg-red-50 p-2 rounded border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Invalid time selection: You selected started date <strong>{format(new Date(bookingDetails.startDate), 'MMM dd, yyyy')}</strong> at <strong>{formatTimeDisplay(bookingDetails.startTime)}</strong>, but this time is in the past. Please select a future time for today&apos;s booking.</span>
          </div>
        )}
        {bookingDetails.startDate && bookingDetails.startTime && bookingDetails.endDate && bookingDetails.startDate === bookingDetails.endDate && isStartTimeDisabled(bookingDetails.startTime, bookingDetails.startDate, bookingDetails.endDate) && (
          <div className="text-red-600 text-xs mt-1 bg-red-50 p-2 rounded border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Invalid start time: You selected <strong>{formatTimeDisplay(bookingDetails.startTime)}</strong> for <strong>{format(new Date(bookingDetails.startDate), 'MMM dd, yyyy')}</strong> for end date. You only have <strong>{24 - parseInt(bookingDetails.startTime.split(':')[0])} hours</strong> remaining before the day ends, which doesn&apos;t meet the 12-hour minimum rental duration. Please select an earlier time or adjust your end date.</span>
          </div>
        )}
      </div>

      <div>
        <TimePickerField
          label="End Time"
          selectedTime={bookingDetails.endTime}
          onTimeSelect={onEndTimeChange}
          timeOptions={generateTimeOptions()}
          isTimeInPast={isTimeInPast}
          isEndTimeInPast={isEndTimeInPast}
          isEndTimeDisabled={isEndTimeDisabled}
          startTime={bookingDetails.startTime}
          startDate={bookingDetails.startDate}
          endDate={bookingDetails.endDate}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
