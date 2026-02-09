"use client";

import { Clock, AlertCircle } from 'lucide-react';
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

interface MobileTimeSelectionProps {
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
  isStartTimeConflicting: (startTime: string) => boolean;
  formatTimeDisplay: (time: string) => string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function MobileTimeSelection({
  bookingDetails,
  generateTimeOptions,
  isTimeInPast,
  isEndTimeInPast,
  isEndTimeDisabled,
  isStartTimeDisabled,
  isStartTimeConflicting,
  formatTimeDisplay,
  onStartTimeChange,
  onEndTimeChange
}: MobileTimeSelectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="h-4 w-4 inline mr-1" />
          Start Time
        </label>
        <DropdownMenu.DropdownMenu>
          <DropdownMenu.DropdownMenuTrigger asChild>
            <button
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors"
            >
              <span className={bookingDetails.startTime ? 'text-gray-900' : 'text-gray-500'}>
                {bookingDetails.startTime ? formatTimeDisplay(bookingDetails.startTime) : 'Select time'}
              </span>
              <Clock className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenu.DropdownMenuTrigger>
          <DropdownMenu.DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width) max-h-40 overflow-y-auto" align="start">
            {generateTimeOptions().map(({ displayTime, value }) => {
              const isPast = isTimeInPast(value);
              const isConflicting = bookingDetails.startDate ? isStartTimeConflicting(value) : false;
              const isDisabled = isPast || isConflicting;

              return (
                <DropdownMenu.DropdownMenuItem
                  key={value}
                  disabled={isDisabled}
                  className={isDisabled ? "text-red-600 text-xs" : "text-xs"}
                  onClick={() => !isDisabled && onStartTimeChange(value)}
                >
                  {displayTime}
                  {isConflicting && <span className="ml-2 text-xs">(Conflicts)</span>}
                </DropdownMenu.DropdownMenuItem>
              );
            })}
          </DropdownMenu.DropdownMenuContent>
        </DropdownMenu.DropdownMenu>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="h-4 w-4 inline mr-1" />
          End Time
        </label>
        <DropdownMenu.DropdownMenu>
          <DropdownMenu.DropdownMenuTrigger asChild>
            <button
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors"
            >
              <span className={bookingDetails.endTime ? 'text-gray-900' : 'text-gray-500'}>
                {bookingDetails.endTime ? formatTimeDisplay(bookingDetails.endTime) : 'Select time'}
              </span>
              <Clock className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenu.DropdownMenuTrigger>
          <DropdownMenu.DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width) max-h-40 overflow-y-auto" align="start">
            {generateTimeOptions().map(({ displayTime, value }) => {
              const isDisabled = isEndTimeDisabled(
                value,
                bookingDetails.startTime,
                bookingDetails.startDate,
                bookingDetails.endDate
              ) || isEndTimeInPast(value);

              return (
                <DropdownMenu.DropdownMenuItem
                  key={value}
                  className={isDisabled ? "text-red-600 text-xs" : "text-xs"}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onEndTimeChange(value)}
                >
                  {displayTime}
                </DropdownMenu.DropdownMenuItem>
              );
            })}
          </DropdownMenu.DropdownMenuContent>
        </DropdownMenu.DropdownMenu>
        {bookingDetails.endDate && bookingDetails.endTime && isEndTimeInPast(bookingDetails.endTime) && (
          <div className="text-red-600 text-xs mt-1 bg-red-50 p-2 rounded border border-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Invalid time selection: You selected end date <strong>{format(new Date(bookingDetails.endDate), 'MMM dd, yyyy')}</strong> at <strong>{formatTimeDisplay(bookingDetails.endTime)}</strong>, but this time is in the past. Please select a future time for today&apos;s booking.</span>
          </div>
        )}
      </div>
    </div>
  );
}
